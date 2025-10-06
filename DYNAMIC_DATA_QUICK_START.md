# Dynamic Data System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup (1 minute)

Run the migration to add data source tables:

```bash
# Generate Prisma client with new models
npx prisma generate

# Apply migration
npx prisma db push
```

Or run the SQL directly:
```bash
psql -d your_database < prisma/migrations/add_data_sources.sql
```

---

### Step 2: Add Your First Data Source (2 minutes)

#### Option A: Public API (No credentials needed)

1. Open any document in the editor
2. Click **"Data Sources"** button (will be added to TopBar)
3. Click **"+ Add Source"**
4. Fill in:
   ```
   Name: JSONPlaceholder
   Type: REST API
   Base URL: https://jsonplaceholder.typicode.com
   Auth: None
   ```
5. Click **"Test Connection"**
6. Click **"Save"**

#### Option B: Your PostgreSQL Database

```
Name: My Database
Type: SQL Database
Host: localhost
Port: 5432
Database: mydb
Username: readonly_user
Password: ********
SSL: ✓ (if needed)
```

#### Option C: JSON File

```
Name: Static Data
Type: JSON URL
URL: https://example.com/data.json
```

---

### Step 3: Create a Query (1 minute)

#### For REST API:
```
Endpoint: /users
Parameters: (none)
Transform: (none)
```

Click **"▶ Run Query"** to test!

#### For SQL:
```sql
SELECT id, name, email, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10
```

#### For GraphQL:
```graphql
query GetUsers {
  users(limit: 10) {
    id
    name
    email
  }
}
```

---

### Step 4: Use Data in Your Document (1 minute)

#### Method 1: Dynamic Table

1. Insert a table in editor (or use existing)
2. Right-click table → **"Connect Data Source"**
3. Select your data source
4. Select your query
5. Set refresh interval (optional): `60` seconds
6. Click **"Apply"**

**Result**: Table now shows live data! ✅

#### Method 2: Stats Component with Live Data

1. Add Stats block (type `/stats`)
2. Click Stats → Inspector → **Props**
3. Add data binding:
   ```
   Data Source: My Database
   Query: SELECT COUNT(*) as total FROM orders
   Stats Template: {{total}}|Total Orders|Updated live
   ```
4. Data refreshes automatically! ✅

---

## 📊 Real-World Examples

### Example 1: Live Sales Dashboard

**Data Source**: Your sales database

**Query**:
```sql
SELECT 
  DATE(created_at) as date,
  SUM(total) as revenue,
  COUNT(*) as orders
FROM sales
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC
```

**Document**:
```
1. Hero: "Sales Dashboard"
2. Stats: Revenue, Orders, Average (from query)
3. Table: Show all data with sorting
4. Chart: Revenue trend (connect to same query)
```

**Auto-refresh**: Every 60 seconds

---

### Example 2: Customer Directory

**Data Source**: CRM API (e.g., HubSpot)

**Query**:
```
Endpoint: /contacts?limit=100
Auth: Bearer Token
```

**Transform**:
```javascript
return data.contacts.map(contact => ({
  name: contact.properties.firstname + ' ' + contact.properties.lastname,
  email: contact.properties.email,
  company: contact.properties.company,
  phone: contact.properties.phone
}));
```

**Document**:
```
1. Hero: "Customer Directory"
2. Search bar (coming soon)
3. Table: All contacts with filtering
```

**Auto-refresh**: Every 5 minutes

---

### Example 3: API Status Monitor

**Data Sources**: 
- REST API: Your service endpoints
- JSON: Public status page

**Queries**:
```
1. GET /health
2. GET /api/status
3. https://status.example.com/summary.json
```

**Document**:
```
1. Hero: "System Status"
2. Stats: Uptime, Response Time, Error Rate
3. Table: Service Status (Green/Red indicators)
4. Timeline: Recent incidents
```

**Auto-refresh**: Every 30 seconds

---

### Example 4: Product Inventory

**Data Source**: PostgreSQL inventory database

**Query**:
```sql
SELECT 
  product_id,
  product_name,
  category,
  quantity,
  reorder_level,
  CASE 
    WHEN quantity <= reorder_level THEN 'Low Stock'
    WHEN quantity = 0 THEN 'Out of Stock'
    ELSE 'In Stock'
  END as status
FROM inventory
WHERE quantity <= reorder_level
ORDER BY quantity ASC
```

**Document**:
```
1. Hero: "Low Stock Alert"
2. Stats: Total items, Out of stock, Low stock
3. Table: Products with conditional formatting
   - Red background: Out of stock
   - Yellow background: Low stock
4. Button: "Reorder All"
```

**Auto-refresh**: Every 2 minutes

---

## 🎨 Excel Features

### Quick Formula Reference

#### Calculations:
```
=SUM(A1:A10)           // Add up a range
=AVG(B1:B100)          // Average
=COUNT(C1:C50)         // Count non-empty cells
=A1 * B1               // Multiply two cells
=ROUND(D1/E1, 2)       // Divide and round to 2 decimals
```

#### Logic:
```
=IF(A1>100, "High", "Low")
=IF(B1="", "N/A", B1)
```

#### Text:
```
=CONCAT(A1, " ", B1)   // Join text
=UPPER(C1)             // Uppercase
=LOWER(D1)             // Lowercase
```

### Cell Types

Click any cell → Right sidebar → **Cell Type**:
- **Text** - Any text
- **Number** - Numeric values
- **Currency** - Auto-formats as money
- **Date** - Date picker
- **Checkbox** - True/false
- **Select** - Dropdown options

### Conditional Formatting

Click table → Inspector → **Conditional Formatting**:
```json
{
  "rules": [
    {
      "condition": "value > 1000",
      "backgroundColor": "#dcfce7",
      "color": "#166534"
    },
    {
      "condition": "value < 0",
      "backgroundColor": "#fee2e2",
      "color": "#991b1b"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Connection Failed

**Problem**: Can't connect to database/API

**Solutions**:
1. Check credentials
2. Verify network access (firewall/VPN)
3. Test connection outside editor first
4. Check SSL settings
5. Ensure database allows remote connections

### Query Error

**Problem**: Query returns error

**Solutions**:
1. Test query in database client first
2. Check table/column names
3. Verify parameter syntax (`:paramName`)
4. Check permissions (SELECT access)
5. Look at error message details

### No Data Showing

**Problem**: Table is empty after connecting

**Solutions**:
1. Run query in Query Builder first
2. Check query returns data
3. Verify column mapping
4. Clear cache and refresh
5. Check browser console for errors

### Slow Performance

**Problem**: Data takes too long to load

**Solutions**:
1. Enable caching (5 min TTL)
2. Add LIMIT to queries
3. Create database indexes
4. Reduce refresh frequency
5. Use database views for complex queries

---

## ⚡ Performance Tips

### 1. Use Caching
```typescript
// Cache for 5 minutes
{
  cache: { enabled: true, ttl: 300 }
}
```

### 2. Limit Results
```sql
-- Instead of:
SELECT * FROM orders

-- Do this:
SELECT * FROM orders LIMIT 100
```

### 3. Index Your Database
```sql
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_users_email ON users(email);
```

### 4. Use Specific Columns
```sql
-- Instead of:
SELECT *

-- Do this:
SELECT id, name, email, created_at
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Use read-only database users
- [ ] Never expose connection details in client code
- [ ] Enable SSL for database connections
- [ ] Encrypt sensitive fields in data source config
- [ ] Add authentication to API routes
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Set up monitoring and alerts
- [ ] Use environment variables for secrets
- [ ] Regular security audits

---

## 📚 Next Steps

1. **Learn Formulas**: Check `DYNAMIC_DATA_SYSTEM.md` for full formula reference
2. **Advanced Queries**: Explore JOIN, GROUP BY, subqueries
3. **Custom Transforms**: Write JavaScript to reshape data
4. **Build Reports**: Create dashboards with multiple data sources
5. **Automation**: Set up scheduled refreshes and alerts

---

## 💡 Pro Tips

### Tip 1: Reuse Queries
Save commonly used queries as templates in Query Builder.

### Tip 2: Transform Data
Use transform functions to reshape API responses:
```javascript
// Convert nested data to flat table
return data.orders.map(o => ({
  id: o.id,
  customer: o.customer.name,
  total: o.line_items.reduce((sum, item) => sum + item.price, 0)
}));
```

### Tip 3: Parameterize Everything
Make queries reusable with parameters:
```sql
SELECT * FROM orders
WHERE date >= :startDate 
  AND date <= :endDate
  AND status = :status
```

### Tip 4: Monitor Performance
Watch the "cached" flag in responses - aim for high cache hit rates.

### Tip 5: Start Simple
Begin with JSON/CSV sources, then move to databases/APIs once comfortable.

---

## 🎉 You're Ready!

You now have:
- ✅ Data sources connected
- ✅ Queries working
- ✅ Live data in documents
- ✅ Auto-refresh enabled
- ✅ Formulas and formatting

**Build something amazing!** 🚀

---

## 📞 Need Help?

- 📖 Full docs: `DYNAMIC_DATA_SYSTEM.md`
- 🔧 Implementation: Check code in `lib/dataSourceManager.ts`
- 💬 Questions: Check inline code comments
- 🐛 Issues: All error messages are detailed

**Happy data dashboarding!** 📊
