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
        // Primary Brand Colors
        primary: {
          orange: "#FF6B35",
          black: "#1A1A1A",
          white: "#FFFFFF",
        },
        // Secondary Colors
        secondary: {
          gray: "#6B7280",
          "light-gray": "#F3F4F6",
          "dark-gray": "#374151",
        },
        // Semantic Colors
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
        },
      },
      fontFamily: {
        sans: ["var(--font-vazirmatn)", "Inter", "Roboto", "system-ui", "sans-serif"],
        display: ["var(--font-vazirmatn)", "Inter", "system-ui", "sans-serif"],
        vazir: ["var(--font-vazirmatn)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      spacing: {
        // Custom spacing scale based on 8px unit
        "1": "0.25rem",   // 4px
        "2": "0.5rem",    // 8px
        "3": "0.75rem",   // 12px
        "4": "1rem",      // 16px
        "6": "1.5rem",    // 24px
        "8": "2rem",      // 32px
        "12": "3rem",     // 48px
        "16": "4rem",     // 64px
        "24": "6rem",     // 96px
      },
      borderRadius: {
        "xl": "0.75rem",  // 12px
        "2xl": "1rem",    // 16px
        "3xl": "1.5rem",  // 24px
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0, 0, 0, 0.1)",
        "glass-orange": "0 8px 32px rgba(255, 107, 53, 0.3)",
        "soft": "0 4px 6px rgba(0, 0, 0, 0.05)",
        "medium": "0 10px 15px rgba(0, 0, 0, 0.1)",
      },
      backdropBlur: {
        "xs": "2px",
        "sm": "4px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "2xl": "24px",
        "3xl": "40px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "bounce-gentle": "bounceGentle 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-orange": "linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)",
      },
    },
  },
  plugins: [
    // Custom plugin for glassmorphism effects
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const newUtilities = {
        ".glass": {
          background: "rgba(255, 255, 255, 0.1)",
          "backdrop-filter": "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        ".glass-dark": {
          background: "rgba(0, 0, 0, 0.1)",
          "backdrop-filter": "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".text-shadow": {
          "text-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
        ".text-shadow-lg": {
          "text-shadow": "0 4px 8px rgba(0, 0, 0, 0.15)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
