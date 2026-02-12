"use client";

import React, { useState, useEffect } from "react";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Loader2, Plus } from "lucide-react";

import { getFirestoreDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

import { useToast } from "./_components/use-toast";
import {
  ApiKeyForm,
  type ApiKeyFormData,
} from "./_components/api-key-form";
import { ApiKeyCreatedAlert } from "./_components/api-key-created-alert";
import { ApiKeysTable } from "./_components/api-keys-table";

import type { ApiKey } from "@/types";

// =============================================================================
// Helpers — key generation & hashing (client-side)
// =============================================================================

function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `rh_${hex}`;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// =============================================================================
// Main Page
// =============================================================================

export default function ApiKeysPage(): React.JSX.Element {
  const { user } = useAuth();
  const { show, ToastNode } = useToast();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [createdPlaintext, setCreatedPlaintext] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Real-time subscription
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const q = query(
      collection(getFirestoreDb(), "api-keys"),
      orderBy("created_at", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          created_at: d.data().created_at?.toDate?.()?.toISOString() ?? "",
          last_used_at:
            d.data().last_used_at?.toDate?.()?.toISOString() ?? null,
          expires_at: d.data().expires_at?.toDate?.()?.toISOString() ?? null,
        })) as ApiKey[];
        setKeys(items);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading API keys:", error);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = async (data: ApiKeyFormData) => {
    const plaintext = generateApiKey();
    const keyHash = await hashKey(plaintext);

    try {
      await addDoc(collection(getFirestoreDb(), "api-keys"), {
        name: data.name.trim(),
        key_hash: keyHash,
        permissions: data.permissions,
        agent_identity: {
          agent_id: data.agent_id,
          agent_name: data.agent_name,
          agent_version: data.agent_version,
          run_id: data.run_id,
        },
        created_by: user?.uid ?? "",
        created_at: serverTimestamp(),
        last_used_at: null,
        is_active: true,
        expires_at: data.expires_at
          ? new Date(data.expires_at)
          : null,
      });

      setCreatedPlaintext(plaintext);
      setIsFormVisible(false);
      show(`API key "${data.name}" created successfully`);
    } catch (error) {
      console.error("Error creating API key:", error);
      show("Failed to create API key. Please try again.");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await updateDoc(doc(getFirestoreDb(), "api-keys", id), {
        is_active: false,
      });
      const key = keys.find((k) => k.id === id);
      show(`Key "${key?.name}" has been revoked`);
    } catch (error) {
      console.error("Error revoking API key:", error);
      show("Failed to revoke key. Please try again.");
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage API keys for agent and external system access
          </p>
        </div>
        <Button onClick={() => setIsFormVisible(true)}>
          <Plus className="h-4 w-4" />
          Create Key
        </Button>
      </div>

      {/* Loading */}
      {isLoading && keys.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Plaintext key alert (shown once after creation) */}
      {createdPlaintext && (
        <ApiKeyCreatedAlert
          plaintextKey={createdPlaintext}
          onDismiss={() => setCreatedPlaintext(null)}
        />
      )}

      {/* Create Form */}
      {isFormVisible && (
        <ApiKeyForm
          onSubmit={handleCreate}
          onCancel={() => setIsFormVisible(false)}
        />
      )}

      {/* Keys Table */}
      {!isLoading && (
        <ApiKeysTable keys={keys} onRevoke={handleRevoke} />
      )}

      {ToastNode}
    </div>
  );
}
