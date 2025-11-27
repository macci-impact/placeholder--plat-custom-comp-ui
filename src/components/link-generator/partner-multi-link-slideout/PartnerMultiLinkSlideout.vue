<template>
  <div>
    <SideModal
      :is-open="show && isFailed"
      @close="closeAndRetry"
      width="500px"
      :class="{rtl: isRTL}"
    >
      <template #header>
        <Btn
          class="close closeSideModalBtn"
          size="regular"
          @click="onClose"
        >
          <Icon name="times"/>
        </Btn>
        <div/>
      </template>
      <template #content>

        <div class="error-modal__content">
          <h1>{{ errorMessages.title }}</h1>
          <span class="desc">{{ errorMessages.message }}</span>
          <img
            src="https://ui.assets.impact.com/platform-ui/custom-components/production/error-handle.png"
            alt="Error"
          />
        </div>
      </template>
    </SideModal>
    <div ref="generateLinksModalContainer" id="generateLinksModalContainer" @close="handleModalClose"/>
  </div>
</template>

<script>

import {isRTL, observeLangAttribute, parseJwt} from "../../../components/link-generator/utils.js";

import {SideModal, Icon, Btn} from "@impactinc/ui-component-library";
import translations from "./translations.json";



const MESSAGE_TITLE = "multi slideout";
export default {
  name: "PartnerMultiLinkSlideout",
  components: {SideModal, Icon, Btn},
  props: {
    eventListenerOptions: {
      type: Array,
      required: true
    },
    messages: {
      type: Object,
      required: true
    },
  },
  localMessages: translations,
  data() {
    return {
      selectedProgram: null,
      selectedProgramId: null,
      impactPrograms: [],
      campaignsList: [],
      autocompleteInputStr: "", // to be able to menage the original input value
      messages: {},
      show: false,
      params: {},
      modal: null,
      isFailed: false,
      lang: "en",
      langObserver: null
    };
  },
  async created() {
    console.log(MESSAGE_TITLE + " created");
    this.langObserver = observeLangAttribute((lang) => {
      this.lang = lang.replace("-", "_");
    });
    this.initSlideout();
  },
  beforeUnmount() {
    // Clean up the observer when the component is destroyed
    if (this.langObserver) {
      this.langObserver.disconnect();
    }
  },

  computed: {
    user() {
      const decodedToken = parseJwt(window._itoken_);
      return {
        jwt: window._itoken_,
        activeAccountId: decodedToken.iaid
      }
    },
    errorMessages() {
      const defaultTitle = "Unexpected Error";
      const defaultMessage = "An invalid response was received from the server. Please close the side panel and try again. We apologize for the inconvenience.";
      const titleKey = "mp.dashboard.create_a_link.error.slideout_title";
      const titleMessage = "mp.dashboard.create_a_link.error.slideout_message";
      return {
        title: this.messages?.[titleKey] || this.$options.localMessages?.[this.lang]?.[titleKey] || defaultTitle,
        message: this.messages?.[titleMessage] || this.$options.localMessages?.[this.lang]?.[titleMessage] || defaultMessage
      }

    },
    isRTL() {
      return isRTL(this.lang);
    }
  },
  methods: {
    onClose() {
      this.show = false;
      this.isFailed = false;
      if (this.modal) {
        this.modal.show = false;
      }
    },
    async initSlideout() {
      const isHavePermissions = await this.getIsHavePermissions();
      if (isHavePermissions) {
        try {
          await this.overrideSlideoutEvent();
          // create component after the script to be able to use vue props
          this.mountComponent();
          await this.loadComponent();
        } catch (error) {
          this.isFailed = true;
        }
      }
    },
    async loadComponent() {
      // ts - to disable cache
      const {load} = await import(
        /* @vite-ignore */
        `https://ui.impact.com/publisher-pro-linkgen-slideout/app/production/load/common.js?ts=${Date.now()}`
        );
      await load("bundle");
    },
    async getIsHavePermissions() {
      // Check if the user has permission to access the link generator
      const {jwt, activeAccountId} = this.user;
      const environment = window?.__envfriend?._imenvt_ || "production";

      let baseUrl = "https://app.impact.com";
      if (environment !== "production") {
        baseUrl = "https://member-ppx-1.gcp.srv-stage-impact.net";
      }
      try {
        const settings = await fetch(`${baseUrl}/secure/srv/publisher-pro-xp/MediaPartners/${activeAccountId}/BrowserExtSettings?itoken=${jwt}`, {
          headers: {
            'Authorization': "Bearer " + jwt,
          },
        })

        let settingsData = [];
        try {
          settingsData = await settings.json();
        } catch (error) {
          console.warn('No settings available:', error);
          return false
        }
        if (settingsData.length === 0) {
          return false;
        }
        const isMultiLinkEnabled = settingsData?.findIndex(
            (item) => item.settingName === "PARTNER_MULTINETWORK_LINK_GENERATOR" && item?.settingValue === "true"
        );

        return isMultiLinkEnabled !== -1;

      } catch (error) {
        console.warn('Unable to fetch settings:', error);
        return false;
      }

    },

    overrideSlideoutEvent() {
      return new Promise((resolve) => {
        const name = this.eventListenerOptions[0]

        document.removeEventListener(...this.eventListenerOptions)

        // Listen for the custom event to open the slideout
        // eslint-disable-next-line unicorn/prevent-abbreviations
        document.addEventListener(name, async (e) => {
          let {selectedItem, impactPrograms: programs, campaignsList, passedCampaign, autocompleteInputStr, messages, ...params} = e.detail.data;

          this.selectedProgram = selectedItem;
          this.selectedProgramId = passedCampaign
          this.impactPrograms = programs;
          this.campaignsList = campaignsList;
          this.autocompleteInputStr = autocompleteInputStr;
          this.messages = messages;
          this.show = true;
          this.params = params;
          if (this.modal) {
            this.modal.selectedProgram = this.selectedProgram;
            this.modal.selectedProgramId = this.selectedProgramId;
            this.modal.impactPrograms = this.impactPrograms;
            this.modal.campaignsList = this.campaignsList;
            this.modal.autocompleteInputStr = autocompleteInputStr;
            this.modal.messages = this.messages;
            this.modal.params = params;
            this.modal.show = true;
          }

          return resolve()
        });
      });

    },

    mountComponent() {
      if (document.querySelector('generate-links-modal')) {
        return;
      }
      const modal = document.createElement('generate-links-modal');

      modal.selectedProgram = this.selectedProgram;
      modal.selectedProgramId = this.selectedProgramId;
      modal.impactPrograms = this.impactPrograms;
      modal.campaignsList = this.campaignsList;
      modal.autocompleteInputStr = this.autocompleteInputStr;
      modal.show = true;
      modal.params = this.params;
      this.show = true;

      modal.close = () => {
        this.handleModalClose();
      };

      this.modal = modal;
      this.$refs.generateLinksModalContainer.append(modal);
    },

    handleModalClose() {
      this.modal.show = false;
      this.show = false;
    },
    closeAndRetry() {
      this.show = false;
      this.isFailed = false;
      this.modal.show = false;
      this.initSlideout();
    }
  },

};
</script>
<style lang="less">
.error-modal__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--iui3-space-padding-page-padding-desktop);
}

.error-modal__content h1 {
  color: var(--iui3-color-text-text-default, #121212);
  text-align: center;
  font-feature-settings: 'liga' off, 'clig' off;
  /* Subheader */
  font-family: var(--iui3-typography-font-family-font-family, Sarabun);
  font-size: var(--iui3-font-size-subheader, 18px);
  font-style: normal;
  font-weight: 600;
  line-height: var(--iui3-line-height-subheader, 23px); /* 127.778% */
  margin: 10px 0;
}

.error-modal__content .desc {
  color: var(--iui3-color-text-text-subdued, #818181);
  text-align: center;
  font-feature-settings: 'liga' off, 'clig' off;
  /* Description Text */
  font-family: var(--iui3-typography-font-family-font-family, Sarabun);
  font-size: var(--iui3-font-size-description-text, 14px);
  font-style: normal;
  font-weight: 400;
  line-height: var(--iui3-line-height-description-text, 18px); /* 128.571% */
  padding-bottom: 16px;
}

.error-modal__content img {
  max-width: 100%;
  height: auto;
}

.closeSideModalBtn {
  display: flex;
  width: var(--iui3-space-width-icon-button-width-default, 40px) !important;
  height: var(--iui3-space-height-button-height-default, 40px) !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 10px;
  border-radius: var(--iui3-radius-pill, 9999px) !important;
  border: 1px solid var(--iui3-color-border-border-default, #818181) !important;
  background: var(--iui3-color-background-background-default, #FFF) !important;
}

.closeSideModalBtn:hover {
  border-color: var(--coal-black);
}

.rtl {
  direction: rtl;
}
</style>
