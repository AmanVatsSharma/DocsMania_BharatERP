# DocsMania Pro - Features Guide

## 🚀 Quick Start Guide

### Accessing the Dashboard
1. Navigate to `/docs` route
2. You'll see the new DocsMania Pro dashboard
3. Enterprise badge indicates pro features enabled

## 📋 View Modes

### 1. Grid View (Default)
**When to use**: Visual browsing, quick overview

**Features**:
- Beautiful card-based layout
- Project cards with gradient icons
- Document cards with preview areas
- Hover effects and animations

**How to use**:
1. Click the grid icon (⊞) in the view mode selector
2. Scroll through projects and documents
3. Click "Edit" to open editor
4. Click "View" to see published version

### 2. List View
**When to use**: Detailed information, sorting, scanning

**Features**:
- Enterprise-style table
- Columns: Document, Project, Updated, Actions
- Sortable headers
- Compact layout

**How to use**:
1. Click the list icon (≡) in the view mode selector
2. Scan through documents in table format
3. Click action buttons for quick access
4. Use sort dropdown to organize

### 3. Analytics View
**When to use**: Insights, reporting, dashboard overview

**Features**:
- 4 key metric cards
- 14-day activity timeline
- Recent activity stats
- Top projects rankings
- Distribution charts
- Insight cards

**How to use**:
1. Click the bar chart icon (📊) in view mode selector
2. Review key metrics at the top
3. Check activity timeline
4. Explore top projects
5. Analyze document distribution

**Key Metrics**:
- **Total Projects**: All projects count
- **Total Documents**: All docs count
- **Avg Docs/Project**: Average ratio
- **Active Last 24h**: Recent updates

### 4. Graph View
**When to use**: Relationships, connections, network analysis

**Features**:
- Interactive knowledge graph
- 5 layout algorithms
- Zoom controls
- Export to PNG
- Node hover effects

**How to use**:
1. Click the network icon (🕸️) in view mode selector
2. Select a project from dropdown
3. Choose layout from dropdown:
   - **Force**: Physics-based (default)
   - **Circle**: Circular arrangement
   - **Grid**: Grid layout
   - **Tree**: Hierarchical tree
   - **Concentric**: Concentric circles
4. Use zoom buttons to navigate
5. Click nodes to select
6. Export graph as PNG

**Controls**:
- **Zoom In** (+): Zoom into graph
- **Zoom Out** (-): Zoom out of graph
- **Fit View** (⛶): Fit all nodes in view
- **Export** (↓): Download as PNG
- **Refresh** (↻): Reload graph data

### 5. Outline View
**When to use**: Organization, hierarchy, structure

**Features**:
- Hierarchical tree view
- Alphabetical grouped view
- Expandable/collapsible nodes
- Statistics cards

**How to use**:

**Hierarchical View** (Left panel):
1. Click the outline icon (▦) in view mode selector
2. Expand folder nodes to see children
3. Click document nodes to edit
4. Navigate nested structures

**Alphabetical View** (Right panel):
1. Documents grouped by first letter
2. Click letter badges to expand/collapse
3. Click documents to edit
4. Quick alphabetical navigation

## 🔍 Search & Filter

### Search Bar
**Location**: Header, right of view modes

**Features**:
- Real-time search
- Searches title, slug, project name
- Instant results

**How to use**:
1. Type in search box
2. Results filter automatically
3. Clear search to see all

### Sort Options
**Location**: Next to search bar

**Options**:
- **Updated**: Most recently updated first (default)
- **Created**: Newest documents first
- **Title**: Alphabetical by title
- **Project**: Alphabetical by project name

### Project Filter
**Location**: Below header

**How to use**:
1. Click project dropdown
2. Select a project to filter
3. Select "All Projects" to clear filter
4. Document count shown in parentheses

## ➕ Creating Content

### Create Project
**Button**: "+ Project" in header (gray button)

**Steps**:
1. Click "+ Project" button
2. Modal opens
3. Fill in:
   - **Project Name** (required)
   - **Project Key** (optional, auto-generated)
   - **Description** (optional)
4. Click "Create Project"
5. Project is created and selected

**Tips**:
- Leave key empty to auto-generate from name
- Add description for better organization
- Project key must be unique

### Create Document
**Button**: "+ Document" in header (black button)

**Steps**:
1. Click "+ Document" button
2. Modal opens
3. Fill in:
   - **Document Title** (required)
   - **Project** (required, select from dropdown)
   - **Slug** (optional, auto-generated)
4. Click "Create & Edit"
5. Redirected to editor

**Tips**:
- Slug auto-generates from title
- Choose project before creating
- You'll be taken to editor immediately

## 📊 Understanding Analytics

### Key Metrics (Top Cards)

**Total Projects** (Blue)
- Count of all projects
- Click for drill-down (future)

**Total Documents** (Purple)
- Count of all documents
- Across all projects

**Avg Docs/Project** (Orange)
- Average number of docs per project
- Indicates project size

**Active Last 24h** (Emerald)
- Documents updated in last 24 hours
- Activity indicator

### Activity Timeline
**Chart**: 14-day bar chart

**Reading the chart**:
- Each bar = one day
- Height = number of updates that day
- Hover to see exact count
- Blue gradient bars

**Use cases**:
- Identify active days
- Track team productivity
- Spot patterns

### Recent Activity Panel
**Three timeframes**:
- **Last 24 hours**: Very recent activity
- **Last 7 days**: Weekly activity
- **Last 30 days**: Monthly activity

**Use cases**:
- Quick activity check
- Compare timeframes
- Track momentum

### Top Projects
**Shows**: Top 5 projects by document count

**Features**:
- Gold/Silver/Bronze medals for top 3
- Numbered rankings
- Document counts
- Project names and keys

**Use cases**:
- Identify largest projects
- Focus on main projects
- Resource allocation

### Document Distribution
**Shows**: All projects with their document counts

**Features**:
- Horizontal bar charts
- Percentage calculations
- Gradient progress bars
- Sorted by document count

**Use cases**:
- Project size comparison
- Resource distribution
- Balance checking

### Insights (Bottom Cards)

**Most Active** (Blue)
- Highest document count project
- Quick identification

**Total Coverage** (Purple)
- Total projects and documents
- System overview

**Growth Rate** (Emerald)
- Updates this week
- Growth indicator

## 🕸️ Using the Graph

### Understanding the Graph

**Nodes** (Circles):
- Represent documents
- Blue-purple gradient
- Size varies slightly
- Label = document title

**Edges** (Lines):
- Represent links between documents
- Gray arrows
- Label = link type

**Colors**:
- **Blue**: Normal node
- **Purple**: Hovered node
- **Orange**: Selected node
- **Gray**: Edges/connections

### Layout Algorithms

**Force (COSE)** - Default
- Physics-based simulation
- Nodes push/pull each other
- Natural clustering
- Best for: General use

**Circle**
- Nodes arranged in circle
- Evenly spaced
- Best for: Equal relationships

**Grid**
- Nodes in grid pattern
- Orderly arrangement
- Best for: Many nodes

**Tree (Breadthfirst)**
- Hierarchical layout
- Top-down structure
- Best for: Dependencies

**Concentric**
- Nodes in concentric circles
- Importance-based
- Best for: Centrality

### Interaction

**Click node**: Select it (turns orange)
**Hover node**: Highlight (turns purple)
**Scroll wheel**: Zoom in/out
**Click-drag background**: Pan graph
**Click-drag node**: Move node (in some layouts)

### Export
1. Arrange graph as desired
2. Click "Export" button (↓)
3. PNG downloads automatically
4. High-quality 2x resolution

## 🗂️ Using Outline View

### Hierarchical Tree View

**Structure**:
- Based on document slug paths
- `/` creates folder levels
- Nested indentation

**Example**:
```
📁 api
  📁 users
    📄 create-user.md
    📄 get-user.md
  📁 posts
    📄 list-posts.md
📁 guides
  📄 getting-started.md
```

**Navigation**:
- Click folder to expand/collapse
- Click document to edit
- Visual indentation shows depth

### Alphabetical Grouped View

**Structure**:
- Documents grouped by first letter
- A-Z organization
- Letter badges

**Features**:
- Click letter to expand/collapse
- Document counts per group
- Quick alphabetical access

**Use cases**:
- Find document by name
- Browse alphabetically
- Quick reference

## 🎨 Visual Indicators

### Status Colors

**Blue**: Projects, primary actions
**Purple**: Documents, secondary
**Orange**: Activity, warnings
**Emerald**: Growth, success
**Yellow**: Featured, important
**Red**: Errors, delete actions
**Gray**: Neutral, disabled

### Badges

**Enterprise** (Emerald): Pro features enabled
**Document Count** (Gray): Number in project
**Activity Count** (Orange): Recent updates
**Project Badge** (Blue): Project indicator

### Icons

📁 **Folder**: Projects
📄 **File**: Documents
📊 **Chart**: Analytics
🕸️ **Network**: Graph
▦ **Outline**: Hierarchy
⊞ **Grid**: Grid view
≡ **List**: List view
🔍 **Search**: Search function
↻ **Refresh**: Reload data
+ **Plus**: Create new

## 💡 Pro Tips

### Efficiency
1. Use keyboard shortcuts (coming soon)
2. Batch operations with bulk select
3. Quick filters for common tasks
4. Save searches (coming soon)

### Organization
1. Use consistent slug structure
2. Add project descriptions
3. Group related documents
4. Use hierarchical paths

### Productivity
1. Check analytics daily
2. Use graph to find connections
3. Outline for structure review
4. List view for quick updates

### Best Practices
1. Name documents clearly
2. Organize by project
3. Update regularly
4. Use descriptive slugs

## 🚦 Status Indicators

### Loading States
- Spinner icon
- "Loading..." text
- Disabled buttons
- Opacity reduction

### Empty States
- Icon in center
- "No items" message
- Create button prompt
- Helper text

### Error States
- Toast notification
- Error message
- Red color
- Retry option

## 📱 Mobile Experience

### Responsive Features
- Stacked layouts
- Hidden non-essential elements
- Touch-friendly buttons
- Scrollable containers
- Simplified navigation

### Mobile Views
- Grid: 1 column
- List: Simplified table
- Analytics: Stacked cards
- Graph: Full-width
- Outline: Single panel

## 🎯 Common Tasks

### Finding a Document
1. Use search bar
2. Filter by project
3. Sort by updated
4. Or use outline view

### Reviewing Activity
1. Switch to analytics view
2. Check activity timeline
3. Review recent activity panel
4. Check top projects

### Understanding Structure
1. Switch to outline view
2. Use hierarchical tree
3. Expand folders
4. Navigate structure

### Visualizing Connections
1. Switch to graph view
2. Select project
3. Choose layout
4. Explore relationships

### Creating Content
1. Click + Project or + Document
2. Fill in required fields
3. Auto-generates slugs/keys
4. Starts editing immediately

## 🔧 Troubleshooting

### No Documents Showing
- Check project filter
- Clear search
- Verify documents exist
- Refresh page

### Graph Not Loading
- Select a project
- Check for documents
- Verify links exist
- Refresh graph

### Search Not Working
- Check spelling
- Try partial match
- Clear and retry
- Verify documents exist

### Slow Performance
- Reduce visible items
- Filter by project
- Close unused tabs
- Refresh page

## 📚 Resources

### Documentation
- DASHBOARD_ENHANCEMENTS.md: Detailed features
- IMPLEMENTATION_SUMMARY.md: Technical details
- This guide: User instructions

### Support
- Check console for errors
- Review network tab
- Check API responses
- Contact support

## 🎓 Learning Path

### Beginner
1. Start with grid view
2. Create a project
3. Create a document
4. Edit content

### Intermediate
1. Use search and filter
2. Try different views
3. Explore analytics
4. Review outline

### Advanced
1. Use graph view
2. Analyze patterns
3. Bulk operations
4. Export data

## 🌟 Power User Features

### Coming Soon
- Keyboard shortcuts
- Saved searches
- Custom views
- Advanced filters
- Batch tagging
- Export templates

### Future
- AI suggestions
- Smart categorization
- Real-time collaboration
- Version history
- Comments system

---

**Need Help?**
- Refer to documentation
- Check tooltips
- Hover for hints
- Contact support

**Pro Tip**: Master one view mode at a time, then combine them for maximum efficiency!
