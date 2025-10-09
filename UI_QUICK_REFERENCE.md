# 🎯 UI/UX Quick Reference Card

## One-Page Cheat Sheet for Developers

---

## 📦 Files Created

```
lib/store/editorUI.ts              # State management
lib/animations.ts                   # Animation library
lib/useKeyboardShortcuts.ts        # Keyboard system
components/ui/sheet.tsx             # Sliding panels
app/editor/_components/
  ├── TopBarAutoHide.tsx           # Smart top bar
  ├── LeftSidebarSliding.tsx       # Left panel
  ├── RightInspectorSliding.tsx    # Right panel
  ├── BubbleMenuEnhanced.tsx       # Text toolbar
  └── ComponentHoverMenu.tsx       # Hover actions
```

---

## ⚡ Quick Setup

```bash
# Install
npm install framer-motion zustand react-hotkeys-hook

# Import state
import { useEditorUI } from "@/lib/store/editorUI";

# Import components
import TopBarAutoHide from "@/app/editor/_components/TopBarAutoHide";
import LeftSidebarSliding from "@/app/editor/_components/LeftSidebarSliding";
import RightInspectorSliding from "@/app/editor/_components/RightInspectorSliding";
import BubbleMenuEnhanced from "@/app/editor/_components/BubbleMenuEnhanced";
```

---

## 🎮 State Management

```typescript
// Get state
const {
  leftSidebarOpen,
  rightInspectorOpen,
  topBarVisible,
  viewMode,
  // Actions
  toggleLeftSidebar,
  toggleRightInspector,
  enterFocusMode,
  enterZenMode,
} = useEditorUI();

// Specific selectors (better performance)
const leftOpen = useEditorUI((state) => state.leftSidebarOpen);
```

---

## ⌨️ Keyboard Shortcuts

```typescript
import useEditorShortcuts from "@/lib/useKeyboardShortcuts";

useEditorShortcuts({
  onToggleLeftSidebar: () => {},
  onToggleRightInspector: () => {},
  onCommandPalette: () => {},
  onFocusMode: () => {},
  onZenMode: () => {},
  onSave: () => {},
  onPublish: () => {},
});
```

| Key | Action |
|-----|--------|
| `⌘+\` | Toggle left |
| `⌘+/` | Toggle right |
| `⌘+K` | Command palette |
| `⌘+⇧+F` | Focus mode |
| `⌘+⇧+Z` | Zen mode |

---

## 🎨 Animations

```typescript
import { slideVariants, transitions } from "@/lib/animations";
import { motion } from "framer-motion";

<motion.div
  initial="initial"
  animate="animate"
  exit="exit"
  variants={slideVariants.fromLeft}
  transition={transitions.smooth}
>
  Content
</motion.div>
```

**Available Variants**:
- `slideVariants.fromLeft/Right/Top/Bottom`
- `fadeVariants.in/inFast/inSlow`
- `scaleVariants.in/inBounce`

---

## 🔧 Components

### Top Bar

```typescript
<TopBarAutoHide
  title="Document Title"
  saving={false}
  lastSaved={new Date()}
  onSave={() => {}}
  onPublish={() => {}}
  breadcrumbs={[
    { label: "Home", onClick: () => {} },
    { label: "Document" }
  ]}
/>
```

### Left Sidebar

```typescript
<AnimatePresence>
  {leftSidebarOpen && (
    <LeftSidebarSliding
      components={components}
      libraryQuery=""
      onLibraryQueryChange={() => {}}
      activeTab="library"
      onChangeTab={() => {}}
      outlineItems={[]}
    />
  )}
</AnimatePresence>
```

### Right Inspector

```typescript
<AnimatePresence>
  {rightInspectorOpen && (
    <RightInspectorSliding
      selectedNode={node}
      onUpdateProps={() => {}}
      onDeleteNode={() => {}}
      tab="props"
      onChangeTab={() => {}}
      components={components}
    />
  )}
</AnimatePresence>
```

### Bubble Menu

```typescript
<BubbleMenuEnhanced 
  editor={editor}
  onToggleLink={() => {}}
/>
```

---

## 🎯 View Modes

```typescript
const { enterFocusMode, enterZenMode, exitSpecialMode } = useEditorUI();

// Focus Mode (⌘+⇧+F)
enterFocusMode();  // Hides sidebars

// Zen Mode (⌘+⇧+Z)
enterZenMode();    // Hides everything

// Normal Mode
exitSpecialMode(); // Restore panels
```

---

## 🎨 Styling

```typescript
// Responsive classes
className={cn(
  "transition-all",
  viewMode === "focus" && "max-w-3xl",
  viewMode === "zen" && "max-w-2xl",
  viewMode === "normal" && "max-w-4xl"
)}
```

---

## 🌙 Dark Mode

```typescript
const { themeMode, setThemeMode } = useEditorUI();

setThemeMode('dark');   // Dark
setThemeMode('light');  // Light
setThemeMode('system'); // Auto
```

---

## 📱 Layout Structure

```tsx
<div className="flex h-screen flex-col">
  {/* Top Bar */}
  <TopBarAutoHide {...props} />

  <div className="flex flex-1 overflow-hidden">
    {/* Left Sidebar */}
    <AnimatePresence>
      {leftSidebarOpen && <LeftSidebarSliding {...props} />}
    </AnimatePresence>

    {/* Editor Canvas */}
    <div className="flex-1 overflow-auto">
      <EditorContent editor={editor} />
      <BubbleMenuEnhanced editor={editor} />
    </div>

    {/* Right Inspector */}
    <AnimatePresence>
      {rightInspectorOpen && <RightInspectorSliding {...props} />}
    </AnimatePresence>
  </div>
</div>
```

---

## 🐛 Common Issues

```typescript
// Top bar not hiding?
const { autoHideTopBar, setAutoHideTopBar } = useEditorUI();
setAutoHideTopBar(true);

// Sidebar not showing?
const { leftSidebarOpen, setLeftSidebarOpen } = useEditorUI();
setLeftSidebarOpen(true);

// Animations disabled?
// Check user's prefers-reduced-motion setting
import { prefersReducedMotion } from "@/lib/animations";
```

---

## 🔍 Debug

```typescript
// Log current state
console.log(useEditorUI.getState());

// Watch state changes
useEditorUI.subscribe((state) => {
  console.log("State changed:", state);
});
```

---

## 📊 Performance

```typescript
// Good: Use selectors
const leftOpen = useEditorUI((s) => s.leftSidebarOpen);

// Less efficient: Destructure whole state
const { leftSidebarOpen } = useEditorUI();

// Memoize callbacks
const handleToggle = useCallback(() => {
  toggleLeftSidebar();
}, []);
```

---

## ✅ Testing Checklist

- [ ] Top bar hides on scroll
- [ ] Sidebars slide smoothly
- [ ] Shortcuts work (⌘+\, ⌘+/)
- [ ] Bubble menu appears on selection
- [ ] Dark mode toggles correctly
- [ ] Mobile responsive
- [ ] No console errors

---

## 📚 Full Docs

- **Integration**: `UI_UX_IMPLEMENTATION_GUIDE.md`
- **Complete**: `UI_UX_COMPLETE.md`
- **This file**: `UI_QUICK_REFERENCE.md`

---

**Print this for quick reference!** 🖨️