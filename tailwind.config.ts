import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        dex: {
          red: "#dc2626",
          "red-deep": "#991b1b",
          "red-light": "#ef4444",
          screen: "#9bbc0f",
          "screen-dark": "#0f380f",
          "screen-mid": "#306230",
          gold: "#fbbf24",
          blue: "#3b82f6",
          black: "#0a0a0a",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        "pixel-mono": ["var(--font-pixel-mono)", "monospace"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 6px 20px -8px rgb(0 0 0 / 0.18)",
        pixel:
          "0 0 0 1px rgb(0 0 0 / 0.2), 2px 2px 0 0 rgb(0 0 0 / 0.6), 4px 4px 0 0 rgb(0 0 0 / 0.3)",
        "pixel-sm":
          "0 0 0 1px rgb(0 0 0 / 0.2), 2px 2px 0 0 rgb(0 0 0 / 0.5)",
        "pixel-inset":
          "inset 2px 2px 0 0 rgb(255 255 255 / 0.25), inset -2px -2px 0 0 rgb(0 0 0 / 0.25)",
      },
      backgroundImage: {
        scanlines:
          "repeating-linear-gradient(180deg, transparent 0, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)",
        "pokeball-pattern":
          "radial-gradient(circle at center, transparent 60px, rgba(220,38,38,0.04) 60px, rgba(220,38,38,0.04) 64px, transparent 64px, transparent 120px, rgba(15,15,15,0.04) 120px, rgba(15,15,15,0.04) 124px, transparent 124px)",
        holo: "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.55) 50%, transparent 75%)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0) rotate(0)" },
          "20%": { transform: "translateX(-3px) rotate(-8deg)" },
          "40%": { transform: "translateX(3px) rotate(8deg)" },
          "60%": { transform: "translateX(-2px) rotate(-6deg)" },
          "80%": { transform: "translateX(2px) rotate(6deg)" },
        },
        spin3d: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        flash: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "0.85" },
        },
        "holo-sweep": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        crt: {
          "0%": { transform: "scaleY(0)", opacity: "0" },
          "20%": { transform: "scaleY(0.05)", opacity: "1" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
      },
      animation: {
        pop: "pop 250ms ease-out",
        shake: "shake 500ms ease-in-out",
        spin3d: "spin3d 1.2s linear infinite",
        flash: "flash 350ms ease-out",
        "holo-sweep": "holo-sweep 2.5s ease-in-out infinite",
        blink: "blink 1.4s ease-in-out infinite",
        bob: "bob 2.6s ease-in-out infinite",
        crt: "crt 350ms ease-out",
      },
    },
  },
  safelist: [
    {
      pattern:
        /(bg|from|to|ring|text)-(stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate)-(200|300|400|500|600|700|800|900)/,
    },
    "ring-stone-400/40",
    "ring-orange-500/40",
    "ring-blue-500/40",
    "ring-yellow-400/40",
    "ring-emerald-500/40",
    "ring-cyan-300/40",
    "ring-red-700/40",
    "ring-purple-600/40",
    "ring-amber-600/40",
    "ring-indigo-400/40",
    "ring-pink-500/40",
    "ring-lime-500/40",
    "ring-yellow-700/40",
    "ring-violet-700/40",
    "ring-indigo-700/40",
    "ring-stone-700/40",
    "ring-slate-500/40",
    "ring-pink-300/40",
    "ring-stone-500/40",
  ],
  plugins: [],
};
export default config;
