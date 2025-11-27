<template>
  <div class="linkGeneratorWidget">
    <div class="widgetHeading mainHeading">
      {{heading}}
    </div>
    <div v-if="!isAdvertiser" class="description descriptionMargin">
      {{translations['create_link_menu.description.promote_brand']}}
    </div>
    <div v-if="loading">
      <div class="loading-position">
        <div class="loader">
          <loading-dots class="dots-position" />
        </div>
      </div>
    </div>
    <div v-else-if="!disabled">

      <div class="margin15OnTop" v-if="!isAdvertiser" >
        <field-label-pair :main-label="translations['create_link_menu.heading.campaigns']">
          <multi-select-input ref="cmpInput" class="full-width" v-model="campaign" :items="context.campaigns" is-single-select close-on-select static-searchable />
        </field-label-pair>
      </div>
      <div class="margin15OnTop" v-else>
        <field-label-pair :main-label="translations['create_link_menu.heading.publishers']">
          <multi-select-input ref="cmpInput" class="full-width" is-single-select :placeholder="partnerName" is-disabled />
        </field-label-pair>
      </div>

      <div v-if="allowsDeepLinking" class="widgetHeading margin15OnTop">
        <field-label-pair :main-label="translations['create_link_menu.enter_landing_placeholder']">
          <input class="fullWidth" type="text" :placeholder="translations['create_link_menu.enter_landing_url']" v-model="landing" autocomplete="off"/>
        </field-label-pair>
      </div>

      <div class="advanced" ref="advCt" :style="{height: container1height }">
        <table class="inputsTable fullWidth" >
          <tr><td>{{translations['mp_ad_search_get_code.value_sub_id1']}}:</td><td><input class="fullWidth" type="text" v-model="advanced.subId1"></td></tr>
          <tr><td>{{translations['mp_ad_search_get_code.value_sub_id2']}}:</td><td><input class="fullWidth" type="text" v-model="advanced.subId2"></td></tr>
          <tr><td>{{translations['mp_ad_search_get_code.value_sub_id3']}}:</td><td><input class="fullWidth" type="text" v-model="advanced.subId3"></td></tr>
          <tr><td>{{translations['mp_ad_search_get_code.value_sub_id4']}}:</td><td><input class="fullWidth" type="text" v-model="advanced.sharedId"></td></tr>
          <tr><td>{{translations['mp_ad_search_get_code.value_media_property']}}:</td><td>
            <multi-select-input class="full-width" v-model="propertyId" :items="context.properties" is-single-select close-on-select />
          </td></tr>
        </table>
      </div>

      <div>
        <table class="fullWidth">
          <tr>
            <td>
              <btn type="button" @click="createClicked" class="primary linkGeneratorBtn">{{translations['create_link_menu.btn.create']}}</btn>
            </td>
            <td  class="right">
              <a @click="toggleAdvanced" v-text="advancedToggled ? translations['create_link_menu.btn.hide'] : translations['create_link_menu.btn.advanced']" :style="linkStyle"></a>
            </td>
          </tr>
        </table>
      </div>


      <div class="linkSection" :key="this.updateKey">
        <template v-if="id || directLinkTracking">
          {{translations['create_link_menu.deep_link.promote']}} <span v-if="context && context._mappings && context._mappings.campaigns">{{context._mappings.campaigns[campaign].label}}</span>
          <em>{{translations['create_link_menu.deep_link.disclaimer']}}</em>

          <div class="linkContainer">
            <label class="linkDropdown">
              <multi-select-input class="linkHttps" is-single-select v-model="protocol" :items="protocolOptions" close-on-select />
            </label>
            <url-edit class="linkInput" :disableEdit="disableEditing || directLinkTracking" :link-value="linkValue" @saveClick="renameClick" :clipboardPrefix="protocol" :messages="translations" @notification="doNotification"></url-edit>
          </div>

          <div class="fullWidth right shareSection">
            {{translations['create_link_menu.social.share']}}
            <icon v-if="!isAdvertiser" name="facebook-color" @click="share($event, 'facebook')" />
            <icon v-if="!isAdvertiser" name="x-dot-com-color" @click="share($event, 'twitter')" />
            <icon name="qr-code" @click="share($event, 'qrcode')" />
          </div>
        </template>
        <template v-else>
          {{translations['mp.dashboard.create_a_link.no_link']}}
        </template>

      </div>

    </div>

    <div v-else>
      <div class="margin15OnTop no-campaigns-text">{{translations['create_link_menu.message_no_campaigns']}}</div>
    </div>
    <qr-modal :messages="translations" :url="qrUrl" :is-open="qrOpen" @qrClose="qrOpen = false" class="qr-modal"/>
    <notification :anchor="notification.anchor" :emoji="notification.emoji" :is-open="notification.isOpen" @close="notification = {}">{{notification.message}}</notification>
  </div>
</template>

<script>

import localMessages from "./translations.json";

import {isValidHexColor, responseCheck, observeLangAttribute} from './utils.js';

import { Btn, MultiSelectInput, Icon, FieldLabelPair, isFalsey, LoadingDots, Notification } from "@impactinc/ui-component-library";
import UrlEdit from "../link-generator/UrlEdit.vue";
import QrModal from "../link-generator/QrModal.vue";

export default {
  name: "LinkGeneratorWidget",
  components: { Btn, FieldLabelPair, Icon, LoadingDots, MultiSelectInput, UrlEdit, QrModal, Notification },
  props: {
    csrf: String,
    branding: Object,
    messages: Object,
    context: {
      type: Object,
      default () {
        return {
          campaigns: [],
          properties: []
        }
      }
    },
    passedCampaign: Number,
    tableContext: Object
  },
  data: function () {
    return {
      qrUrl: null,
      qrOpen: false,
      loading: true,
      disabled:false,
      protocolOptions: [
        {
          label: 'https://',
          value: 'https://'
        }
      ],
      id:'',
      campaign:this.passedCampaign,
      allowsDeepLinking: false,
      landing: "",
      propertyId: '',
      notification: {
        anchor: window.document.body
      },
      advanced: {
        subId1:"",
        subId2:"",
        subId3:"",
        sharedId:"",
      },
      linkValue: '',
      trackingUrl: '',
      protocol:'https://',
      directLinkTracking: false,
      disableEditing: false,
      EXPANDED_CONTAINER_HEIGHT: 'auto',
      advancedToggled: false,
      container1height: 0,
      linkStyle: {
        color: 'var(--iui3-color-text-text-interactive, #14B1F7)',
        'text-decoration': 'none',
        cursor: 'pointer',
        'font-size': 'var(--iui3-typography-font-size-text-link, 14px)'
      },
      updateKey: 0,

      lang: "en_US",
      langObserver: null
    }
  },
  watch: {
    campaign : function (nv) {
      this.getCampaignData(nv);
    }
  },
  mounted() {

    this.langObserver = observeLangAttribute((lang) => {
      this.lang = lang.replace("-", "_");
    });

    let brandedOptions = this.branding || {};
    if(isValidHexColor(brandedOptions.linkColor)) {
      this.linkStyle.color = brandedOptions.linkColor;
    }

    if(!this.isAdvertiser) {
      fetch("/secure/nositemesh/publisher/link/campaignOptions.json", {
        method: 'GET',
        credentials: 'include',
        headers: this.fetchHeaders
      })
          .then(responseCheck.bind(this))
          .then(function (value) {
            if (value === undefined) {
              return;
            }
            this.context.campaigns = value;
            if (value.length > 0) {
              this.campaign = this.passedCampaign || value[0].value
              this.loading = false;
              this.context._mappings = this.extractMappings({campaigns: value});
            } else {
              this.loading = false;
              this.disabled = true;
            }
          }.bind(this));
}
  else {
      this.getCampaignData(this.passedCampaign);
      this.loading = false;
    }



    const propertyUrl = this.isAdvertiser ? "/secure/nositemesh/advertiser/mediakit/mediaPropertyOptions.json?partnerId=" + this.partnerId
        : "/secure/nositemesh/publisher/mediakit/mediaPropertyOptions.json";
    fetch(propertyUrl, {
      method: 'GET',
      credentials: 'include',
      headers: this.fetchHeaders
    })
        .then(responseCheck.bind(this))
        .then(function (value) {
          if(value === undefined) {
            return;
          }
          this.context.properties = value;

        }.bind(this))
  },
  methods: {
    getCampaignData: function (cid) {
      if(cid) {
        const url = this.isAdvertiser ? "/secure/nositemesh/advertiser/link/shortLink.json?partnerId=" +  this.partnerId
            : "/secure/nositemesh/publisher/link/shortLink.json?cid="+(cid);
        fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: this.fetchHeaders
        })
            .then(responseCheck.bind(this))
            .then(function (value) {
              if(value === undefined) {
                return;
              }
              this.id = value.id;
              this.campaign = this.campaign || value.campaign || this.passedCampaign;
              this.landing = value.landing;
              this.advanced.subId1 = value.advanced.subId1;
              this.advanced.subId2 = value.advanced.subId2;
              this.advanced.subId3 = value.advanced.subId3;
              this.advanced.sharedId = value.advanced.sharedId;
              this.linkValue = value.linkValue;
              this.trackingUrl = value.trackingUrl;
              this.allowsDeepLinking = value.allowsDeepLinking;
              this.directLinkTracking = value.directLinkTracking;
              this.updateKey++;
            }.bind(this));
          this.loading = false;
      }
    },
    extractMappings: function(dropdowns) {
      let dropdownsMap = {};
      for (let k in dropdowns) {
        if (Array.isArray(dropdowns[k])) {
          dropdowns[k].forEach(
              function (it) {
                dropdownsMap[k] = dropdownsMap[k] ? dropdownsMap[k] : {};
                dropdownsMap[k] [it.value] = it;
              }
          )
        }
      }
      return dropdownsMap;
    },
    toggleAdvanced: function () {

      if(this.advancedToggled) {
        this.advancedToggled = false;
        this.container1height = 0;
      } else {
        this.$refs.advCt.scrollTop = 0;
        this.advancedToggled = true;
        this.container1height = this.EXPANDED_CONTAINER_HEIGHT;
      }
    },
    share: function (ctx, media) {
      let url = encodeURIComponent('https://' + this.linkValue);
      switch(media) {
        case "facebook": {
          window.open('https://www.facebook.com/sharer.php?u='+url, '_blank');
          break;
        }
        case "twitter": {
          window.open('https://www.twitter.com/intent/tweet?url='+url+'&text=Check%20this%20out!', '_blank');
          break;
        }
        case "qrcode": {
          this.qrUrl = 'https://' + this.linkValue;
          this.qrOpen = true;
        }

      }
    },
    createClicked: function () {
      const url = this.isAdvertiser ? "/secure/nositemesh/advertiser/" + this.partnerId + "/link/shortLink.json"
          : "/secure/nositemesh/publisher/link/shortLink.json";
      fetch(url, {
        credentials: 'include',
        method: 'POST',
        body: this.dataModel,
        headers: this.fetchHeaders
      })
          .then(responseCheck.bind(this))
          .then(function (value) {
            if(value === undefined) {
              return;
            }
            this.id = value.id;
            this.linkValue = value.linkValue;
            this.trackingUrl = value.trackingUrl;
            this.allowsDeepLinking = value.allowsDeepLinking;
            this.directLinkTracking = value.directLinkTracking;
            this.updateKey++;
            this.doNotification('Generated');
          }.bind(this))
          .catch(this.whoops);
    },
    doNotification(message, emoji = '👍') {
      this.notification = {
        anchor: window.document.body,
        message: message,
        emoji: emoji,
        isOpen: true
      };
    },
    whoops: function() {
      return this.translations['create_link_menu.whoops'];
    },
    renameClick: function (value) {
      this.linkValue = value;
      fetch("/secure/nositemesh/publisher/link/renameLink.json", {
        credentials: 'include',
        method: 'POST',
        body: this.dataModel,
        headers: this.fetchHeaders
      })
          .then(responseCheck.bind(this))
          .then(function (value) {
            if(value === undefined) {
              return; // TODO
            }
            //TODO - validate
            this.disableEditing = true;

          }.bind(this))
          .catch(this.whoops);
    }
  },
  computed: {
    localCsrf() {
      return this.csrf || window.getCsrfToken();
    },
    translations() {
      return this.messages || localMessages[this.lang] || localMessages['en'];
    },
    fetchHeaders() {
      return {
        "Content-Type": "application/json",
        'Is-Ajax-Request': true,
        "uitk_csrf": this.localCsrf
      };
    },
    partnerId() {
      return this.tableContext ? this.tableContext[1]['modalData'].publisherId : null;
    },
    partnerName() {
      return this.tableContext ? this.tableContext[1]['modalData']['pubParams.name'] : null;
    },
    isAdvertiser() {
      return !isFalsey(this.passedCampaign) && !isFalsey(this.partnerId);// if has passedCampaign and no partnerId === advertiser
    },
    dataModel: function() {
      return JSON.stringify({
        id:this.id,
        campaign:this.campaign || this.passedCampaign,
        allowsDeepLinking: this.allowsDeepLinking,
        landing: this.landing,
        advanced: {
          subId1:this.advanced.subId1,
          subId2:this.advanced.subId2,
          subId3:this.advanced.subId3,
          sharedId:this.advanced.sharedId,
          propertyId:this.propertyId
        },
        trackingUrl: this.trackingUrl,
        directLinkTracking: this.directLinkTracking,
        linkValue: this.linkValue,
        protocol:this.protocol
      });
    },
    heading() {
      return this.context.heading === undefined ? this.translations['create_link_menu.title'] : this.context.heading
    }
  },

  beforeUnmount() {
    // Clean up the observer when the component is destroyed
    if (this.langObserver) {
      this.langObserver.disconnect();
    }
  },
}
</script>

<style lang="less" scoped>
.loading-position {
  position: relative;
}
.dots-position {
  position: absolute;
}
.linkGeneratorWidget {
  box-sizing: border-box;
  font-size: var(--iui3-typography-font-size-regular-text, 14px);
  div.qr-modal.iui-modal .modal-screen {
      z-index: calc(var(--iui-z-index-overlay) + 200);
  }
  div.qr-modal.iui-modal .modal-container {
      z-index: calc(var(--iui-z-index-modal) + 100);
  }
  .mainHeading {
    font-weight: normal;
    text-transform: uppercase;
    /* TODO - confirm font size for heading here, for now using heading font size token */
    font-size: var(--iui3-typography-font-size-header, 16px);
    color: var(--iui3-color-text-text-default, #2d3e50);
    height: auto;
    /* TODO - confirm line height for heading here, for now using heading line height token */
    line-height: var(--iui3-typography-line-height-header, 16px);
    overflow: hidden;
  }

  .loader {
    position: absolute;
    /* TODO - confirm #F2F3F4 for replacement */
    background-color: var(--iui3-color-background-background-subdued, #F8FAFB);
    height: 100%;
    width: 100%;
    text-align: center;
  }

  .description, .no-campaigns-text {
    color: var(--storm-gray)
  }

  .descriptionMargin {
    margin-bottom: var(--iui3-space-gap-gap-large, 20px);
  }

  .shareSection {
    vertical-align: middle;
    line-height: var(--iui3-typography-line-height-field-label, 20px);
  }
  .shareSection .iui-icon {
    width: 24px;
    height: 24px;
    margin-left: var(--iui3-space-gap-gap-small, 5px);
    cursor: pointer;
  }

  .linkSection {
    padding: var(--iui3-space-gap-gap-large, 20px);
    border-top: var(--iui-border-default);
    color: var(--storm-gray);
  }

  .fullWidth {
    width: 100%;
  }

  .widgetHeading {
    text-transform: uppercase;
  }

  .margin15OnTop {
    margin-top: var(--iui3-space-padding-table-cell-padding-topbottom, 15px);
  }

  .margin10OnTop {
    margin-top: var(--iui3-space-padding-select-item-padding-topbottom, 10px);
    color: var(--storm-gray);
  }

  .right {
    text-align: right;
  }

  .advanced {
    overflow-y: hidden;
    overflow-x: hidden;
    transition: all ease 200ms;
  }

  input, select {
    font-size: var(--iui3-typography-font-size-regular-text, 14px);
    height: 38px;
    border-radius: var(--iui-border-radius-default, 8px);
    border: var(--iui-border-default, 1px solid #CACFD3);
    color: var(--iui3-color-text-text-default, #2D3E50);
    background: var(--iui3-color-background-background-default, #FFFFFFFF);
    -webkit-appearance: none;
    outline: none;
    padding-left: var(--iui3-space-padding-select-item-padding-leftright-default, 12px);
    box-sizing: border-box;
  }

  input::placeholder {
    color: var(--storm-gray);
  }

  table td {
    padding: 0;
  }

  table {
    border-collapse: separate;
    border-spacing: 0 var(--iui3-space-padding-table-cell-padding-topbottom, 15px);
  }

  table .right {
    text-align: right;
  }

  .dropdown {
    white-space: nowrap;
  }

  select:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #000;
  }

  .linkHttps {
    margin-right: var(--iui3-space-gap-gap-default, 10px);
    width: 80px;
  }
  .linkInput {
    flex: 1;
  }
  .linkContainer {
    display: flex;
    margin-top: var(--iui3-space-gap-gap-default, 10px);
    margin-bottom: var(--iui3-space-gap-gap-default, 10px);
  }

  .inputsTable  td:nth-child(1) {
    font-weight: 500;
    font-size: var(--iui-font-size-default, 14px);
    padding-left: var(--iui3-space-gap-gap-default, 11px);
    vertical-align: middle;
  }

  .inputsTable  td:nth-child(2) {
    width: 73%;
    padding-left: var(--iui3-space-gap-gap-small, 5px);
  }

  button.iui-btn.primary.linkGeneratorBtn {
    background-color: var(--brandedLinkColor, var(--strata-blue));
  }
}
</style>
