import { createPreset } from '@tailwindcss/postcss'

export default {
  presets: [createPreset()],
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
}
