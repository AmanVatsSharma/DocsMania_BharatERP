/**
 * Seed default beautiful templates for DocsMania
 * Run with: npx tsx scripts/seed-templates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: "Product Launch Page",
    description: "Beautiful landing page for product launches with hero, features, and CTA sections",
    category: "Landing Page",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "Introducing Our Latest Innovation",
              subtitle: "The future of productivity is here. Transform how you work with cutting-edge technology.",
              ctaText: "Get Started Free",
              ctaLink: "#signup",
              alignment: "center",
              style: {
                backgroundColor: "#0f172a",
                color: "#ffffff",
                borderRadius: 16,
                shadow: "lg"
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "columns",
            props: {
              columns: 3,
              gap: 32,
              equalHeight: true,
              columnWidths: "1fr,1fr,1fr",
              style: {
                backgroundColor: "#f8fafc",
                padding: 48,
                borderRadius: 0
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "feature",
            props: {
              title: "Why Choose Us?",
              description: "Built for modern teams who demand excellence",
              points: "⚡ Lightning Fast Performance,🔒 Enterprise-Grade Security,📈 Scales With Your Business,🎨 Beautiful & Intuitive Design",
              icon: "✓"
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "stats",
            props: {
              stats: "1M+|Active Users|Growing every day;99.9%|Uptime|Enterprise SLA;24/7|Support|Always here to help;150+|Countries|Global reach"
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "callout",
            props: {
              text: "🚀 Limited time offer: Get 50% off your first year!",
              type: "success",
              icon: "🚀",
              style: {
                backgroundColor: "#dcfce7",
                color: "#166534",
                borderColor: "#22c55e"
              }
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    name: "Documentation Template",
    description: "Clean documentation page with table of contents and code examples",
    category: "Documentation",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "Documentation",
              subtitle: "Everything you need to know to get started",
              ctaText: "",
              ctaLink: "",
              alignment: "left",
              style: {
                backgroundColor: "#ffffff",
                color: "#0f172a",
                borderRadius: 0,
                shadow: "none"
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "columns",
            props: {
              columns: 2,
              gap: 40,
              equalHeight: false,
              columnWidths: "250px,1fr",
              verticalAlign: "start",
              style: {
                backgroundColor: "transparent",
                padding: 0,
                borderRadius: 0
              }
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
          content: [{ type: "text", text: "Welcome to our platform. This guide will help you get up and running quickly." }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "code",
            props: {
              code: "npm install docsmania\nimport { DocsMania } from 'docsmania'\n\nconst app = new DocsMania({\n  apiKey: 'your-api-key'\n})",
              language: "javascript",
              showLineNumbers: true
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "callout",
            props: {
              text: "💡 Pro tip: Check out our interactive tutorials for hands-on learning",
              type: "info",
              icon: "💡",
              style: {
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                borderColor: "#3b82f6"
              }
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    name: "Pricing Page",
    description: "Professional pricing page with comparison table",
    category: "Marketing",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "Simple, Transparent Pricing",
              subtitle: "Choose the perfect plan for your needs. No hidden fees.",
              ctaText: "",
              ctaLink: "",
              alignment: "center",
              style: {
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                borderRadius: 0,
                shadow: "none"
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "columns",
            props: {
              columns: 3,
              gap: 24,
              equalHeight: true,
              columnWidths: "1fr,1fr,1fr",
              style: {
                backgroundColor: "transparent",
                padding: 32,
                borderRadius: 0
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "pricing",
            props: {
              name: "Starter",
              price: "$9/mo",
              features: "10 documents,1 GB storage,Email support,Basic analytics",
              highlighted: false
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "pricing",
            props: {
              name: "Pro",
              price: "$29/mo",
              features: "Unlimited documents,50 GB storage,Priority support,Advanced analytics,Custom domain,Team collaboration",
              highlighted: true
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "pricing",
            props: {
              name: "Enterprise",
              price: "Custom",
              features: "Everything in Pro,Unlimited storage,Dedicated support,SSO & Advanced security,Custom integrations,SLA guarantee",
              highlighted: false
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "callout",
            props: {
              text: "🎉 All plans include a 14-day free trial with no credit card required",
              type: "success",
              icon: "🎉",
              style: {
                backgroundColor: "#dcfce7",
                color: "#166534",
                borderColor: "#22c55e"
              }
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    name: "Team Page",
    description: "Showcase your team with profiles and testimonials",
    category: "About",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "Meet Our Team",
              subtitle: "Passionate people building amazing products",
              ctaText: "Join Us",
              ctaLink: "/careers",
              alignment: "center",
              style: {
                backgroundColor: "#fef3c7",
                color: "#78350f",
                borderRadius: 16,
                shadow: "md"
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "columns",
            props: {
              columns: 3,
              gap: 32,
              equalHeight: true,
              columnWidths: "1fr,1fr,1fr",
              style: {
                backgroundColor: "transparent",
                padding: 48,
                borderRadius: 0
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "card",
            props: {
              image: "/placeholder.svg",
              title: "Sarah Johnson",
              description: "CEO & Founder - Leading with vision and passion",
              link: "#"
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "card",
            props: {
              image: "/placeholder.svg",
              title: "Michael Chen",
              description: "CTO - Building scalable solutions",
              link: "#"
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "card",
            props: {
              image: "/placeholder.svg",
              title: "Emily Rodriguez",
              description: "Head of Design - Crafting beautiful experiences",
              link: "#"
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "quote",
            props: {
              text: "We're building more than a product - we're creating a movement. Join us on this incredible journey.",
              author: "Sarah Johnson",
              role: "CEO & Founder",
              avatar: ""
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    name: "Blog Post Template",
    description: "Clean blog post layout with hero image and structured content",
    category: "Blog",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "The Future of Work is Here",
              subtitle: "How modern teams are transforming productivity with new tools",
              ctaText: "",
              ctaLink: "",
              alignment: "left",
              style: {
                backgroundColor: "#ffffff",
                color: "#0f172a",
                borderRadius: 0,
                shadow: "none"
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Published on ", marks: [{ type: "italic" }] },
            { type: "text", text: "January 15, 2024", marks: [{ type: "bold" }] },
            { type: "text", text: " by ", marks: [{ type: "italic" }] },
            { type: "text", text: "Editorial Team" }
          ]
        },
        {
          type: "section",
          attrs: {
            componentKey: "image",
            props: {
              src: "/placeholder.svg",
              alt: "Hero image",
              caption: "The modern workplace is evolving",
              width: "full",
              rounded: true
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Introduction" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "In today's rapidly changing business landscape, teams need powerful tools to stay competitive. This article explores the latest trends and technologies reshaping how we work." }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "callout",
            props: {
              text: "💡 Key takeaway: Adaptation is the key to thriving in the modern workplace",
              type: "info",
              icon: "💡",
              style: {
                backgroundColor: "#e0f2fe",
                color: "#0c4a6e",
                borderColor: "#0ea5e9"
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "The Three Pillars of Modern Work" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "feature",
            props: {
              title: "Essential Components",
              description: "What every successful team needs",
              points: "🚀 Speed & Efficiency,🤝 Collaboration Tools,📊 Data-Driven Insights,🔐 Security & Compliance",
              icon: "✓"
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  },
  {
    name: "FAQ Page",
    description: "Comprehensive FAQ with accordion sections",
    category: "Support",
    content: {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: {
            componentKey: "hero",
            props: {
              title: "Frequently Asked Questions",
              subtitle: "Find answers to common questions about our platform",
              ctaText: "Contact Support",
              ctaLink: "/support",
              alignment: "center",
              style: {
                backgroundColor: "#f0f9ff",
                color: "#0c4a6e",
                borderRadius: 12,
                shadow: "sm"
              }
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "accordion",
            props: {
              items: "What is DocsMania?|DocsMania is a powerful document creation and hosting platform that helps teams create beautiful, interactive documents;How do I get started?|Simply sign up for a free account, create your first document, and start building. It's that easy!;Is there a free plan?|Yes! We offer a generous free tier with 10 documents and 1GB storage;Can I upgrade or downgrade anytime?|Absolutely. You can change your plan at any time from your account settings;Do you offer refunds?|Yes, we offer a 30-day money-back guarantee on all paid plans",
              defaultOpen: true,
              multipleOpen: false
            }
          },
          content: [{ type: "paragraph" }]
        },
        {
          type: "section",
          attrs: {
            componentKey: "callout",
            props: {
              text: "📧 Still have questions? Our support team is here to help 24/7",
              type: "info",
              icon: "📧",
              style: {
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                borderColor: "#3b82f6"
              }
            }
          },
          content: [{ type: "paragraph" }]
        }
      ]
    }
  }
];

async function main() {
  console.log('🌱 Seeding templates...');

  // First, find or create a default project
  let project = await prisma.project.findFirst({
    where: { name: "Default Project" }
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Default Project",
        key: "default",
        description: "Default project for templates"
      }
    });
    console.log('✓ Created default project');
  }

  // Create templates
  for (const template of templates) {
    try {
      const existing = await prisma.template.findFirst({
        where: {
          name: template.name,
          projectId: project.id
        }
      });

      if (existing) {
        await prisma.template.update({
          where: { id: existing.id },
          data: {
            description: template.description,
            category: template.category,
            content: template.content as any,
            updatedAt: new Date()
          }
        });
        console.log(`↻ Updated template: ${template.name}`);
      } else {
        await prisma.template.create({
          data: {
            name: template.name,
            description: template.description,
            category: template.category,
            content: template.content as any,
            projectId: project.id
          }
        });
        console.log(`✓ Created template: ${template.name}`);
      }
    } catch (error) {
      console.error(`✗ Failed to seed template ${template.name}:`, error);
    }
  }

  console.log('✨ Template seeding completed!');
}

main()
  .catch((error) => {
    console.error('Error seeding templates:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });