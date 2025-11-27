import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

import package_ from './package.json' assert { type: 'json' };

const uiclVersion = package_.devDependencies['@impactinc/ui-component-library'];
const isoStyleId = "application-platform-custom-components-style";
const isoLinkId = isoStyleId + "-uicl";

function addStyleIdPlugin(id: string) {
    return {
        name: 'add-style-id',
        // This hook runs after the bundle has been generated but before it's written to disk
        generateBundle(options: any, bundle: any) {
            for (const fileName in bundle) {
                const chunk = bundle[fileName];

                // For IIFE, CSS is often injected via JS
                if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
                    let code = chunk.code;
                    code = code.replace('__UICL_VERSION__', uiclVersion);

                    // Look for the style injection pattern created by Vite/Rollup's CSS handling
                    // This pattern might vary slightly depending on Vite/Rollup versions and configs
                    const styleInjectionRegex = /(document.createElement\("style"\))/;

                    if (styleInjectionRegex.test(code)) {
                        // Modify the code to add the ID
                        code = code.replace(
                          styleInjectionRegex,
                          `(() => {let el = document.createElement("style"); el.id = '${id}'; return el;})()`
                        );
                        chunk.code = code;
                    }
                }
            }
        },
    };
}

export default defineConfig({
    define: {
        'process.env': {},
        __ISO_SHEETS__: JSON.stringify(`#${isoStyleId}`)
    },
    plugins: [vue(), addStyleIdPlugin(isoStyleId),
        cssInjectedByJsPlugin({ relativeCSSInjection: true })],
    base: './',

    build: {
        outDir: 'dist',
        emptyOutDir: false,
        cssCodeSplit: true,


        //NOTE - we purposely embed the vue in these bundles, as they are single page or a widget
        // on a page which might not have vue3 - eg dashboard
        rollupOptions: {

            //input: 'src/widgets/banner-brand/main-brand-banner.ts',
            input: 'src/main-linkgenerator-slideout.ts',
            output: {
                format: 'iife',
                amd: { define: "false" },
                entryFileNames: '[name].js',
            }
        }
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/mocks/vitest.setup.js",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        },
    }
});