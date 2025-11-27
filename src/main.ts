import { defineCustomElement } from "vue";

import SignUpOrLogIn from "./components/accept-invitation/SignUpOrLogIn.vue";
// import TableFilterToggle from "./components/dynamic-partials/table-toggle/TableFilterToggle.vue";
// import TableToggle from "./components/dynamic-partials/table-toggle/TableToggle.vue";
// import HorizontalTabs from "./components/general/HorizontalTabs.vue";
// import ImagePreview from "./components/general/ImagePreview.vue";
// import LoginTwoFa from "./components/login-2fa/LoginTwoFa.vue";
// import RolesAndPermissions from "./components/invite-user/RolesAndPermissions.vue";
import LoadMask from "./components/general/LoadMask.vue";
// import PsaLanding from "./components/psa/PsaLanding.vue";
import PreviewLinkUrl from "@/components/branding/PreviewLinkUrl.vue";

const PreviewLinkUrlElement = defineCustomElement(PreviewLinkUrl);

if (!customElements.get('preview-link-url')) {
    customElements.define('preview-link-url', PreviewLinkUrlElement);
}

export {
    // HorizontalTabs,
    // ImagePreview,
    // LoadMask,
    // LoginTwoFa,
    PreviewLinkUrl,
    // PsaLanding,
    // RolesAndPermissions,
    SignUpOrLogIn,
    // TableToggle,
    // TableFilterToggle,
}

(window as any)['platform-custom-components'] = {
    LoadMask
}
