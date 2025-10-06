"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Sparkles, X, FileText, Briefcase, Newspaper, BookOpen, Users, Zap } from "lucide-react";
import { clsx } from "clsx";

export interface BlockTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (template: any) => void;
}

/**
 * Pre-built document templates for quick starts
 * Categories: Landing Page, Documentation, Blog, Portfolio, etc.
 */

const templates = [
  {
    id: "landing-saas",
    name: "SaaS Landing Page",
    category: "Marketing",
    icon: <Zap className="h-5 w-5" />,
    description: "Modern landing page for SaaS products",
    preview: "Hero + Features + Pricing + CTA",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "Transform Your Workflow",
              subtitle: "The all-in-one platform for modern teams",
              ctaText: "Start Free Trial",
              ctaLink: "#signup",
              alignment: "center",
              style: { backgroundColor: "#0f172a", color: "#ffffff", borderRadius: 16, shadow: "lg" }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "feature",
            props: {
              title: "Why Teams Love Us",
              description: "Everything you need to succeed",
              points: "⚡ Lightning fast performance,🔒 Bank-level security,📊 Advanced analytics,🎨 Beautiful design,🌍 Global CDN,🤝 24/7 Support"
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "stats",
            props: {
              stats: "50K+|Active Users|Growing daily;99.9%|Uptime|Enterprise SLA;4.9/5|Rating|From 2K+ reviews;24/7|Support|Always available"
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    id: "product-docs",
    name: "Product Documentation",
    category: "Documentation",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Technical documentation structure",
    preview: "Getting Started + API + Examples",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "callout",
            props: {
              text: "📚 Welcome to the documentation! Start with the quick start guide below.",
              type: "info",
              icon: "📚",
              style: { backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#3b82f6" }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Getting Started" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Follow these steps to get up and running in minutes." }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "code",
            props: {
              code: "npm install @yourpackage/core\\n\\nimport { initialize } from '@yourpackage/core';\\n\\nconst app = initialize({\\n  apiKey: 'your-api-key'\\n});",
              language: "javascript",
              showLineNumbers: true
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "accordion",
            props: {
              items: "Installation|Install via npm, yarn, or pnpm. See installation guide for details.;Configuration|Configure your app with environment variables and config files.;Authentication|Set up authentication with OAuth, API keys, or JWT tokens.",
              defaultOpen: true,
              multipleOpen: false
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    id: "blog-post",
    name: "Blog Article",
    category: "Content",
    icon: <Newspaper className="h-5 w-5" />,
    description: "Blog post with rich formatting",
    preview: "Header + Body + Images + CTA",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Your Blog Post Title Here" }]
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Published on " },
            { type: "text", marks: [{ type: "bold" }], text: "January 1, 2024" },
            { type: "text", text: " by Author Name" }
          ]
        },
        {
          type: "section",
          attrs: {
            componentKey: "divider",
            props: { style: "solid", spacing: 24 }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Start with a compelling introduction that hooks your readers and sets the context for your article..." }]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Key Takeaways" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "callout",
            props: {
              text: "💡 Remember these important points as you read through this article.",
              type: "info",
              icon: "💡"
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    id: "team-page",
    name: "Team Page",
    category: "Company",
    icon: <Users className="h-5 w-5" />,
    description: "Showcase your team members",
    preview: "Team grid with profiles",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "Meet Our Team",
              subtitle: "The talented people behind our success",
              alignment: "center",
              style: { backgroundColor: "#f8fafc", color: "#0f172a", borderRadius: 12 }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "columns",
            props: { columns: "3", gap: 32, equalHeight: true }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "card",
            props: {
              image: "/placeholder.svg",
              title: "Team Member Name",
              description: "Role & Bio - Add your team member's information here",
              link: "#"
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    id: "portfolio",
    name: "Portfolio Showcase",
    category: "Portfolio",
    icon: <Briefcase className="h-5 w-5" />,
    description: "Display your work and projects",
    preview: "Projects + Gallery + About",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "My Portfolio",
              subtitle: "Designer • Developer • Creator",
              alignment: "center",
              style: { backgroundColor: "#0f172a", color: "#ffffff", borderRadius: 16, shadow: "lg" }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "gallery",
            props: {
              images: "/placeholder.svg,/placeholder.svg,/placeholder.svg,/placeholder.svg",
              columns: "2",
              gap: 24
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "button",
            props: {
              text: "View All Projects",
              link: "#projects",
              variant: "primary",
              size: "lg"
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    id: "changelog",
    name: "Product Changelog",
    category: "Product",
    icon: <FileText className="h-5 w-5" />,
    description: "Product updates and release notes",
    preview: "Timeline of releases",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Changelog" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "All notable changes and updates to our product." }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "timeline",
            props: {
              events: "v2.0.0 - Jan 2024|Major Release|Complete redesign with new features and improvements;v1.5.0 - Dec 2023|Feature Update|Added real-time collaboration and comments;v1.0.0 - Oct 2023|Launch|Initial public release"
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "accordion",
            props: {
              items: "Latest Updates|See what's new in the most recent release;Bug Fixes|View all resolved issues and improvements;Upcoming Features|Preview what's coming next",
              defaultOpen: true,
              multipleOpen: true
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  }
];

export default function BlockTemplates(props: BlockTemplatesProps) {
  const { open, onOpenChange, onApplyTemplate } = props;
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>("All");

  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];

  const filtered = filter === "All" 
    ? templates 
    : templates.filter(t => t.category === filter);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl"
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Document Templates
                </Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-500">
                  Start with a professional template and customize it to your needs
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-lg p-2 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Category Filter */}
            <div className="border-b border-zinc-200 px-6 py-3">
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={clsx(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      filter === cat
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4">
                {filtered.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={clsx(
                      "group relative overflow-hidden rounded-lg border-2 text-left transition-all",
                      selectedTemplate === template.id
                        ? "border-purple-500 ring-2 ring-purple-100"
                        : "border-zinc-200 hover:border-zinc-300 hover:shadow-md"
                    )}
                  >
                    <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 p-6">
                      <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-white p-2 shadow-sm">
                          {template.icon}
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="rounded-full bg-purple-500 p-1">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 font-semibold text-zinc-900">{template.name}</h3>
                      <p className="mt-1 text-xs text-zinc-600">{template.description}</p>
                      <div className="mt-3 rounded bg-white/60 px-2 py-1 text-xs text-zinc-600">
                        {template.preview}
                      </div>
                    </div>
                    <div className="border-t border-zinc-200 bg-white px-4 py-2">
                      <span className="text-xs font-medium text-zinc-500">{template.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
              <div className="text-sm text-zinc-500">
                {selectedTemplate 
                  ? `${templates.find(t => t.id === selectedTemplate)?.name} selected`
                  : "Select a template to continue"}
              </div>
              <div className="flex gap-2">
                <Dialog.Close className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={() => {
                    const template = templates.find(t => t.id === selectedTemplate);
                    if (template) {
                      onApplyTemplate(template.content);
                      onOpenChange(false);
                    }
                  }}
                  disabled={!selectedTemplate}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
