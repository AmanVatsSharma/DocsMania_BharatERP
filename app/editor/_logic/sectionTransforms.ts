import { Editor } from "@tiptap/react";

export function findSelectedSection(editor: any): { pos: number; node: any } | null {
  const { state } = editor;
  const $from = state.selection.$from;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "section") {
      const pos = $from.before(depth);
      return { pos, node };
    }
  }
  return null;
}

export function moveSection(editor: Editor, fromPos: number, dir: -1 | 1) {
  const { tr, doc } = editor.state;
  const node = doc.nodeAt(fromPos);
  if (!node || node.type.name !== "section") return;
  const size = node.nodeSize;
  let targetPos = fromPos;

  // Find neighbor section
  doc.descendants((n, pos) => {
    if (n.type.name === "section") {
      if (dir === -1 && pos < fromPos) targetPos = pos;
      if (dir === 1 && pos > fromPos && targetPos === fromPos) targetPos = pos;
    }
    return true;
  });

  if (targetPos === fromPos) return; // no move

  const slice = tr.doc.slice(fromPos, fromPos + size);
  tr.delete(fromPos, fromPos + size);
  const insertPos = dir === -1 ? targetPos : targetPos + (doc.nodeAt(targetPos)?.nodeSize ?? 0);
  tr.insert(insertPos, slice.content);
  editor.view.dispatch(tr);
}

export function deleteSectionAt(editor: Editor, pos: number) {
  const { tr, doc } = editor.state;
  const node = doc.nodeAt(pos);
  if (!node || node.type.name !== "section") return;
  editor.view.dispatch(tr.delete(pos, pos + node.nodeSize));
}
