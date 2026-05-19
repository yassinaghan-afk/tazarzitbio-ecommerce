import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold:  "hsl(var(--gold))",
        olive: "hsl(var(--olive))",
        sand:  "hsl(var(--sand))",
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      borderRadius: {
        sm:   "calc(var(--radius) - 4px)",
        md:   "calc(var(--radius) - 2px)",
        lg:   "var(--radius)",
        xl:   "calc(var(--radius) + 4px)",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        "warm-sm": "var(--shadow-sm)",
        "warm-md": "var(--shadow-md)",
        "warm-lg": "var(--shadow-lg)",
        "warm-xl": "var(--shadow-xl)",
        gold:      "var(--shadow-gold)",
      },
      fontSize: {
        "2xs": ["0.7rem",   { lineHeight: "1rem" }],
        xs:    ["0.75rem",  { lineHeight: "1.1rem" }],
        sm:    ["0.875rem", { lineHeight: "1.35rem" }],
        base:  ["1rem",     { lineHeight: "1.6rem" }],
        lg:    ["1.125rem", { lineHeight: "1.7rem" }],
        xl:    ["1.25rem",  { lineHeight: "1.65rem" }],
        "2xl": ["1.5rem",   { lineHeight: "1.4rem" }],
        "3xl": ["1.875rem", { lineHeight: "1.3rem" }],
        "4xl": ["2.25rem",  { lineHeight: "1.2rem" }],
        "5xl": ["3rem",     { lineHeight: "1.15rem" }],
        "6xl": ["3.75rem",  { lineHeight: "1.1rem" }],
        "7xl": ["4.5rem",   { lineHeight: "1.05rem" }],
      },
      animation: {
        float:    "float 5s ease-in-out infinite",
        shimmer:  "shimmer 2.4s linear infinite",
        "fade-up": "fadeUp 0.5s ease-out both",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(35 65% 46% / 0)" },
          "50%":      { boxShadow: "0 0 0 8px hsl(35 65% 46% / 0.12)" },
        },
      },
      backgroundImage: {
        "gradient-gold":   "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(42 80% 58%) 50%, hsl(30 58% 40%) 100%)",
        "gradient-olive":  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(100 27% 17%) 100%)",
        "gradient-warm":   "linear-gradient(160deg, hsl(var(--background)) 0%, hsl(38 35% 92%) 100%)",
        "gradient-radial-gold": "radial-gradient(ellipse at center, hsl(35 65% 46% / 0.15) 0%, transparent 70%)",
      },
      spacing: {
        "18":  "4.5rem",
        "22":  "5.5rem",
        "26":  "6.5rem",
        "30":  "7.5rem",
        "34":  "8.5rem",
        "section": "5rem",
        "section-lg": "7rem",
      },
    },
  },
  plugins: [],
};

export default config;
