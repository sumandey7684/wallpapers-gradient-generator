# Gradient Wallpapers Studio

A modern gradient wallpaper generator built with Next.js 15, React 19, Tailwind CSS v4, and the Kibo UI design system. Create cinematic mesh, linear, and radial gradients with live canvas preview, premium color tooling, and one-click export up to 5K.

## Highlights

- 🎨 Three gradient modes — mesh, linear, radial — with automatic state normalization
- 🧪 Advanced color controls powered by Kibo Color Picker (hue, alpha, multiple formats)
- 🎚️ Precision sliders, comboboxes, and pill toggles for a polished designer experience
- 📸 Responsive live preview with device-pixel–aware rendering
- 📦 Preset resolutions and format options (PNG, JPEG, WEBP) with timestamped filenames
- 🌗 Theme switcher (light/dark/system) wired to CSS custom properties

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- [Kibo UI](https://www.kibo-ui.com/) and shadcn/ui foundations
- Canvas rendering utilities in `src/lib/gradient.ts`

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production build locally
npm run start

# Lint
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000) to explore the studio. The app hot-reloads on file changes.

## Project Structure

- `src/app/` – layout, global styles, and the main page
- `src/components/` – UI building blocks (canvas, controls, export panel, Kibo integrations)
- `src/lib/gradient.ts` – gradient state types, rendering, random generator, export helpers

## Design Credits

- Product design & engineering: [@gh0styx](https://github.com/gh0styx)
- UI system: [Kibo UI](https://www.kibo-ui.com/)

Feel free to fork, remix, and deploy your own wallpaper studio. Contributions and ideas are welcome!\*\*\*
