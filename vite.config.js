import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { sources } from "./src/data/sources.js";

const datapackAbsPath = path.resolve(__dirname, `src/data/datapacks/${sources.datapack}`).replace(/\\/g, '/');

export default defineConfig({
  plugins: [
    {
      name: 'datapack-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (id.replace(/\\/g, '/').startsWith(datapackAbsPath) && /\.js$/.test(id)) {
          return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
        }
      }
    },
    react(),
  ],
  base: "/portfolio/",
  resolve: {
    alias: {
      "@datapack": path.resolve(__dirname, `src/data/datapacks/${sources.datapack}`),
    },
  },
});