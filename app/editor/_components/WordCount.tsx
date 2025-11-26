"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { FileText } from "lucide-react";
import { clsx } from "clsx";
import * as Popover from "@radix-ui/react-popover";

/**
 * Word Count - Display character and word count
 * Features:
 * - Real-time word count
 * - Character count (with/without spaces)
 * - Paragraph count
 * - Shows in popover on hover/click
 */

export interface WordCountProps {
  editor: Editor | null;
  showAlways?: boolean;
}

export default function WordCount(props: WordCountProps) {
  const { editor, showAlways = false } = props;
  const [stats, setStats] = React.useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
  });

  // Calculate statistics
  const calculateStats = React.useCallback(() => {
    if (!editor) {
      setStats({ words: 0, characters: 0, charactersNoSpaces: 0, paragraphs: 0 });
      return;
    }

    const text = editor.getText();
    const html = editor.getHTML();

    // Word count (split by whitespace, filter empty)
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

    // Character count
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;

    // Paragraph count
    const paragraphs = html.match(/<p[^>]*>/g)?.length || 0;

    setStats({ words, characters, charactersNoSpaces, paragraphs });
  }, [editor]);

  // Update stats on editor changes
  React.useEffect(() => {
    if (!editor) return;

    calculateStats();
    editor.on("update", calculateStats);
    editor.on("selectionUpdate", calculateStats);

    return () => {
      editor.off("update", calculateStats);
      editor.off("selectionUpdate", calculateStats);
    };
  }, [editor, calculateStats]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={clsx(
            "flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors",
            showAlways && "bg-zinc-50"
          )}
          title="Word count"
        >
          <span className="font-normal">{formatNumber(stats.words)} words</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
          sideOffset={5}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Words</span>
              <span className="text-sm font-semibold text-zinc-900">
                {formatNumber(stats.words)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Characters</span>
              <span className="text-sm font-semibold text-zinc-900">
                {formatNumber(stats.characters)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Characters (no spaces)</span>
              <span className="text-sm font-semibold text-zinc-900">
                {formatNumber(stats.charactersNoSpaces)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
              <span className="text-sm text-zinc-600">Paragraphs</span>
              <span className="text-sm font-semibold text-zinc-900">
                {formatNumber(stats.paragraphs)}
              </span>
            </div>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
