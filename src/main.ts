import { defineCustomElement } from "vue";
import defineLightDomElement from "@/shared/LightDomElement.mjs";

import SignUpOrLogIn from "./components/accept-invitation/SignUpOrLogIn.vue";
import LoadMask from "./components/general/LoadMask.vue";
import PreviewLinkUrl from "@/components/branding/PreviewLinkUrl.vue";
import TwoFaSendAndVerify from "@/components-shared/app-partner-xp/TwoFaSendAndVerify.vue";
import VueComponentTest from "@/components/VueComponentTest.vue";

if (!customElements.get('vue-component-test')) {
    customElements.define('vue-component-test', defineCustomElement(VueComponentTest));
}
defineLightDomElement("lightdom-vue-component-test", VueComponentTest);

if (!customElements.get('two-fa-send-and-verify')) {
    customElements.define('two-fa-send-and-verify', defineCustomElement(TwoFaSendAndVerify));
}
defineLightDomElement("lightdom-two-fa-send-and-verify-vue", TwoFaSendAndVerify);

export {
    SignUpOrLogIn,
    TwoFaSendAndVerify
}

(window as any)['platform-custom-components'] = {
    LoadMask
}
