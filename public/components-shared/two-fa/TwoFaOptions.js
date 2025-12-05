class TwoFaOptions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
      this.labelsDefault = {
          title: "Verify your identity",
          description: "We'll email or text a verification code to you. Select an option to continue.",
          mobileOptionPrepend: "Mobile ending in",
          labelContinue: "Continue",
      };
      this._labels = {
          ...this.labelsDefault,
    };
    // Remove internal contact details state; use attributes instead
    this._uitkCsrf = "";
    this._selectedMethod = null;
  }

  static get observedAttributes() {
    // Only observe attributes we actually support
    return [
      "labels",
      "uitk-csrf-token",
      "email",
      "number",
      "country",
    ];
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "labels") {
      const labelsObject = typeof val === "string" ? JSON.parse(newValue) : { ...this._labels, ...newValue };

      this._labels = { ...this.labelsDefault, ...labelsObject };

    } else if (name === "uitk-csrf-token") {
      this._uitkCsrf = newValue || "";
    }
    // email, number, country are from getters, attributes in _render, and _sendVerification
    this._render();
  }

  connectedCallback() {
    this._render();
    this._wireEvents();
  }

  _safeParseJSON(str, fallback) {
    try {
      return JSON.parse(str);
    } catch (_) {
      return fallback;
    }
  }

  _render() {
    const { title, description, mobileOptionPrepend, labelContinue } = this._labels;
    const email = this.getAttribute("email") || "";
    const number = this.getAttribute("number") || "";
    const last4 = String(number).slice(-4);
    const iconSms = this._iconsSvg["sms24x24"];
    const iconEmail = this._iconsSvg["email24x24"];
    const styleCss = this._styleCss;

    this.shadowRoot.innerHTML = /*html*/`
      <style>
        @import './components-shared/two-fa/two-fa.css';
        // ${styleCss}
        
        .btn-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          position: relative;
          border-radius: var(--iui3-space-radius-input-radius, 8px);
          border: 1px solid var(--iui3-color-border-border-default, #CACFD3);
          background: var(--iui3-color-background-background-default, #FFF);
          cursor: pointer;
          margin-bottom: 10px;
          margin-top: 20px;
          height: 60px;
        }
        .btn-wrapper.selected { border-color: var(--iui3-color-text-text-default, #121212); }
        .styled-btn-icon {
          font-size: 25px;
          position: absolute;
          left: 30px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--iui3-color-text-text-default, #121212);
        }
        .styled-btn-icon img {
            color: var(--iui3-color-text-text-default, #121212);
        }
        .styled-btn-icon.icon-text img {
            height: 20px;
            left: 2px;
        }  
        .styled-btn-icon.icon-email img {
            width: 24px;
        } 
        .styled-btn-text {
          color: var(--iui3-color-text-text-default, #121212);
          text-align: center;
          font-size: var(--iui3-font-size-secondary-field-label, 14px);
          font-style: normal;
          font-weight: 600;
          line-height: var(--iui3-line-height-secondary-field-label, 18px); /* 128.571% */ 
          width: 100%; 
        }
      </style>

      <div class="two-fa-options two-fa-view-container">
        <div>
          <div class="header d-block mb-8">${title}</div>
          <div class="description d-block mb-24">${description}</div>

          <div class="btn-wrapper ${this._selectedMethod === 'sms' ? 'selected' : ''}" id="option-sms" role="button" tabindex="0">
            <div class="styled-btn-icon icon-sms" aria-hidden="true">
                ${iconSms}
            </div>
            <div class="styled-btn-text">${mobileOptionPrepend} ${last4}</div>
          </div>
          <div class="btn-wrapper ${this._selectedMethod === 'email' ? 'selected' : ''}" id="option-email" role="button" tabindex="0">
            <div class="styled-btn-icon icon-email" aria-hidden="true">
                ${iconEmail}
            </div>
            <div class="styled-btn-text">${email}</div>
          </div>
        </div>

        <div class="footer">
          <button class="continue-action-btn" id="continue-btn" ${!this._selectedMethod ? 'disabled' : ''}><span>${labelContinue}</span></button>
        </div>
      </div>
    `;
  }

  _wireEvents() {
    const sms = this.shadowRoot.getElementById("option-sms");
    const email = this.shadowRoot.getElementById("option-email");
    const continueBtn = this.shadowRoot.getElementById("continue-btn");
    if (!sms || !email || !continueBtn) return;

    sms.onclick = () => {
      this._selectedMethod = "sms";
      this._render();
      this._wireEvents();
    };
    email.onclick = () => {
      this._selectedMethod = "email";
      this._render();
      this._wireEvents();
    };
    continueBtn.onclick = () => this._sendVerification();
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  async _sendVerification() {
    const contactMethod = this._selectedMethod;
    if (!contactMethod) return;
    const country = this.getAttribute("country") || "";
    const email = this.getAttribute("email") || "";
    const number = this.getAttribute("number") || "";

    try {
      const res = await fetch("/signup/numberValidation/sendMobileValidationPin.json", {
        method: "POST",
        body: JSON.stringify({ country, email, number, contactMethod }),
        headers: {
          "content-type": "application/json",
          uitk_csrf: this._uitkCsrf || "",
          "Is-Ajax-Request": "true",
        },
        credentials: "include",
      });

      if (res.status === 429) {
        alert("An error has occurred. Please try again in about 5 minutes.");
      }

      const json = await res.json();
      if (json.content === "Error") {
        if (json.allowAlternateMethod && json.alternateMethod === "email") {
          this._emit("viewChange", "signUpFraud");
        } else if (!json.allowAlternateMethod) {
          this._emit("viewChange", "signUpFraud");
        }
        this._emit("message", { status: "error", message: json.Message });
        return;
      }

      if (json.Message) {
        this._emit("message", { status: "success", message: json.Message });
      }

      let nextViewKey = this.getAttribute("next-view-key") || null;
      if (json.VerificationChannel === "email") {
        nextViewKey = "verifyCodeEmail";
      } else if (json.VerificationChannel === "sms") {
        nextViewKey = "phoneVerifyConfirm";
      } else if (json.VerificationChannel === "smsemail") {
        nextViewKey = "verifyCodeSmsEmail";
      } else if (json.content === "Fraud") {
        nextViewKey = "signUpFraud";
      }

      if (nextViewKey) this._emit("viewChange", nextViewKey);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Error sending code", e);
      this._emit("message", {
        status: "error",
        message: "There was a problem sending the code. Please try again.",
      });
    }
  }

  // Property-based API for labels and csrf only; contactDetails removed
  get labels() {
    return this._labels;
  }

  set labels(val) {
    try {
      const labelsObject = typeof val === "string" ? JSON.parse(val) : { ...this._labels, ...val };
      this._labels = { ...this.labelsDefault, ...labelsObject };
    } catch (_) { /* ignore invalid parse */ }
    this._render();
  }

  get uitkCsrfToken() {
    return this._uitkCsrf;
  }

  set uitkCsrfToken(val) {
    this._uitkCsrf = val || "";
    this._render();
  }

  // Keep convenience property accessors that reflect to attributes
  get email() { return this.getAttribute("email") || ""; }
  set email(val) { this.setAttribute("email", val ?? ""); }

  get number() { return this.getAttribute("number") || ""; }
  set number(val) { this.setAttribute("number", val ?? ""); }

  get country() { return this.getAttribute("country") || ""; }
  set country(val) { this.setAttribute("country", val ?? ""); }

  _iconsSvg = {
    email24x24:`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_8140_28343)">
            <g clip-path="url(#clip1_8140_28343)">
              <path d="M22 3H2.00002C0.896955 3 0 3.89695 0 5.00002V19C0 20.103 0.896955 21 2.00002 21H22.0001C23.1031 21 24.0001 20.103 24.0001 19V5.00002C24.0001 3.89695 23.1031 3 22 3ZM2.00002 3.99998H22.0001C22.0738 3.99998 22.1387 4.02684 22.2078 4.04203C20.4763 5.62673 14.7349 10.8792 12.7257 12.6894C12.5684 12.831 12.315 13 12.0001 13C11.6851 13 11.4317 12.831 11.274 12.689C9.26496 10.879 3.52318 5.62627 1.79194 4.04213C1.86122 4.02694 1.92629 3.99998 2.00002 3.99998ZM0.999987 19V5.00002C0.999987 4.90205 1.02952 4.81317 1.05596 4.72364C2.38121 5.93658 6.38734 9.60145 8.98497 11.9636C6.39578 14.1877 2.38862 17.9868 1.05281 19.2606C1.02924 19.1756 0.999987 19.0924 0.999987 19ZM22 20H2.00002C1.92015 20 1.84913 19.9722 1.77455 19.9544C3.15488 18.6385 7.18755 14.8175 9.73123 12.6414C10.0628 12.9422 10.3657 13.2165 10.6045 13.4317C11.0166 13.8038 11.499 14 12 14C12.501 14 12.9834 13.8037 13.395 13.4321C13.6339 13.2169 13.937 12.9424 14.2688 12.6414C16.8127 14.8173 20.8448 18.638 22.2255 19.9544C22.1509 19.9722 22.08 20 22 20ZM23.0001 19C23.0001 19.0924 22.9708 19.1756 22.9473 19.2606C21.611 17.9862 17.6043 14.1875 15.0151 11.9637C17.6129 9.6015 21.6184 5.93695 22.9441 4.72355C22.9705 4.81308 23.0001 4.902 23.0001 4.99997V19Z"
                    fill="var(--iui3-color-text-text-default, #121212)"/>
              <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M-0.25 5.00002C-0.25 3.75888 0.758885 2.75 2.00002 2.75H22C23.2412 2.75 24.2501 3.75888 24.2501 5.00002V19C24.2501 20.2411 23.2412 21.25 22.0001 21.25H2.00002C0.758889 21.25 -0.25 20.2411 -0.25 19V5.00002ZM2.00002 3.25C1.03503 3.25 0.25 4.03502 0.25 5.00002V19C0.25 19.965 1.03502 20.75 2.00002 20.75H22.0001C22.965 20.75 23.7501 19.965 23.7501 19V5.00002C23.7501 4.03502 22.965 3.25 22 3.25H2.00002ZM11.4413 12.5032C9.57636 10.823 4.49207 6.17366 2.38946 4.24998L11.4413 12.5032ZM2.38946 4.24998H21.6103C19.5075 6.17405 14.4234 10.8233 12.5583 12.5037C12.4208 12.6276 12.2252 12.75 12.0001 12.75C11.775 12.75 11.5795 12.6276 11.4413 12.5032M1.833 3.77299C1.87529 3.7623 1.93303 3.74998 2.00002 3.74998H22.0001C22.067 3.74998 22.1246 3.76225 22.1669 3.77293C22.1938 3.77973 22.2089 3.78402 22.2209 3.78746C22.2342 3.79123 22.2438 3.79397 22.2615 3.79785L22.732 3.90121L22.3766 4.22645C20.6455 5.81077 14.9031 11.0641 12.893 12.8752L12.893 12.8752C12.7161 13.0345 12.4048 13.25 12.0001 13.25C11.5953 13.25 11.284 13.0345 11.1067 12.8747L11.1066 12.8747C9.0967 11.0639 3.35396 5.81029 1.62317 4.22656L1.26754 3.90115L1.73841 3.79792C1.75603 3.79406 1.76571 3.79131 1.77911 3.78749C1.79119 3.78405 1.80631 3.77975 1.833 3.77299ZM23.0705 4.26892L23.1839 4.65275C23.1861 4.6604 23.1886 4.66858 23.1912 4.67725C23.2147 4.75502 23.2501 4.87194 23.2501 4.99997V19C23.2501 19.1166 23.2174 19.2276 23.1971 19.2966C23.1937 19.308 23.1907 19.3183 23.1882 19.3273L23.0769 19.7297L22.7747 19.4415C21.4376 18.1663 17.4356 14.3722 14.8522 12.1533L14.6377 11.969L14.8469 11.7787C17.4443 9.41685 21.4496 5.75257 22.7753 4.53913L23.0705 4.26892ZM0.929527 4.26902L1.22474 4.53922C2.55003 5.75219 6.55588 9.4168 9.15317 11.7787L9.36244 11.969L9.14787 12.1533C6.56445 14.3724 2.56198 18.167 1.22534 19.4415L0.923391 19.7295L0.811905 19.3274C0.809423 19.3185 0.806396 19.3082 0.80303 19.2968C0.782701 19.2278 0.749987 19.1168 0.749987 19V5.00002C0.749987 4.872 0.785321 4.75513 0.808824 4.67739C0.811449 4.6687 0.813926 4.66051 0.81619 4.65284L0.929527 4.26902ZM15.3921 11.9587C17.775 14.0223 21.1988 17.2525 22.7501 18.7276V5.24001C21.2079 6.65121 17.7801 9.78628 15.3921 11.9587ZM1.24999 5.24009V18.7277C2.801 17.253 6.22506 14.0225 8.60798 11.9587C6.22015 9.78627 2.79191 6.65102 1.24999 5.24009ZM9.73607 12.3083L9.89919 12.4563C10.2307 12.757 10.5334 13.0311 10.7719 13.2459L10.772 13.2461C11.1435 13.5815 11.5677 13.75 12 13.75C12.4324 13.75 12.8566 13.5814 13.2275 13.2466L13.2277 13.2464C13.4662 13.0314 13.7691 12.7572 14.1009 12.4563L14.264 12.3083L14.4313 12.4515C16.9812 14.6325 21.0182 18.4579 22.398 19.7734L22.7308 20.0907L22.2836 20.1975C22.27 20.2008 22.2557 20.2047 22.2371 20.2099C22.2198 20.2147 22.1977 20.2209 22.175 20.2265C22.1288 20.238 22.0689 20.25 22 20.25H2.00002C1.93124 20.25 1.87133 20.238 1.82514 20.2265C1.8042 20.2213 1.78373 20.2156 1.76711 20.211L1.76303 20.2099C1.74442 20.2047 1.73009 20.2008 1.71647 20.1975L1.26922 20.0907L1.60205 19.7734C2.98143 18.4584 7.01902 14.6327 9.56871 12.4515L9.73607 12.3083ZM14.2734 12.9748C14.0056 13.2175 13.7617 13.4382 13.5624 13.6178C13.1101 14.026 12.5696 14.25 12 14.25C11.4304 14.25 10.8898 14.026 10.4371 13.6173C10.2379 13.4378 9.99424 13.2174 9.7267 12.9748C7.4027 14.9771 3.96008 18.2218 2.35188 19.75H21.6482C20.0398 18.2214 16.5975 14.9769 14.2734 12.9748Z"
                    fill="var(--iui3-color-text-text-default, #121212)"/>
          </g>
        </g>
      </svg>
      `,
    sms24x24: `
    <svg xmlns="http://www.w3.org/2000/svg" width="29" height="41" viewBox="0 0 29 41" fill="currentColor">
      <path d="M27.6392 11.9537H15.1621C14.8541 11.9537 14.5585 12.0763 14.3405 12.2941C14.1224 12.5122 14 12.8078 14 13.1158V23.396C14 23.7043 14.1224 23.9999 14.3405 24.2177C14.5585 24.4358 14.8541 24.5582 15.1621 24.5582H17.2694L17.2889 26.3593C17.2935 26.5728 17.4137 26.7671 17.6026 26.8668C17.6847 26.9108 17.7766 26.9332 17.8698 26.9327C17.9855 26.934 18.099 26.9003 18.1951 26.8357L21.5807 24.5579L27.6389 24.5582C27.9472 24.5582 28.2428 24.4358 28.4609 24.2177C28.6786 23.9999 28.801 23.7043 28.801 23.396V13.1269C28.8043 12.8167 28.6832 12.5181 28.4649 12.2976C28.2466 12.0772 27.9494 11.9531 27.6389 11.9531L27.6392 11.9537ZM27.6392 23.3967H21.4028C21.2871 23.3953 21.1736 23.4291 21.0775 23.4934L18.4395 25.2675V23.9697V23.97C18.4346 23.8152 18.3679 23.6687 18.2544 23.5633C18.1409 23.4577 17.9901 23.402 17.8353 23.4082H15.1239V13.128H27.612L27.6392 23.3967Z"
            fill="currentColor"/>
      <path d="M18.2257 16.654H24.8108C25.1315 16.654 25.3917 16.3941 25.3917 16.0731C25.3917 15.7521 25.1315 15.4922 24.8108 15.4922H18.2257C17.9047 15.4922 17.6445 15.7521 17.6445 16.0731C17.6445 16.3941 17.9047 16.654 18.2257 16.654Z"
            fill="currentColor"/>
      <path d="M18.2257 19.0381H24.8108C25.1315 19.0381 25.3917 18.7779 25.3917 18.4572C25.3917 18.1362 25.1315 17.876 24.8108 17.876H18.2257C17.9047 17.876 17.6445 18.1362 17.6445 18.4572C17.6445 18.7779 17.9047 19.0381 18.2257 19.0381Z"
            fill="currentColor"/>
      <path d="M18.2257 21.4131H22.1264C22.4474 21.4131 22.7073 21.1529 22.7073 20.8322C22.7073 20.5112 22.4474 20.251 22.1264 20.251H18.2257C17.9047 20.251 17.6445 20.5112 17.6445 20.8322C17.6445 21.1529 17.9047 21.4131 18.2257 21.4131Z"
            fill="currentColor"/>
      <path d="M20.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V38.5C1.5 39.0523 1.94772 39.5 2.5 39.5H20.5C21.0523 39.5 21.5 39.0523 21.5 38.5V28.75C21.5 28.3358 21.8358 28 22.25 28C22.6642 28 23 28.3358 23 28.75V38.5C23 39.8807 21.8807 41 20.5 41H2.5C1.11929 41 0 39.8807 0 38.5V2.5C0 1.11929 1.11929 0 2.5 0H20.5C21.8807 0 23 1.11929 23 2.5V9.25C23 9.66421 22.6642 10 22.25 10C21.8358 10 21.5 9.66421 21.5 9.25V2.5C21.5 1.94771 21.0523 1.5 20.5 1.5Z"
            fill="currentColor"/>
            <rect x="1" y="3.2998" width="21" height="1.5" fill="currentColor"/>
    <rect x="1" y="36.2998" width="21" height="1.5" fill="currentColor"/>
    </svg>
    `
  }
  _styleCss = `
@import url('https://ui.impact.com/theme-tokens/1.9.4/themes.css');
@import url('https://ui.impact.com/theme-tokens/1.9.4/index.css');
@import url('https://ui.impact.com/theme-tokens/1.9.4/fonts.css');
@import url('https://ui.impact.com/4.19.0/impactui.css');

:host {
    height: 100%;
}

*{
    box-sizing: border-box;
}
.d-block { display: block; }

.mt-24 { margin-top: 24px; }
.mt-4 { margin-top: 4px;}

.mb-24 { margin-bottom: 24px; }
.mb-8 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 4px; }

.mr-4 { margin-right: 4px; }

.two-fa-view-container {
    padding: 24px;
    height: 100%;
    min-height: 400px;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: var(--iui3-typography-font-family-font-family, Sarabun);
    color: var(--iui3-color-text-text-default, #121212);
}

.header {
    color: var(--iui3-color-text-text-default, #121212);
    font-feature-settings: 'liga' off, 'clig' off;
    /* Header */
    font-size: var(--iui3--font-size-header, 24px);
    font-style: normal;
    font-weight: 700;
    line-height: var(--iui3-line-height-header, 33px); /* 137.5% */
    text-transform: capitalize;
}
.description {
    color: var(--iui3-color-text-text-subdued, #696969);
    font-size: var(--iui3-font-size-description-text, 14px);
    font-style: normal;
    font-weight: 400;
    line-height: var(--iui30line-height-description-text, 18px); /* 128.571% */
}

.text-input {
    display: flex;
    height: var(--iui3-space-height-input-height-default, 40px);
    padding: 7px var(--iui3-space-padding-input-padding-leftright, 8px);
    align-items: center;
    gap: var(--iui3-space-gap-gap-default, 8px);
    align-self: stretch;
    border-radius: var(--iui3-space-radius-input-radius, 8px);
    border: 1px solid var(--iui3-color-border-border-interactive, #949494);
    width: 100%;
}

.text-input-label {
    color: var(--iui3-color-text-text-default, #121212);
    font-size: var(--iui3-font-size-field-label, 16px);
    font-style: normal;
    font-weight: 700;
    line-height: var(--iui3-line-height-field-label, 20px);
}

.field--error input.text-input{
    border-radius: var(--iui3-space-radius-input-radius, 8px);
    border: 1px solid var(--iui3-color-critical-border-critical, #C81426);
    background: var(--iui3-color-critical-background-critical-subdued, #FFDEDC);
}
.error-message {
    display: flex;
    align-items: center;
    margin-top: 4px;
    color: var(--iui3-color-critical-text-critical, #C81426);
    font-size: var(--iui3-font-size-help-text, 12px);
    font-style: normal;
    font-weight: 400;
    line-height: var(--iui3-line-height-help-text, 15px);
}

.resend-code-holder{
    color: var(--iui3-color-text-text-subdued, #696969);
    font-size: var(--iui3-font-size-description-text, 14px);

}
.resend-code-holder .span-header{
    color: var(--iui3-color-text-text-default, #121212);
    font-size: var(--iui3-font-size-regular-text, 14px);
    font-style: normal;
    font-weight: 400;
    line-height: var(--iui3-line-height-regular-text, 18px); /* 128.571% */
}

.resend-code-holder strong{
    color: var(--iui3-color-text-text-default, #121212);
}

.resend-code-holder .btn-span{
    cursor: pointer;
    outline: 0;
    border: 0;
    padding: 0;
    margin: 0;
    background: none;
    color: var(--iui3-color-text-text-default, #121212);
    text-decoration: underline;
    font-size: var(--iui3-font-size-description-text, 14px);
    font-weight: 600;
}

.footer{
    margin: 0 -24px;
    border-top: 1px solid var(--iui3-color-border-border-default, #CACFD3);
    padding: 16px 24px 0;
}
.continue-action-btn {
    outline: none;
    border: none;
    display: flex;
    width: 100%;
    height: var(--iui3-space-height-button-height-default, 40px);
    min-width: 65px;
    padding: 0 var(--iui3-space-padding-button-padding-leftright-default, 16px);
    justify-content: center;
    align-items: center;
    gap: var(--iui3-space-gap-gap-default, 8px);
    border-radius: var(--iui3-space-radius-button-radius, 9999px);
    background: var(--iui3-color-primary-button-primary-background-default, #121212);
    cursor: pointer;
}

.continue-action-btn span{
    color: var(--iui3-color-primary-button-text-on-primary-default, #FFF);
    text-align: center;
    font-family: var(--iui3-typography-font-family-font-family, Sarabun);
    font-size: var(--iui3-font-size-secondary-field-label, 14px);
    font-style: normal;
    font-weight: 600;

}

.continue-action-btn[disabled] {
    /*background: #94a3b8;*/
    background-color: var(--iui3-color-primary-button-disabled-background-default, #94a3b8);
    cursor: not-allowed;
}

  `

}

if (!customElements.get("two-fa-options")) {
  customElements.define("two-fa-options", TwoFaOptions);
}

export {TwoFaOptions};