/**
 * In-memory Firebase Storage mock for file upload tests.
 */

interface UploadedFile {
  path: string;
  data: Buffer;
  metadata: unknown;
}

const uploadedFiles: UploadedFile[] = [];

export function resetStorage(): void {
  uploadedFiles.length = 0;
}

export function getUploadedFiles(): UploadedFile[] {
  return uploadedFiles;
}

const mockBucket = {
  name: 'test-bucket',
  file: (path: string) => ({
    save: async (data: Buffer, options?: { metadata?: unknown }) => {
      uploadedFiles.push({ path, data, metadata: options?.metadata });
    },
    makePublic: async () => {},
    getSignedUrl: async () => [`https://storage.googleapis.com/test-bucket/${path}?signed=true`],
  }),
};

export function storage() {
  return { bucket: () => mockBucket };
}
