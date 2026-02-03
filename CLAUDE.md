# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ITQ Market Intelligence Portal — an internal Next.js application where ITQ employees can search, consult, and initiate structured market research across geographies, domains, and sectors. The portal is both a **library** (find and read research) and a **workbench** (define, execute, and publish research).

## Commands

```bash
# Development
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript, React 19) |
| Styling | Tailwind CSS v4 (CSS-based config, no tailwind.config) |
| UI Components | Radix UI primitives + Lucide React icons |
| Backend | Firebase (Firestore, Auth, Storage) |
| Auth | Firebase Auth (Google + Email/Password) |
| Utilities | date-fns, uuid, clsx + tailwind-merge, react-markdown |

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Providers wrapper)
│   ├── providers.tsx             # Client-side providers (AuthProvider)
│   ├── globals.css               # Tailwind v4 theme variables
│   ├── login/                    # Standalone login page (no AppShell)
│   └── (dashboard)/              # Route group — all pages wrapped in AppShell
│       ├── layout.tsx            # Dashboard layout (AppShell)
│       ├── page.tsx              # Dashboard home
│       ├── research/             # Research Library, detail, wizard
│       ├── context-library/      # Context Library CRUD
│       └── admin/                # Taxonomy + user management
├── components/
│   ├── ui/                       # Base UI primitives (Badge, Button, Card, Input, Textarea)
│   ├── layout/                   # AppShell (sidebar + header + main)
│   ├── shared/                   # Reusable domain components (StatusBadge, DimensionTags, etc.)
│   ├── research/                 # Research-specific components (future)
│   ├── context/                  # Context Library components (future)
│   └── admin/                    # Admin components (future)
├── hooks/                        # Custom React hooks
│   └── use-auth.tsx              # Firebase Auth provider + hook
├── lib/                          # Utilities and services
│   ├── firebase.ts               # Firebase lazy init (SSR-safe)
│   ├── utils.ts                  # cn(), formatDate(), generateId(), etc.
│   ├── constants.ts              # Label maps, configs, enums
│   └── prompt-templates.ts       # Research prompt generation engine
├── types/
│   └── index.ts                  # All TypeScript types and union types
└── data/                         # Seed data and mock data
    ├── markets.ts                # Market taxonomy (hierarchical)
    ├── domains.ts                # Domain taxonomy with default sources
    ├── sectors.ts                # Sector taxonomy with regulations
    ├── tags.ts                   # System tags
    ├── mock-research.ts          # Mock research data (MVP)
    └── mock-context-documents.ts # Mock context documents (MVP)
```

### Key Files

- `src/types/index.ts` — All TypeScript types; **single source of truth** for the data model
- `src/lib/firebase.ts` — Lazy Firebase initialization; **never** import Firebase at module level in server components
- `src/hooks/use-auth.tsx` — Auth state, sign-in/out methods, role derivation
- `src/lib/prompt-templates.ts` — Generates discovery/analysis/synthesis prompts per domain and notebook type
- `src/lib/constants.ts` — All label maps, notebook configs, refresh schedules, time estimates
- `src/components/layout/app-shell.tsx` — Main navigation shell; wraps all authenticated pages

### Route Groups

| Route | Purpose | Auth required |
|-------|---------|--------------|
| `/login` | Sign in / sign up (standalone layout, no sidebar) | No |
| `/` | Dashboard with overview stats | Yes |
| `/research` | Research Library listing with search + filters | Yes |
| `/research/new` | Research Wizard (multi-step form) | Yes |
| `/research/[id]` | Research detail with tabs | Yes |
| `/context-library` | Context Library listing | Yes |
| `/context-library/new` | Upload context document | Yes |
| `/context-library/[id]` | Context document detail | Yes |
| `/admin/taxonomy` | Taxonomy management (admin only) | Yes (admin) |
| `/admin/users` | User management (admin only) | Yes (admin) |

### Data Model

The portal's data model is defined in `src/types/index.ts`. The three core dimension types (Market, Domain, Sector) form the classification axes for all research and context documents. Key entities:

- **Research** — the primary artifact; contains notebooks, sources, synthesis, assumptions, version lineage
- **ContextDocument** — ITQ internal docs or curated external sources used as research input
- **Notebook** — a research lens (market_regulation, competitive, business_model, local_sector)
- **Source** — a reference with quality tier (1-8) and discovery tool attribution

## Security Requirements

### Firebase Security

- NEVER use `allow read: if true` or `allow write: if true` in Firestore rules
- Always check authentication: `if request.auth != null`
- Always verify ownership or role-based access before allowing operations
- Test security rules with Firebase emulator before deploying

### Authentication

- Firebase Auth with lazy initialization (SSR-safe — no module-level `getAuth()`)
- Role derivation: `@itq.nl` emails → admin, others → researcher (MVP)
- Protected routes via `<ProtectedRoute>` component
- Admin routes check `isAdmin` before rendering nav items and page content

### Input Sanitization

- Sanitize user input before embedding in HTML
- Validate file types and sizes on Context Library uploads
- Escape markdown content before rendering with react-markdown
- Never expose raw error messages to users

## Code Quality Standards

### No Code Duplication

- NEVER duplicate code across multiple files
- Extract common patterns into shared utilities in `lib/`
- Create custom hooks for repeated React patterns
- Use shared components from `components/ui/` and `components/shared/`
- Before writing similar code, check if a utility/hook/component already exists

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Boolean variables | Prefix with `is`, `has`, `can` | `isLoading`, `hasAccess`, `canEdit` |
| Loading states | Use `isLoading` consistently | `isLoading` (not `loading`) |
| Async functions | Prefix with `handle` or `fetch` | `handleSubmit`, `fetchResearch` |
| Event handlers | Prefix with `handle` | `handleClick`, `handleFilterChange` |
| Directories | Lowercase with dashes | `components/context-library` |
| Types/Interfaces | PascalCase | `Research`, `ContextDocument` |
| Union types | PascalCase | `ResearchStatus`, `OutputFormat` |
| Constants | UPPER_SNAKE_CASE for exports | `MOCK_RESEARCH`, `DOMAINS` |
| Seed data arrays | Plural UPPER_SNAKE | `MARKETS`, `SECTORS`, `SYSTEM_TAGS` |

### Type Safety

- NEVER use `any` type unless absolutely necessary
- Define proper interfaces in `types/index.ts`
- TypeScript strict mode is enabled
- Properly type Firestore documents when integrating
- Prefer `interface` over `type` for object shapes
- Use explicit return type annotations for exported functions
- Use union types for known string sets (e.g., `ResearchStatus`, `OutputFormat`)

```typescript
// Good
interface ResearchCardProps {
  research: Research;
  onSelect: (id: string) => void;
}

// Bad
type ResearchCardProps = { research: any; onSelect: Function; };
```

### React File Size Guidelines

- Components should stay between **50–150 lines**
- Files over **200 lines** should be split
- Files over **300 lines** indicate missing separation of concerns

Rules of thumb:
- One component = one responsibility
- Business logic lives in hooks or services, not components
- Hooks should be 30–80 lines and focus on a single concern
- Components should mainly contain JSX, minimal state, and callbacks
- If a file needs comments to explain its sections, it should be split

**Decomposition pattern:** When a component exceeds 200 lines, extract sub-pieces into a same-name subdirectory:
- UI sections → named sub-components
- Business logic → custom hooks (`useResearchFilters.ts`)
- Forms → separate form components
- The parent file becomes an orchestrator that imports and composes sub-pieces

### Error Handling

Always use try-catch in async functions with consistent pattern:

```typescript
try {
  // operation
} catch (error) {
  console.error('Context - what failed:', error);
  // Show user-friendly message via UI
}
```

- Log errors with context (what operation failed)
- Show user-friendly error messages in UI
- Never expose raw error messages to users
- Firebase errors should be translated to friendly messages (see login page for pattern)

## Code Patterns

### React Components

```typescript
interface Props {
  research: Research;
  onSelect?: (id: string) => void;
}

export function ResearchCard({ research, onSelect }: Props) {
  const { isAdmin } = useAuth();
  // ...
}
```

Use `function` declarations for exported components (not arrow functions assigned to const).

### State Management

```typescript
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState<Research[]>([]);
const [error, setError] = useState<string | null>(null);
```

### Firestore Data Loading (when Firebase is connected)

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

### Firestore Data Writing

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

### Firebase Initialization

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

### Firestore Collection Paths (planned)

```
research/{researchId}                    — Research documents
research/{researchId}/notebooks/{nbId}   — Notebook sub-collection
context-documents/{docId}                — Context Library documents
taxonomy/markets                         — Market taxonomy
taxonomy/domains                         — Domain taxonomy
taxonomy/sectors                         — Sector taxonomy
taxonomy/tags                            — Tags
users/{userId}                           — User profiles and roles
```

## Import Consistency

```typescript
// React / Next.js imports first
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// External libraries
import { format } from 'date-fns';
import { Search, Filter } from 'lucide-react';

// Firebase — always use lazy getters
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

// Internal — types
import type { Research, ContextDocument } from '@/types';

// Internal — utilities and constants
import { cn, formatDate } from '@/lib/utils';
import { RESEARCH_STATUS_LABELS } from '@/lib/constants';

// Internal — components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';

// Internal — hooks
import { useAuth } from '@/hooks/use-auth';

// Internal — data
import { DOMAINS } from '@/data/domains';
```

## Anti-Patterns to Avoid

```typescript
// Don't: Use any type
function processResearch(data: any) { }
// Do: Use proper types
function processResearch(data: Research): ResearchSummary { }

// Don't: Duplicate Firestore loading logic
const loadResearch = async () => { /* same pattern in 10 files */ }
// Do: Create shared data hooks
import { useResearchList } from '@/hooks/use-research';

// Don't: Inconsistent loading state naming
const [loading, setLoading] = useState(false);
// Do: Consistent naming with is- prefix
const [isLoading, setIsLoading] = useState(false);

// Don't: Nested ternaries
const label = a ? (b ? 'x' : 'y') : 'z';
// Do: Use switch or if/else
switch (true) {
  case a && b: return 'x';
  case a: return 'y';
  default: return 'z';
}

// Don't: Import Firebase at module level
import { auth } from '@/lib/firebase';
// Do: Use lazy getters inside hooks/effects
import { getFirebaseAuth } from '@/lib/firebase';
```

## Frontend Aesthetics

Avoid generic "AI slop" aesthetics. Make creative, distinctive frontends that surprise and delight.

**Typography:** Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the design.

**Color & Theme:** Commit to a cohesive aesthetic. Use CSS variables (defined in `globals.css`) for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**Motion:** Use animations for effects and micro-interactions. Prioritize CSS-only solutions. Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

**Backgrounds:** Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects.

**Avoid:**
- Overused font families (Inter, Roboto, Arial, system fonts)
- Cliched color schemes (purple gradients on white)
- Predictable layouts and component patterns
- Cookie-cutter design lacking context-specific character

Vary between light and dark themes, different fonts, different aesthetics. Never converge on the same common choices across generations.

## Environment Variables

Next.js uses `NEXT_PUBLIC_` prefix for client-side variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

See `.env.example` for the full list. Copy to `.env.local` and fill in values.

## MCP Servers

Configured in `.mcp.json`:
- **Context7** — library documentation lookups for up-to-date API references
- **Firebase MCP** — direct Firestore/Auth/Storage operations (requires service account key)

## Research Process Reference

The portal implements the ITQ standardised research process:
1. **Define** — select dimensions (market, domain, sector) and output format
2. **Structure** — determine notebook types (N1-N4) based on format
3. **Discover** — find sources using generated prompts (Perplexity/Claude/NotebookLM)
4. **Analyse** — run targeted analysis prompts per notebook
5. **Synthesise** — combine results with ITQ context documents
6. **Publish** — review, tag, set refresh schedule, publish

The prompt template engine (`lib/prompt-templates.ts`) generates domain-specific prompts for steps 3-5.
