<template>
<div class="two-fa-outer-container">
    <loading-dots v-if="loading"/>
    <div v-else-if="!showVerificationOptionsScreen && !error" class="phone-code-container large-screen" >
        <div class="top-nav-logo-container">
            <div class="top-logo-container">
							<div class="logo-holder">
								<impact-logo v-if="isLogoImpactDefault"/>
								<img v-else :src="logoUrl"/>
							</div>
            </div>
        </div>
        <div class="title title-margin">{{title}}</div>
        <div class="subTitle" v-html="description"></div>
        <div class="code-container">
            <text-input v-model="code" :placeholder="title" @keydown.enter="verifyCode" />
        </div>
        <div class="save-device-container">
            <div class="save-device-checkbox">
                <field-label-pair :right-field-label="saveDeviceLabel" :label-tooltip="saveDeviceToolTip">
                    <checkbox v-model="saveDevice" :aria-label="saveDeviceLabel" />
                </field-label-pair>
            </div>
            <div class="device-name" v-if="saveDevice">
                <text-input v-model="deviceName" placeholder="Please enter a name for this device"/>
            </div>
        </div>
        <div class="resend-container">
            <div class="resend-desc">{{didntReceiveCode}}</div>
            <hyper-link @click="resendPressed">{{reSendCode}}</hyper-link>
        </div>

        <div class="footer">
            <div v-if="otherVerificationOptions.length" class="alternative" @click="verifyWithOtherOptionsClicked" v-html="otherOptionsLabel"></div>
            <btn class="primary verify" @click="verifyCode" :is-disabled="!isVerifyBtnEnabled">{{verifyLabel}}</btn>
        </div>
    </div>


    <div v-else-if="!error" class="phone-code-container large-screen verify-options" >
        <div class="back-btn-container">
            <div @click="goBack" class="arrow-container"><icon name="arrow-left"/></div>
            <div class="logo-wrapper">
                <div class="logo-container">
									<div class="logo-holder">
										<impact-logo v-if="isLogoImpactDefault"/>
										<img v-else :src="logoUrl"/>
									</div>
                </div>
            </div>
        </div>
        <div class="title">{{verificationOptionsTitle}}</div>
        <div class="subTitle">{{verificationOptionsSubTitle}}</div>

        <div class="options-container">
            <div v-for="option in otherVerificationOptions"
                 :key="option.contactMethod"
                 @click="optionClicked = option.contactMethod"
                 :class="['option-btn', {'selected': optionClicked === option.contactMethod}]"
            >
                <icon :name="getIconName(option.contactMethod)"/>
                <div>{{option.label}}</div>
            </div>
        </div>

        <div class="footer">
            <btn :is-disabled="!optionClicked" class="primary continue" @click="continueToSelectedOption">{{continueLabel}}</btn>
        </div>

    </div>


    <div v-if="error" class="phone-code-container large-screen error-display">
        <div class="back-btn-container">
            <div @click="goBack" class="arrow-container"><icon name="arrow-left"/></div>
            <div class="logo-wrapper">
                <div class="logo-container">
									<div class="logo-holder">
										<impact-logo v-if="isLogoImpactDefault"/>
										<img v-else :src="logoUrl"/>
									</div>
                </div>
            </div>
        </div>
        <div class="error-container">
            <icon name="exclamation-circle" />
            <div class="error-msg">{{error}}</div>
        </div>

    </div>

</div>
</template>

<script>
import { Btn, Checkbox, Icon, FieldLabelPair, LoadingDots, TextInput, HyperLink, Tooltip } from "@impactinc/ui-component-library";
import ImpactLogo from "./../general/ImpactLogo.vue";

export default {
    name: "LoginTwoFa",
    components: { Btn, Checkbox, Icon, FieldLabelPair, LoadingDots, TextInput, HyperLink, Tooltip, ImpactLogo},
    props: {
        preSavedDeviceName: String,
        saveDeviceLabel: {
          type: String,
          default: "Remember this device"
        },
        saveDeviceToolTip: {
          type: String,
          default: "For your security, don’t save this device when using shared or public computers."
        },
        title: {
            type: String,
            default: "Enter your code"
        },
        verificationOptionsTitle: {
            type: String,
            default: "Verification Options"
        },
        verificationOptionsSubTitle: {
            type: String,
            default: "impact.com wants to help keep your account safe, select a verification option to continue."
        },
        didntReceiveCode: {
            type: String,
            default: "Didn't receive the code?"
        },
        reSendCode: {
            type: String,
            default: "Resend code"
        },
        otherOptionsLabel: String,
        allVerificationOptions: Object,
        preferredMethod: String,
        verifyLabel: {
            type: String,
            default: "Verify"
        },
        continueLabel: {
            type: String,
            default: "Continue"
        },
        logoUrl: String,
        csrfToken: String,
    },
    data(){
        return {
            code: undefined,
            showVerificationOptionsScreen: false,
            selectedOption: undefined,
            loading: false,
            saveDevice: true,
            deviceName: this.preSavedDeviceName || undefined,
            error: undefined,
            optionClicked: undefined,
            verifyBtnClicked: false,
        }
    },
    watch: {
        saveDevice(val){
            if (!val) {
                this.deviceName = undefined
            }
        }
    },
    methods: {
        verifyWithOtherOptionsClicked(){
            this.code = undefined
            this.optionClicked = undefined
            this.showVerificationOptionsScreen = true
        },
        continueToSelectedOption(e){
            e.preventDefault()
            this.sendCode(this.optionClicked)
            this.showVerificationOptionsScreen = false
            this.selectedOption = this.optionClicked
        },
        resendPressed(){
            let contactMethod = this.selectedOption || this.preferredMethod
            console.log("resend code for", contactMethod)
            this.sendCode(contactMethod)
        },
        verifyCode(){
            this.verifyBtnClicked = true
            this.loading = true
            let formData = new FormData()
            formData.append("code", this.code)
            formData.append("saveDevice", this.saveDevice)
            formData.append("deviceName", this.deviceName)

            fetch("/secure/device/doverify.json", {
                method: 'POST',
                headers: {
                    uitk_csrf: this.csrfToken
                },
                body: new URLSearchParams(formData)
            })
                .then(response => response.json())
                .then(res => {
                    if (res.Status !== "SUCCESS"){
                        this.error = res.Message
                        this.verifyBtnClicked = false
                        this.loading = false
                    } else {
                        window.location= res.redirectUrl
                    }
                })
        },
        goBack(){
            this.showVerificationOptionsScreen = false
            this.optionClicked = undefined
            this.error = undefined
        },
        sendCode(contactMethod){
            console.log("sendCode", contactMethod)
            this.loading = true
            let url = "/secure/device/auth.json?contactMethod=" + contactMethod
            fetch(url, {
                method: 'POST',
                headers: {
                    uitk_csrf: this.csrfToken
                },
            })
            .then(response => response.json())
            .then(res => {
                if (res.Status !== "SUCCESS"){
                    this.error = res.Message
                    this.loading = false
                } else {
                    this.loading = false
                }
            })
        },
        getIconName(option){
            let name = ""
            switch (option) {
                case "sms":
                    name  = "mobile-message"
                    break
                case "app":
                    name  = "mobile"
                    break
                case "email":
                    name  = "envelope"
                    break
            }
            return name
        }
    },
    computed: {
        otherVerificationOptions(){
            if (this.selectedOption) {
                return this.allVerificationOptions.filter(option => option.contactMethod !== this.selectedOption)
            }
            return this.allVerificationOptions.filter(option => option.contactMethod !== this.preferredMethod)
        },
        isVerifyBtnEnabled(){
          if (this.verifyBtnClicked) {
              return false
          }
          return this.saveDevice ? this.deviceName && this.code : this.code
        },
        description(){
            if (this.selectedOption) {
                let option = this.allVerificationOptions.find(o => o.contactMethod === this.selectedOption)
                return option?.subTitle
            } else {
                let option = this.allVerificationOptions.find(o => o.contactMethod === this.preferredMethod)
                return option?.subTitle
            }
        },
				isLogoImpactDefault(){
					return this.logoUrl?.endsWith("impact-logo-black.svg");
				}
    },
    mounted(){
        this.sendCode(this.preferredMethod)
    }
}

</script>
<style>
.app-page:has(.two-fa-outer-container) {
  background-color: var(--iui3-color-background-background-default);
}
</style>
<style scoped lang="less">

.two-fa-outer-container {
    color: var(--iui3-color-text-text-default, #121212);
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .phone-code-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 580px;
        max-height: 80vh;
        overflow: auto;

        &.large-screen {
            border: var(--iui-border-default, 1px solid #DADADA);
            border-radius: var(--iui-border-radius-default, 8px);
            box-shadow: 0px 2px 4px 0px #00000021;
            width: 685px;
        }

        .top-nav-logo-container {
            padding: var(--iui3-space-gap-gap-large, 19px 20px);
            border-bottom: var(--iui-border-default, 1px solid #DADADA);
            display: flex;
            justify-content: center;
            width: 100%;
            box-sizing: border-box;

            .top-logo-container {
                width: 120px;
                max-height: 30px;

                img {
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .title {
            font-size: var(--iui3-typography-font-size-header-desktop, 24px);
            font-weight: 700;
            line-height: var(--iui3-typography-line-height-header-desktop, 30px);
            text-align: center;
            margin-bottom: var(--iui-horizontal-margin, 10px);
        }

        .subTitle {
            font-size: var(--iui-font-size-default, 14px);
            font-weight: 400;
            line-height: var(--iui3-typography-line-height-description, 18px);
            text-align: center;
            color: var(--iui3-color-text-text-subdued, #6c7784);
            /* TODO: there is no margin / padding variable with 0 value */
            margin-bottom: 0;
        }

        .title-margin {
            margin-top: var(--iui3-space-padding-page-padding-desktop, 30px);
        }

        .code-container {
            width: 100%;
            text-align: center;
            margin: var(--iui3-space-padding-page-padding-desktop, 30px) 0 0 0;
        }

        .save-device-container {
            margin-bottom: var(--iui3-space-padding-page-padding-desktop, 30px);
            text-align: center;

            .save-device-checkbox {
              padding: var(--iui3-space-gap-gap-default) 0;
            }
        }

        .resend-container {
            /* TODO - no variable for this */
            margin-bottom: 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .resend-desc {
                font-size: var(--iui-font-size-default, 14px);
                font-weight: 600;
                line-height: var(--iui-line-height-small, 24px);
                text-align: center;
            }
        }

        .footer {
            text-align: center;
            width: 100%;

            .alternative {
                color: var(--strata-blue);
                font-size: var(--iui-font-size-default, 14px);
                font-weight: 600;
                line-height: var(--iui-line-height-small, 24px);
                margin-bottom: var(--iui3-space-padding-page-padding-desktop, 30px);
                cursor: pointer;
            }

            button.iui-btn {
                min-width: var(--col-3-12);
            }
        }

        &.verify-options {
            justify-content: flex-start;

            .title {
                margin-top: var(--iui3-space-padding-page-padding-desktop, 30px);
            }

            .footer {
                margin-top: var(--iui3-space-padding-page-padding-desktop, 30px);
            }
        }

        .back-btn-container {
            padding: var(--iui3-space-padding-selector-padding-default) var(--iui3-space-gap-gap-large);
            border-bottom: var(--iui-border-default, 1px solid #DADADA);
            display: flex;
            align-items: center;
            width: 100%;
            box-sizing: border-box;

            .arrow-container {
                cursor: pointer;
                border-radius: 100%;
                border: var(--iui-border-default, 1px solid #DADADA);
                height: 38px;
                width: 38px;
                display: flex;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
            }

            .logo-wrapper {
                width: calc(100% - 40px - 38px);
                display: flex;
                justify-content: center;

                .logo-container {
                    width: 120px;
                    max-height: 30px;
                    img {
                        width: 100%;
                        height: 100%;
                    }
										:deep(.impact-logo) {
											width: 100%;
											height: 100%;
										}
                }
            }
        }

        .options-container {
            display: flex;
            flex-direction: column;
            gap: var(--iui3-space-gap-gap-default, 10px);
            margin-top: var(--iui3-space-padding-page-padding-desktop, 30px);

            .option-btn {
                width: var(--col-3-12);
                min-width: fit-content;
                border: var(--iui-border-light, 1px solid #EAEBED);
                border-radius: var(--iui-border-radius-default, 8px);
                display: flex;
                align-items: center;
                padding: var(--iui3-space-gap-gap-large, 20px);
                font-size: var(--iui-font-size-default, 14px);
                font-weight: 700;
                line-height: var(--iui-line-height-small, 24px);
                gap: var(--iui3-space-gap-gap-default, 10px);

                .iui-icon {
                    width: 28px;
                    &.envelope {
                        height: var(--iui-icon-large);
                    }

                    &.mobile-message {
                        height: 26px;
                    }

                    &.mobile {
                        height: 26px;
                    }
                }

                &.selected {
                    border-color: var(--coal-black, #2d3e50);
                }
            }
        }

        &.error-display {

            .error-container {
                margin-top: var(--iui3-space-gap-page-section-gap-default, 30px);
                display: flex;
                gap: var(--iui3-space-gap-gap-default, 10px);
                align-items: center;
                justify-content: center;
                width: 100%;

                .iui-icon {
                    color: var(--error-red);
                    height: var(--iui-icon-large);
                    width: var(--iui-icon-large);
                }

                .error-msg {
                    color: var(--error-red);
                }
            }
        }
    }

}

/* mobile device */

@media only screen and (max-width: 480px) {
    .iui-form-page .iui-web-form .iui-form-section:not(.subFormSection) {
        padding: 0 !important;
    }

    .two-fa-outer-container {
        width: 100%;
        align-items: flex-start;
    }

    .two-fa-outer-container .phone-code-container.large-screen.verify-options,
    .two-fa-outer-container .phone-code-container.large-screen {
        border: none;
        border-radius: var(--iui-border-radius-default, 8px);
        box-shadow: unset;
        padding: 0 !important;

        .iui-text-input,
        .iui-btn.primary.verify {
            width: 100%;
        }
    }
}

</style>
