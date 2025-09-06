import { uuid } from "@sanity/uuid";

export function parseColumnsBlock(node: HTMLElement, next: any, block: any) {
  if (node.nodeName.toLowerCase() !== "div" || !node.classList.contains("wp-block-columns")) {
    return undefined;
  }

  const columns = Array.from(node.children)
    .filter((child) => child.classList.contains("wp-block-column"))
    .map((columnEl) => ({
      _type: "column",
      _key: uuid(),
      content: next(columnEl.childNodes),
    }));

  return block({
    _type: "columns",
    _key: uuid(),
    columns,
  });
}
