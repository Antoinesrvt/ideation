import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Add safelist for GRP Model dynamic classes
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-400', 'bg-yellow-500', 'border-yellow-200', 'text-yellow-500', 'text-yellow-600', 'text-yellow-800',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-500', 'border-blue-200', 'text-blue-500', 'text-blue-600', 'text-blue-800',
    'bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-500', 'border-red-200', 'text-red-500', 'text-red-600', 'text-red-800',
    'bg-green-50', 'bg-green-100', 'bg-green-500', 'bg-green-800', 'text-green-500', 'text-green-600', 'text-green-800',
    'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-500', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800',
    'bg-purple-100', 'bg-purple-500', 'text-purple-500', 'text-purple-800',
    
    // Text and font classes
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
    'font-normal', 'font-medium', 'font-semibold', 'font-bold',
    'text-center', 'text-left', 'text-right',
    'text-white',
    
    // Grid layout classes
    'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-10', 'grid-rows-2', 'auto-rows-fr',
    'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-10', 
    'hidden', 'lg:hidden', 'lg:block', 'lg:grid', 'block',
    'gap-2', 'gap-4', 'gap-6', 'gap-8',
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5',
    'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4',
    
    // Flex classes for the layout
    'flex', 'flex-col', 'flex-row', 'flex-wrap', 'flex-1', 'flex-auto', 'flex-initial', 'flex-none',
    'items-center', 'items-start', 'items-end', 'items-stretch',
    'justify-center', 'justify-between', 'justify-start', 'justify-end', 'justify-around', 'justify-evenly',
    'space-x-1', 'space-x-2', 'space-x-4', 'space-y-1', 'space-y-2', 'space-y-4',
    
    // Sizing and spacing
    'w-full', 'w-auto', 'w-10', 'w-16', 'w-32', 'w-64', 'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4',
    'h-full', 'h-auto', 'h-10', 'h-16', 'h-32', 'h-64', 'h-screen', 'min-h-screen', 'min-h-[100px]', 'min-h-[500px]', 'min-h-[600px]',
    'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8',
    'px-1', 'px-2', 'px-3', 'px-4', 'px-6', 'px-8',
    'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8',
    'pt-1', 'pt-2', 'pr-1', 'pr-2', 'pb-1', 'pb-2', 'pl-1', 'pl-2',
    'm-1', 'm-2', 'm-3', 'm-4', 'm-auto',
    'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-auto',
    'my-1', 'my-2', 'my-3', 'my-4', 'my-auto',
    'mt-1', 'mt-2', 'mr-1', 'mr-2', 'mb-1', 'mb-2', 'mb-4', 'ml-1', 'ml-2',
    
    // Borders and shadows
    'border', 'border-0', 'border-2', 'border-4', 'border-t', 'border-r', 'border-b', 'border-l',
    'border-solid', 'border-dashed',
    'border-gray-100', 'border-gray-200', 'border-gray-300',
    'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full',
    'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-none',
    
    // Positioning and display
    'absolute', 'relative', 'fixed', 'sticky',
    'top-0', 'right-0', 'bottom-0', 'left-0', 'top-8', 'right-8', 'bottom-8', 'left-8',
    'block', 'inline', 'inline-block', 'hidden',
    'overflow-auto', 'overflow-hidden', 'overflow-x-auto', 'overflow-y-auto',
    'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    
    // Transitions and animations
    'transition', 'transition-all', 'duration-100', 'duration-200', 'duration-300',
    'hover:shadow-md', 'hover:border-gray-300',
    
    // Cursor styles
    'cursor-pointer', 'cursor-default', 'cursor-not-allowed',
  ],
  theme: {
  	extend: {
  		colors: {
  			// Brand Colors from landing page
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))",
  				900: "#4A0772",
          800: "#5D0991",
          700: "#7209B7",
          600: "#8A2BE2",
          500: "#9D4EDA",
          400: "#B57EDC",
          300: "#C9A0E4",
          200: "#E2C6F1",
          100: "#F3E5FB",
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))",
  				900: "#0D5D6A",
          800: "#0E7C8E",
          700: "#1399B0",
          600: "#30B3CC",
          500: "#4CC9F0",
          400: "#65D4F5",
          300: "#89E0F8",
          200: "#ADEEF9",
          100: "#D5F5FD",
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))",
  				900: "#910838",
          800: "#B2144C",
          700: "#D1185D",
          600: "#F72585",
          500: "#F8539B",
          400: "#FA7FB6",
          300: "#FCADD1",
          200: "#FEDCEA",
          100: "#FFF0F7",
  			},
  			dark: {
  				900: "#0F0F1A",
          800: "#1A1A2A",
          700: "#242445",
          600: "#36365A",
          500: "#484872",
          400: "#6B6B90",
          300: "#9090AE",
          200: "#BCBCCE",
          100: "#E5E5ED",
  			},
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))"
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))"
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))"
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))"
  			},
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
  			xl: "3rem",      // --radius-2xl from landing
  			"2xl": "10000px" // --radius-full from landing
  		},
  		fontFamily: {
  			sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
  			heading: ["Outfit", "sans-serif"],
  			mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
  		},
      boxShadow: {
        sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
        md: "0 8px 24px rgba(0, 0, 0, 0.12)",
        lg: "0 16px 32px rgba(0, 0, 0, 0.16)",
        xl: "0 32px 64px rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--primary-700), var(--primary-600))',
        'gradient-secondary': 'linear-gradient(135deg, var(--secondary-700), var(--secondary-500))',
        'gradient-accent': 'linear-gradient(135deg, var(--accent-700), var(--accent-500))',
        'gradient-dark': 'linear-gradient(135deg, var(--dark-800), var(--dark-700))',
        'gradient-mixed': 'linear-gradient(135deg, var(--primary-700), var(--accent-700))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'reveal': 'reveal 0.8s ease-out',
        'rotate-slow': 'rotate-slow 15s linear infinite',
        'gradient-shift': 'gradient-shift 3s linear infinite',
        'bounce': 'bounce 1s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'ripple': 'ripple 1.5s ease-out infinite',
        'text-shimmer': 'text-shimmer 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        reveal: {
          from: { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
          to: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-15px)' },
          '60%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        ripple: {
          '0%': { boxShadow: '0 0 0 0 rgba(114, 9, 183, 0.3), 0 0 0 0.5rem rgba(114, 9, 183, 0.2), 0 0 0 1rem rgba(114, 9, 183, 0.1)' },
          '100%': { boxShadow: '0 0 0 0.5rem rgba(114, 9, 183, 0.2), 0 0 0 1rem rgba(114, 9, 183, 0.1), 0 0 0 1.5rem rgba(114, 9, 183, 0)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;