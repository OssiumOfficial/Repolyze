"use client";

import  { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoDemo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="instrument-serif text-3xl md:text-5xl text-foreground mb-4"
          >
            See it in <span className="text-primary">Action</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground jetbrains-mono text-sm max-w-lg mx-auto"
          >
            Watch how we parse complexity into clarity in seconds.
          </motion.p>
        </div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto z-10"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Background Glow Effect */}
          {/* <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-3xl rounded-[3rem] opacity-60 -z-10" />
          <div className="absolute -inset-8 bg-gradient-to-tr from-secondary/20 via-transparent to-accent/20 blur-3xl rounded-[4rem] opacity-40 -z-20" /> */}

          {/* Window Frame */}
          <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            
            {/* Window Header / Toolbar */}
            <div className="flex items-center px-4 py-3 border-b border-border bg-muted/50">
              {/* Traffic light dots */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80 border border-destructive/20 hover:bg-destructive transition-colors cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-chart-4/80 border border-chart-4/20 hover:bg-chart-4 transition-colors cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-chart-2/80 border border-chart-2/20 hover:bg-chart-2 transition-colors cursor-pointer" />
              </div>
              
              {/* URL Bar */}
              <div className="mx-auto bg-background/80 border border-border rounded-md px-3 py-1.5 text-[10px] sm:text-xs text-muted-foreground jetbrains-mono flex items-center gap-2 max-w-xs sm:max-w-md">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline text-muted-foreground/50">https://</span>
                  repo-analyzer.com/demo
                </span>
              </div>

              {/* Right side placeholder for symmetry */}
              <div className="flex gap-2 w-13" />
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-background group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                poster="/video-poster.png"
                onClick={togglePlay}
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Play/Pause Overlay Button */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm cursor-pointer"
                    onClick={togglePlay}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-xl"
                    >
                      <Play className="h-8 w-8 text-primary-foreground ml-1" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Overlay */}
              <AnimatePresence>
                {showControls && isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent pointer-events-none"
                  >
                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-foreground hover:bg-accent/50"
                            onClick={togglePlay}
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-foreground hover:bg-accent/50"
                            onClick={restartVideo}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-foreground hover:bg-accent/50"
                            onClick={toggleMute}
                          >
                            {isMuted ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-foreground hover:bg-accent/50"
                            onClick={toggleFullscreen}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inner shadow overlay */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_20px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.2)]" />
            </div>
          </div>

          {/* Reflection effect */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-linear-to-b from-primary/10 to-transparent blur-2xl opacity-50" />
        </motion.div>

        {/* Optional: Caption below video */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-6 jetbrains-mono"
        >
          Click to play/pause • Hover for controls
        </motion.p>
      </div>
    </section>
  );
};

export default VideoDemo;