"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Type,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Table,
  Eraser
} from "lucide-react";

export interface EditorContextMenuProps {
  onSetParagraph: () => void;
  onHeading: (level: 1|2|3|4|5|6) => void;
  onBulletList: () => void;
  onOrderedList: () => void;
  onIndent?: () => void;
  onOutdent?: () => void;
  onBold: () => void;
  onItalic: () => void;
  onStrike: () => void;
  onUnderline: () => void;
  onLink: () => void;
  onFontSize: (px: number) => void;
  onAlign: (align: "left"|"center"|"right"|"justify") => void;
  onTextColor: (hex: string) => void;
  onHighlightColor: (hex: string) => void;
  onClearFormatting: () => void;
  onTableCommands?: {
    addRowAbove: () => void;
    addRowBelow: () => void;
    addColLeft: () => void;
    addColRight: () => void;
    deleteRow: () => void;
    deleteCol: () => void;
    merge: () => void;
    split: () => void;
  };
  children: React.ReactNode;
}

export default function EditorContextMenu(props: EditorContextMenuProps) {
  const { children } = props;

  const textColors = [
    { name: "Black", hex: "#111827" },
    { name: "Gray", hex: "#6B7280" },
    { name: "Red", hex: "#DC2626" },
    { name: "Green", hex: "#16A34A" },
    { name: "Blue", hex: "#2563EB" },
    { name: "Orange", hex: "#EA580C" },
    { name: "Purple", hex: "#7C3AED" },
    { name: "Pink", hex: "#DB2777" },
  ];

  const highlightColors = [
    { name: "Yellow", hex: "#FEF3C7" },
    { name: "Orange", hex: "#FFEDD5" },
    { name: "Green", hex: "#DCFCE7" },
    { name: "Blue", hex: "#DBEAFE" },
    { name: "Pink", hex: "#FCE7F3" },
    { name: "Purple", hex: "#EDE9FE" },
  ];

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Structure */}
        <ContextMenuItem onClick={props.onSetParagraph}>
          <Type className="mr-2 h-4 w-4" />
          Paragraph
          <ContextMenuShortcut>⌘⌥0</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Heading1 className="mr-2 h-4 w-4" />
            Heading
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <ContextMenuItem key={level} onClick={() => props.onHeading(level as any)}>
                <span className="mr-2">{level === 1 ? <Heading1 className="h-4 w-4" /> : level === 2 ? <Heading2 className="h-4 w-4" /> : <Heading3 className="h-4 w-4" />}</span>
                Heading {level}
                <ContextMenuShortcut>⌘⌥{level}</ContextMenuShortcut>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Lists */}
        <ContextMenuItem onClick={props.onBulletList}>
          <List className="mr-2 h-4 w-4" />
          Bullet List
          <ContextMenuShortcut>⌘⇧8</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={props.onOrderedList}>
          <ListOrdered className="mr-2 h-4 w-4" />
          Numbered List
          <ContextMenuShortcut>⌘⇧7</ContextMenuShortcut>
        </ContextMenuItem>

        {props.onIndent && props.onOutdent && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="mr-2">⇥</span>
              Indent
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={props.onIndent}>
                Increase Indent
                <ContextMenuShortcut>Tab</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={props.onOutdent}>
                Decrease Indent
                <ContextMenuShortcut>⇧Tab</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSeparator />

        {/* Text Formatting */}
        <ContextMenuItem onClick={props.onBold}>
          <Bold className="mr-2 h-4 w-4" />
          Bold
          <ContextMenuShortcut>⌘B</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={props.onItalic}>
          <Italic className="mr-2 h-4 w-4" />
          Italic
          <ContextMenuShortcut>⌘I</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={props.onUnderline}>
          <Underline className="mr-2 h-4 w-4" />
          Underline
          <ContextMenuShortcut>⌘U</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={props.onStrike}>
          <Strikethrough className="mr-2 h-4 w-4" />
          Strikethrough
          <ContextMenuShortcut>⌘⇧S</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={props.onLink}>
          <Link2 className="mr-2 h-4 w-4" />
          Add Link
          <ContextMenuShortcut>⌘K</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Alignment */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <AlignLeft className="mr-2 h-4 w-4" />
            Align
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={() => props.onAlign("left")}>
              <AlignLeft className="mr-2 h-4 w-4" />
              Left
              <ContextMenuShortcut>⌘⇧L</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => props.onAlign("center")}>
              <AlignCenter className="mr-2 h-4 w-4" />
              Center
              <ContextMenuShortcut>⌘⇧E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => props.onAlign("right")}>
              <AlignRight className="mr-2 h-4 w-4" />
              Right
              <ContextMenuShortcut>⌘⇧R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => props.onAlign("justify")}>
              <AlignJustify className="mr-2 h-4 w-4" />
              Justify
              <ContextMenuShortcut>⌘⇧J</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Font Size */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Type className="mr-2 h-4 w-4" />
            Font Size
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <div className="grid grid-cols-2 gap-1 p-1">
              {fontSizes.map((size) => (
                <ContextMenuItem 
                  key={size} 
                  onClick={() => props.onFontSize(size)}
                  className="justify-center"
                >
                  {size}px
                </ContextMenuItem>
              ))}
            </div>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Text Color */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Text Color
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            <div className="grid grid-cols-2 gap-1 p-2">
              {textColors.map((color) => (
                <ContextMenuItem 
                  key={color.hex} 
                  onClick={() => props.onTextColor(color.hex)}
                  className="cursor-pointer"
                >
                  <span 
                    className="mr-2 h-4 w-4 rounded border border-zinc-200" 
                    style={{ backgroundColor: color.hex }} 
                  />
                  {color.name}
                </ContextMenuItem>
              ))}
            </div>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Highlight Color */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Highlighter className="mr-2 h-4 w-4" />
            Highlight
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            <div className="grid grid-cols-2 gap-1 p-2">
              {highlightColors.map((color) => (
                <ContextMenuItem 
                  key={color.hex} 
                  onClick={() => props.onHighlightColor(color.hex)}
                  className="cursor-pointer"
                >
                  <span 
                    className="mr-2 h-4 w-4 rounded border border-zinc-200" 
                    style={{ backgroundColor: color.hex }} 
                  />
                  {color.name}
                </ContextMenuItem>
              ))}
            </div>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Clear Formatting */}
        <ContextMenuItem onClick={props.onClearFormatting}>
          <Eraser className="mr-2 h-4 w-4" />
          Clear Formatting
          <ContextMenuShortcut>⌘\</ContextMenuShortcut>
        </ContextMenuItem>

        {/* Table Commands */}
        {props.onTableCommands && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Table className="mr-2 h-4 w-4" />
                Table
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem onClick={props.onTableCommands.addRowAbove}>
                  Add Row Above
                </ContextMenuItem>
                <ContextMenuItem onClick={props.onTableCommands.addRowBelow}>
                  Add Row Below
                </ContextMenuItem>
                <ContextMenuItem onClick={props.onTableCommands.addColLeft}>
                  Add Column Left
                </ContextMenuItem>
                <ContextMenuItem onClick={props.onTableCommands.addColRight}>
                  Add Column Right
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={props.onTableCommands.deleteRow} className="text-red-600">
                  Delete Row
                </ContextMenuItem>
                <ContextMenuItem onClick={props.onTableCommands.deleteCol} className="text-red-600">
                  Delete Column
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={props.onTableCommands.merge}>
                  Merge Cells
                </ContextMenuItem>
                <ContextMenuItem onClick={props.onTableCommands.split}>
                  Split Cell
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
