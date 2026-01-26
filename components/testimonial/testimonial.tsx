import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Masonry from "./masonry";
import TweetCard from "./tweet-card";
import { tweets } from "./data";
import { Button } from "../ui/button";

const Testimonials = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  const COLLAPSED_HEIGHT = 500;

  // Measure the actual content height
  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContentHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const displayHeight = isExpanded
    ? contentHeight
    : Math.min(COLLAPSED_HEIGHT, contentHeight);

  const showButton = contentHeight > COLLAPSED_HEIGHT;

  return (
    <section className="w-full overflow-hidden py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Built in public. Used by developers. Improved by feedback.{" "}
          </p>
        </div>

        <div className="relative">
          {/* Use CSS clip-path or height with will-change for GPU acceleration */}
          <motion.div
            initial={false}
            animate={{ height: displayHeight }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              overflow: "hidden",
              willChange: "height",
            }}
          >
            <div ref={contentRef}>
              <Masonry
                items={tweets}
                renderItem={(tweet) => <TweetCard tweet={tweet} />}
                gap={16}
              />
            </div>
          </motion.div>

          {showButton && !isExpanded && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32
               bg-linear-to-t from-background via-background/80 to-transparent"
            />
          )}

          {showButton && (
            <div className="flex justify-center mt-6 relative z-10">
              <Button
                variant={"link"}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span>{isExpanded ? "Show Less" : "Show More"}</span>
                <motion.svg
                  initial={false}
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
