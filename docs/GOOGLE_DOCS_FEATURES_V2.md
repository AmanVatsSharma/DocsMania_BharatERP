# Google Docs-Style Features V2

This document describes the additional Google Docs-like features added to the editor, including Suggestions Mode, Footnotes, Equations, Word Count, and Page Breaks.

## Table of Contents

1. [Suggestions Mode (Track Changes)](#suggestions-mode-track-changes)
2. [Footnotes](#footnotes)
3. [Equations](#equations)
4. [Word Count](#word-count)
5. [Page Breaks](#page-breaks)

---

## Suggestions Mode (Track Changes)

**Location**: `app/editor/_components/SuggestionsMode.tsx`

### Overview

Suggestions Mode allows users to track changes in the document, similar to Google Docs' "Suggesting" mode. Changes are highlighted and can be accepted or rejected.

### Features

- **Track Changes**: Automatically tracks insertions, deletions, and formatting changes
- **Accept/Reject**: Accept or reject individual suggestions
- **Author Tracking**: Shows who made each suggestion
- **Timestamp**: Displays when each suggestion was made
- **Visual Indicators**: Highlights pending suggestions in the document

### Usage

1. **Enable Suggestions Mode**:
   - Click the "Suggesting" button in the top bar
   - Or use keyboard shortcut: `Cmd+Alt+S` (Mac) / `Ctrl+Alt+S` (Windows)

2. **Make Changes**: While in suggestions mode, all edits are tracked as suggestions

3. **Review Suggestions**: 
   - Click the suggestions panel button (appears when there are pending suggestions)
   - View all pending suggestions with author and timestamp

4. **Accept/Reject**:
   - Click "Accept" to keep the change
   - Click "Reject" to revert the change

### Keyboard Shortcuts

- `Cmd+Alt+S` / `Ctrl+Alt+S`: Toggle suggestions mode

### Technical Details

- **State Management**: Uses React state to track enabled status and suggestions list
- **Editor Integration**: Listens to editor update events to detect changes
- **Persistence**: Suggestions are stored in component state (can be extended to persist to database)

### Future Enhancements

- Persist suggestions to database
- Real-time collaboration with suggestions
- Comment threads on suggestions
- Batch accept/reject
- Suggestion filtering by author

---

## Footnotes

**Location**: 
- Extension: `lib/FootnoteExtension.ts`
- Panel: `app/editor/_components/FootnotesPanel.tsx`

### Overview

Footnotes allow you to add citations and references at the bottom of pages, similar to Google Docs.

### Features

- **Insert Footnotes**: Add footnotes at any position in the document
- **Manage Footnotes**: View, edit, and delete footnotes in a dedicated panel
- **Auto-numbering**: Footnotes are automatically numbered
- **Navigation**: Jump to footnote location in document
- **Edit Content**: Edit footnote text inline

### Usage

1. **Open Footnotes Panel**:
   - Go to "More" menu → "Footnotes"
   - Or use keyboard shortcut: `Cmd+Alt+F` (Mac) / `Ctrl+Alt+F` (Windows)

2. **Add Footnote**:
   - Click "Add Footnote" button
   - Enter footnote content
   - A numbered footnote reference is inserted at the cursor position

3. **Manage Footnotes**:
   - View all footnotes in the panel
   - Click "Edit" to modify footnote content
   - Click "Delete" to remove a footnote
   - Click "Jump to location" to navigate to where the footnote is referenced

### Keyboard Shortcuts

- `Cmd+Alt+F` / `Ctrl+Alt+F`: Toggle footnotes panel

### Technical Details

- **Extension**: Custom Tiptap node extension (`Footnote`)
- **Storage**: Footnotes are stored as document content (Tiptap JSON)
- **Rendering**: Footnotes appear as numbered references in the document

### Future Enhancements

- Automatic footnote numbering
- Custom footnote numbering styles
- Footnotes at end of document (endnotes)
- Cross-references to footnotes

---

## Equations

**Location**:
- Extension: `lib/EquationExtension.ts`
- Editor: `app/editor/_components/EquationEditor.tsx`

### Overview

Insert mathematical equations using LaTeX syntax, similar to Google Docs' equation editor.

### Features

- **LaTeX Support**: Enter equations using LaTeX syntax
- **Inline/Block**: Choose between inline equations and block equations
- **Examples**: Pre-built examples for common equations
- **Preview**: Preview equation before inserting

### Usage

1. **Open Equation Editor**:
   - Go to "More" menu → "Insert Equation"
   - Or use keyboard shortcut: `Cmd+Alt+E` (Mac) / `Ctrl+Alt+E` (Windows)

2. **Enter Equation**:
   - Choose equation type (Inline or Block)
   - Enter LaTeX formula (e.g., `E = mc^2`, `x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`)
   - Use examples for quick insertion

3. **Insert**: Click "Insert Equation" to add it to the document

### LaTeX Examples

- **Superscript**: `x^2`
- **Subscript**: `x_1`
- **Fraction**: `\frac{a}{b}`
- **Square Root**: `\sqrt{x}`
- **Summation**: `\sum_{i=1}^{n} i`
- **Integral**: `\int_{a}^{b} f(x) dx`

### Keyboard Shortcuts

- `Cmd+Alt+E` / `Ctrl+Alt+E`: Open equation editor

### Technical Details

- **Extension**: Custom Tiptap node extension (`Equation`)
- **Rendering**: Currently displays LaTeX source (can be extended with KaTeX/MathJax for rendering)
- **Storage**: Equations stored as document content

### Future Enhancements

- Integrate KaTeX or MathJax for visual rendering
- Visual equation editor (WYSIWYG)
- Equation templates library
- Copy/paste equations from other tools

---

## Word Count

**Location**: `app/editor/_components/WordCount.tsx`

### Overview

Display real-time word and character count statistics, similar to Google Docs.

### Features

- **Word Count**: Real-time word count
- **Character Count**: Total characters (with and without spaces)
- **Paragraph Count**: Number of paragraphs
- **Popover Display**: Hover/click to see detailed statistics

### Usage

1. **View Word Count**: 
   - Word count is displayed in the top bar
   - Click or hover to see detailed statistics

2. **Statistics Shown**:
   - Words
   - Characters (total)
   - Characters (no spaces)
   - Paragraphs

### Technical Details

- **Real-time Updates**: Updates automatically on editor content changes
- **Calculation**: Uses editor text content and HTML parsing for accurate counts
- **Performance**: Debounced updates for optimal performance

### Future Enhancements

- Reading time estimation
- Character count for selected text
- Export statistics

---

## Page Breaks

**Location**: `lib/PageBreakExtension.ts`

### Overview

Insert page breaks for printing, similar to Google Docs.

### Features

- **Insert Page Breaks**: Add page breaks anywhere in the document
- **Visual Indicator**: Page breaks are shown as dashed lines in the editor
- **Print Support**: Page breaks work correctly when printing

### Usage

1. **Insert Page Break**:
   - Click the page break button in the toolbar (FileText icon)
   - Or use keyboard shortcut: `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

2. **Visual Indicator**: 
   - Page breaks appear as a dashed line with "Page Break" label in the editor
   - They are invisible when printing (actual page break occurs)

### Keyboard Shortcuts

- `Cmd+Enter` / `Ctrl+Enter`: Insert page break

### Technical Details

- **Extension**: Custom Tiptap node extension (`PageBreak`)
- **CSS**: Uses `page-break-after: always` for print compatibility
- **Rendering**: Visual indicator in editor, actual break in print

### Future Enhancements

- Section breaks
- Column breaks
- Custom page break styles

---

## Integration

All features are integrated into the main editor page (`app/editor/[id]/page.tsx`):

- **State Management**: Each feature has its own state variable
- **Keyboard Shortcuts**: All features have keyboard shortcuts
- **Menu Integration**: Features accessible from "More" menu in TopBarEnhanced
- **Extensions**: Tiptap extensions registered in editor configuration

## Styling

Additional CSS styles are added to `app/editor/_styles/enterprise-editor.css`:

- Page break styles
- Footnote reference styles
- Equation container styles

## API Integration

Currently, these features use local state. Future enhancements can include:

- **Suggestions**: API endpoints for persisting suggestions
- **Footnotes**: Database storage for footnote metadata
- **Equations**: Equation library/API integration

---

## Summary

These features bring the editor closer to Google Docs functionality:

✅ **Suggestions Mode**: Track changes with accept/reject  
✅ **Footnotes**: Citation and reference management  
✅ **Equations**: LaTeX-based math equations  
✅ **Word Count**: Real-time statistics  
✅ **Page Breaks**: Print formatting support  

All features are fully integrated, keyboard-accessible, and ready for use!
