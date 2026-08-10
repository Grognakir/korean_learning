import type { ReactNode } from "react";

import { renderMarkedTerms } from "./renderMarkedTerms";

import styles from "./GrammarMarkdownBody.module.css";

type GrammarMarkdownBodyProps = {
  readonly markdown: string;
};

type ListType = "ordered" | "unordered";

function renderInline(text: string): ReactNode {
  return renderMarkedTerms(text);
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{2,}/u.test(line.trim());
}

function parseTable(lines: readonly string[], start: number): { node: ReactNode; next: number } {
  const rows: string[][] = [];
  let index = start;
  while (index < lines.length && lines[index]!.includes("|")) {
    const line = lines[index]!.trim();
    if (isTableSeparator(line)) {
      index += 1;
      continue;
    }
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter(
        (cell, cellIndex, all) =>
          !(cellIndex === 0 && cell === "") && !(cellIndex === all.length - 1 && cell === ""),
      );
    if (cells.length > 0) {
      rows.push(cells);
    }
    index += 1;
  }

  return {
    next: index,
    node: (
      <div className={styles.tableWrap} key={`table-${start}`}>
        <table className={styles.table}>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${start}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`cell-${start}-${rowIndex}-${cellIndex}`}>{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  };
}

/** Renders the subset of markdown used in CURRICULUM_GRAMMAR.md. */
export function GrammarMarkdownBody({ markdown }: GrammarMarkdownBodyProps) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;
  let listItems: string[] = [];
  let currentListType: ListType | null = null;

  const flushList = () => {
    if (listItems.length === 0 || currentListType === null) {
      listItems = [];
      currentListType = null;
      return;
    }
    const items = listItems;
    const listType = currentListType;
    listItems = [];
    currentListType = null;
    const ListTag = listType === "ordered" ? "ol" : "ul";
    const className = listType === "ordered" ? styles.orderedList : styles.list;
    nodes.push(
      <ListTag className={className} key={`list-${nodes.length}`}>
        {items.map((item, itemIndex) => (
          <li key={`li-${nodes.length}-${itemIndex}`}>{renderInline(item)}</li>
        ))}
      </ListTag>,
    );
  };

  const pushListItem = (type: ListType, item: string) => {
    if (currentListType !== null && currentListType !== type) {
      flushList();
    }
    currentListType = type;
    listItems.push(item);
  };

  while (index < lines.length) {
    const line = lines[index]!;
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      index += 1;
      continue;
    }

    if (trimmed === "---") {
      flushList();
      nodes.push(<hr className={styles.rule} key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.includes("|")) {
      flushList();
      const table = parseTable(lines, index);
      nodes.push(table.node);
      index = table.next;
      continue;
    }

    if (/^#{2,4}\s+/u.test(trimmed)) {
      flushList();
      const text = trimmed.replace(/^#{2,4}\s+/u, "");
      nodes.push(
        <h3 className={styles.heading} key={`h-${index}`}>
          {renderInline(text)}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/u.test(trimmed)) {
      pushListItem("unordered", trimmed.replace(/^[-*]\s+/u, ""));
      index += 1;
      continue;
    }

    if (/^\d+\.\s+/u.test(trimmed)) {
      pushListItem("ordered", trimmed.replace(/^\d+\.\s+/u, ""));
      index += 1;
      continue;
    }

    flushList();
    nodes.push(
      <p className={styles.paragraph} key={`p-${index}`}>
        {renderInline(trimmed)}
      </p>,
    );
    index += 1;
  }

  flushList();

  return <div className={styles.root}>{nodes}</div>;
}
