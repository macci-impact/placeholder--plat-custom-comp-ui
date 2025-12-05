/**
 * TwoFaSendAndVerify Web Component
 *
 * This component manages the two-factor authentication flow:
 * 1. Shows verification options (SMS/Email) via <two-fa-options>
 * 2. Shows code verification via <two-fa-verify-mobile>
 *
 * Similar to Vue component structure:
 * - constructor() = data() + default state
 * - attributeChangedCallback() = watch/props changes
 * - connectedCallback() = mounted()
 * - _render() = template rendering
 * - getters/setters = computed properties
 */

class TwoFaSendAndVerify extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // State management (like Vue's data())
    this._viewOptions = {
      VERIFICATION_OPTIONS: 'verificationOptions',
      VERIFY_ON_MOBILE: 'phoneVerifyConfirm',
      VERIFY_ON_EMAIL: 'verifyCodeEmail',
      FRAUD: 'signUpFraud'
    };

    this._currentView = this._viewOptions.VERIFICATION_OPTIONS;
    this._labelsVerifyCode = {};
    this._uitkCsrf = "";
  }

  // Define which attributes to observe (like Vue props)
  static get observedAttributes() {
    return [
      "email",
      "number",
      "country",
      "uitk-csrf-token"
    ];
  }

  // Handle attribute changes (like Vue watch)
  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "uitk-csrf-token") {
      this._uitkCsrf = newValue || "";
    }
    this._render();
  }

  // Component mounted (like Vue's mounted())
  connectedCallback() {
    // Import the child web components
    this._importChildComponents();
    this._render();
    this._wireEvents();
  }

  // Import child web components
  _importChildComponents() {
    // Ensure TwoFaOptions is loaded
    if (!customElements.get('two-fa-options')) {
      const scriptId = 'two-fa-options-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = '/components-shared/two-fa/TwoFaOptions.js';
        document.head.appendChild(script);
      }
    }

    // Ensure TwoFaVerifyMobile is loaded
    if (!customElements.get('two-fa-verify-mobile')) {
      const scriptId = 'two-fa-verify-mobile-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = '/components-shared/two-fa/TwoFaVerifyMobile.js';
        document.head.appendChild(script);
      }
    }

    // Ensure TwoFaVerifyEmail is loaded
    if (!customElements.get('two-fa-verify-email')) {
      const scriptId = 'two-fa-verify-email-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = '/components-shared/two-fa/TwoFaVerifyEmail.js';
        document.head.appendChild(script);
      }
    }
  }

  // Render the template (like Vue's template)
  _render() {
    const email = this.getAttribute("email") || "";
    const number = this.getAttribute("number") || "";
    const country = this.getAttribute("country") || "";
    const labelsVerifyCodeJson = JSON.stringify(this._labelsVerifyCode);
    const styleCss = this._styleCss;

    // Conditional rendering (like v-if in Vue)
    const showOptions = this._currentView === this._viewOptions.VERIFICATION_OPTIONS;
    const showVerifyMobile = this._currentView === this._viewOptions.VERIFY_ON_MOBILE;
    const showVerifyEmail = this._currentView === this._viewOptions.VERIFY_ON_EMAIL;

    this.shadowRoot.innerHTML = /*html*/`
      <style>
        ${styleCss}
      </style>

      <div class="two-fa-view-container">
          
        ${showOptions ? /*html*/`
          <two-fa-options
            email="${email}"
            number="${number}"
            country="${country}"
            uitk-csrf-token="${this._uitkCsrf}"
            next-view-key="${this._viewOptions.VERIFY_ON_MOBILE}"
            style="height:100%"
          ></two-fa-options>
        ` : ''}

        ${showVerifyMobile ? /*html*/`
          <two-fa-verify-mobile
            labels='${labelsVerifyCodeJson}'
            email="${email}"
            number="${number}"
            country="${country}"
            uitk-csrf-token="${this._uitkCsrf}"
            style="height:100%"
          ></two-fa-verify-mobile>
        ` : ''}

        ${showVerifyEmail ? /*html*/`
          <two-fa-verify-email
            labels='${labelsVerifyCodeJson}'
            email="${email}"
            number="${number}"
            country="${country}"
            uitk-csrf-token="${this._uitkCsrf}"
            style="height:100%"
          ></two-fa-verify-email>
        ` : ''}
      </div>
    `;

    // Re-wire events after render
    this._wireEvents();
  }

  // Wire up event listeners (like Vue's @event handlers)
  _wireEvents() {
    const twoFaOptions = this.shadowRoot.querySelector('two-fa-options');
    const twoFaVerifyMobile = this.shadowRoot.querySelector('two-fa-verify-mobile');
    const twoFaVerifyEmail = this.shadowRoot.querySelector('two-fa-verify-email');

    // Listen to events from child components (like @message in Vue)
    if (twoFaOptions) {
      twoFaOptions.addEventListener('message', (e) => this._onMessage(e));
      twoFaOptions.addEventListener('viewChange', (e) => this._onViewChange(e));
    }

    if (twoFaVerifyMobile) {
      twoFaVerifyMobile.addEventListener('message', (e) => this._onMessage(e));
      twoFaVerifyMobile.addEventListener('success-validation', (e) => this._onVerifiedSuccess(e));
    }

    if (twoFaVerifyEmail) {
      twoFaVerifyEmail.addEventListener('message', (e) => this._onMessage(e));
      twoFaVerifyEmail.addEventListener('success-validation', (e) => this._onVerifiedSuccess(e));
    }
  }

  // Handle message events (like Vue methods)
  _onMessage(e) {
    const { status, message } = e.detail || {};

    if (this._currentView === this._viewOptions.VERIFICATION_OPTIONS) {
      console.log({ status, message });

      if (status === "success") {
        // Update labels for verify code view
        this._labelsVerifyCode = {
          description: message
        };
      } else if (status === "error") {
        // Emit error to parent or show notification
        this._emit("message", { status: "error", message });
      }
    }

    // Emit the message event to parent components
    this._emit("message", e.detail);
  }

  // Handle view change events (like Vue methods)
  _onViewChange(e) {
    this._currentView = e.detail;
    this._render();

    // Emit view change to parent components
    this._emit("viewChange", e.detail);
  }

  // Handle successful verification (like Vue methods)
  _onVerifiedSuccess(e) {
    console.log(e);
    alert("Code verified");

    // Emit success-validation to parent components
    this._emit("success-validation", e.detail);
  }

  // Emit custom events (like Vue's $emit)
  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  // Getters and setters (like Vue computed properties and props)
  get email() {
    return this.getAttribute("email") || "";
  }

  set email(val) {
    this.setAttribute("email", val ?? "");
  }

  get number() {
    return this.getAttribute("number") || "";
  }

  set number(val) {
    this.setAttribute("number", val ?? "");
  }

  get country() {
    return this.getAttribute("country") || "";
  }

  set country(val) {
    this.setAttribute("country", val ?? "");
  }

  get uitkCsrfToken() {
    return this._uitkCsrf;
  }

  set uitkCsrfToken(val) {
    this._uitkCsrf = val || "";
    this._render();
  }

  get contactDetails() {
    return {
      email: this.email,
      number: this.number,
      country: this.country
    };
  }

  set contactDetails(val) {
    if (val && typeof val === 'object') {
      if (val.email) this.email = val.email;
      if (val.number) this.number = val.number;
      if (val.country) this.country = val.country;
    }
  }

  // Styles (like Vue's <style> section)
  _styleCss = `
    @import url('https://ui.impact.com/theme-tokens/1.9.4/themes.css');
    @import url('https://ui.impact.com/theme-tokens/1.9.4/index.css');
    @import url('https://ui.impact.com/theme-tokens/1.9.4/fonts.css');
    @import url('https://ui.impact.com/4.19.0/impactui.css');

    :host {
      display: block;
    }

    .two-fa-view-container {
      height: 100%
      outline: 2px solid hotpink;
      height: 480px;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-family: var(--iui3-typography-font-family-font-family, Sarabun);
      color: var(--iui3-color-text-text-default, #121212);
    }
  `;
}

// Register the custom element (like Vue's component registration)
if (!customElements.get("two-fa-send-and-verify-webcomponent")) {
  customElements.define("two-fa-send-and-verify-webcomponent", TwoFaSendAndVerify);
}

export { TwoFaSendAndVerify };
