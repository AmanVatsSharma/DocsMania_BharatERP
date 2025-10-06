-- Add DataSource table for external data connections
CREATE TABLE IF NOT EXISTS "DataSource" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- 'sql', 'rest', 'graphql', 'json', 'csv', 'webhook'
  "config" TEXT NOT NULL, -- JSON string with connection details (encrypted sensitive fields)
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index on type for filtering
CREATE INDEX IF NOT EXISTS "DataSource_type_idx" ON "DataSource"("type");

-- Add DataQuery table for saved queries
CREATE TABLE IF NOT EXISTS "DataQuery" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "dataSourceId" TEXT NOT NULL,
  "query" TEXT NOT NULL, -- SQL query, REST endpoint, or GraphQL query
  "params" TEXT, -- JSON string with query parameters
  "transform" TEXT, -- JavaScript transform function
  "cacheEnabled" BOOLEAN NOT NULL DEFAULT false,
  "cacheTTL" INTEGER NOT NULL DEFAULT 300, -- seconds
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE
);

-- Add index for queries by data source
CREATE INDEX IF NOT EXISTS "DataQuery_dataSourceId_idx" ON "DataQuery"("dataSourceId");
