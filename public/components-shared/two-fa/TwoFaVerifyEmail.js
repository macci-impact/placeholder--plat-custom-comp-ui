class TwoFaVerifyEmail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    this.labelsDefault = {
      title: "Verify your email address",
      description: "A verification code has been sent to your email.",
      labelVerificationCode: "Verification code",
      labelContinue: "Continue",
      labelDidNotReceive: "Didn't receive a code?",
    };

    this._labels = {...this.labelsDefault};
    this._uitkCsrf = "";
    this._codeValue = "";
    this._errorMessage = "";

    this._render();
  }

  static get observedAttributes() {
    return [
      "labels",
      "uitk-csrf-token",
      "error-message",

      "email",
      "number",
      "country",
    ];
    // NOTE: email, number, country are not expected to change
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "labels") {
      try {
        const labelsObject = typeof val === "string" ? JSON.parse(newValue) : {...this._labels, ...newValue};
        this._labels = {...this.labelsDefault, ...labelsObject};
        // this._labels = JSON.parse(newValue);
      } catch { /* keep existing */
      }
    } else if (name === "uitk-csrf-token") {
      this._uitkCsrf = newValue || "";
    } else if (name === "code") {
      // keep both aliases; treat as the same source of truth
      this._codeValue = newValue || "";
    } else if (name === "error-message") {
      this._errorMessage = newValue || "";
    }


    this._render();
  }

  connectedCallback() {
    this._render();
    this._wireEvents();
  }

  // NOTE: You need getters and setters to make values reactive from outside (like vue-props)
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

  get errorMessage() {
    return this._errorMessage;
  }

  set errorMessage(val) {
    try {
      this._errorMessage = val || "";
    } catch (_) { /* ignore invalid parse */ }
    this._render();
  }


  _render() {
    const {title, description, labelVerificationCode, labelContinue, labelDidNotReceive} = this._labels;
    const errorMessage = this._errorMessage;
    const iconError = this._iconsSvg["error12x12"];
    const styleCss = this._styleCss;

    this.shadowRoot.innerHTML = /*html*/`
      <style>
        /*@import url('/components-shared/two-fa/two-fa.css');*/
         ${styleCss}
      </style>

      <div class="two-fa-verify-mobile two-fa-view-container">
        <div class="d-block">
          <div class="header d-block mb-8">${title}</div>
          <div class="description d-block mb-24">${description}</div>

          <div 
            class="field ${errorMessage.length ? 'field--error' : null}"
           >
            <label class="text-input-label d-block mb-8" for="input-code">${labelVerificationCode}</label>
            <input id="input-code" class="text-input" autocomplete="one-time-code" inputmode="numeric"/>
            ${
      errorMessage.length ?
        `<div class="error-message">
                        <span class="mr-4">${iconError}</span> 
                        ${errorMessage}
                </div>` : ``
    }
            <div class="resend-code-holder mt-24">
                <span class="span-header d-block mb-4">${labelDidNotReceive}</span>
                <div id="countdown" style="display: none">You can request a new code in <strong id="count-second"></strong> seconds.</div>
                <div id="check-spam-or-resend">Check your spam or <button id="resend-code-btn" class="btn-span">Resend code</button></div>
            </div>
          </div>
        </div>

        <div class="footer">
          <button class="continue-action-btn" disabled id="continue-btn">
            <span>${labelContinue}</span>
          </button>
        </div>
      </div>
    `;
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {detail, bubbles: true, composed: true}));
  }

  _wireEvents() {
    const input = this.shadowRoot.getElementById("input-code");
    const continueBtn = this.shadowRoot.getElementById("continue-btn");
    const resendCodeBtn = this.shadowRoot.getElementById("resend-code-btn");

    function isButtonDisabled(codeValue) {
      if (codeValue.length) {
        continueBtn.removeAttribute("disabled");
      } else {
        continueBtn.setAttribute("disabled", true);
      }
    }

    if (input) {
      input.oninput = (e) => {
        this._codeValue = e.target.value
        isButtonDisabled(this._codeValue)
      };
      input.onchange = (e) => {
        this._codeValue = e.target.value;
        isButtonDisabled(this._codeValue)
      };
    }

    if (resendCodeBtn) {
      resendCodeBtn.onclick = ()=>{
        this._sendVerification();
      }
    };
    if (continueBtn) {
      continueBtn.onclick = () => {
        // call validation using current attributes and code value
        this._validateCode();
      };
    }
  }

  _validateCode() {
    const number = this.getAttribute("number") || "";
    const country = this.getAttribute("country") || "";
    const email = this.getAttribute("email") || "";
    const code = this._codeValue || "";
    const nextViewKeyAttr = this.getAttribute("next-view-key") || null;

    return fetch("/signup/numberValidation/validateCode.json", {
      method: "POST",
      body: JSON.stringify({number, country, code, email}),
      headers: {
        "content-type": "application/json",
        uitk_csrf: this._uitkCsrf || "",
        "Is-Ajax-Request": "true",
      },
      credentials: "include",
    })
    .then((response) => {
      if (response.status === 429) {
        const errTryIn5 ="An error has occurred. Please try again in about 5 minutes."
        this._errorMessage = errTryIn5;
        this._render();
        alert(errTryIn5);
      }
      return response.json();
    })
    .then((json) => {
      console.log(json)
      if (json && json.content === "Done") {
        this._emit("message", {status: "success", message: json.Message || "Code verified."});
        this._emit("success-validation", json);
      } else {
        // emit error message
        const msg = (json && json.Message) ? json.Message : "The verification code is invalid.";
        console.log(204, "Error validating code", msg);
          this._errorMessage = msg;
          this._render();
        // this._emit("message", {status: "error", message: msg});
      }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      const errTryAgain = "There was a problem. Please try again. (Error 125)"
      console.log("Error validating code", e);
      this._errorMessage = errTryAgain;
      this._render();
      // this._emit("message", {status: "error", message: errTryAgain});
    });
  }

  _startCountdown(){
    const resendText = this.shadowRoot.getElementById("check-spam-or-resend");
    const countdownText = this.shadowRoot.getElementById("countdown");
    const countNum = this.shadowRoot.getElementById("count-second");

    resendText.style.display = "none";
    countdownText.style.display = "block";
    countNum.innerText = 30;
    const timer = setInterval(() => {
      countNum.innerText = countNum.innerText - 1;
      if (countNum.innerText == 0 ) {
        countdownText.style.display = "none";
        resendText.style.display = "block";
      }
    }, 1000);


  }
  async _sendVerification() {
    const country = this.getAttribute("country") || "";
    const email = this.getAttribute("email") || "";
    const number = this.getAttribute("number") || "";

    console.log("Sending verification code", country, email, number,  this._uitkCsrf );
    try {
      const res = await fetch("/signup/numberValidation/sendMobileValidationPin.json", {
        method: "POST",
        body: JSON.stringify({country, email, number, contactMethod: 'email'}),
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
      console.log(json)
      if (json.content === "Error") {
        if (json.allowAlternateMethod && json.alternateMethod === "email") {
          this._emit("viewChange", "signUpFraud");
        } else if (!json.allowAlternateMethod) {
          this._emit("viewChange", "signUpFraud");
        }
        this._emit("message", {status: "error", message: json.Message});
        return;
      }

      if (json.Message) {
        this._emit("message", {status: "success", message: json.Message});
      }

      if (json.VerificationChannel === "email") {
        this._startCountdown();
        // reset did not receive code countdown timer
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Error sending code", e);
      this._emit("message", {
        status: "error",
        message: "There was a problem sending the code. Please try again.",
      });
    }
  }


  _iconsSvg = {
      error12x12: `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6ZM6.57844 7.69964V1.86764H5.13844V7.69964H6.57844ZM5.85844 10.4356C6.12244 10.4356 6.34844 10.3436 6.53644 10.1596C6.72444 9.97564 6.81844 9.75564 6.81844 9.49964C6.81844 9.24364 6.72244 9.02764 6.53044 8.85164C6.33844 8.67564 6.11444 8.58764 5.85844 8.58764C5.59444 8.58764 5.36844 8.67964 5.18044 8.86364C4.99244 9.04764 4.89844 9.26764 4.89844 9.52364C4.89844 9.65164 4.92444 9.77164 4.97644 9.88364C5.02844 9.99564 5.09844 10.0916 5.18644 10.1716C5.27444 10.2516 5.37644 10.3156 5.49244 10.3636C5.60844 10.4116 5.73044 10.4356 5.85844 10.4356Z" fill="#C81426"/>
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
    background-color: var(--iui3-color-primary-button-disabled-background-default, #94a3b8);
    cursor: not-allowed;
}

  `
}


if (!customElements.get("two-fa-verify-email")) {
  customElements.define("two-fa-verify-email", TwoFaVerifyEmail);
}
export {TwoFaVerifyEmail};
