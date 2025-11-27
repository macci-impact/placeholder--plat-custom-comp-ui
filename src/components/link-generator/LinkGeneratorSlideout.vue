<template>
  <div class="">
    <side-modal
        :is-open="isOpen"
        @close="isOpen = false"
        width="600px"
        display-on-left
    >
      <template v-slot:content>
        <link-generator-widget  :csrf="csrf" :branding="branding" :messages="messages" :context="context" :passed-campaign="passedCampaign"/>
      </template>
    </side-modal>
<!--    dont change the tag's name. Might overwrite the LinkGeneratorSlideout behavior-->
    <partner-multi-link-slideout :event-listener-options="eventListenerOptions" :messages="messages"/>
  </div>
</template>

<script>
import { SideModal } from "@impactinc/ui-component-library";
import LinkGeneratorWidget from "./LinkGeneratorWidget.vue"
import PartnerMultiLinkSlideout from "../link-generator/partner-multi-link-slideout/PartnerMultiLinkSlideout.vue";


export default {
    name: "LinkGeneratorSlideout",
    components: {PartnerMultiLinkSlideout, LinkGeneratorWidget, SideModal},
    data() {
        return {
            isOpen: false,
            csrf: '',
            branding: null,
            messages: {},
            context: {},
            passedCampaign: undefined,
            // the exact payload to evenListener: name, callback, options
            eventListenerOptions: []
        };
    },
    created() {
      console.log("slideout created")

      const name = "LinkGeneratorModalOpenEvent"

      const callback = (e) => {
            console.log("from event e.detail.data:", e.detail.data);
            this.csrf = e.detail.data.csrf
            this.branding = e.detail.data.branding
            this.passedCampaign = e.detail.data.passedCampaign
            this.context = e.detail.data.context
            this.messages = e.detail.data.messages



            this.open();
      }

      // use if need for event listener and push eventListenerOptions
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,sonarjs/no-unused-vars
      const options = null


      //   this event can be overridden by partner-multi-link-slideout
      document.addEventListener(name, callback);

      // when changing the event lis
      this.eventListenerOptions.push(name, callback)

    },
    methods: {
        open() {
            //do AJAX to fetch modal data, etc.
            // await fetch()...;
            this.isOpen = true;
        },
    }
}
</script>