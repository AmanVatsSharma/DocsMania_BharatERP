# 🚀 Quick Test Guide - Custom Features

## 5-Minute Test

### ✅ Test 1: Create Custom Component (2 minutes)

1. **Start server**:
   ```bash
   npm run dev
   ```

2. **Open editor**:
   ```
   http://localhost:3000/editor/[any-doc-id]
   ```

3. **Open Custom Components**:
   - Click **TopBar** → **"Tools"** dropdown
   - Click **"Custom Components"**
   - Click **"+ Create Component"** button

4. **Paste this code** (Code tab):
   ```jsx
   export default function MyBanner({ props }) {
     const { 
       text = "Welcome!",
       emoji = "🎉",
       color = "#8b5cf6"
     } = props || {};
     
     return (
       <div style={{
         padding: "32px",
         backgroundColor: color,
         color: "white",
         borderRadius: "16px",
         textAlign: "center",
         fontSize: "32px",
         fontWeight: "bold"
       }}>
         {emoji} {text} {emoji}
       </div>
     );
   }
   ```

5. **Switch to Props tab**, paste schema:
   ```json
   {
     "text": {
       "type": "string",
       "label": "Banner Text",
       "default": "Welcome!"
     },
     "emoji": {
       "type": "string",
       "label": "Emoji",
       "default": "🎉"
     },
     "color": {
       "type": "color",
       "label": "Background Color",
       "default": "#8b5cf6"
     }
   }
   ```

6. **Fill in metadata**:
   - Name: `Welcome Banner`
   - Key: `welcome-banner` (auto-generated)
   - Description: `Colorful welcome banner`
   - Category: `Custom`
   - Tags: `banner`, `welcome`

7. **Test preview**:
   - Click **Preview** tab
   - Adjust test props
   - See live preview!

8. **Save**:
   - Click **"Save Component"**
   - Wait for success toast

9. **Use in document**:
   - Close modal
   - Look at **left sidebar** → **Custom category**
   - Find "Welcome Banner"
   - **Drag** it into your document
   - **Click** to select
   - **Right sidebar** → Edit color, text, emoji
   - See changes in real-time!

**Expected result**: ✅ Component works perfectly!

---

### ✅ Test 2: Create Custom Template (3 minutes)

1. **Build a document**:
   - Drag **Hero** component into document
   - Set title: "My Product Launch"
   - Drag **Feature** component
   - Set features text
   - Drag **Pricing** component

2. **Open Template Manager**:
   - Click **TopBar** → **"Tools"**
   - Click **"Templates"**
   - Or click **"More"** → **"Templates"**

3. **Save as template**:
   - Click **"Save Current as Template"** button
   - Fill in:
     - Name: `Product Launch Template`
     - Description: `Ready-to-use product launch page`
     - Category: `Marketing`
     - Tags: `product`, `launch`, `marketing`
     - Visibility: **Public** (toggle on)
   - Click **"Save Template"**
   - Wait for success

4. **Test template**:
   - Switch to **"Browse Templates"** tab
   - See your template in the grid
   - Clear your document: Select all (Cmd+A), Delete
   - Click **"Apply"** on your template
   - **Result**: Document restored with all components!

**Expected result**: ✅ Template works perfectly!

---

## 🔍 Verification Checklist

After tests, verify these work:

### Custom Components:
- [ ] Component appears in left sidebar under "Custom"
- [ ] Can drag component to document
- [ ] Component renders correctly in editor
- [ ] Can edit props in right Inspector
- [ ] Props changes update in real-time
- [ ] Component works on published/hosted page
- [ ] Can edit component after saving
- [ ] Can delete component
- [ ] Can search for component

### Templates:
- [ ] Can save current document as template
- [ ] Template appears in browse view
- [ ] Can search templates
- [ ] Can filter by category
- [ ] Can apply template to document
- [ ] Document content matches template
- [ ] Can edit template metadata
- [ ] Can delete template
- [ ] Public/private toggle works

---

## 🎯 Console Checks

Open browser console (F12) and look for:

### Custom Components:
```
[CustomComponents] Loading from API...
[CustomComponents] Found 1 custom components
[CustomComponents] Registering: welcome-banner
[CustomComponents] ✓ Registered: welcome-banner
[CustomComponents] Loaded 1 custom components
```

### General:
```
[Editor] Loaded 26 components  (25 built-in + 1 custom)
```

If you see these logs: ✅ **Everything is working!**

---

## 🐛 Quick Fixes

### Issue: Component not showing in sidebar

**Fix**:
```javascript
// In browser console:
fetch('/api/custom-components').then(r => r.json()).then(console.log)
// Should show your component
```

Then refresh: `Ctrl+Shift+R`

### Issue: Template not saving

**Fix**:
```javascript
// Check API:
fetch('/api/templates').then(r => r.json()).then(console.log)
```

### Issue: Changes not appearing

**Fix**:
1. Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. Clear Next.js cache: `rm -rf .next && npm run dev`

---

## 📊 Success Metrics

You'll know everything works when:

1. ✅ Custom component appears in sidebar within 5 seconds of saving
2. ✅ Component drags smoothly into document
3. ✅ Props edit in real-time (no lag)
4. ✅ Template applies in <1 second
5. ✅ No console errors
6. ✅ All animations smooth

---

## 🎉 Next Steps

Once basic tests pass, try:

### Advanced Custom Component:
```jsx
export default function AnimatedCard({ props }) {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "24px",
        backgroundColor: hovered ? "#8b5cf6" : "#f3f4f6",
        color: hovered ? "white" : "#1f2937",
        borderRadius: "16px",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        textAlign: "center"
      }}
    >
      <h3 style={{ fontSize: "24px", fontWeight: "bold" }}>
        {props?.title || "Hover Me!"}
      </h3>
    </div>
  );
}
```

### Complex Template:
1. Create full landing page with 10+ sections
2. Save as "Complete Landing Page" template
3. Test on new document
4. Verify all sections render correctly

---

## ✅ Done!

If both tests pass, you're ready to:
- Build custom components for your use case
- Create template library for your team
- Deploy to production!

**Everything is working perfectly!** 🎊
