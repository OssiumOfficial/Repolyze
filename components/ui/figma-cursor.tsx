"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FigmaCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouchScreen =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0;

      const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
      const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

      return hasTouchScreen || isSmallScreen || hasCoarsePointer;
    };

    setIsTouchDevice(checkTouchDevice());

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => {
      setIsTouchDevice(checkTouchDevice());
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    if (checkTouchDevice()) {
      return () => {
        mediaQuery.removeEventListener("change", handleMediaChange);
      };
    }

    const textTags = new Set([
      "P",
      "SPAN",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "LABEL",
      "LI",
      "TD",
      "TH",
      "BLOCKQUOTE",
      "PRE",
      "CODE",
      "EM",
      "STRONG",
      "B",
      "I",
      "U",
      "S",
      "SMALL",
      "SUB",
      "SUP",
      "MARK",
      "DEL",
      "INS",
      "Q",
      "CITE",
      "DFN",
      "ABBR",
      "TIME",
      "VAR",
      "SAMP",
      "KBD",
    ]);

    const isTextElement = (element: HTMLElement): boolean => {
      const computedStyle = window.getComputedStyle(element);
      if (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.getAttribute("contenteditable") === "true" ||
        computedStyle.cursor === "text" ||
        computedStyle.cursor === "vertical-text"
      ) {
        return true;
      }

      if (textTags.has(element.tagName)) {
        const hasDirectText = Array.from(element.childNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        );
        if (hasDirectText) {
          return true;
        }
      }

      return false;
    };

    const isClickableElement = (element: HTMLElement): boolean => {
      if (
        element.tagName === "A" ||
        element.tagName === "BUTTON" ||
        element.closest("a") !== null ||
        element.closest("button") !== null ||
        element.classList.contains("cursor-pointer") ||
        element.closest(".cursor-pointer") !== null ||
        element.getAttribute("role") === "button" ||
        element.closest('[role="button"]') !== null ||
        element.onclick !== null ||
        element.getAttribute("onclick") !== null
      ) {
        return true;
      }

      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.cursor === "pointer") {
        return true;
      }

      return false;
    };

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;

      const clickable = isClickableElement(target);
      const text = !clickable && isTextElement(target);

      setIsPointer(clickable);
      setIsText(text);
    };

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
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  if (isTouchDevice) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-9999 transition-opacity duration-300",
        hidden ? "opacity-0" : "opacity-100"
      )}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "tween", ease: "linear", duration: 0 }}
    >
      {isText ? (
        <motion.div
          key="text"
          animate={{
            scale: clicked ? 0.9 : 1,
            opacity: 1,
          }}
          className="relative -ml-2 -mt-3"
        >
          {/* I-Beam Text Cursor */}
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White Outline (Back) */}
            <path
              d="M8 2V22"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="square"
            />
            <path
              d="M4 2H12"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="square"
            />
            <path
              d="M4 22H12"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="square"
            />

            {/* Black Fill (Front) */}
            <path
              d="M8 2V22"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
            <path
              d="M5 2H11"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
            <path
              d="M5 22H11"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </motion.div>
      ) : isPointer ? (
        <motion.div
          key="hand"
          animate={{
            scale: clicked ? 0.8 : 1,
            opacity: 1,
            rotate: clicked ? -10 : 0,
          }}
          className="relative -ml-3.5 -mt-2"
        >
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
        </motion.div>
      ) : (
        <motion.div
          key="arrow"
          animate={{
            scale: clicked ? 0.8 : 1,
            opacity: 1,
            rotate: -20,
          }}
          className="relative"
        >
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
        </motion.div>
      )}
    </motion.div>
  );
};
