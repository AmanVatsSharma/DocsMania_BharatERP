"use client";

import React from "react";
import { FileText, Image as ImageIcon, Code, Table } from "lucide-react";

interface DocumentThumbnailProps {
  documentId: string;
  title: string;
  fallbackIcon?: React.ElementType;
  className?: string;
}

export default function DocumentThumbnail({ 
  documentId, 
  title,
  fallbackIcon: FallbackIcon = FileText,
  className = ""
}: DocumentThumbnailProps) {
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const generateThumbnail = async () => {
      try {
        setLoading(true);
        setError(false);

        // Fetch document content
        const res = await fetch(`/api/documents/${documentId}`);
        if (!res.ok) throw new Error("Failed to fetch document");
        
        const json = await res.json();
        if (!json.ok) throw new Error("Document not found");

        const doc = json.data;
        
        // Get the latest version content if available
        let content = null;
        if (doc.versions && doc.versions.length > 0) {
          const latestVersion = doc.versions[doc.versions.length - 1];
          content = latestVersion.content;
        }

        // Generate thumbnail based on content
        if (content) {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 400, 300);
            gradient.addColorStop(0, '#f8fafc');
            gradient.addColorStop(1, '#f1f5f9');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 300);

            // Title
            ctx.fillStyle = '#18181b';
            ctx.font = 'bold 24px system-ui';
            ctx.fillText(title.substring(0, 20), 20, 40);

            // Content preview (simplified)
            ctx.fillStyle = '#52525b';
            ctx.font = '14px system-ui';
            let y = 80;
            
            // Draw content lines (simplified representation)
            const contentText = JSON.stringify(content).substring(0, 200);
            const words = contentText.split(' ');
            let line = '';
            
            for (let i = 0; i < Math.min(words.length, 30); i++) {
              const testLine = line + words[i] + ' ';
              const metrics = ctx.measureText(testLine);
              
              if (metrics.width > 360 && i > 0) {
                ctx.fillText(line, 20, y);
                line = words[i] + ' ';
                y += 20;
                
                if (y > 260) break;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, 20, y);

            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png');
            setThumbnail(dataUrl);
          }
        }
      } catch (e) {
        console.error("[DocumentThumbnail] Error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [documentId, title]);

  // Fallback rendering
  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-white ${className}`}>
        <div className="animate-pulse">
          <FallbackIcon className="w-12 h-12 text-zinc-300" />
        </div>
      </div>
    );
  }

  if (error || !thumbnail) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-white ${className}`}>
        <FallbackIcon className="w-12 h-12 text-zinc-300" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <img 
        src={thumbnail} 
        alt={`Thumbnail for ${title}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// Helper component for static gradient backgrounds
export function DocumentThumbnailPlaceholder({ 
  title,
  icon: Icon = FileText,
  gradient = "from-blue-500 to-purple-600",
  className = ""
}: {
  title: string;
  icon?: React.ElementType;
  gradient?: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-16 h-16 text-white/30" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="text-xs font-semibold text-white truncate">
          {title}
        </div>
      </div>
    </div>
  );
}

// Get icon based on document type/content
export function getDocumentIcon(slug: string): React.ElementType {
  if (slug.includes('api') || slug.includes('code')) return Code;
  if (slug.includes('table') || slug.includes('data')) return Table;
  if (slug.includes('image') || slug.includes('gallery')) return ImageIcon;
  return FileText;
}
