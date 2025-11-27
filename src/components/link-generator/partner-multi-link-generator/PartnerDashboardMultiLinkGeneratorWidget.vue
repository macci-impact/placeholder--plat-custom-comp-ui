<template>
  <div>
    <DefaultShimmer
      v-if="isLoading"
      border-radius="8px"
      height="50px"
      width="100%"
    />
    <!-- !dont change the tag name-->
    <generate-links-widget :messages="JSON.stringify(messages)" v-show="!isLoading" />

    <div v-if="!isLoading && isFailed" :class="{rtl: isRTL}" >
      <div class="error-title">
        {{messages["mp.dashboard.create_a_link.header"] }}
      </div>

      <div class="error-message">
        <Icon name="urgent-tickets-icon"  />
        {{messages["mp.dashboard.create_a_link.error.widget_message"]}}
      </div>

      <Btn class="primary"  @click="window.location.reload()"> {{messages["mp.dashboard.create_a_link.error.widget_btn"]}}</Btn>
    </div>

  </div>
</template>

<script>
/*
 * This component is a wrapper for the GenerateLinksWidget.
 * It dynamically loads the GenerateLinksWidget component from module script.
 * The actual component is managed https://github.com/ImpactInc/impact-publisher-pro-linkgen-ui/generateLinksWidget
 * The component itself is a shadow DOM component with its own styles and scripts.
 */

import DefaultShimmer from "../../general/Shimmer.vue";
import {Icon, Btn} from "@impactinc/ui-component-library";
import {isRTL} from "../../../components/link-generator/utils.js";


export default {
  name: "PartnerDashboardMultiLinkGeneratorWidget",
  components: { DefaultShimmer, Icon, Btn },
  props: {
    accountId: {
      type: Number,
      required: true
    },
    jwt: {
      type: String,
      required: true
    },
    messages: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      isLoading: true,
      isFailed: false,
      scriptEl: null
    };
  },
  computed: {
    isRTL() {
      const lang = document.querySelector("html").getAttribute("lang");
      return isRTL(lang);
    }
  },
  async mounted() {
    this.$emit("show") // show in dashboard

    try {
      const { load } = await import(
          'https://ui.impact.com/publisher-pro-linkgen-widget/app/production/load/common.js'
          )

      await load("bundle")

    } catch (error) {
      console.error("Error loading GenerateLinksWidget:", error);
      this.isFailed = true;
    } finally {
      setTimeout(() => {
        this.isLoading = false;
      })
    }

  },
};

</script>

<style lang="less" scoped>
.error-title{
  color: var(--iui3-color-text-text-default, #121212);
  font-size: var(--iui3-font-size-subheader, 18px);
  font-weight: 600;
  line-height: var(--iui3-line-height-subheader, 23px); /* 127.778% */


  margin-bottom: 17px;
}
.error-message{
  color: var(--iui3-color-critical-text-critical, #C8144A);
  font-size: var(--iui3-font-size-description-text, 14px);
  font-weight: 400;
  line-height: var(--iui3-line-height-description-text, 18px); /* 128.571% */

  margin-bottom: 16px;
}


.rtl {
  direction: rtl;
}

</style>
