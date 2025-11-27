import { Component, createApp } from 'vue';

/**
 * Registers a Vue component as a global function in the window object
 * usually used together with the Vite plugin replaceFileNoExt()
 *
 * Eg.
 *
 * import { registerWidget } from '../helpers/componentRegistrar';
 * import Banner from './Banner.vue';
 * registerWidget(__FILE_NO_EXT__, Banner);
 *
 * where __FILE_NO_EXT__ is replaced by the Vite plugin with the file name without the extension
 *
 * @param globalName name of this render function for the window object
 * @param component Vue component to register
 */
export function registerWidget(globalName: string, component: Component) {
    if (!(globalThis as any)[globalName]) {
        if (window.location.href.includes('debug=true')) {
            console.log('Registering widget:', globalName);
        }
        (globalThis as any)[globalName] = (props: Record<string, unknown> | null) => {
            return createApp(component, props);
        }
    }
}