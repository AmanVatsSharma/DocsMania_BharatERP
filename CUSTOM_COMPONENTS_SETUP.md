# Custom Components - Setup & Quick Start

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup (1 minute)

```bash
# Generate Prisma client with new model
npx prisma generate

# Apply database migration
npx prisma db push

# Or run SQL directly
psql -d your_database < prisma/migrations/add_custom_components.sql
```

---

### Step 2: Start the Editor (30 seconds)

```bash
npm run dev
```

Open: `http://localhost:3000/editor/your-doc-id`

---

### Step 3: Create Your First Component (3 minutes)

#### A. Open Component Builder

**Option 1**: Add button to TopBar (recommended)
```tsx
// In app/editor/[id]/page.tsx, add state:
const [componentBuilderOpen, setComponentBuilderOpen] = useState(false);

// Add to TopBar:
<button onClick={() => setComponentBuilderOpen(true)}>
  Custom Components
</button>

// Add modal:
<ComponentBuilder
  open={componentBuilderOpen}
  onOpenChange={setComponentBuilderOpen}
  onSave={handleSaveComponent}
/>
```

**Option 2**: Direct URL
Navigate to: `/editor/custom-components` (after adding route)

#### B. Write Component Code

Paste this example:

```jsx
export default function HelloWorld({ props }) {
  const { name = "World", color = "#8b5cf6" } = props || {};
  
  return (
    <div style={{
      padding: "32px",
      textAlign: "center",
      backgroundColor: "#f8fafc",
      borderRadius: "12px"
    }}>
      <h2 style={{ color: color, fontSize: "32px" }}>
        Hello, {name}! 👋
      </h2>
    </div>
  );
}
```

#### C. Define Props Schema

```json
{
  "name": {
    "type": "string",
    "label": "Name",
    "default": "World"
  },
  "color": {
    "type": "color",
    "label": "Text Color",
    "default": "#8b5cf6"
  }
}
```

#### D. Test & Save

1. Fill in:
   - **Name**: Hello World
   - **Key**: hello-world (auto-generated)
   - **Category**: Custom
   - **Description**: A friendly greeting component

2. Click **Preview** tab
3. Adjust test props
4. Click **Refresh Preview**
5. See it render! ✅
6. Click **Create Component**

Done! Your first custom component is saved! 🎉

---

### Step 4: Use Your Component (30 seconds)

#### A. Load Custom Components in Library

Update `app/editor/_components/LeftSidebar.tsx`:

```tsx
// Add state for custom components
const [customComponents, setCustomComponents] = useState([]);

// Load custom components
useEffect(() => {
  async function loadCustom() {
    const res = await fetch('/api/custom-components');
    const data = await res.json();
    if (data.ok) {
      setCustomComponents(data.data);
    }
  }
  loadCustom();
}, []);

// Add to component list
const allComponents = [
  ...components, // Existing built-in components
  ...customComponents.map(c => ({
    key: c.key,
    name: c.name,
    category: c.category,
    description: c.description,
    tags: JSON.parse(c.tags || '[]'),
    isCustom: true
  }))
];
```

#### B. Register Component Renderers

Update `app/editor/_registry/sections.tsx`:

```tsx
import { compileCustomComponent } from "@/lib/customComponentRenderer";

// Load custom components at runtime
export async function getPreviewComponents() {
  const res = await fetch('/api/custom-components');
  const data = await res.json();
  
  const customPreviews: any = {};
  if (data.ok) {
    data.data.forEach((comp: any) => {
      const compiled = compileCustomComponent(comp.code);
      if (compiled) {
        customPreviews[comp.key] = compiled;
      }
    });
  }
  
  return {
    ...previewComponents, // Built-in components
    ...customPreviews      // Custom components
  };
}
```

#### C. Use in Document

1. Look in component library
2. Find "Hello World" under "Custom" category
3. Drag into document
4. Customize props in Inspector
5. See it render! ✅

---

## 🎯 Full Integration Guide

### 1. Add to TopBar

**File**: `app/editor/_components/TopBar.tsx`

```tsx
import { Code } from "lucide-react";

// Add button
<button
  onClick={onOpenCustomComponents}
  className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
  title="Custom Components"
>
  <Code className="h-4 w-4" />
  Components
</button>
```

### 2. Add to Main Editor

**File**: `app/editor/[id]/page.tsx`

```tsx
import ComponentBuilder from "../_components/ComponentBuilder";
import CustomComponentLibrary from "../_components/CustomComponentLibrary";

// Add state
const [componentBuilderOpen, setComponentBuilderOpen] = useState(false);
const [componentLibraryOpen, setComponentLibraryOpen] = useState(false);
const [editingComponent, setEditingComponent] = useState(null);

// Add handlers
function handleOpenComponentBuilder() {
  setEditingComponent(null);
  setComponentBuilderOpen(true);
}

function handleOpenComponentLibrary() {
  setComponentLibraryOpen(true);
}

function handleEditComponent(component) {
  setEditingComponent(component);
  setComponentBuilderOpen(true);
  setComponentLibraryOpen(false);
}

function handleSaveComponent(component) {
  // Refresh component library
  // Reload document if needed
}

// Add modals
<>
  <ComponentBuilder
    open={componentBuilderOpen}
    onOpenChange={setComponentBuilderOpen}
    editingComponent={editingComponent}
    onSave={handleSaveComponent}
  />
  
  <CustomComponentLibrary
    open={componentLibraryOpen}
    onOpenChange={setComponentLibraryOpen}
    onEdit={handleEditComponent}
    onCreate={handleOpenComponentBuilder}
  />
</>

// Add to TopBar
<TopBar
  onOpenCustomComponents={handleOpenComponentLibrary}
  onCreateComponent={handleOpenComponentBuilder}
/>
```

### 3. Load Custom Components Dynamically

**File**: `app/editor/_registry/sections.tsx`

```tsx
import { createCustomPreviewComponent } from "@/lib/customComponentRenderer";

// Make this async or load on mount
export async function loadCustomComponents() {
  try {
    const res = await fetch('/api/custom-components');
    const data = await res.json();
    
    if (data.ok) {
      data.data.forEach((comp: any) => {
        const preview = createCustomPreviewComponent({
          id: comp.id,
          key: comp.key,
          name: comp.name,
          code: comp.code,
          schema: JSON.parse(comp.schema || '{}'),
          defaultConfig: JSON.parse(comp.defaultConfig || '{}')
        });
        
        // Add to preview components registry
        (previewComponents as any)[comp.key] = preview;
      });
    }
  } catch (error) {
    console.error('[CustomComponents] Load error', error);
  }
}

// Call on app initialization
loadCustomComponents();
```

### 4. Update Component List

**File**: `app/api/components/route.ts`

```tsx
export async function GET(request: NextRequest) {
  try {
    // Get built-in components
    const builtIn = seed;
    
    // Get custom components
    const custom = await (prisma as any).customComponent.findMany();
    const customFormatted = custom.map((c: any) => ({
      key: c.key,
      name: c.name,
      category: c.category,
      description: c.description,
      tags: JSON.parse(c.tags || '[]'),
      schema: JSON.parse(c.schema || '{}'),
      defaultConfig: JSON.parse(c.defaultConfig || '{}'),
      isCustom: true
    }));
    
    // Combine
    const all = [...builtIn, ...customFormatted];
    
    return NextResponse.json({ ok: true, data: all });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
```

---

## 🎨 UI Enhancements

### Add Badge for Custom Components

In component library cards:

```tsx
{component.isCustom && (
  <div className="absolute right-2 top-2 rounded bg-purple-600 px-2 py-0.5 text-[10px] text-white">
    Custom
  </div>
)}
```

### Add Manage Button

In left sidebar:

```tsx
<div className="border-t border-zinc-200 p-3">
  <button
    onClick={onOpenCustomLibrary}
    className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
  >
    <Code className="h-4 w-4" />
    Manage Custom Components
  </button>
</div>
```

---

## 🔧 Configuration

### Environment Variables

No additional environment variables needed! Uses existing Prisma setup.

### Permissions (Optional)

Add role-based access:

```tsx
// In API routes
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  
  // Check permissions
  if (!session?.user?.canCreateComponents) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN" } },
      { status: 403 }
    );
  }
  
  // Continue...
}
```

---

## 📊 Testing Checklist

### Component Builder:
- [ ] Open Component Builder
- [ ] Write JSX code
- [ ] Define props schema
- [ ] Test in preview
- [ ] Save component
- [ ] Export as JSON
- [ ] Import JSON file

### Component Library:
- [ ] Browse all components
- [ ] Search components
- [ ] Edit component
- [ ] Duplicate component
- [ ] Delete component
- [ ] Filter by category

### Document Usage:
- [ ] Find custom component in library
- [ ] Drag into document
- [ ] Customize props
- [ ] Save document
- [ ] Publish document
- [ ] View on published page
- [ ] Verify component renders correctly

---

## 🐛 Troubleshooting

### Components Not Showing in Library

**Solution**:
1. Check database: `SELECT * FROM "CustomComponent";`
2. Verify API: `curl http://localhost:3000/api/custom-components`
3. Check console for errors
4. Reload component library

### Component Won't Compile

**Solution**:
1. Check for `export default`
2. Verify JSX syntax (all tags closed)
3. Look at error in preview tab
4. Test in isolation

### Props Not Working

**Solution**:
1. Verify schema JSON is valid
2. Check prop names match in code
3. Ensure defaults are set
4. Re-save component

---

## 📈 Performance

### Optimization Tips:

1. **Cache Compiled Components**
```tsx
const componentCache = new Map();

function getCompiledComponent(key: string, code: string) {
  if (!componentCache.has(key)) {
    componentCache.set(key, compileCustomComponent(code));
  }
  return componentCache.get(key);
}
```

2. **Lazy Load Components**
```tsx
// Only load when needed
const CustomComponent = React.lazy(() => 
  import(`./custom/${componentKey}`)
);
```

3. **Limit Component Size**
- Keep components under 500 lines
- Split complex components
- Use memoization for expensive operations

---

## 🎓 Learning Resources

### Created Documentation:
- **CUSTOM_COMPONENTS_GUIDE.md** - Complete user guide
- **CUSTOM_COMPONENTS_IMPLEMENTATION.md** - Technical details
- **CUSTOM_COMPONENTS_SETUP.md** - This file

### External Resources:
- [React JSX](https://react.dev/learn/writing-markup-with-jsx)
- [React Hooks](https://react.dev/reference/react)
- [Inline Styles](https://react.dev/reference/react-dom/components/common#applying-css-styles)

---

## ✅ You're All Set!

Run through the setup steps above and you'll have:
- ✅ Database ready
- ✅ UI integrated
- ✅ Components working
- ✅ First component created
- ✅ Ready to build!

**Total setup time: ~10 minutes** ⚡

---

*Start creating amazing custom components!* 🎨✨
