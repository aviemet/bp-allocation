# TypeScript Migration Guide

This document outlines the step-by-step process for migrating this Meteor application to TypeScript.

## Phase 1: Setup (✅ Completed)

- [x] Created `tsconfig.json` with proper configuration
- [x] Updated `package.json` with TypeScript dependencies
- [x] Migrated ESLint to v9 with flat config format
- [x] Created comprehensive type definitions in `imports/types.ts`
- [x] Updated build scripts for TypeScript support

## Phase 2: Dependency Upgrades (Next Steps)

### Meteor Upgrade

```bash
# Check current Meteor version
meteor --version

# Upgrade to latest Meteor with TypeScript support
meteor update --release 3.0
```

### React Dependencies Upgrade

```bash
# Upgrade React and related packages
yarn add react@^18.3.0 react-dom@^18.3.0
yarn add @types/react@^18.3.0 @types/react-dom@^18.3.0

# Upgrade React Router
yarn add react-router@^6.26.0 react-router-dom@^6.26.0
```

## Phase 3: File Migration Strategy

### Priority Order

1. **Core Types** - `imports/types.ts` (✅ Done)
2. **Simple Components** - Start with stateless components
3. **Complex Components** - Components with state and props
4. **API Methods** - Server-side methods and database operations
5. **Stores/Collections** - MobX stores and Meteor collections
6. **Tests** - Convert test files to TypeScript

### Migration Steps for Each File

1. **Rename** `.js/.jsx` → `.ts/.tsx`
2. **Add Type Annotations**:
   - Function parameters and return types
   - Component props interfaces
   - State types for hooks
3. **Update Imports**:
   - Use TypeScript imports
   - Add type-only imports where needed
4. **Fix Type Errors**:
   - Use proper TypeScript syntax
   - Add type guards where necessary
   - Handle Meteor-specific types

### Example Migration

**Before (Loading.jsx):**

```jsx
import React from 'react'
import { Box, CircularProgress } from '@mui/material'

const Loading = () => {
  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export default Loading
```

**After (Loading.tsx):**

```tsx
import React from 'react'
import { Box, CircularProgress } from '@mui/material'

const Loading: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export default Loading
```

## Phase 4: Testing and Validation

### Type Checking

```bash
# Check for TypeScript errors
yarn type-check

# Run ESLint with TypeScript rules
yarn lint
```

### Build Verification

```bash
# Ensure Meteor can build with TypeScript
yarn start
```

## Common Patterns and Solutions

### Meteor-Specific Types

```typescript
// For Meteor collections
import { Mongo } from 'meteor/mongo'

export const Members = new Mongo.Collection<Member>('members')

// For Meteor methods
import { Meteor } from 'meteor/meteor'

Meteor.call('methodName', params, (error, result) => {
  // Handle callback
})
```

### React Component Props

```typescript
interface ComponentProps {
  title: string
  isVisible: boolean
  onClose: () => void
  children?: ReactNode
}

const Component: React.FC<ComponentProps> = ({ title, isVisible, onClose, children }) => {
  // Component implementation
}
```

### MobX Store Types

```typescript
import { makeAutoObservable } from 'mobx'

class MemberStore {
  members: Member[] = []
  isLoading = false

  constructor() {
    makeAutoObservable(this)
  }

  setMembers(members: Member[]): void {
    this.members = members
  }
}
```

## Troubleshooting

### Common Issues

1. **Meteor Package Types**: Install `@types/meteor` for Meteor-specific types
2. **Import Paths**: Update import paths to use `.ts/.tsx` extensions
3. **JSX Configuration**: Ensure `tsconfig.json` has proper JSX settings
4. **ESLint Errors**: Update ESLint rules for TypeScript compatibility

### Resources

- [Meteor TypeScript Guide](https://guide.meteor.com/build-tool.html#typescript)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
