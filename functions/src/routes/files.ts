import { Router, Response } from 'express';
import { ZodError } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { UploadFileSchema, MAX_FILE_SIZE_BYTES } from '../schemas';
import { db, storage } from '../lib/admin';

export const filesRouter = Router();

/** Check file content matches declared MIME type via magic bytes. */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4b, 0x03, 0x04],
  };
  const sig = signatures[mimeType];
  if (!sig) return true; // text-based types skip validation
  return sig.every((byte, i) => buffer.length > i && buffer[i] === byte);
}

// POST /:id/files — Upload a file attachment
filesRouter.post(
  '/:id/files',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parsed = UploadFileSchema.parse(req.body);

      // Decode base64 payload
      const buffer = Buffer.from(parsed.file_data, 'base64');

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        res.status(400).json({
          error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
        });
        return;
      }

      if (!validateMagicBytes(buffer, parsed.file_type)) {
        res.status(400).json({ error: 'File content does not match declared MIME type' });
        return;
      }

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const storagePath = `research/${id}/${timestamp}-${parsed.file_name}`;
      const bucket = storage().bucket();
      const file = bucket.file(storagePath);
      await file.save(buffer, { metadata: { contentType: parsed.file_type } });
      await file.makePublic();
      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      // Create Firestore record
      const attachment = {
        research_id: id,
        source_id: parsed.source_id,
        file_name: parsed.file_name,
        file_type: parsed.file_type,
        storage_path: storagePath,
        download_url: downloadUrl,
        size_bytes: buffer.length,
        uploaded_by: req.apiKey?.agent_identity.agent_id ?? 'unknown',
        uploaded_at: new Date().toISOString(),
        origin: 'agent' as const,
      };

      const docRef = await db().collection('file-attachments').add(attachment);

      // Audit log (fire-and-forget)
      db().collection('audit_logs').add({
        timestamp: new Date().toISOString(),
        actor: {
          user_id: req.apiKey?.agent_identity.agent_id ?? '',
          display_name: req.apiKey?.agent_identity.agent_name ?? 'unknown',
        },
        action: 'file_uploaded',
        target_type: 'file',
        target_id: docRef.id,
        target_name: parsed.file_name,
        details: {
          research_id: id,
          file_type: parsed.file_type,
          size_bytes: buffer.length,
          storage_path: storagePath,
        },
        category: 'research',
      }).catch(() => {});

      res.status(201).json({ id: docRef.id, ...attachment });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation failed', issues: error.issues });
        return;
      }
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },
);

// GET /:id/files — List file attachments for a research item
filesRouter.get(
  '/:id/files',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const snapshot = await db()
        .collection('file-attachments')
        .where('research_id', '==', id)
        .orderBy('uploaded_at', 'desc')
        .get();

      const files = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      res.status(200).json(files);
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  },
);
