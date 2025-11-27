<template>
  <div id="outer-container">
    <div id="inner-container">
      <h1>{{joinMember}}</h1>
      <p class="subtext">In order to join {{member}}, you must be a member of {{network}}. Choose an option below to continue.</p>
      <btn v-if="hasEmailLogin" class="styled-btn primary" @click="signUpWithEmailClicked" style="">
        <span>{{signUpWithEmailText}}</span>
      </btn>

      <div v-if="hasEmailLogin" class="dividing-lines"><span class="hr">{{or}}<span></span></span></div>

      <btn v-for="btn in ssoButtonsToDisplay" :class="{'ebay-sso-btn': (btn.value === 'EBAY' || btn.value === 'EBAY_CORP') }" class="styled-btn secondary" @click="signUpAuthBtnClicked(btn)" :key="btn.label" >
        <component :is="getIconName(btn)" class="styled-btn-icon" :color="getIconColor(btn)" />
        <span>{{btn.label}}</span>
      </btn>

      <div v-if="ssoButtonsToDisplay.length" class="dividing-lines"><span class="hr">{{or}}<span></span></span></div>

      <h2>{{alreadyHaveAccount}}</h2>

      <btn type="button" class="secondary" @click="login">{{signInBtn}}</btn>
    </div>
  </div>
</template>

<script>
import {Btn, Icon} from "@impactinc/ui-component-library"
import apple24x24 from "../../icons/icon-components/Apple24x24.vue"
import ebay24x24 from "../../icons/icon-components/Ebay24x24.vue";
import facebook24x24 from "../../icons/icon-components/Facebook24x24.vue"
import google24x24 from "../../icons/icon-components/Google24x24.vue"
import linkedIn24x24 from "../../icons/icon-components/LinkedIn24x24.vue"
import twitter24x24 from "../../icons/icon-components/Twitter24x24.vue"

export default {
  name: "SignUpOrLogIn",
  components: {apple24x24, Btn, ebay24x24, facebook24x24, google24x24, Icon, linkedIn24x24, twitter24x24},
  props: {
    enabledSsoProviders: {
      type: Array
    },
    hasEmailLogin: {
      type: Boolean
    },
    join: {
      type: String,
      default: "Join {0}"
    },
    member: {
      type: String
    },
    network: {
      type: String
    },
    signUpWithEmailText: {
      type: String,
      default: "Sign Up with Email"
    },
    signUpWithEmailUrl: {
      type: String
    },
    or: {
      type: String,
      default: "or"
    },
    loginUrl: {
      type: String,
      default: "/login.user"
    },
    alreadyHaveAccount: {
      type: String,
      default: "Already have an account?"
    },
    signInBtn: {
      type: String,
      default: "Sign In"
    }
  },
  methods: {
    getIconName(btn){
      console.log("inside iconName method", btn.value)
      if (btn.value === 'EBAY' || btn.value === 'EBAY_CORP') {
        console.log("icon is ebay24x24")
        return "ebay24x24"
      }
      return btn.metaData.conf.icon
    },
    getIconColor(btn){
      console.log("inside iconColor method")
      if (btn.value === 'EBAY' || btn.value === 'EBAY_CORP') {
        console.log("icon color is white")
        return "white"
      }
      return btn.metaData.conf.iconColor
    },
    login() {
      window.location.href = this.loginUrl
    },
    signUpWithEmailClicked(){
      window.location = this.signUpWithEmailUrl
    },
    signUpAuthBtnClicked(btn){
      window.location = btn.metaData.conf.loginUrl;
    }
  },
  computed: {
    joinMember(){
      return this.join.replace("{0}", this.member)
    },
    ssoButtonsToDisplay(){
      return this.enabledSsoProviders.filter(btn => btn.value !== "EMAIL")
    }
  },
  mounted(){
    console.log("Vue prop for enabledSsoProviders is:", this.enabledSsoProviders)
  }
}
</script>



<style lang="less" scoped>

#outer-container{
  background-color: var(--iui3-color-background-background-default, #FFFFFF);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--iui3-font-family-sans-v2) !important;
  height: 100vh;
  overflow: auto;
  color: var(--coal-black);

  #inner-container {
    max-width: 450px;
    width: 90%;
    display: flex;
    flex-direction: column;
    text-align: center;
    margin-top: 10%;

    h1 {
      font-size: var(--iui3-typography-font-size-header-desktop, 26px);
      font-weight: 700;
      margin-bottom: var(--iui-vertical-margin, 8px);
    }

    p.subtext {
      font-size: var(--iui-font-size-default, 14px);
      font-weight: 400;
      line-height: var(--iui3-typography-line-height-regular-text, 18px);
      margin-top: 0;
      margin-bottom: var(--iui3-space-gap-gap-large, 20px);
    }

    .dividing-lines {
      color: var(--serenity-gray, #CACFD3);
      display: flex;
      font-size: var(--iui-font-size-default, 14px);
      justify-content: center;
      line-height: var(--iui3-typography-line-height, 0px);
      margin-bottom: var(--iui3-space-gap-gap-large, 20px);
      margin-top: var(--iui3-space-gap-page-section-gap-default, 30px);
      position: relative;
      max-width: 450px;
      width: 100%;

      .hr:before,
      .hr:after {
        border-top: var(--iui-border-light, 1px solid #eaebed);
        content: ' ';
        display: inline-block;
        left: 0;
        height: 1px;
        margin: 0 10px 0 0;
        position: absolute;
        top: 1px;
        width: 170px;
      }

      .hr:after {
        left: 270px;
        margin: 0 0 0 10px;
      }
    }

    h2 {
      font-size: var(--iui3-typography-font-size-subheader-desktop, 18px);
      font-weight: 700;
      line-height: var(--iui-line-height-small, 24px);
      margin-top: 0;
      margin-bottom: var(--iui3-space-gap-gap-large, 20px);
    }

    .iui-component.iui-btn {
      margin-top: var(--iui3-space-gap-gap-default, 10px);

      &.secondary {
        margin-top: 0;
        margin-bottom: 10%;
      }

      &.styled-btn {
        border-color: var(--serenity-gray, #CACFD3);
        margin-bottom: var(--iui3-space-gap-page-section-gap-default, 30px);

        position: relative;

        span {
          font-size: var(--iui-font-size-default, 14px);
          font-weight: 600;
          line-height: var(--iui-line-height-small, 24px);
        }

        .styled-btn-icon {
          position: absolute;
          top: 50%;
          left: 25px;
          transform: translate(-50%, -50%);
          font-size: var(--iui-font-size-default, 14px);
        }

        &.ebay-sso-btn {
          border-color: #0064D2;
          background-color: #0064D2;
          color: white;
        }
      }
    }
  }
}


/* mobile device */


@media only screen and (max-width: 480px) {
  #outer-container {
    height: 80vh;

    #inner-container {
      .dividing-lines {
        max-width: 90vw;

        .hr:before,
        .hr:after {
          left: 0;
          width: 30vw;
        }

        .hr:after {
          left: 60%;
        }

      }
    }
  }

}

</style>
