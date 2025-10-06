# Dynamic Data & Excel-Like Editor System

## 🎯 Overview

Your editor now has **enterprise-grade data capabilities**:
- 📊 **Excel-like tables** with formulas, sorting, filtering
- 🔌 **External data sources** (SQL, REST API, GraphQL, CSV, JSON)
- 🔄 **Live data refresh** with caching
- 📈 **Dynamic reports** powered by real-time data
- 🎨 **Visual query builder** for non-technical users
- 🔒 **Secure data handling** with encryption

---

## 🚀 Key Features

### 1. Excel-Like Table Capabilities

#### Formula Support
```
=SUM(A1:A10)          // Sum range
=AVG(B1:B5)           // Average
=IF(C1>100, "High", "Low")  // Conditional
=ROUND(D1/E1, 2)      // Math operations
=CONCAT(F1, " ", G1)  // String operations
=COUNT(H1:H20)        // Count values
=MAX(I1:I15)          // Maximum value
=MIN(J1:J10)          // Minimum value
```

#### Cell Types
- **Text** - Plain text
- **Number** - Numeric values with formatting
- **Currency** - $1,234.56 format
- **Date** - Date picker and formatting
- **Checkbox** - Boolean values
- **Select** - Dropdown options

#### Advanced Features
- ✅ **Sorting** - Click column headers
- ✅ **Filtering** - Filter rows by criteria
- ✅ **Conditional Formatting** - Highlight cells based on rules
- ✅ **Data Validation** - Enforce input rules
- ✅ **Aggregations** - Auto-calculate SUM, AVG, COUNT
- ✅ **Frozen Columns/Rows** - Lock headers

---

### 2. Data Source Connections

#### Supported Sources

##### SQL Databases
```typescript
// PostgreSQL, MySQL, MariaDB
{
  type: "sql",
  config: {
    host: "localhost",
    port: 5432,
    database: "mydb",
    username: "user",
    password: "***", // Encrypted
    ssl: true
  }
}
```

**Use Cases**:
- Customer databases
- Order history
- Product catalogs
- Analytics data

##### REST APIs
```typescript
{
  type: "rest",
  config: {
    baseUrl: "https://api.example.com",
    auth: {
      type: "bearer",
      token: "***" // Encrypted
    }
  }
}
```

**Use Cases**:
- Third-party APIs (Stripe, Salesforce, etc.)
- Internal microservices
- Public data APIs (weather, stocks, etc.)

##### GraphQL
```typescript
{
  type: "graphql",
  config: {
    endpoint: "https://api.example.com/graphql",
    headers: {
      "Authorization": "Bearer ***"
    }
  }
}
```

**Use Cases**:
- Modern APIs
- GitHub, Shopify, etc.
- Complex data relationships

##### JSON/CSV URLs
```typescript
{
  type: "json",
  config: {
    url: "https://example.com/data.json"
  }
}
```

**Use Cases**:
- Static data files
- Public datasets
- Simple integrations

---

### 3. Query Builder UI

#### Visual Interface
```
┌─────────────────────────────────────────┐
│  Data Source Manager                    │
├─────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ SQL │ │ REST│ │ GQL │               │
│  └─────┘ └─────┘ └─────┘               │
│                                         │
│  + Add New Source                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Query Builder                          │
├─────────────────────────────────────────┤
│  Query Editor          │  Results       │
│                        │                │
│  SELECT * FROM users   │  ┌──────────┐ │
│  WHERE status = :active│  │ id │name │ │
│  LIMIT 10              │  ├──────────┤ │
│                        │  │ 1  │John │ │
│  Parameters:           │  │ 2  │Jane │ │
│  {                     │  └──────────┘ │
│    "active": true      │                │
│  }                     │  ✓ 2 rows     │
│                        │                │
│  [▶ Run Query] [Save]  │                │
└─────────────────────────────────────────┘
```

#### Features
- 📝 **Syntax Highlighting** - SQL, GraphQL
- ✅ **Live Testing** - Run queries before saving
- 🔄 **Auto-refresh** - Set refresh intervals
- 💾 **Query Templates** - Save reusable queries
- 🛡️ **Error Handling** - Clear error messages

---

### 4. Dynamic Data Binding

#### Table with Live Data
```typescript
// In table attributes:
{
  dataSource: "my-postgres-db",
  dataQuery: {
    sourceId: "abc123",
    query: "SELECT * FROM sales WHERE date >= :startDate",
    params: { startDate: "2024-01-01" },
    cache: {
      enabled: true,
      ttl: 300 // 5 minutes
    }
  },
  refreshInterval: 60 // Auto-refresh every 60 seconds
}
```

#### Component Data Binding
```typescript
// Stats component with live data:
{
  componentKey: "stats",
  props: {
    dataSource: "api-endpoint",
    stats: "{{data.totalUsers}}|Active Users|Growing daily"
  }
}
```

---

### 5. Report Templates

#### Sales Dashboard
```json
{
  "type": "doc",
  "content": [
    {
      "type": "section",
      "attrs": {
        "componentKey": "hero",
        "props": {
          "title": "Sales Dashboard",
          "subtitle": "Real-time metrics updated every minute"
        }
      }
    },
    {
      "type": "section",
      "attrs": {
        "componentKey": "stats",
        "props": {
          "dataSource": "sales-db",
          "dataQuery": {
            "query": "SELECT SUM(total) as revenue, COUNT(*) as orders FROM sales WHERE date = CURRENT_DATE"
          },
          "stats": "{{revenue}}|Revenue|Today's sales;{{orders}}|Orders|Processed today"
        }
      }
    },
    {
      "type": "tableAdvanced",
      "attrs": {
        "dataSource": "sales-db",
        "dataQuery": {
          "query": "SELECT * FROM sales ORDER BY created_at DESC LIMIT 10"
        },
        "sortable": true,
        "filterable": true,
        "refreshInterval": 60
      }
    }
  ]
}
```

#### Customer Analytics
```json
{
  "type": "doc",
  "content": [
    {
      "type": "section",
      "attrs": {
        "componentKey": "chart",
        "props": {
          "type": "bar",
          "title": "Customer Growth",
          "dataSource": "analytics-api",
          "dataQuery": {
            "query": "/api/analytics/customers/growth?period=30d"
          }
        }
      }
    }
  ]
}
```

---

## 🔧 Implementation Guide

### Step 1: Set Up Data Sources

#### Via UI:
1. Click **"Data Sources"** in editor
2. Click **"+ Add Source"**
3. Choose type (SQL, REST, etc.)
4. Enter connection details
5. Click **"Test Connection"**
6. Save

#### Via API:
```typescript
POST /api/data-sources
{
  "name": "Production DB",
  "type": "sql",
  "config": {
    "host": "db.example.com",
    "port": 5432,
    "database": "prod",
    "username": "readonly",
    "password": "***",
    "ssl": true
  }
}
```

---

### Step 2: Create Queries

#### SQL Example:
```sql
-- Query: Get Recent Orders
SELECT 
  id,
  customer_name,
  total,
  status,
  created_at
FROM orders
WHERE created_at >= :startDate
ORDER BY created_at DESC
LIMIT :limit
```

**Parameters**:
```json
{
  "startDate": "2024-01-01",
  "limit": 50
}
```

#### REST API Example:
```
Endpoint: /api/customers?status=active&limit=100

Transform Function:
return data.customers.map(c => ({
  id: c.id,
  name: c.full_name,
  email: c.email_address,
  total_orders: c.order_count
}));
```

#### GraphQL Example:
```graphql
query GetProducts($category: String) {
  products(category: $category, limit: 20) {
    id
    name
    price
    inventory {
      quantity
      location
    }
  }
}
```

**Variables**:
```json
{
  "category": "electronics"
}
```

---

### Step 3: Bind Data to Components

#### Method 1: Advanced Table
```typescript
1. Insert table in editor
2. Click table → "Connect Data Source"
3. Select data source
4. Write/select query
5. Test query
6. Set refresh interval (optional)
7. Save

// Table will now display live data!
```

#### Method 2: Dynamic Stats
```typescript
1. Add Stats component
2. In Inspector → Props:
   - dataSource: "my-api"
   - dataQuery: { ... }
3. Use {{fieldName}} in stats template
4. Data refreshes automatically
```

---

### Step 4: Configure Caching

```typescript
// Enable caching for expensive queries
{
  cache: {
    enabled: true,
    ttl: 300 // Cache for 5 minutes
  }
}

// Disable for real-time data
{
  cache: {
    enabled: false
  }
}
```

---

## 🎨 Excel-Like Features

### Formulas

#### Basic Math:
```
=A1+B1              // Addition
=C1-D1              // Subtraction
=E1*F1              // Multiplication
=G1/H1              // Division
=POW(I1, 2)         // Power
=SQRT(J1)           // Square root
=ABS(K1)            // Absolute value
```

#### Aggregations:
```
=SUM(A1:A100)       // Sum range
=AVG(B1:B50)        // Average
=COUNT(C1:C200)     // Count non-empty
=MIN(D1:D30)        // Minimum
=MAX(E1:E30)        // Maximum
```

#### Logic:
```
=IF(A1>100, "High", "Low")
=IF(B1="", "Empty", B1)
=IF(C1>50 AND D1<100, "Valid", "Invalid")
```

#### Text:
```
=CONCAT(A1, " ", B1)     // Concatenate
=UPPER(C1)               // Uppercase
=LOWER(D1)               // Lowercase
=LEN(E1)                 // Length
```

#### Dates:
```
=NOW()              // Current date/time
=TODAY()            // Current date
```

---

### Cell Types & Validation

#### Number with Range:
```typescript
{
  type: "number",
  validation: {
    type: "range",
    params: { min: 0, max: 100 },
    message: "Value must be between 0 and 100"
  }
}
```

#### Email:
```typescript
{
  type: "text",
  validation: {
    type: "email",
    message: "Invalid email address"
  }
}
```

#### Select Dropdown:
```typescript
{
  type: "select",
  options: ["Active", "Pending", "Inactive"]
}
```

---

### Conditional Formatting

#### Rules:
```typescript
{
  conditionalFormatting: [
    {
      condition: "value > 1000",
      style: {
        backgroundColor: "#dcfce7",
        color: "#166534"
      }
    },
    {
      condition: "value < 0",
      style: {
        backgroundColor: "#fee2e2",
        color: "#991b1b"
      }
    }
  ]
}
```

---

## 🔒 Security

### Encryption
- ✅ **Passwords encrypted** at rest
- ✅ **API tokens encrypted** in database
- ✅ **Secure transmission** over HTTPS

### Access Control
```typescript
// Add authentication checks in API routes
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED" } },
      { status: 401 }
    );
  }
  
  // Check user permissions for data source access
  const hasAccess = await checkDataSourceAccess(
    session.userId,
    dataSourceId
  );
  
  if (!hasAccess) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN" } },
      { status: 403 }
    );
  }
  
  // Proceed with query...
}
```

### Query Sanitization
- ✅ **Parameterized queries** prevent SQL injection
- ✅ **Input validation** on all parameters
- ✅ **Read-only** database users recommended
- ✅ **Query timeout limits** prevent abuse

---

## 📊 Use Cases

### 1. Sales Dashboard
**Data Sources**: 
- PostgreSQL (sales database)
- Stripe API (payment data)

**Components**:
- Live stats (revenue, orders, customers)
- Sales table with sorting/filtering
- Revenue chart (last 30 days)
- Top products list

**Refresh**: Every 60 seconds

---

### 2. Customer Reports
**Data Sources**:
- CRM API (Salesforce/HubSpot)
- Analytics database

**Components**:
- Customer growth chart
- Active customers table
- Churn rate stats
- Segmentation breakdown

**Refresh**: Every 5 minutes

---

### 3. Inventory Management
**Data Sources**:
- Inventory database
- Supplier API

**Components**:
- Low stock alerts (conditional formatting)
- Product table with filters
- Reorder recommendations
- Supplier performance stats

**Refresh**: Real-time (on-demand)

---

### 4. Analytics Dashboard
**Data Sources**:
- Google Analytics API
- Internal analytics DB

**Components**:
- Traffic stats
- Conversion funnel
- Top pages table
- User behavior charts

**Refresh**: Every 15 minutes

---

## 🚀 Performance

### Caching Strategy
```typescript
// Fast queries: No cache needed
{
  cache: { enabled: false }
}

// Medium queries: Short cache
{
  cache: { enabled: true, ttl: 60 } // 1 minute
}

// Slow queries: Long cache
{
  cache: { enabled: true, ttl: 3600 } // 1 hour
}
```

### Optimization Tips
1. **Index your database** tables
2. **Limit result sets** (use LIMIT)
3. **Use parameterized queries**
4. **Cache expensive queries**
5. **Paginate large datasets**
6. **Use database views** for complex queries

---

## 🔄 Auto-Refresh

### Table with Auto-Refresh:
```typescript
{
  refreshInterval: 60, // seconds
  dataSource: "sales-db",
  dataQuery: { ... }
}

// Table refreshes every 60 seconds automatically
```

### Manual Refresh Button:
```typescript
// Add refresh button to your UI
<button onClick={() => {
  editor.commands.refreshTableData();
}}>
  🔄 Refresh
</button>
```

---

## 📝 API Reference

### Data Sources

#### Create Source
```
POST /api/data-sources
Body: { name, type, config }
Response: { ok: true, data: DataSource }
```

#### List Sources
```
GET /api/data-sources
Response: { ok: true, data: DataSource[] }
```

#### Delete Source
```
DELETE /api/data-sources/:id
Response: { ok: true }
```

### Query Execution

#### Execute Query
```
POST /api/data-sources/execute
Body: {
  sourceId: string,
  query: string | object,
  params?: object,
  transform?: string,
  useCache?: boolean
}
Response: { ok: true, data: any[], cached?: boolean }
```

---

## 🎓 Best Practices

### 1. Query Design
- ✅ Use **SELECT specific columns**, not SELECT *
- ✅ Add **WHERE clauses** to limit data
- ✅ Use **LIMIT** for large tables
- ✅ Create **database indexes** for better performance

### 2. Security
- ✅ Use **read-only** database users
- ✅ **Never expose** connection details to client
- ✅ Implement **rate limiting**
- ✅ **Validate all inputs**

### 3. Caching
- ✅ Cache **expensive queries**
- ✅ Set **appropriate TTL** based on data freshness needs
- ✅ **Bust cache** when data changes
- ✅ Monitor **cache hit rates**

### 4. Error Handling
- ✅ **Graceful fallbacks** when data source is down
- ✅ **Clear error messages** for users
- ✅ **Retry logic** for transient failures
- ✅ **Logging and monitoring**

---

## 🔮 Future Enhancements

Coming soon:
- 🔜 **Write operations** (INSERT, UPDATE, DELETE)
- 🔜 **Real-time subscriptions** (WebSocket)
- 🔜 **Data joins** across sources
- 🔜 **AI-powered query suggestions**
- 🔜 **Visual schema explorer**
- 🔜 **Automated reports** (scheduled)
- 🔜 **Data export** (Excel, CSV, PDF)

---

## ✅ Summary

You now have:
- ✅ **Excel-like tables** with formulas and advanced features
- ✅ **External data connections** (SQL, REST, GraphQL, CSV, JSON)
- ✅ **Visual query builder** for easy data access
- ✅ **Live data refresh** with intelligent caching
- ✅ **Dynamic components** powered by real-time data
- ✅ **Secure data handling** with encryption
- ✅ **Enterprise-grade** performance and reliability

**Your editor is now a powerful data platform!** 🎉
