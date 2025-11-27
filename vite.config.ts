import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import package_ from './package.json' assert { type: 'json' };

const uiclVersion = package_.devDependencies['@impactinc/ui-component-library'];
const isoStyleId = "application-platform-custom-components-style";
const isoLinkId = isoStyleId + "-uicl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({}),
    cssInjectedByJsPlugin({
    relativeCSSInjection: true
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    cssCodeSplit: true,

    lib: {
      entry: "src/main.ts",
      //defines the global variable for the UMD build
      name: "platform_custom_ui",
      fileName: (format) => `platform-custom-ui.${format}.js`,
      formats: ["es"],
    },

    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      external: ["vue"],

      output: {
        // do not use 'define' funciton which might be declared by RequireJS (UMD only)
        amd: { define: "false" },

        globals: {
          // tells Rollup 'how' to externalize the 'vue' module
          // whenever it sees 'vue' in the code, it will treat it as 'Vue' in the global scope
          vue: "Vue",
        },
      },
    },
  },
  define: {
      'process.env': process.env,
      __ISO_SHEETS__: JSON.stringify(`#${isoStyleId}, #${isoLinkId}`)
  }
});
