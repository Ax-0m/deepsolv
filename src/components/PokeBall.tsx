"use client";

interface Props {
  size?: number;
  caught?: boolean;
  variant?: "default" | "great" | "ultra" | "master";
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

const VARIANTS = {
  default: { top: "#ef4444", topShadow: "#991b1b" },
  great: { top: "#3b82f6", topShadow: "#1e40af" },
  ultra: { top: "#1f2937", topShadow: "#0a0a0a" },
  master: { top: "#7c3aed", topShadow: "#4c1d95" },
} as const;

export default function PokeBall({
  size = 24,
  caught = true,
  variant = "default",
  className = "",
  style,
  title,
}: Props) {
  const colors = VARIANTS[variant];

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      className={className}
      style={style}
    >
      <defs>
        <radialGradient id={`pb-shine-${variant}`} cx="35%" cy="30%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <circle cx="32" cy="32" r="30" fill="#0a0a0a" />
      <circle cx="32" cy="32" r="28" fill="#ffffff" />

      {caught ? (
        <path
          d="M 4 32 A 28 28 0 0 1 60 32 L 4 32 Z"
          fill={colors.top}
        />
      ) : (
        <path
          d="M 4 32 A 28 28 0 0 1 60 32 L 4 32 Z"
          fill="#f4f4f5"
        />
      )}

      <rect x="4" y="29" width="56" height="6" fill="#0a0a0a" />

      <circle cx="32" cy="32" r="9" fill="#0a0a0a" />
      <circle cx="32" cy="32" r="6.5" fill="#ffffff" />
      {caught ? (
        <circle
          cx="32"
          cy="32"
          r="3.5"
          fill="#fbbf24"
          stroke="#9ca3af"
          strokeWidth="0.5"
        />
      ) : (
        <circle
          cx="32"
          cy="32"
          r="3.5"
          fill="#ffffff"
          stroke="#9ca3af"
          strokeWidth="1"
        />
      )}

      {caught ? (
        <ellipse
          cx="22"
          cy="18"
          rx="9"
          ry="5"
          fill={`url(#pb-shine-${variant})`}
          opacity="0.7"
        />
      ) : null}
    </svg>
  );
}
