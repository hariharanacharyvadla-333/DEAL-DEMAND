/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F5F5F5",
        "surface-card": "#FAFAFA",
        border: "#E5E5E5",
        "border-dark": "#D4D4D4",
        foreground: "#0A0A0A",
        muted: "#737373",
        "muted-dark": "#525252",
        brand: {
          DEFAULT: "#FF5A1F", // Signature Orange
          hover: "#E04810",
          light: "#FFF1EB",
        },
        alert: {
          DEFAULT: "#E1251B", // Signal Red
          hover: "#C51A11",
          light: "#FEECEB",
        },
        success: {
          DEFAULT: "#10B981", // LED Status Green
          light: "#ECFDF5",
        }
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "Inter", "-apple-system", "sans-serif"],
        dot: ["'Doto'", "'DotGothic16'", "'Courier New'", "monospace"],
        mono: ["'JetBrains Mono'", "Menlo", "monospace"],
      },
      borderRadius: {
        'nothing': '20px',
        'nothing-sm': '14px',
        'nothing-lg': '28px',
      },
      boxShadow: {
        'nothing': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'nothing-hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'glyph': '0 0 15px rgba(255, 90, 31, 0.25)',
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, #E5E5E5 1.2px, transparent 1.2px)',
        'dot-pattern-dense': 'radial-gradient(circle, #D4D4D4 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-16': '16px 16px',
        'dot-12': '12px 12px',
        'dot-8': '8px 8px',
      }
    },
  },
  plugins: [],
}
