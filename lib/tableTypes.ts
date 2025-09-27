export type TableAlign = "left" | "center" | "right";
export type TableBorderStyle = "none" | "grid" | "row" | "col";

export interface TableAttrs {
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  zebra?: boolean;
  compact?: boolean;
  overflowX?: boolean;
  caption?: string | null;
  align?: TableAlign;
  width?: string | null; // e.g., "100%" | "800px"
  borderStyle?: TableBorderStyle;
}

export type CellAlign = "left" | "center" | "right";
export type CellVerticalAlign = "top" | "middle" | "bottom";

export interface TableCellAttrs {
  backgroundColor?: string | null;
  textAlign?: CellAlign | null;
  verticalAlign?: CellVerticalAlign | null;
  padding?: string | null; // e.g., "8px"
  borderColor?: string | null;
  borderWidth?: string | null; // e.g., "1px"
}


