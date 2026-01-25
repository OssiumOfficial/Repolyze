import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number,
): number => {
  const get = () => {
    // SSR guard
    if (typeof window === "undefined") return defaultValue;

    const index = queries.findIndex((q) => window.matchMedia(q).matches);

    return values[index] ?? defaultValue;
  };

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => setValue(get());

    const mediaQueryLists = queries.map((q) => window.matchMedia(q));

    mediaQueryLists.forEach((mql) => mql.addEventListener("change", handler));

    return () =>
      mediaQueryLists.forEach((mql) =>
        mql.removeEventListener("change", handler),
      );
  }, [queries]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

interface MasonryItem {
  id: string;
}

interface GridItem<T> extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
  data: T;
}

interface MasonryProps<T extends MasonryItem> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getItemHeight?: (item: T, columnWidth: number) => number;
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  blurToFocus?: boolean;
  gap?: number;
}

function Masonry<T extends MasonryItem>({
  items,
  renderItem,
  getItemHeight,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  blurToFocus = true,
  gap = 16,
}: MasonryProps<T>) {
  const columns = useMedia(
    ["(min-width:1000px)", "(min-width:600px)", "(min-width:400px)"],
    [3, 2, 2],
    1,
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [itemHeights, setItemHeights] = useState<Map<string, number>>(
    new Map(),
  );
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Measure item heights after render
  useLayoutEffect(() => {
    const newHeights = new Map<string, number>();
    itemRefs.current.forEach((el, id) => {
      if (el) {
        newHeights.set(id, el.offsetHeight);
      }
    });
    setItemHeights(newHeights);
  }, [items, width, columns]);

  const getInitialPosition = (item: GridItem<T>) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === "random") {
      const dirs = ["top", "bottom", "left", "right"];
      direction = dirs[
        Math.floor(Math.random() * dirs.length)
      ] as typeof animateFrom;
    }

    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  const grid = useMemo<GridItem<T>[]>(() => {
    if (!width || itemHeights.size === 0) return [];

    const colHeights = new Array(columns).fill(0);
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    return items.map((item) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const height = getItemHeight
        ? getItemHeight(item, columnWidth)
        : itemHeights.get(item.id) || 150;
      const y = colHeights[col];

      colHeights[col] += height + gap;
      return { ...item, x, y, w: columnWidth, h: height, data: item };
    });
  }, [columns, items, width, gap, itemHeights, getItemHeight]);

  const containerHeight = useMemo(() => {
    if (grid.length === 0) return 0;
    return Math.max(...grid.map((item) => item.y + item.h));
  }, [grid]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (grid.length === 0) return;

    grid.forEach((item, index) => {
      const selector = `[data-masonry-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            ...(blurToFocus && { filter: "blur(10px)" }),
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration: 0.8,
            ease: "power3.out",
            delay: index * stagger,
          },
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
  }, [grid, stagger, animateFrom, blurToFocus, duration, ease]);

  // Hidden measurement container
  const measurementItems = useMemo(() => {
    if (!width) return null;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    return (
      <div
        className="absolute opacity-0 pointer-events-none"
        style={{ width: columnWidth }}
        aria-hidden="true"
      >
        {items.map((item) => (
          <div
            key={`measure-${item.id}`}
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }, [items, width, columns, gap, renderItem]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: containerHeight }}
    >
      {measurementItems}
      {grid.map((item) => (
        <div
          key={item.id}
          data-masonry-key={item.id}
          className="absolute"
          style={{
            willChange: "transform, width, opacity",
            width: item.w,
          }}
        >
          {renderItem(item.data)}
        </div>
      ))}
    </div>
  );
}

export default Masonry;
