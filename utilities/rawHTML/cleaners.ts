function sanitizeNestedBlocks(columnContent) {
    return columnContent.map((block) => {
      if (block._type === "block" && Array.isArray(block.children)) {
        const flattenedChildren = block.children.flatMap((child) => {
          // If child is a __block wrapper, unwrap it
          if (child._type === "__block" && child.block?._type === "block") {
            return child.block.children || []; // return the unwrapped span(s)
          }
          return child; // return normal span
        });
  
        return {
          ...block,
          children: flattenedChildren,
        };
      }
  
      return block;
    });
  }
  
  function removeEmptyTextBlocks(blocks) {
    return blocks
      .map((block) => {
        // ✅ Trim span text directly
        if (block._type === "span" && typeof block.text === "string") {
          return {
            ...block,
            text: block.text.trim(),
          };
        }
  
        // ✅ Trim each span inside a block
        if (block._type === "block" && Array.isArray(block.children)) {
          const trimmedChildren = block.children.map((child) => {
            if (child._type === "span" && typeof child.text === "string") {
              return {
                ...child,
                text: child.text.trim(),
              };
            }
            return child;
          });
  
          return {
            ...block,
            children: trimmedChildren,
          };
        }
  
        return block;
      })
      .filter((block) => {
        // ✅ Remove empty spans
        if (block._type === "span") {
          return block.text && block.text.trim().length > 0;
        }
  
        // ✅ Remove blocks with no visible text
        if (block._type === "block" && Array.isArray(block.children)) {
          const combinedText = block.children
            .map((child) => child?.text || "")
            .join("")
            .trim();
  
          return combinedText.length > 0;
        }
  
        // ✅ Keep everything else
        return true;
      });
  }

  export function cleanColumns(columns) {
    return columns.map((col) => {
      if (!Array.isArray(col.content)) return col;
  
      // Sanitize and clean each block in the column
      const sanitized = sanitizeNestedBlocks(col.content);
      const cleaned = removeEmptyTextBlocks(sanitized);
  
      return {
        ...col,
        content: cleaned,
      };
    });
  }
  