# 🎊 DocsMania - Enterprise Editor (V1 & V2)

## Quick Start

```bash
npm install
npm run dev
```

---

## 📍 Two Editor Versions Available

### V2: Modern UI (Recommended ⭐)
**URL**: `/editor/[documentId]`

**Why Use V2**:
- ✅ Modern, beautiful design
- ✅ Clean interface (more space)
- ✅ Bubble menu with ALL formatting
- ✅ Font size & family controls
- ✅ Auto-hide behavior
- ✅ Keyboard shortcuts
- ✅ All V1 features preserved!

### V1: Classic UI (Reference)
**URL**: `/v1/editor/[documentId]`

**Why Use V1**:
- Compare with V2
- Traditional toolbar
- Classic design
- Reference implementation

---

## ✨ V2 Features

### Bubble Menu (Select Text)
```
[B][I][U][S][Code] | [Font▼][Size▼] | [Align▼] 
[🔗] [🎨][🖍️] [AI✨] [More▼] [↶][↷]
```

**Everything you need when selecting text**:
- Text formatting
- Font family & size
- Alignment
- Colors & highlights
- AI actions
- Line height & letter spacing
- Undo/Redo

### Modern Top Bar
- Auto-hides on scroll
- Tools dropdown (Image, Templates, Components)
- Shows "Saved 2m ago"
- Pin to keep visible

### Always-Visible Inspector
- Props/Layout/Style tabs
- Table controls
- Image controls
- Always accessible

---

## 🎯 Compare Yourself

```bash
npm run dev
```

Open both:
- **V1**: `http://localhost:3000/v1/editor/abc123` (Old)
- **V2**: `http://localhost:3000/editor/abc123` (New)

**Switch easily**: Click badge in bottom-left!

---

## 📚 Documentation

**Quick Start**:
- `README.md` - This file
- `README_SIMPLE.md` - Ultra-simple guide
- `READY_TO_COMPARE.md` - Comparison guide

**Complete**:
- `V1_VS_V2_COMPARISON.md` - Detailed comparison
- `ALL_FEATURES_RESTORED.md` - Feature checklist
- `COMPLETE_MODERN_INTEGRATION.md` - Technical details

**Visual**:
- `VISUAL_COMPARISON_FINAL.md` - Visual diagrams
- `KEYBOARD_SHORTCUTS_VISUAL.md` - Shortcuts reference

---

## 🚀 Features

### All Editors Have
- ✅ Rich text editing
- ✅ Images (S3/local upload, resize, positioning)
- ✅ Tables (inspector, CSV, sorting)
- ✅ Multi-column layouts
- ✅ Components (25+ built-in)
- ✅ Custom components (JSX builder)
- ✅ Templates (6 default, seeding script)
- ✅ Auto-save
- ✅ Publishing
- ✅ Device preview
- ✅ All modals (8+)

### Only V2 Has
- ✅ Auto-hiding top bar
- ✅ Collapsible sidebars
- ✅ Bubble menu (contextual)
- ✅ 20+ keyboard shortcuts
- ✅ View modes (focus, zen)
- ✅ Smooth animations
- ✅ Modern design

---

## ⌨️ Keyboard Shortcuts (V2)

| Key | Action |
|-----|--------|
| `⌘+\` | Toggle sidebar |
| `⌘+/` | Toggle inspector |
| `⌘+⇧+F` | Focus mode |
| `⌘+⇧+Z` | Zen mode |
| `⌘+S` | Save |
| `/` | Slash commands |

---

## 📦 What Was Built

### Phase 1: S3 & Images
- AWS S3 integration
- Image resize/positioning
- Multi-column layouts
- Template seeding

### Phase 2: Modern UI/UX
- State management (Zustand)
- Animation library
- Keyboard shortcuts
- Modern components (7)
- Complete integration

**Total**:
- 25+ files created
- 5,000+ lines of code
- 15 major features
- 2 complete editor versions

---

## 🎯 Recommendation

**Use V2** for production:
- Better UX
- Modern design
- Same features
- More space
- Professional feel

**Keep V1** for:
- Comparison
- Reference
- 2-4 weeks
- Then delete

---

## 🛠️ Optional: Install AWS SDK

For S3 image storage:
```bash
npm install @aws-sdk/client-s3
```

Configure in `.env.local`:
```env
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

**Not required** - works with local storage!

---

## 🎊 Summary

✅ V1 (Old UI) at `/v1/editor/[id]`
✅ V2 (Modern UI) at `/editor/[id]`
✅ Both fully functional
✅ Easy switching
✅ All features preserved
✅ Build successful

**Start**: `npm run dev`
**Compare**: Both versions
**Choose**: V2 is better!

---

**Your enterprise-grade editor with two versions is ready!** 🚀

Test both and see the transformation! ✨