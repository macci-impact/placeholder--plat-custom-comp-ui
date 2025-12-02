import { defineCustomElement } from "vue";
import defineLightDomElement from "@/shared/LightDomElement.mjs";

import SignUpOrLogIn from "./components/accept-invitation/SignUpOrLogIn.vue";
import LoadMask from "./components/general/LoadMask.vue";
import PreviewLinkUrl from "@/components/branding/PreviewLinkUrl.vue";
const PreviewLinkUrlElement = defineCustomElement(PreviewLinkUrl);
import VueComponentTest from "@/components/VueComponentTest.vue";

if (!customElements.get('preview-link-url')) {
    customElements.define('preview-link-url', PreviewLinkUrlElement);
}
if (!customElements.get('vue-component-test')) {
    customElements.define('vue-component-test', defineCustomElement(VueComponentTest));
}
defineLightDomElement("lightdom-vue-component-test", VueComponentTest);


export {
    SignUpOrLogIn,
    PreviewLinkUrlElement,
}

(window as any)['platform-custom-components'] = {
    LoadMask
}
