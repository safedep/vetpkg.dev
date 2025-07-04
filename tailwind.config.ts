import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Developer-focused color palette
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          border: "var(--surface-border)",
        },

        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
        },

        code: {
          bg: "var(--code-bg)",
          border: "var(--code-border)",
          text: "var(--code-text)",
        },

        status: {
          success: "var(--success)",
          warning: "var(--warning)",
          error: "var(--error)",
          info: "var(--info)",
        },

        muted: {
          DEFAULT: "var(--muted)",
          lighter: "var(--muted-lighter)",
          foreground: "var(--muted-foreground)",
        },

        interactive: {
          DEFAULT: "var(--interactive-text)",
          hover: "var(--interactive-hover)",
          active: "var(--interactive-active)",
          text: "var(--interactive-text)",
          "text-hover": "var(--interactive-text-hover)",
        },

        subtle: "var(--subtle)",

        // Legacy support for shadcn components
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        secondary: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "#ffffff",
        },
        border: "var(--surface-border)",
        input: "var(--surface-border)",
        ring: "var(--accent)",
        chart: {
          "1": "var(--accent)",
          "2": "var(--success)",
          "3": "var(--warning)",
          "4": "var(--error)",
          "5": "var(--info)",
        },
      },
      borderRadius: {
        lg: "var(--border-radius-lg)",
        md: "var(--border-radius)",
        sm: "var(--border-radius-sm)",
      },

      boxShadow: {
        dev: "var(--shadow-md)",
        "dev-lg": "var(--shadow-lg)",
        "dev-sm": "var(--shadow-sm)",
      },

      fontFamily: {
        code: [
          "Geist Mono",
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },

      fontSize: {
        code: ["0.875rem", { lineHeight: "1.5" }],
        "code-sm": ["0.75rem", { lineHeight: "1.5" }],
        "code-lg": ["1rem", { lineHeight: "1.5" }],
      },

      backdropBlur: {
        dev: "8px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.02)",
          },
        },
        "slide-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "terminal-cursor": {
          "0%, 50%": {
            opacity: "1",
          },
          "51%, 100%": {
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "terminal-cursor": "terminal-cursor 1s ease-in-out infinite",
      },
    },
    plugins: [tailwindcssAnimate],
  },
} satisfies Config;
