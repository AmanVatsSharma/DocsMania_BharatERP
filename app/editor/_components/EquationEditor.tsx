"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { FunctionSquareSquare, X, Check } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * Equation Editor - Insert and edit math equations
 * Features:
 * - LaTeX syntax support
 * - Inline and block equations
 * - Preview equation
 */

export interface EquationEditorProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFormula?: string;
  inline?: boolean;
}

export default function EquationEditor(props: EquationEditorProps) {
  const { editor, open, onOpenChange, initialFormula = "", inline = false } = props;
  const [formula, setFormula] = React.useState(initialFormula);
  const [isInline, setIsInline] = React.useState(inline);

  React.useEffect(() => {
    if (open) {
      setFormula(initialFormula);
      setIsInline(inline);
    }
  }, [open, initialFormula, inline]);

  const handleInsert = () => {
    if (!editor || !formula.trim()) {
      toast.error("Please enter an equation");
      return;
    }

    try {
      editor.chain().focus().setEquation({ formula: formula.trim(), inline: isInline }).run();
      toast.success("Equation inserted");
      onOpenChange(false);
      setFormula("");
    } catch (error) {
      console.error("[Equation] Insert error", error);
      toast.error("Failed to insert equation");
    }
  };

  const examples = [
    { label: "Quadratic Formula", formula: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" },
    { label: "Pythagorean Theorem", formula: "a^2 + b^2 = c^2" },
    { label: "Euler's Identity", formula: "e^{i\\pi} + 1 = 0" },
    { label: "Summation", formula: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
    { label: "Integral", formula: "\\int_{a}^{b} f(x) dx" },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FunctionSquare className="h-5 w-5 text-zinc-600" />
              <Dialog.Title className="text-lg font-semibold text-zinc-900">Insert Equation</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded p-1 hover:bg-zinc-100">
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Equation Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Equation Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsInline(true)}
                  className={clsx(
                    "flex-1 rounded-lg border px-4 py-2 text-sm transition-all",
                    isInline
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  Inline
                </button>
                <button
                  onClick={() => setIsInline(false)}
                  className={clsx(
                    "flex-1 rounded-lg border px-4 py-2 text-sm transition-all",
                    !isInline
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  Block
                </button>
              </div>
            </div>

            {/* Formula Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                LaTeX Formula
              </label>
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Enter LaTeX formula, e.g., E = mc^2"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                rows={4}
              />
              <p className="mt-1 text-xs text-zinc-500">
                Use LaTeX syntax. Examples: <code>x^2</code>, <code>\frac{a}{b}</code>, <code>\sqrt{x}</code>
              </p>
            </div>

            {/* Preview */}
            {formula && (
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">Preview</label>
                <div className={clsx(
                  "rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm",
                  isInline ? "inline-block" : "block"
                )}>
                  {formula || "(No formula)"}
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Note: Actual rendering requires a LaTeX renderer (e.g., KaTeX, MathJax)
                </p>
              </div>
            )}

            {/* Examples */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">Examples</label>
              <div className="grid grid-cols-1 gap-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setFormula(example.formula)}
                    className="text-left rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="font-medium text-zinc-900">{example.label}</div>
                    <div className="font-mono text-xs text-zinc-600 mt-1">{example.formula}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4">
            <Dialog.Close asChild>
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              Insert Equation
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
