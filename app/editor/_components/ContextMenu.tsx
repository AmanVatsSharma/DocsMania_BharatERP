"use client";

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";

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
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Content className="min-w-[220px] rounded-md border border-[var(--border)] bg-white p-1 shadow-md">
        <Item onSelect={props.onSetParagraph}>Paragraph</Item>
        <Sub label="Heading">
          {[1,2,3,4,5,6].map((l) => (
            <Item key={l} onSelect={() => props.onHeading(l as any)}>H{l}</Item>
          ))}
        </Sub>
        <Separator />
        <Item onSelect={props.onBulletList}>Bullet list</Item>
        <Item onSelect={props.onOrderedList}>Ordered list</Item>
        {props.onIndent && props.onOutdent ? (
          <Sub label="Indent">
            <Item onSelect={props.onIndent}>Increase indent</Item>
            <Item onSelect={props.onOutdent}>Decrease indent</Item>
          </Sub>
        ) : null}
        <Sub label="Align">
          {(["left","center","right","justify"] as const).map((a) => (
            <Item key={a} onSelect={() => props.onAlign(a)}>{a[0].toUpperCase() + a.slice(1)}</Item>
          ))}
        </Sub>
        <Separator />
        <Item onSelect={props.onBold}>Bold</Item>
        <Item onSelect={props.onItalic}>Italic</Item>
        <Item onSelect={props.onStrike}>Strike</Item>
        <Item onSelect={props.onUnderline}>Underline</Item>
        <Item onSelect={props.onLink}>Link…</Item>
        <Separator />
        <Sub label="Font size">
          {[12,14,16,18,20,24,28,32].map((px) => (
            <Item key={px} onSelect={() => props.onFontSize(px)}>{px}px</Item>
          ))}
        </Sub>
        <Sub label="Text color">
          {['#111827','#4B5563','#DC2626','#16A34A','#2563EB','#D97706','#7C3AED','#0EA5E9'].map((hex) => (
            <Item key={hex} onSelect={() => props.onTextColor(hex)}>
              <span className="mr-2 inline-block h-3 w-3 rounded" style={{ backgroundColor: hex }} />{hex}
            </Item>
          ))}
        </Sub>
        <Sub label="Highlight">
          {['#FEF3C7','#FFEDD5','#DCFCE7','#E0F2FE','#FCE7F3','#EDE9FE'].map((hex) => (
            <Item key={hex} onSelect={() => props.onHighlightColor(hex)}>
              <span className="mr-2 inline-block h-3 w-3 rounded" style={{ backgroundColor: hex }} />{hex}
            </Item>
          ))}
        </Sub>
        <Separator />
        <Item onSelect={props.onClearFormatting}>Clear formatting</Item>
        {props.onTableCommands ? (
          <>
            <Separator />
            <Sub label="Table">
              <Item onSelect={props.onTableCommands.addRowAbove}>+ Row above</Item>
              <Item onSelect={props.onTableCommands.addRowBelow}>+ Row below</Item>
              <Item onSelect={props.onTableCommands.addColLeft}>+ Col left</Item>
              <Item onSelect={props.onTableCommands.addColRight}>+ Col right</Item>
              <Item onSelect={props.onTableCommands.deleteRow}>- Delete row</Item>
              <Item onSelect={props.onTableCommands.deleteCol}>- Delete col</Item>
              <Item onSelect={props.onTableCommands.merge}>Merge cells</Item>
              <Item onSelect={props.onTableCommands.split}>Split cell</Item>
            </Sub>
          </>
        ) : null}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

function Item(props: { onSelect: () => void; children: React.ReactNode }) {
  return (
    <ContextMenu.Item onSelect={props.onSelect} className="cursor-pointer rounded px-2 py-1.5 text-sm text-zinc-800 outline-none data-[highlighted]:bg-zinc-100">
      {props.children}
    </ContextMenu.Item>
  );
}

function Sub(props: { label: string; children: React.ReactNode }) {
  return (
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger className="cursor-pointer rounded px-2 py-1.5 text-sm text-zinc-800 outline-none data-[highlighted]:bg-zinc-100">
        {props.label}
      </ContextMenu.SubTrigger>
      <ContextMenu.SubContent className="min-w-[160px] rounded-md border border-[var(--border)] bg-white p-1 shadow-md">
        {props.children}
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
  );
}

function Separator() {
  return <ContextMenu.Separator className="my-1 h-px bg-[var(--border)]" />;
}


