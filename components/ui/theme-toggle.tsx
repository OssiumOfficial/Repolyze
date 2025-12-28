"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Button } from "./button";

import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";

interface ThemeToggleProps {
  onMouseEnter?: () => void;
}

const ThemeToggle = ({ onMouseEnter }: ThemeToggleProps) => {
  const { setTheme, resolvedTheme } = useTheme();

  // Avoid hydration mismatch
  if (!resolvedTheme) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onMouseEnter={onMouseEnter}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {resolvedTheme === "dark" ? (
              <motion.div
                key="dark"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HugeiconsIcon
                  icon={Moon02Icon}
                  className="w-4 h-4 text-foreground/70"
                />
              </motion.div>
            ) : (
              <motion.div
                key="light"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HugeiconsIcon
                  icon={Sun01Icon}
                  className="w-4 h-4 text-foreground/70"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </TooltipTrigger>

      <TooltipContent side="bottom" sideOffset={5}>
        Toggle Mode
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
