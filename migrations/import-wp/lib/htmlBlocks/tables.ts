import { uuid } from "@sanity/uuid";

export function parseTableBlock(node, next, block) {
  if (node.nodeName.toLowerCase() === "figure" && node.classList.contains("wp-block-table")) {

    const tableEl = node.querySelector("table");
    if (!tableEl) return undefined;

    const headerRowEl = tableEl.querySelector("thead tr");
    const bodyRowsEls = tableEl.querySelectorAll("tbody tr");
    const footerRowEl = tableEl.querySelector("tfoot tr");

    // Extract header row
    const headerRow = headerRowEl
      ? Array.from(headerRowEl.children).map((th) => th.textContent.trim())
      : [];

    // Extract table rows
    const rows = Array.from(bodyRowsEls).map((rowEl) => ({
      _key: uuid(),
      cells: Array.from(rowEl.children).map((td) => td.textContent.trim()),
    }));

    // Extract footer row
    const footerRow = footerRowEl
      ? Array.from(footerRowEl.children).map((td) => td.textContent.trim())
      : [];

    return block({
      _type: "tableType",
      _key: uuid(),
      title: "Imported Table",
      headerRow,
      rows,
      footerRow,
    });
  }

  return undefined;
}
