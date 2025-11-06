/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		screens: {
			xs: "0px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},
		extend: {
			// Note: Tailwind's default spacing scale already uses 4px increments
			// CSS variables are available for direct use: --spacing-1 through --spacing-16
			boxShadow: {
				// Two-part realistic shadow system
				"card": "var(--shadow-card)",
				"elevated": "var(--shadow-elevated)",
				"floating": "var(--shadow-floating)",
			},
			colors: {
				border: "oklch(var(--border))",
				input: "oklch(var(--input))",
				ring: "oklch(var(--ring))",
				background: "oklch(var(--background))",
				foreground: "oklch(var(--foreground))",
				primary: {
					DEFAULT: "oklch(var(--primary))",
					foreground: "oklch(var(--primary-foreground))",
					hsl: "hsl(var(--color-primary-hsl))",
					"hsl-light": "hsl(var(--color-primary-hsl-light))",
					"hsl-dark": "hsl(var(--color-primary-hsl-dark))",
				},
				secondary: {
					DEFAULT: "oklch(var(--secondary))",
					foreground: "oklch(var(--secondary-foreground))",
					hsl: "hsl(var(--color-secondary-hsl))",
					"hsl-light": "hsl(var(--color-secondary-hsl-light))",
					"hsl-dark": "hsl(var(--color-secondary-hsl-dark))",
				},
				destructive: {
					DEFAULT: "oklch(var(--destructive))",
					foreground: "oklch(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "oklch(var(--muted))",
					foreground: "oklch(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "oklch(var(--accent))",
					foreground: "oklch(var(--accent-foreground))",
					hsl: "hsl(var(--color-accent-hsl))",
					"hsl-light": "hsl(var(--color-accent-hsl-light))",
					"hsl-dark": "hsl(var(--color-accent-hsl-dark))",
				},
				popover: {
					DEFAULT: "oklch(var(--popover))",
					foreground: "oklch(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "oklch(var(--card))",
					foreground: "oklch(var(--card-foreground))",
				},
				sidebar: {
					DEFAULT: "oklch(var(--sidebar))",
					foreground: "oklch(var(--sidebar-foreground))",
					primary: {
						DEFAULT: "oklch(var(--sidebar-primary))",
						foreground: "oklch(var(--sidebar-primary-foreground))",
					},
					accent: {
						DEFAULT: "oklch(var(--sidebar-accent))",
						foreground: "oklch(var(--sidebar-accent-foreground))",
					},
					border: "oklch(var(--sidebar-border))",
					ring: "oklch(var(--sidebar-ring))",
				},
				// HSL Semantic Colors
				success: {
					hsl: "hsl(var(--color-success-hsl))",
				},
				warning: {
					hsl: "hsl(var(--color-warning-hsl))",
				},
				error: {
					hsl: "hsl(var(--color-error-hsl))",
				},
				info: {
					hsl: "hsl(var(--color-info-hsl))",
				},
				// Neutral HSL Colors
				neutral: {
					50: "hsl(var(--color-neutral-50-hsl))",
					100: "hsl(var(--color-neutral-100-hsl))",
					200: "hsl(var(--color-neutral-200-hsl))",
					300: "hsl(var(--color-neutral-300-hsl))",
					400: "hsl(var(--color-neutral-400-hsl))",
					500: "hsl(var(--color-neutral-500-hsl))",
					600: "hsl(var(--color-neutral-600-hsl))",
					700: "hsl(var(--color-neutral-700-hsl))",
					800: "hsl(var(--color-neutral-800-hsl))",
					900: "hsl(var(--color-neutral-900-hsl))",
				},
				// Raised element colors (for depth/hierarchy)
				raised: {
					1: "hsl(var(--color-raised-1-hsl))",
					2: "hsl(var(--color-raised-2-hsl))",
					3: "hsl(var(--color-raised-3-hsl))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			lineHeight: {
				tight: "var(--line-height-tight)",
				normal: "var(--line-height-normal)",
				relaxed: "var(--line-height-relaxed)",
				loose: "var(--line-height-loose)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"scaleUp": {
					from: { opacity: "0", transform: "scale(0.95)" },
					to: { opacity: "1", transform: "scale(1)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"scaleUp": "scaleUp 0.3s ease-out forwards",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
