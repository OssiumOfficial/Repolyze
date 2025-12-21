import { IconProps } from "@/lib/types";

function AnalyzeIcon({
  fill = "currentColor",
  secondaryfill,
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height="18"
      width="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill={fill}>
        {/* Magnifying glass lens */}
        <circle
          cx="7.5"
          cy="7.5"
          r="5.5"
          fill="none"
          stroke={fill}
          strokeWidth="1.5"
        />
        {/* Code brackets inside lens */}
        <path
          d="M5.5 6L4.5 7.5L5.5 9"
          fill="none"
          stroke={secondaryfill}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        <path
          d="M9.5 6L10.5 7.5L9.5 9"
          fill="none"
          stroke={secondaryfill}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        {/* Magnifying glass handle */}
        <path
          d="M11.5 11.5L16 16"
          fill="none"
          stroke={fill}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default AnalyzeIcon;
