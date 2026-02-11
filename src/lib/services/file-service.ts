import { getAdminFirestore, getAdminStorage } from '@/lib/firebase-admin';
import { UploadFileSchema } from '@/lib/validations';
import type { FileAttachment, ResearchOrigin } from '@/types';

// Magic byte signatures for file type validation
const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4B, 0x03, 0x04]], // PK (ZIP-based)
  'application/json': [], // validated by parsing
  'text/plain': [],       // no magic bytes for text
  'text/markdown': [],    // no magic bytes for text
  'text/csv': [],         // no magic bytes for text
};

/** Validate that a buffer matches the expected MIME type via magic bytes. */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures || signatures.length === 0) return true; // text types pass
  return signatures.some(sig =>
    sig.every((byte, i) => buffer.length > i && buffer[i] === byte)
  );
}

/** Upload a file to Firebase Storage and create a FileAttachment record. */
export async function uploadResearchFile(params: {
  research_id: string;
  file_name: string;
  file_type: string;
  file_buffer: Buffer;
  uploaded_by: string;
  origin: ResearchOrigin;
  source_id?: string | null;
}): Promise<FileAttachment & { id: string }> {
  // Validate input
  const validated = UploadFileSchema.parse({
    file_name: params.file_name,
    file_type: params.file_type,
    size_bytes: params.file_buffer.length,
    source_id: params.source_id ?? null,
  });

  // Validate magic bytes
  if (!validateMagicBytes(params.file_buffer, params.file_type)) {
    throw new Error(`File content does not match declared type: ${params.file_type}`);
  }

  const db = getAdminFirestore();
  const storage = getAdminStorage();
  const storagePath = `research/${params.research_id}/${Date.now()}-${validated.file_name}`;

  try {
    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    await file.save(params.file_buffer, {
      metadata: { contentType: params.file_type },
    });
    await file.makePublic();
    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Create Firestore record
    const attachment: Omit<FileAttachment, 'id'> = {
      research_id: params.research_id,
      source_id: validated.source_id,
      file_name: validated.file_name,
      file_type: params.file_type,
      storage_path: storagePath,
      download_url: downloadUrl,
      size_bytes: params.file_buffer.length,
      uploaded_by: params.uploaded_by,
      uploaded_at: new Date().toISOString(),
      origin: params.origin,
    };

    const docRef = await db.collection('file-attachments').add(attachment);
    return { id: docRef.id, ...attachment };
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

/** List file attachments for a research entry. */
export async function listResearchFiles(researchId: string): Promise<Array<FileAttachment & { id: string }>> {
  const db = getAdminFirestore();
  try {
    const snapshot = await db.collection('file-attachments')
      .where('research_id', '==', researchId)
      .orderBy('uploaded_at', 'desc')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<FileAttachment & { id: string }>;
  } catch (error) {
    console.error('File listing failed:', error);
    throw error;
  }
}
