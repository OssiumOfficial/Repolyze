// components/testimonial/masonry.tsx
"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";

/**
 * Simple hook to get responsive column count
 */
function useColumns(): number {
  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1000) setColumns(3);
      else if (width >= 600) setColumns(2);
      else setColumns(1);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return columns;
}

/**
 * Simple hook to measure container width
 */
function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateWidth = () => {
      setWidth(element.offsetWidth);
    };

    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(element);

    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

interface MasonryItem {
  id: string;
}

interface MasonryProps<T extends MasonryItem> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  gap?: number;
}

function Masonry<T extends MasonryItem>({
  items,
  renderItem,
  gap = 16,
}: MasonryProps<T>) {
  const columns = useColumns();
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();

  // Distribute items into columns
  const columnItems = useMemo(() => {
    const cols: T[][] = Array.from({ length: columns }, () => []);

    items.forEach((item, index) => {
      // Simple round-robin distribution
      const colIndex = index % columns;
      cols[colIndex].push(item);
    });

    return cols;
  }, [items, columns]);

  // Calculate column width
  const columnWidth = useMemo(() => {
    if (!width) return 0;
    const totalGaps = (columns - 1) * gap;
    return (width - totalGaps) / columns;
  }, [width, columns, gap]);

  if (!width) {
    // Initial render - just need the ref attached
    return <div ref={containerRef} className="w-full" />;
  }

  return (
    <div ref={containerRef} className="w-full flex" style={{ gap }}>
      {columnItems.map((colItems, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col"
          style={{ width: columnWidth, gap }}
        >
          {colItems.map((item) => (
            <div key={item.id}>{renderItem(item)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Masonry;
