# 🎨 UI/UX Implementation Guide

## Enterprise-Grade Editor UI/UX - Complete Implementation

This guide shows you how to integrate all the new UI components into your editor.

---

## 📦 What's Been Implemented

### ✅ Completed Components

1. **UI State Management** (`/lib/store/editorUI.ts`)
   - Zustand store with persistence
   - Panel states, view modes, preferences
   - Optimized selectors

2. **Animation Library** (`/lib/animations.ts`)
   - Framer Motion variants
   - Accessibility-aware (respects prefers-reduced-motion)
   - Reusable transitions

3. **Keyboard Shortcuts** (`/lib/useKeyboardShortcuts.ts`)
   - Centralized shortcut management
   - Platform-aware (Mac/Windows)
   - Conflict detection

4. **Sheet Component** (`/components/ui/sheet.tsx`)
   - shadcn/ui Sheet component
   - Sliding panels from all sides
   - Backdrop blur

5. **Top Bar Auto-Hide** (`/app/editor/_components/TopBarAutoHide.tsx`)
   - Hides on scroll down
   - Shows on scroll up or hover at top
   - Pin/unpin functionality
   - Compact mode

6. **Left Sidebar Sliding** (`/app/editor/_components/LeftSidebarSliding.tsx`)
   - Collapsible to icons
   - Hover to preview
   - Library and outline tabs
   - Search components

7. **Right Inspector Sliding** (`/app/editor/_components/RightInspectorSliding.tsx`)
   - Auto-show on selection
   - Props/Layout/Style tabs
   - Pin/unpin
   - Schema-based form generation

8. **Bubble Menu Enhanced** (`/app/editor/_components/BubbleMenuEnhanced.tsx`)
   - Appears on text selection
   - Formatting, colors, highlights
   - AI actions (placeholder)
   - More options

9. **Component Hover Menu** (`/app/editor/_components/ComponentHoverMenu.tsx`)
   - Shows on component hover
   - Quick actions: move, duplicate, delete
   - Drag handle

---

## 🚀 Integration Steps

### Step 1: Install Dependencies

```bash
npm install framer-motion zustand react-hotkeys-hook @radix-ui/react-slot
```

### Step 2: Update Your Editor Page

Replace your current editor page imports and add the new components:

```typescript
// app/editor/[id]/page.tsx
import { useEditorUI } from "@/lib/store/editorUI";
import useEditorShortcuts from "@/lib/useKeyboardShortcuts";
import TopBarAutoHide from "@/app/editor/_components/TopBarAutoHide";
import LeftSidebarSliding from "@/app/editor/_components/LeftSidebarSliding";
import RightInspectorSliding from "@/app/editor/_components/RightInspectorSliding";
import BubbleMenuEnhanced from "@/app/editor/_components/BubbleMenuEnhanced";
import { AnimatePresence } from "framer-motion";
```

### Step 3: Use UI State Management

```typescript
export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  // ... existing code ...
  
  // Add UI state
  const {
    leftSidebarOpen,
    rightInspectorOpen,
    topBarVisible,
    viewMode,
    enterFocusMode,
    enterZenMode,
    exitSpecialMode,
  } = useEditorUI();

  // Add keyboard shortcuts
  useEditorShortcuts({
    onToggleLeftSidebar: () => {
      const { toggleLeftSidebar } = useEditorUI.getState();
      toggleLeftSidebar();
    },
    onToggleRightInspector: () => {
      const { toggleRightInspector } = useEditorUI.getState();
      toggleRightInspector();
    },
    onCommandPalette: () => setCmdkOpen(true),
    onFocusMode: () => enterFocusMode(),
    onZenMode: () => enterZenMode(),
    onSave: () => {
      // Your save logic
    },
    onPublish: () => {
      // Your publish logic
    },
    onShowHelp: () => setHelpOpen(true),
  });

  // ... rest of your code ...
}
```

### Step 4: Replace Top Bar

Replace your existing `TopBarEnhanced` with `TopBarAutoHide`:

```typescript
{/* Old */}
<TopBarEnhanced
  title={title}
  saving={saving}
  // ... other props
/>

{/* New */}
<TopBarAutoHide
  title={title}
  saving={saving}
  lastSaved={new Date()}
  onSave={() => {
    const json = editor?.getJSON();
    // Save logic
  }}
  onPublish={onPublish}
  onView={() => {
    const pk = projectKeyRef.current;
    if (pk && slug) router.push(`/p/${pk}/${slug}`);
  }}
  onInsertImage={onInsertImageClick}
  onOpenCommandPalette={() => setCmdkOpen(true)}
  onOpenHelp={() => setHelpOpen(true)}
  onOpenSettings={() => setDocumentSettingsOpen(true)}
  breadcrumbs={[
    { label: "Projects", onClick: () => router.push("/") },
    { label: title },
  ]}
/>
```

### Step 5: Replace Left Sidebar

Replace your existing left sidebar with `LeftSidebarSliding`:

```typescript
{/* Wrap in AnimatePresence for smooth transitions */}
<AnimatePresence>
  {leftSidebarOpen && (
    <LeftSidebarSliding
      width={leftWidth}
      components={components}
      libraryQuery={libraryQuery}
      onLibraryQueryChange={setLibraryQuery}
      onDragStartComponent={(e, c) => {
        e.dataTransfer.setData(
          "application/x-dc-component",
          JSON.stringify({ key: c.key, props: c.defaultConfig })
        );
      }}
      onOutlineJump={(pos) => {
        editor?.chain().focus().setTextSelection(pos + 1).run();
      }}
      onOutlineMove={(pos, dir) => {
        // Your move section logic
      }}
      outlineItems={getOutlineItems()}
      activeTab={leftTab}
      onChangeTab={setLeftTab}
      onMouseDownResizer={startLeftResize}
    />
  )}
</AnimatePresence>
```

### Step 6: Replace Right Inspector

Replace your existing inspector with `RightInspectorSliding`:

```typescript
<AnimatePresence>
  {rightInspectorOpen && (
    <RightInspectorSliding
      width={rightWidth}
      onMouseDownResizer={startRightResize}
      selectedNode={
        selectedSectionProps
          ? {
              attrs: {
                props: selectedSectionProps,
                componentKey: selectedSectionKey,
              },
            }
          : null
      }
      onUpdateProps={(next) => {
        setSelectedSectionProps(next);
        editor?.chain().focus().updateAttributes("section", { props: next }).run();
      }}
      onDeleteNode={deleteSection}
      onDuplicateNode={duplicateSection}
      onResetProps={resetProps}
      tab={inspectorTab}
      onChangeTab={setInspectorTab}
      rawPropsMode={rawPropsMode}
      setRawPropsMode={setRawPropsMode}
      components={components}
      bottomExtra={
        <>
          <TableInspector editor={editor} />
          <ImageInspector editor={editor} />
        </>
      }
    />
  )}
</AnimatePresence>
```

### Step 7: Add Bubble Menu

Add the bubble menu to your editor:

```typescript
{/* Add after EditorContent */}
<BubbleMenuEnhanced 
  editor={editor} 
  onToggleLink={onToggleLink}
/>
```

### Step 8: Update Layout Structure

Update your main layout to support the new panel system:

```typescript
return (
  <div className="flex h-screen flex-col overflow-hidden">
    {/* Top Bar */}
    <TopBarAutoHide {...topBarProps} />

    {/* Main Content Area */}
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
      <AnimatePresence>
        {leftSidebarOpen && <LeftSidebarSliding {...leftSidebarProps} />}
      </AnimatePresence>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto">
        <div
          className={cn(
            "mx-auto px-8 py-12 transition-all",
            viewMode === "focus" && "max-w-3xl",
            viewMode === "zen" && "max-w-2xl",
            viewMode === "normal" && "max-w-4xl"
          )}
        >
          <EditorContent editor={editor} />
          <BubbleMenuEnhanced editor={editor} onToggleLink={onToggleLink} />
        </div>
      </div>

      {/* Right Inspector */}
      <AnimatePresence>
        {rightInspectorOpen && <RightInspectorSliding {...inspectorProps} />}
      </AnimatePresence>
    </div>
  </div>
);
```

---

## 🎨 View Modes

The new UI system supports multiple view modes:

### Normal Mode (default)
```typescript
// Full editor with all panels
```

### Focus Mode
```typescript
// Hide sidebars, keep top bar
const { enterFocusMode } = useEditorUI();
enterFocusMode();
```

### Zen Mode
```typescript
// Hide everything, fullscreen editing
const { enterZenMode } = useEditorUI();
enterZenMode();
```

### Exit Special Mode
```typescript
const { exitSpecialMode } = useEditorUI();
exitSpecialMode();
```

---

## ⌨️ Keyboard Shortcuts

All shortcuts are automatically registered when you use `useEditorShortcuts`:

| Shortcut | Action |
|----------|--------|
| `⌘+\` | Toggle left sidebar |
| `⌘+/` | Toggle right inspector |
| `⌘+.` | Toggle top bar |
| `⌘+K` | Command palette |
| `⌘+P` | Quick switcher |
| `⌘+⇧+F` | Focus mode |
| `⌘+⇧+Z` | Zen mode |
| `⌘+S` | Save |
| `⌘+⇧+P` | Publish |
| `?` | Show help |

---

## 🎭 Animations

All animations respect user preferences:

```typescript
// Animations automatically disabled if user prefers reduced motion
import { prefersReducedMotion, getAnimation } from "@/lib/animations";

// Use in your components
const variants = getAnimation(slideVariants.fromLeft);
```

---

## 🎨 Customization

### Change Panel Widths

```typescript
const { canvasWidth, setCanvasWidth } = useEditorUI();

// Change canvas width (400-1200px)
setCanvasWidth(800);
```

### Auto-Hide Behavior

```typescript
const { autoHideTopBar, setAutoHideTopBar } = useEditorUI();

// Disable auto-hide
setAutoHideTopBar(false);
```

### Pin Panels

```typescript
const { topBarPinned, setTopBarPinned } = useEditorUI();

// Pin top bar (won't auto-hide)
setTopBarPinned(true);
```

---

## 🌙 Dark Mode

Dark mode is automatically supported:

```typescript
const { themeMode, setThemeMode } = useEditorUI();

// Set theme
setThemeMode('dark');    // Dark mode
setThemeMode('light');   // Light mode
setThemeMode('system');  // Follow system
```

---

## 📱 Mobile Support

The new UI is responsive and mobile-friendly:

- **Top Bar**: Compact mode on mobile
- **Sidebars**: Full-screen sheets on mobile
- **Bubble Menu**: Touch-optimized
- **Inspector**: Bottom sheet on mobile

---

## 🐛 Error Handling

All components include error boundaries:

```typescript
try {
  // Component logic
} catch (error) {
  console.error("[ComponentName] Error:", error);
  // Fallback behavior
}
```

---

## 🔧 Advanced Usage

### Custom Animations

```typescript
import { createSlideVariants, createFadeVariants } from "@/lib/animations";

// Custom slide distance
const mySlide = createSlideVariants('left', 200);

// Custom fade with delay
const myFade = createFadeVariants(0.3);
```

### Add Custom Shortcuts

```typescript
import { useHotkeys } from 'react-hotkeys-hook';

useHotkeys('ctrl+shift+e', () => {
  // Your custom action
});
```

### Extend UI State

```typescript
// Add to editorUI.ts
export interface EditorUIState {
  // ... existing state
  myCustomState: boolean;
  setMyCustomState: (value: boolean) => void;
}
```

---

## 📊 Performance Tips

1. **Use Selectors**: Use specific selectors instead of the whole store
```typescript
// Good
const leftSidebarOpen = useEditorUI((state) => state.leftSidebarOpen);

// Less efficient
const { leftSidebarOpen } = useEditorUI();
```

2. **Lazy Load Animations**: Animations are tree-shakeable
```typescript
import { slideVariants } from "@/lib/animations";
// Only imports what you use
```

3. **Memoize Callbacks**: Wrap handlers in useCallback
```typescript
const handleToggle = useCallback(() => {
  toggleLeftSidebar();
}, [toggleLeftSidebar]);
```

---

## 🧪 Testing

Test the new UI features:

1. **Scroll Behavior**:
   - Scroll down → top bar hides
   - Scroll up → top bar shows
   - Hover at top → top bar shows

2. **Sidebar Collapse**:
   - Click collapse → shows icons
   - Hover over icons → preview
   - Click icon → expand

3. **Inspector Auto-Show**:
   - Select component → inspector opens
   - Deselect → inspector closes
   - Pin inspector → stays open

4. **Keyboard Shortcuts**:
   - Press `⌘+\` → toggle sidebar
   - Press `⌘+/` → toggle inspector
   - Press `⌘+⇧+F` → enter focus mode

5. **View Modes**:
   - Focus mode → sidebars hidden
   - Zen mode → everything hidden
   - Normal mode → restore panels

---

## 🚨 Troubleshooting

### Top Bar Not Hiding

1. Check if `autoHideTopBar` is enabled
2. Check if top bar is pinned
3. Ensure scroll event listener is attached

### Sidebar Not Showing

1. Check `leftSidebarOpen` state
2. Ensure AnimatePresence wraps the sidebar
3. Check for z-index conflicts

### Animations Not Working

1. Check if framer-motion is installed
2. Verify user doesn't have `prefers-reduced-motion`
3. Check console for errors

### Keyboard Shortcuts Not Working

1. Ensure `useEditorShortcuts` is called
2. Check if inputs are focused (some shortcuts disabled)
3. Verify platform-specific modifier (Cmd vs Ctrl)

---

## 📚 Component API Reference

### TopBarAutoHide

```typescript
interface TopBarAutoHideProps {
  title?: string;
  saving?: boolean;
  lastSaved?: Date;
  onSave?: () => void;
  onPublish?: () => void;
  onView?: () => void;
  onShare?: () => void;
  onInsertImage?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
}
```

### LeftSidebarSliding

```typescript
interface LeftSidebarSlidingProps {
  components: Array<{ key: string; name: string; category?: string }>;
  libraryQuery: string;
  onLibraryQueryChange: (query: string) => void;
  onDragStartComponent: (e: React.DragEvent, component: any) => void;
  onOutlineJump: (pos: number) => void;
  onOutlineMove: (pos: number, direction: "up" | "down") => void;
  outlineItems: Array<{ index: number; preview: string; pos: number }>;
  activeTab: "library" | "outline";
  onChangeTab: (tab: "library" | "outline") => void;
  width?: number;
  onMouseDownResizer?: (e: React.MouseEvent) => void;
}
```

### RightInspectorSliding

```typescript
interface RightInspectorSlidingProps {
  width?: number;
  onMouseDownResizer?: (e: React.MouseEvent) => void;
  selectedNode: any;
  onUpdateProps: (props: any) => void;
  onDeleteNode: () => void;
  onDuplicateNode: () => void;
  onResetProps: () => void;
  tab: "props" | "layout" | "style";
  onChangeTab: (tab: "props" | "layout" | "style") => void;
  rawPropsMode: boolean;
  setRawPropsMode: (mode: boolean) => void;
  components: Array<{ key: string; name: string; schema?: Record<string, any> }>;
  bottomExtra?: React.ReactNode;
}
```

### BubbleMenuEnhanced

```typescript
interface BubbleMenuEnhancedProps {
  editor: Editor | null;
  onToggleLink?: () => void;
}
```

---

## 🎉 Summary

You now have a world-class, enterprise-grade editor UI with:

✅ Smart auto-hiding top bar
✅ Sliding collapsible sidebars
✅ Context-aware inspector
✅ Inline text formatting (bubble menu)
✅ Component hover menus
✅ Keyboard shortcuts
✅ Multiple view modes (focus, zen)
✅ Dark mode support
✅ Mobile responsive
✅ Accessibility-compliant animations
✅ Error boundaries
✅ Performance optimized

**Next Steps**:
1. Follow integration steps above
2. Test all features
3. Customize to your brand
4. Add custom shortcuts
5. Extend with additional features

For questions or issues, check the troubleshooting section or review the component source code.