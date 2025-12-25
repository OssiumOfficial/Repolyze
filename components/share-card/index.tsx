"use client";

import { forwardRef } from "react";
import { ShareCardProps } from "./types";
import { getScoreConfig } from "./utils";
import { CompactVariant } from "./variants/compact-variant";
import { DetailedVariant } from "./variants/detailed-variant";
import { DefaultVariant } from "./variants/default-variant";

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ data, variant = "default", showWatermark = true, className }, ref) => {
    const config = getScoreConfig(data.overallScore);

    if (variant === "compact") {
      return (
        <CompactVariant
          ref={ref}
          data={data}
          config={config}
          className={className}
        />
      );
    }

    if (variant === "detailed") {
      return (
        <DetailedVariant
          ref={ref}
          data={data}
          config={config}
          showWatermark={showWatermark}
          className={className}
        />
      );
    }

    return (
      <DefaultVariant
        ref={ref}
        data={data}
        config={config}
        showWatermark={showWatermark}
        className={className}
      />
    );
  }
);

ShareCard.displayName = "ShareCard";
