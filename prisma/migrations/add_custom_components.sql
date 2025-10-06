-- Add CustomComponent table for user-created React components
CREATE TABLE IF NOT EXISTS "CustomComponent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Custom',
  "tags" TEXT NOT NULL, -- JSON array of tags
  "code" TEXT NOT NULL, -- React JSX code
  "schema" TEXT NOT NULL, -- JSON props schema
  "defaultConfig" TEXT NOT NULL, -- JSON default configuration
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "CustomComponent_category_idx" ON "CustomComponent"("category");
CREATE INDEX IF NOT EXISTS "CustomComponent_key_idx" ON "CustomComponent"("key");

-- Example: Insert a sample custom component
INSERT INTO "CustomComponent" (
  "id",
  "key",
  "name",
  "description",
  "category",
  "tags",
  "code",
  "schema",
  "defaultConfig"
) VALUES (
  'example-custom-component-' || gen_random_uuid(),
  'custom-hero',
  'Custom Hero Section',
  'A customizable hero section with modern design',
  'Custom',
  '["hero", "header", "custom"]',
  'export default function CustomHero({ props }) {
  const {
    title = "Welcome",
    subtitle = "Build something amazing",
    buttonText = "Get Started",
    buttonLink = "#",
    alignment = "center"
  } = props || {};
  
  return (
    <div style={{
      padding: "64px 32px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      textAlign: alignment,
      borderRadius: "24px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
    }}>
      <h1 style={{
        fontSize: "48px",
        fontWeight: "bold",
        marginBottom: "16px",
        lineHeight: "1.2"
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{
          fontSize: "20px",
          opacity: 0.9,
          marginBottom: "32px"
        }}>
          {subtitle}
        </p>
      )}
      {buttonText && (
        <a
          href={buttonLink}
          style={{
            display: "inline-block",
            padding: "16px 40px",
            backgroundColor: "white",
            color: "#667eea",
            textDecoration: "none",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "18px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}
        >
          {buttonText}
        </a>
      )}
    </div>
  );
}',
  '{"title": {"type": "string", "label": "Title", "default": "Welcome"}, "subtitle": {"type": "string", "label": "Subtitle", "default": "Build something amazing"}, "buttonText": {"type": "string", "label": "Button Text", "default": "Get Started"}, "buttonLink": {"type": "string", "label": "Button Link", "default": "#"}, "alignment": {"type": "select", "options": ["left", "center", "right"], "label": "Alignment", "default": "center"}}',
  '{"title": "Welcome", "subtitle": "Build something amazing", "buttonText": "Get Started", "buttonLink": "#", "alignment": "center"}'
) ON CONFLICT DO NOTHING;
