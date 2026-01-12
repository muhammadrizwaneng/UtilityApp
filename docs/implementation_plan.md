# Professional UI, TypeScript Migration & global Safe Area Fix

Migrate the codebase to TypeScript for better maintainability, fix scrolling issues, and resolve safe area overlap issues on all internal screens.

## User Review Required
> [!IMPORTANT]
> This change involves renaming files from `.js` to `.ts/.tsx`. Ensure you have no unsaved changes in your editor before I proceed.

## Proposed Changes

### [TypeScript Migration]
- Rename all `.js` files in `src/` to `.ts` or `.tsx`.
- Create a `src/types` directory for common interfaces (Utility, Theme, Navigation).
- Add type annotations to all components and screens.

### [Safe Area & Layout Fixes]
#### [MODIFY] [All Screens](file:///Users/muhammadrizwansar/code/UtilityApp/src/screens/)
- Replace `SafeAreaView` with `useSafeAreaInsets` for precise control.
- Ensure the main container has `flex: 1` to allow internal `ScrollView`/`FlatList` to function correctly.
- Add dynamic padding to headers and footers using insets.

### [Theme & Design System]
#### [MODIFY] [theme.ts](file:///Users/muhammadrizwansar/code/UtilityApp/src/constants/theme.ts)
- Maintain the professional palette but strictly type it.

## Verification Plan

### Automated Tests
- Run `tsc` to check for type errors.

### Manual Verification
- **Scrolling Check**: Verify that `FlatList` on Home and `ScrollView` on internal pages like `Unit Converter` and `Image to PDF` scroll smoothly.
- **Safe Area Check**: Verify all screens (Home and Internal) handle notches and home indicators correctly.
- **Navigation Check**: Ensure all navigation still works with typed routes.
