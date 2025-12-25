"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CursorType = "default" | "pointer" | "text";

export const FigmaCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const hasHover = window.matchMedia("(hover: hover)").matches;
      const hasPointer = window.matchMedia("(pointer: fine)").matches;
      const isLargeScreen = window.matchMedia("(min-width: 768px)").matches;

      setIsEnabled(hasHover && hasPointer && isLargeScreen);
    };

    checkDevice();

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleResize = () => checkDevice();

    mediaQuery.addEventListener("change", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      document.body.style.cursor = "auto";
      const existingStyle = document.getElementById("figma-cursor-style");
      if (existingStyle) {
        existingStyle.remove();
      }
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const computedStyle = window.getComputedStyle(target);

      // Check for text cursor elements
      const isTextInput =
        (target.tagName === "INPUT" &&
          ["text", "email", "password", "search", "tel", "url", "number"].includes(
            (target as HTMLInputElement).type
          )) ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("contenteditable") === "true" ||
        target.closest('[contenteditable="true"]') !== null;

      // Check if hovering over selectable text
      const isTextElement =
        target.tagName === "P" ||
        target.tagName === "SPAN" ||
        target.tagName === "H1" ||
        target.tagName === "H2" ||
        target.tagName === "H3" ||
        target.tagName === "H4" ||
        target.tagName === "H5" ||
        target.tagName === "H6" ||
        target.tagName === "LI" ||
        target.tagName === "TD" ||
        target.tagName === "TH" ||
        target.tagName === "LABEL" ||
        target.tagName === "BLOCKQUOTE" ||
        target.tagName === "PRE" ||
        target.tagName === "CODE" ||
        target.tagName === "EM" ||
        target.tagName === "STRONG" ||
        target.tagName === "B" ||
        target.tagName === "I" ||
        target.tagName === "U" ||
        target.tagName === "SMALL" ||
        target.tagName === "MARK" ||
        target.tagName === "DEL" ||
        target.tagName === "INS" ||
        target.tagName === "SUB" ||
        target.tagName === "SUP";

      // Check if text is selectable (not set to none)
      const isSelectable =
        computedStyle.userSelect !== "none" &&
        computedStyle.webkitUserSelect !== "none";

      // Check for cursor-text class or computed cursor style
      const hasCursorTextClass =
        target.classList.contains("cursor-text") ||
        target.closest(".cursor-text") !== null;

      const hasTextCursorStyle = computedStyle.cursor === "text";

      // Determine if we should show text cursor
      const shouldShowTextCursor =
        isTextInput ||
        hasCursorTextClass ||
        hasTextCursorStyle ||
        (isTextElement && isSelectable && !isInsideClickable(target));

      // Check for pointer cursor elements
      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer") !== null ||
        target.getAttribute("role") === "button" ||
        target.closest('[role="button"]') !== null ||
        target.tagName === "SELECT" ||
        (target.tagName === "INPUT" &&
          ["checkbox", "radio", "submit", "button", "reset", "file"].includes(
            (target as HTMLInputElement).type
          )) ||
        computedStyle.cursor === "pointer";

      if (shouldShowTextCursor) {
        setCursorType("text");
      } else if (isClickable) {
        setCursorType("pointer");
      } else {
        setCursorType("default");
      }
    };

    // Helper function to check if element is inside a clickable element
    function isInsideClickable(element: HTMLElement): boolean {
      return !!(
        element.closest("a") ||
        element.closest("button") ||
        element.closest('[role="button"]') ||
        element.closest(".cursor-pointer")
      );
    }

    const onMouseDown = () => {
      setClicked(true);
    };

    const onMouseUp = () => {
      setClicked(false);
    };

    const onMouseLeave = () => {
      setHidden(true);
    };

    const onMouseEnter = () => {
      setHidden(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.body.addEventListener("mouseenter", onMouseEnter);
    document.body.addEventListener("mouseleave", onMouseLeave);

    document.body.style.cursor = "none";

    const style = document.createElement("style");
    style.innerHTML = `
      * { cursor: none !important; }
    `;
    style.id = "figma-cursor-style";
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.removeEventListener("mouseenter", onMouseEnter);
      document.body.removeEventListener("mouseleave", onMouseLeave);
      document.body.style.cursor = "auto";
      const existingStyle = document.getElementById("figma-cursor-style");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  const renderCursor = () => {
    switch (cursorType) {
      case "text":
        return (
          <div
            key="text"
            className="relative -ml-[3px] -mt-[10px]"
            style={{ transform: `scale(${clicked ? 0.9 : 1})` }}
          >
            {/* I-beam / Text Cursor - Black with White Outline */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* White outline/background */}
              <path
                d="M9 4H10C10.5 4 11 4.2 11.4 4.6C11.8 5 12 5.5 12 6V18C12 18.5 11.8 19 11.4 19.4C11 19.8 10.5 20 10 20H9"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 4H14C13.5 4 13 4.2 12.6 4.6C12.2 5 12 5.5 12 6V18C12 18.5 12.2 19 12.6 19.4C13 19.8 13.5 20 14 20H15"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="6"
                x2="12"
                y2="18"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Black foreground */}
              <path
                d="M9 4H10C10.5 4 11 4.2 11.4 4.6C11.8 5 12 5.5 12 6V18C12 18.5 11.8 19 11.4 19.4C11 19.8 10.5 20 10 20H9"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 4H14C13.5 4 13 4.2 12.6 4.6C12.2 5 12 5.5 12 6V18C12 18.5 12.2 19 12.6 19.4C13 19.8 13.5 20 14 20H15"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="6"
                x2="12"
                y2="18"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );

      case "pointer":
        return (
          <div
            key="hand"
            className="relative -ml-3.5 -mt-2"
            style={{
              transform: `scale(${clicked ? 0.8 : 1}) rotate(${clicked ? -10 : 0}deg)`,
            }}
          >
            {/* Hand Cursor - White with Black Outline */}
            <svg
              width="40"
              height="40"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 24 24"
              enableBackground="new 0 0 24 24"
              xmlSpace="preserve"
            >
              <g>
                <defs>
                  <rect id="SVGID_1_" width="24" height="24" />
                </defs>
                <clipPath id="SVGID_2_">
                  <use xlinkHref="#SVGID_1_" overflow="visible" />
                </clipPath>
                <path
                  clipPath="url(#SVGID_2_)"
                  fill="#FFFFFF"
                  d="M11.3,20.4c-0.3-0.4-0.6-1.1-1.2-2c-0.3-0.5-1.2-1.5-1.5-1.9
      c-0.2-0.4-0.2-0.6-0.1-1c0.1-0.6,0.7-1.1,1.4-1.1c0.5,0,1,0.4,1.4,0.7c0.2,0.2,0.5,0.6,0.7,0.8c0.2,0.2,0.2,0.3,0.4,0.5
      c0.2,0.3,0.3,0.5,0.2,0.1c-0.1-0.5-0.2-1.3-0.4-2.1c-0.1-0.6-0.2-0.7-0.3-1.1c-0.1-0.5-0.2-0.8-0.3-1.3c-0.1-0.3-0.2-1.1-0.3-1.5
      c-0.1-0.5-0.1-1.4,0.3-1.8c0.3-0.3,0.9-0.4,1.3-0.2c0.5,0.3,0.8,1,0.9,1.3c0.2,0.5,0.4,1.2,0.5,2c0.2,1,0.5,2.5,0.5,2.8
      c0-0.4-0.1-1.1,0-1.5c0.1-0.3,0.3-0.7,0.7-0.8c0.3-0.1,0.6-0.1,0.9-0.1c0.3,0.1,0.6,0.3,0.8,0.5c0.4,0.6,0.4,1.9,0.4,1.8
      c0.1-0.4,0.1-1.2,0.3-1.6c0.1-0.2,0.5-0.4,0.7-0.5c0.3-0.1,0.7-0.1,1,0c0.2,0,0.6,0.3,0.7,0.5c0.2,0.3,0.3,1.3,0.4,1.7
      c0,0.1,0.1-0.4,0.3-0.7c0.4-0.6,1.8-0.8,1.9,0.6c0,0.7,0,0.6,0,1.1c0,0.5,0,0.8,0,1.2c0,0.4-0.1,1.3-0.2,1.7
      c-0.1,0.3-0.4,1-0.7,1.4c0,0-1.1,1.2-1.2,1.8c-0.1,0.6-0.1,0.6-0.1,1c0,0.4,0.1,0.9,0.1,0.9s-0.8,0.1-1.2,0c-0.4-0.1-0.9-0.8-1-1.1
      c-0.2-0.3-0.5-0.3-0.7,0c-0.2,0.4-0.7,1.1-1.1,1.1c-0.7,0.1-2.1,0-3.1,0c0,0,0.2-1-0.2-1.4c-0.3-0.3-0.8-0.8-1.1-1.1L11.3,20.4z"
                />

                <path
                  clipPath="url(#SVGID_2_)"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="
      M11.3,20.4c-0.3-0.4-0.6-1.1-1.2-2c-0.3-0.5-1.2-1.5-1.5-1.9c-0.2-0.4-0.2-0.6-0.1-1c0.1-0.6,0.7-1.1,1.4-1.1c0.5,0,1,0.4,1.4,0.7
      c0.2,0.2,0.5,0.6,0.7,0.8c0.2,0.2,0.2,0.3,0.4,0.5c0.2,0.3,0.3,0.5,0.2,0.1c-0.1-0.5-0.2-1.3-0.4-2.1c-0.1-0.6-0.2-0.7-0.3-1.1
      c-0.1-0.5-0.2-0.8-0.3-1.3c-0.1-0.3-0.2-1.1-0.3-1.5c-0.1-0.5-0.1-1.4,0.3-1.8c0.3-0.3,0.9-0.4,1.3-0.2c0.5,0.3,0.8,1,0.9,1.3
      c0.2,0.5,0.4,1.2,0.5,2c0.2,1,0.5,2.5,0.5,2.8c0-0.4-0.1-1.1,0-1.5c0.1-0.3,0.3-0.7,0.7-0.8c0.3-0.1,0.6-0.1,0.9-0.1
      c0.3,0.1,0.6,0.3,0.8,0.5c0.4,0.6,0.4,1.9,0.4,1.8c0.1-0.4,0.1-1.2,0.3-1.6c0.1-0.2,0.5-0.4,0.7-0.5c0.3-0.1,0.7-0.1,1,0
      c0.2,0,0.6,0.3,0.7,0.5c0.2,0.3,0.3,1.3,0.4,1.7c0,0.1,0.1-0.4,0.3-0.7c0.4-0.6,1.8-0.8,1.9,0.6c0,0.7,0,0.6,0,1.1
      c0,0.5,0,0.8,0,1.2c0,0.4-0.1,1.3-0.2,1.7c-0.1,0.3-0.4,1-0.7,1.4c0,0-1.1,1.2-1.2,1.8c-0.1,0.6-0.1,0.6-0.1,1
      c0,0.4,0.1,0.9,0.1,0.9s-0.8,0.1-1.2,0c-0.4-0.1-0.9-0.8-1-1.1c-0.2-0.3-0.5-0.3-0.7,0c-0.2,0.4-0.7,1.1-1.1,1.1
      c-0.7,0.1-2.1,0-3.1,0c0,0,0.2-1-0.2-1.4c-0.3-0.3-0.8-0.8-1.1-1.1L11.3,20.4z"
                />

                <line
                  clipPath="url(#SVGID_2_)"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  x1="19.6"
                  y1="20.7"
                  x2="19.6"
                  y2="17.3"
                />

                <line
                  clipPath="url(#SVGID_2_)"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  x1="17.6"
                  y1="20.7"
                  x2="17.5"
                  y2="17.3"
                />

                <line
                  clipPath="url(#SVGID_2_)"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  x1="15.6"
                  y1="17.3"
                  x2="15.6"
                  y2="20.7"
                />
              </g>
            </svg>
          </div>
        );

      default:
        return (
          <div
            key="arrow"
            className="relative"
            style={{
              transform: `scale(${clicked ? 0.8 : 1}) rotate(-20deg)`,
            }}
          >
            {/* Figma Arrow Cursor - Black with White Outline */}
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19169L11.7841 12.3673H5.65376Z"
                fill="black"
                stroke="white"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[9999]",
        hidden ? "opacity-0" : "opacity-100"
      )}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "tween", ease: "linear", duration: 0 }}
    >
      {renderCursor()}
    </motion.div>
  );
};