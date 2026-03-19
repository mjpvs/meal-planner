# Agent Guidelines for React & Next.js Development

## General Principles

- Use 4 spaces for indentation
- Prefer functional components with hooks over class components
- Use TypeScript for type safety
- Keep components small and focused on a single responsibility
- colocate files by feature or route, not by file type

## Next.js Specific

### App Router (Next.js 13+)

- Use Server Components by default; add `'use client'` only when client-side interactivity is needed
- Keep client components at the leaves of the component tree
- Use `next/image` for all images to enable optimization
- Use `next/link` for navigation (no `<a>` tags for internal links)
- Use `generateMetadata` or `metadata` export for SEO
- Leverage React's `cache()` for request memoization

### Data Fetching

- Prefer Server Components for data fetching
- Use `fetch()` with extended caching options for static data
- Use `revalidatePath` or `revalidateTag` for on-demand revalidation
- Avoid `useEffect` for initial data fetching

### Routing

- Use lowercase, hyphenated route segments (e.g., `/meal-plans`)
- Use route groups `(folder)` for organizational purposes
- Place shared layouts at the parent level
- Use dynamic segments `[id]` for parameterized routes

## React Patterns

### Component Structure

```tsx
// 1. Imports (external first, then internal)
// 2. Types/interfaces
// 3. Component definition
// 4. Helper functions (if needed)
// 5. Main render

export default function Component() {
    return (
        <div>
            {/* JSX */}
        </div>
    );
}
```

### State Management

- Use `useState` for local component state
- Use `useReducer` for complex local state
- Use React Context sparingly; prefer prop drilling for shallow trees
- Lift state to the lowest common ancestor
- Co-locate state with the components that use it

### Hooks

- Always include hooks at the top level, before any early returns
- Custom hooks should start with `use` and return either a value or an array
- Use `useMemo` and `useCallback` judiciously; measure before optimizing

### Performance

- Use `React.memo()` only when a component re-renders frequently with same props
- Prefer composition over prop drilling for deeply nested data
- Use `next/dynamic` or `React.lazy` for code splitting
- Avoid anonymous functions in render for stable references

## Styling

- Use CSS Modules or Tailwind CSS for component-scoped styles
- Avoid inline styles except for dynamic values
- Use CSS variables for theming

## File Naming

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` starting with `use`
- Utilities: `camelCase.ts`
- Routes: `kebab-case/page.tsx`
- Constants: `SCREAMING_SNAKE_CASE.ts`

## Testing

- Write unit tests for utilities and hooks
- Write integration tests for components and pages
- Test behavior, not implementation details
- Use `@testing-library/react` for component tests
- Mock external dependencies (API calls, external modules)
