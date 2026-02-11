import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { app } from './app';

setGlobalOptions({
  region: 'europe-west1',
  memory: '256MiB',
  timeoutSeconds: 120,
});

/** Single Cloud Function wrapping the Express API. */
export const api = onRequest(app);
