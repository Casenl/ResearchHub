# Code Patterns

Project-specific patterns beyond the global standards in `~/.claude/docs/`.

## Firebase Initialization

Firebase is initialized lazily to avoid SSR errors. **Never** import Firebase instances at module top-level in files that may run on the server.

```typescript
// Good — lazy getter, only runs client-side
import { getFirebaseAuth } from '@/lib/firebase';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => { ... });
  return unsubscribe;
}, []);

// Bad — module-level initialization breaks SSR
import { auth } from '@/lib/firebase'; // crashes during build
```

### initializeAuth() requires explicit resolvers

When using `initializeAuth()` instead of `getAuth()` (e.g. to set custom persistence), you **must** also pass `popupRedirectResolver`. Without it, `signInWithPopup` throws `auth/argument-error` at runtime — a silent failure that builds and type-checks fine.

```typescript
// Good — explicit persistence AND popup resolver
import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';

initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Bad — missing resolver, signInWithPopup breaks at runtime
initializeAuth(app, {
  persistence: browserLocalPersistence,
});
```

**Why**: `getAuth()` bundles the popup resolver automatically. `initializeAuth()` strips all defaults — you must opt in to each capability explicitly.

## Firestore Data Loading

```typescript
const loadResearch = async () => {
  try {
    setIsLoading(true);
    const snapshot = await getDocs(collection(getFirestoreDb(), 'research'));
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? '',
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() ?? '',
    })) as Research[];
    setData(items);
  } catch (error) {
    console.error('Error loading research:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Firestore Data Writing

Always include timestamps when writing:

```typescript
import { serverTimestamp } from 'firebase/firestore';

const researchData = {
  ...formData,
  updatedAt: serverTimestamp(),
};

// For new documents
const newResearchData = {
  ...researchData,
  createdAt: serverTimestamp(),
};
```

## Import Order

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { format } from 'date-fns';
import { Search, Filter } from 'lucide-react';

// 3. Firebase — always use lazy getters
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

// 4. Internal — types
import type { Research, ContextDocument } from '@/types';

// 5. Internal — utilities and constants
import { cn, formatDate } from '@/lib/utils';
import { RESEARCH_STATUS_LABELS } from '@/lib/constants';

// 6. Internal — components
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';

// 7. Internal — hooks
import { useAuth } from '@/hooks/use-auth';

// 8. Internal — data
import { DOMAINS } from '@/data/domains';
```

## Authentication

- Firebase Auth with lazy initialization (SSR-safe — no module-level `getAuth()`)
- Role derivation: `@itq.nl` emails -> admin, others -> researcher (MVP)
- Protected routes via `<ProtectedRoute>` component
- Admin routes check `isAdmin` before rendering nav items and page content

## Dark Mode Colors for Badges/Tags

Every hardcoded Tailwind color class MUST include a `dark:` variant:

| Light | Dark |
|-------|------|
| `bg-{color}-50` or `-100` | `dark:bg-{color}-950` |
| `text-{color}-700` or `-800` | `dark:text-{color}-200` or `-300` |
| `border-{color}-200` | `dark:border-{color}-800` |

Reference implementation: `src/hooks/use-toast.tsx` VARIANT_STYLES.

## Frontend Aesthetics

Avoid generic "AI slop" aesthetics. Make creative, distinctive frontends that surprise and delight.

- **Typography:** Distinctive fonts, not generic (avoid Arial, Inter, Roboto, system fonts)
- **Color & Theme:** Cohesive aesthetic via CSS variables (`globals.css`). Dominant colors with sharp accents.
- **Motion:** CSS-only animations. One well-orchestrated page load > scattered micro-interactions.
- **Backgrounds:** Atmosphere and depth, not solid colors. Layer CSS gradients, geometric patterns.
- Vary between light/dark themes, different fonts, different aesthetics across generations.
