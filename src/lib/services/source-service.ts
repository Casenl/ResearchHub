import { getAdminFirestore } from '@/lib/firebase-admin';
import { CreateSourceSchema, ValidateSourceSchema } from '@/lib/validations';
import { getDefaultTierForTool, calculateTierAdjustment } from '@/lib/trust-tiers';
import type { Source, QualityTier, ValidationStatus } from '@/types';

/** Add a source to a research entry's notebook. */
export async function addSource(
  researchId: string,
  notebookId: string,
  input: unknown,
  addedBy: string,
): Promise<Source> {
  const validated = CreateSourceSchema.parse(input);
  const db = getAdminFirestore();

  const source: Source = {
    id: `src-${Date.now()}`,
    title: validated.title,
    url: validated.url,
    publisher: validated.publisher,
    publication_date: validated.publication_date,
    quality_tier: validated.quality_tier ?? getDefaultTierForTool(validated.discovered_by),
    discovered_by: validated.discovered_by,
    notes: validated.notes,
    validation_status: 'unverified',
    validated_by: null,
    validated_at: null,
    validation_notes: '',
  };

  try {
    const researchRef = db.collection('research').doc(researchId);
    const notebookRef = researchRef.collection('notebooks').doc(notebookId);
    const notebookDoc = await notebookRef.get();

    if (!notebookDoc.exists) {
      // If notebooks are embedded in research doc, update the research doc directly
      const researchDoc = await researchRef.get();
      if (!researchDoc.exists) throw new Error(`Research ${researchId} not found`);

      const data = researchDoc.data()!;
      const notebooks = data.notebooks ?? [];
      const nbIndex = notebooks.findIndex((nb: { id: string }) => nb.id === notebookId);

      if (nbIndex === -1) throw new Error(`Notebook ${notebookId} not found in research ${researchId}`);

      notebooks[nbIndex].sources = [...(notebooks[nbIndex].sources ?? []), source];
      await researchRef.update({ notebooks, updated_at: new Date().toISOString() });
    } else {
      // Sub-collection approach
      const sources = notebookDoc.data()?.sources ?? [];
      await notebookRef.update({ sources: [...sources, source] });
    }

    return source;
  } catch (error) {
    console.error('Source addition failed:', error);
    throw error;
  }
}

/** Validate a source -- record corroboration, verification, or dispute. */
export async function validateSource(
  researchId: string,
  sourceId: string,
  input: unknown,
  validatedBy: string,
): Promise<{ new_tier: QualityTier; new_status: ValidationStatus }> {
  const validated = ValidateSourceSchema.parse(input);
  const db = getAdminFirestore();

  try {
    const researchRef = db.collection('research').doc(researchId);
    const researchDoc = await researchRef.get();
    if (!researchDoc.exists) throw new Error(`Research ${researchId} not found`);

    const data = researchDoc.data()!;
    const notebooks = data.notebooks ?? [];
    let isSourceFound = false;
    let newTier: QualityTier = 1;

    for (const notebook of notebooks) {
      const sources: Source[] = notebook.sources ?? [];
      const sourceIndex = sources.findIndex((s: Source) => s.id === sourceId);
      if (sourceIndex !== -1) {
        const currentTier = sources[sourceIndex].quality_tier;
        newTier = calculateTierAdjustment(currentTier, validated.validation_status);
        sources[sourceIndex] = {
          ...sources[sourceIndex],
          validation_status: validated.validation_status,
          validated_by: validatedBy,
          validated_at: new Date().toISOString(),
          validation_notes: validated.validation_notes,
          quality_tier: newTier,
        };
        isSourceFound = true;
        break;
      }
    }

    if (!isSourceFound) throw new Error(`Source ${sourceId} not found in research ${researchId}`);

    await researchRef.update({ notebooks, updated_at: new Date().toISOString() });
    return { new_tier: newTier, new_status: validated.validation_status };
  } catch (error) {
    console.error('Source validation failed:', error);
    throw error;
  }
}
