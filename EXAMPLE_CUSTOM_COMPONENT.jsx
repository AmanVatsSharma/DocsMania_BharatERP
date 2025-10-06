// Example 1: Testimonial Card
export default function TestimonialCard({ props }) {
  const {
    quote = "This product changed my life!",
    author = "Jane Doe",
    role = "CEO, Acme Corp",
    avatar = "https://i.pravatar.cc/150?img=1",
    rating = 5
  } = props || {};
  
  return (
    <div style={{
      padding: "32px",
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      maxWidth: "500px",
      margin: "0 auto"
    }}>
      {/* Star Rating */}
      <div style={{ marginBottom: "16px", color: "#fbbf24" }}>
        {"★".repeat(rating)}{"☆".repeat(5 - rating)}
      </div>
      
      {/* Quote */}
      <p style={{
        fontSize: "18px",
        lineHeight: "1.6",
        color: "#374151",
        marginBottom: "24px",
        fontStyle: "italic"
      }}>
        "{quote}"
      </p>
      
      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <img 
          src={avatar}
          alt={author}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            objectFit: "cover"
          }}
        />
        <div>
          <div style={{ fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
            {author}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}

// Schema for above:
{
  "quote": {
    "type": "string",
    "label": "Testimonial Quote",
    "default": "This product changed my life!"
  },
  "author": {
    "type": "string",
    "label": "Author Name",
    "default": "Jane Doe"
  },
  "role": {
    "type": "string",
    "label": "Author Role",
    "default": "CEO, Acme Corp"
  },
  "avatar": {
    "type": "string",
    "label": "Avatar URL",
    "default": "https://i.pravatar.cc/150?img=1"
  },
  "rating": {
    "type": "number",
    "label": "Star Rating (1-5)",
    "default": 5
  }
}
