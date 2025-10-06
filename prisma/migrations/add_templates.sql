-- Add Template table for custom document templates
CREATE TABLE IF NOT EXISTS "Template" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Custom',
  "tags" TEXT NOT NULL,
  "thumbnail" TEXT,
  "content" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Template_category_idx" ON "Template"("category");
CREATE INDEX IF NOT EXISTS "Template_isPublic_idx" ON "Template"("isPublic");

-- Insert a sample template
INSERT INTO "Template" (id, name, description, category, tags, content, "isPublic", "createdAt", "updatedAt")
VALUES (
  'tpl-' || lower(hex(randomblob(16))),
  'Blank Document',
  'Start with a clean slate',
  'Basic',
  '["blank", "starter"]',
  '{"type":"doc","content":[{"type":"section","attrs":{"componentKey":"hero","props":{"title":"Untitled Document","subtitle":"Start writing here...","alignment":"center"}},"content":[{"type":"paragraph"}]}]}',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
