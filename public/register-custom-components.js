import { importForEnvironment } from './load/common.js';

export default async function register() {
    window['platform-custom-components'] = await importForEnvironment ('platform-custom-ui.es');
}