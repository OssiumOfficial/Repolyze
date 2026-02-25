import React, { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
  isOrg?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 48,
};

const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", isOrg = false }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const shapeClass = isOrg ? "rounded-md" : "rounded-full";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getColorFromName = (name: string) => {
    const colors = [
      "bg-primary",
      "bg-secondary",
      "bg-accent",
      "bg-primary/80",
      "bg-secondary/80",
    ];
    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (hasError || !src) {
    return (
      <div
        className={`${sizeClasses[size]} ${getColorFromName(
          name
        )} ${shapeClass} flex items-center justify-center text-primary-foreground font-medium shrink-0`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative shrink-0`}>
      {isLoading && (
        <div
          className={`absolute inset-0 ${shapeClass} bg-muted animate-pulse`}
        />
      )}
      <Image
        src={src}
        alt={name}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className={`w-full h-full ${shapeClass} object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default Avatar;
