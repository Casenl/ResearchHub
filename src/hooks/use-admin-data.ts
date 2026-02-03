"use client";

/**
 * Hooks for admin collections: prompt templates, AI tools, assignments, context rules.
 * Falls back to seed data during loading.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribePromptTemplates,
  subscribeAIToolProfiles,
  subscribePromptAssignments,
  subscribeContextRules,
  createPromptTemplate as createTemplateService,
  updatePromptTemplate as updateTemplateService,
  deletePromptTemplate as deleteTemplateService,
  upsertAIToolProfile as upsertToolService,
  deleteAIToolProfile as deleteToolService,
  upsertPromptAssignment as upsertAssignmentService,
  deletePromptAssignment as deleteAssignmentService,
  upsertContextRule as upsertRuleService,
  deleteContextRule as deleteRuleService,
} from "@/lib/firestore/admin";

import { DEFAULT_PROMPT_TEMPLATES } from "@/data/prompt-templates";
import { AI_TOOL_PROFILES } from "@/data/ai-tool-profiles";
import { DEFAULT_CONTEXT_RULES } from "@/data/context-rules";

import type {
  PromptTemplate,
  AIToolProfile,
  PromptAssignment,
  ContextRule,
} from "@/types";

// -----------------------------------------------------------------------------
// Prompt Templates
// -----------------------------------------------------------------------------

interface UsePromptTemplatesResult {
  data: PromptTemplate[];
  isLoading: boolean;
  error: string | null;
  createTemplate: (
    data: Omit<PromptTemplate, "id" | "created_at">
  ) => Promise<string>;
  updateTemplate: (
    id: string,
    data: Partial<Omit<PromptTemplate, "id">>
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export function usePromptTemplates(): UsePromptTemplatesResult {
  const [data, setData] = useState<PromptTemplate[]>(DEFAULT_PROMPT_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePromptTemplates(
      (items) => {
        setData(items.length > 0 ? items : DEFAULT_PROMPT_TEMPLATES);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const createTemplate = useCallback(
    async (d: Omit<PromptTemplate, "id" | "created_at">) =>
      createTemplateService(d),
    []
  );
  const updateTemplate = useCallback(
    async (id: string, d: Partial<Omit<PromptTemplate, "id">>) =>
      updateTemplateService(id, d),
    []
  );
  const deleteTemplate = useCallback(
    async (id: string) => deleteTemplateService(id),
    []
  );

  return {
    data,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}

// -----------------------------------------------------------------------------
// AI Tool Profiles
// -----------------------------------------------------------------------------

interface UseAIToolProfilesResult {
  data: AIToolProfile[];
  isLoading: boolean;
  error: string | null;
  upsertTool: (profile: AIToolProfile) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
}

export function useAIToolProfiles(): UseAIToolProfilesResult {
  const [data, setData] = useState<AIToolProfile[]>(AI_TOOL_PROFILES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAIToolProfiles(
      (items) => {
        setData(items.length > 0 ? items : AI_TOOL_PROFILES);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const upsertTool = useCallback(
    async (p: AIToolProfile) => upsertToolService(p),
    []
  );
  const deleteTool = useCallback(
    async (id: string) => deleteToolService(id),
    []
  );

  return { data, isLoading, error, upsertTool, deleteTool };
}

// -----------------------------------------------------------------------------
// Prompt Assignments
// -----------------------------------------------------------------------------

interface UsePromptAssignmentsResult {
  data: PromptAssignment[];
  isLoading: boolean;
  error: string | null;
  upsertAssignment: (assignment: PromptAssignment) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

export function usePromptAssignments(): UsePromptAssignmentsResult {
  const [data, setData] = useState<PromptAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePromptAssignments(
      (items) => {
        setData(items);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const upsertAssignment = useCallback(
    async (a: PromptAssignment) => upsertAssignmentService(a),
    []
  );
  const deleteAssignment = useCallback(
    async (id: string) => deleteAssignmentService(id),
    []
  );

  return { data, isLoading, error, upsertAssignment, deleteAssignment };
}

// -----------------------------------------------------------------------------
// Context Rules
// -----------------------------------------------------------------------------

interface UseContextRulesResult {
  data: ContextRule[];
  isLoading: boolean;
  error: string | null;
  upsertRule: (rule: ContextRule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

export function useContextRules(): UseContextRulesResult {
  const [data, setData] = useState<ContextRule[]>(DEFAULT_CONTEXT_RULES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeContextRules(
      (items) => {
        setData(items.length > 0 ? items : DEFAULT_CONTEXT_RULES);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const upsertRule = useCallback(
    async (r: ContextRule) => upsertRuleService(r),
    []
  );
  const deleteRule = useCallback(
    async (id: string) => deleteRuleService(id),
    []
  );

  return { data, isLoading, error, upsertRule, deleteRule };
}
