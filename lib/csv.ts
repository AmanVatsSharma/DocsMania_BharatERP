/**
 * Lightweight, robust CSV/TSV parsing and serialization.
 * - Handles quoted fields, embedded separators, and newlines within quotes.
 * - Auto-detects separator (comma or tab) for parsing when not provided.
 * - Always returns string[][]; empty input -> [].
 */

export interface ParseOptions {
  separator?: "," | "\t";
  trim?: boolean;
}

export function parseDelimited(input: string, opts: ParseOptions = {}): string[][] {
  const sep = opts.separator ?? (input.includes("\t") && !input.includes(",") ? "\t" : ",");
  const trim = opts.trim ?? false;
  const rows: string[][] = [];
  let i = 0;
  const N = input.length;
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  function pushField() {
    current.push(trim ? field.trim() : field);
    field = "";
  }

  function pushRow() {
    // Avoid pushing trailing empty row from final newline
    rows.push(current.slice());
    current.length = 0;
  }

  while (i < N) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = input[i + 1];
        if (next === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === sep) {
      pushField();
      i++;
      continue;
    }
    if (ch === "\n") {
      pushField();
      pushRow();
      i++;
      continue;
    }
    if (ch === "\r") {
      // Handle CRLF; skip CR, next loop consumes LF
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // Last field/row
  if (field.length > 0 || current.length > 0) {
    pushField();
    pushRow();
  }
  // Remove possible trailing empty row caused by end newline
  if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }
  return rows;
}

export function serializeDelimited(rows: string[][], separator: "," | "\t" = ","): string {
  const needsQuote = (s: string) => s.includes('"') || s.includes("\n") || s.includes("\r") || s.includes(separator);
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const val = cell ?? "";
          if (needsQuote(val)) {
            return '"' + val.replaceAll('"', '""') + '"';
          }
          return val;
        })
        .join(separator)
    )
    .join("\n");
}

export const parseCSV = (input: string) => parseDelimited(input, { separator: "," });
export const parseTSV = (input: string) => parseDelimited(input, { separator: "\t" });
export const serializeCSV = (rows: string[][]) => serializeDelimited(rows, ",");
export const serializeTSV = (rows: string[][]) => serializeDelimited(rows, "\t");


