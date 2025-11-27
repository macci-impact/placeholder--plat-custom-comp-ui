<template>
    <div class="dashboard-component create-link-widget-container enable-accessibility-in-dashboard-container">
        <div class="subheading" v-if="!disabled">{{ getSubheading }}</div>

        <template v-if="loading">
            <div style="position: relative">
                <div class="loader">
                    <loading-dots style="position: absolute"/>
                </div>
            </div>
        </template>

        <template v-if="disabled">
            <div class="margin15OnTop empty">
                <div class="subheading">
                    {{ getSubheading }}
                </div>
                <btn class="primary" @click.once="brandMarketplaceClick()">
              	      {{ messages["create_link_menu.button.find_brands"] }}
                </btn>
            </div>
        </template>

        <template v-else>
            <div>
                <div class="link-widget-formelement-container">
                    <field-label-pair
                      :main-label="messages['create_link_menu.label.brand']"
                    >
                        <multi-select-input
                          ref="cmpInput"
                          class="full-width"
                          v-model="campaign"
                          static-searchable
                          :items="context.campaigns"
                          is-single-select
                          close-on-select
                        />
                    </field-label-pair>
                </div>

                <div
                  class="link-widget-formelement-container"
                  v-show="creatorCampaigns.length > 0"
									:inert="!campaignTasksOptions.length"
                >
                    <field-label-pair
                      :main-label="messages['create_link_menu.label.creator_campaign']"
                      :label-tooltip="messages['create_link_menu.tooltip.creator_campaign']"
                    >
                        <multi-select-input
                          class="full-width"
                          v-model="ccId"
                          :items="creatorCampaigns"
                          is-single-select
                          close-on-select
                        />
                    </field-label-pair>
                </div>

                <div
                  class="link-widget-formelement-container"
                  v-show="campaignTasksOptions.length > 0"
									:inert="!campaignTasksOptions.length"
                >
                    <field-label-pair>
                        <multi-select-input
                          class="full-width"
                          v-model="taskId"
                          :items="campaignTasksOptions"
                          :placeholder="messages['create_link_menu.tasks.placeholder']"
                          is-single-select
                          close-on-select
                        />
                    </field-label-pair>
                </div>
            </div>

            <div class="link-widget-formelement-container" v-show="allowsDeepLinking" :inert="!allowsDeepLinking">
                <field-label-pair
                  :main-label="messages['create_link_menu.enter_landing_placeholder']"
                >
                    <text-input
                      class="fullWidth"
                      type="text"
                      :placeholder="messages['create_link_menu.enter_landing_url']"
                      v-model="landing"
                      autocomplete="off"
                      v-show="showLandingPageInput"
											:tabindex="showLandingPageInput ? 0 : -1"
											data-testid="input-landing-page"
                    />
                    <multi-select-input
                      class="full-width"
                      v-model="landing"
                      :items="campaignLandingPages"
                      :placeholder="messages['create_link_menu.select_landing_page']"
                      is-single-select
                      close-on-select
                      v-show="campaignTrafficDestination === 'SPECIFIC_PAGES'"
											:tabindex="campaignTrafficDestination === 'SPECIFIC_PAGES' ? 0 : -1"
                    />
                </field-label-pair>
            </div>
            <div>
                <div class="advanced" ref="advCt" :style="{ height: container1height }" :inert="!advancedToggled">
                    <table class="inputsTable fullWidth">
                        <tr v-for="n in 3" :key="advancedInputPrefix + '-' + n">
													<td><label :for="advancedInputPrefix + '-' + n">{{ messages["mp_ad_search_get_code.value_sub_id" + n] }}:</label></td>
                            <td>
                                <text-input
																	:id="advancedInputPrefix + '-' + n"
																	:data-testid="advancedInputPrefix + '-' + n"
																	:name="'sub ID ' + n"
																	v-model="advanced[`subId${n}`]"
																	class="fullWidth"
                                  type="text"
                                />
                            </td>
                        </tr>
                        <tr>
													<td><label :for="advancedInputPrefix + '-4'">{{ messages["mp_ad_search_get_code.value_sub_id4"] }}:</label></td>
                            <td>
                                <text-input
																	:id="advancedInputPrefix + '-4'"
																	:data-testid="advancedInputPrefix + '-4'"
																	v-model="advanced.sharedId"
																	class="fullWidth"
                                  type="text"

                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ messages["mp_ad_search_get_code.value_media_property"] }}:
                            </td>
                            <td>
                                <multi-select-input
                                  class="full-width"
                                  v-model="advanced.mediaPartnerPropertyId"
                                  :items="campaignMediaProperties"
                                  is-single-select
                                  close-on-select
																	aria-label="media property id"
																	data-testid="advanced-media-partner-property-id"
                                />
                            </td>
                        </tr>
                    </table>
                </div>

                <div>
                    <table class="fullWidth">
                        <tr>
                            <td>
                                <btn
                                  type="button"
																	ref="btnCreate"
                                  @click="createClicked"
                                  class="primary btn-create styled-focus-within"
                                  :is-disabled="buttonDisabled"
																	data-testid="btn-create"
                                >
                                    {{ messages["create_link_menu.btn.create"] }}
                                </btn>
                            </td>
                            <td class="right">
                                <button
                                  @click="toggleAdvanced"
                                  v-text="advancedToggled
                                    ? messages['create_link_menu.btn.hide']
                                    : messages['create_link_menu.btn.advanced']"
																	class="styled-link styled-focus"
                                  :style="linkStyle"
																	data-testid="link-toggle-advanced"
                                ></button>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <span class="divider"></span>

            <div class="link-gen-widget-linkSection" :key="updateKey">
                <div v-if="showLinkGeneratorInput">
                    <span v-show="!hasErrors()">
                        {{ messages["create_link_menu.deep_link.promote"] }}
                        <span>{{ getProgramLabel }}. <em>{{messages["create_link_menu.deep_link.disclaimer"] }}</em></span>
                    </span>

                    <div class="linkContainer" v-show="!hasErrors()" :inert="hasErrors()">
                      <label class="linkDropdown">
                        <multi-select-input class="linkHttps" is-single-select is-read-only v-model="protocol" :items="protocolOptions" close-on-select/>
                      </label>
                        <url-edit
                          ref="shortLinkInput"
                          class="linkInput"
                          :disableEdit="disableEditing || directLinkTracking"
                          :link-value="linkValue"
                          @rename="renameClick($event)"
                          :clipboardPrefix="protocol"
                          :messages="messages"
                          @notification="doNotification($event)"
                        />
                    </div>

                    <div class="shareSection">
                        <div class="rename-link-errors" v-show="hasErrors()" :inert="!hasErrors()">
                            <span>{{ errorMessages[0] }}</span>
                            <btn class="secondary btn-clear" @click="clearErrors()"
                            	>{{ messages["create_link_menu.button.clear"] }}
                            </btn>
                        </div>
                        <div class="shares" v-show="!hasErrors()" :inert="hasErrors()">
                            <span class="shares-label">
                                {{ messages["create_link_menu.social.share"] }}
                            </span>
                            <btn
                              class="shares-btn"
                              size="small"
                              is-icon-only
                              @click="share($event, 'facebook')"
                            >
                                <icon name="facebook-color" title="Share on Facebook"/>
                            </btn>
                            <btn
                              class="shares-btn"
                              size="small"
                              is-icon-only
                              @click="share($event, 'twitter')"
                            >
                                <icon name="x-dot-com-color" title="Share on Twitter"/>
                            </btn>
                            <btn
                              class="shares-btn"
                              size="small"
                              is-icon-only
                              @click="share($event, 'qrcode')"
                            >
                                <icon name="qr-code" title="Share using QR Code"/>
                            </btn>
                        </div>
                    </div>
                </div>
                <div v-else>
                    {{ messages["mp.dashboard.create_a_link.no_link"] }}
                </div>
            </div>
        </template>

        <div>
            <qr-modal
              :messages="messages"
              :url="qrUrl"
              :is-open="qrOpen"
              @qrClose="qrOpen = false"
            />
            <notification
              :anchor="notification.anchor"
              :emoji="notification.emoji"
              :is-open="notification.isOpen"
              @close="notification = {}"
            >{{ notification.message }}
            </notification>
        </div>
    </div>
</template>

<script>
import {isValidHexColor, responseCheck} from "../utils.js";
import {
    Btn,
    FieldLabelPair,
    Icon,
    LoadingDots,
    MultiSelectInput,
    Notification,
		TextInput,
} from "@impactinc/ui-component-library";
import QrModal from "../QrModal.vue";
import UrlEdit from "./UrlEdit.vue";
const SUB_ID_PREFIX = "advanced-sub-id"

export default {
    name: "PartnerDashboardLinkGeneratorWidget",
    components: {
        Btn,
        FieldLabelPair,
        Icon,
        LoadingDots,
        MultiSelectInput,
        Notification,
        QrModal,
        UrlEdit,
				TextInput,
    },
    props: {
        csrf: String,
        branding: Object,
        messages: Object,
        context: {
            type: Object,
            default: () => ({
                campaigns: [],
                properties: [],
            }),
        },
        passedCampaign: Number,
    },
    data: () => ({
        qrUrl: null,
        qrOpen: false,
        loading: true,
        disabled: false,
        id: "",
        campaign: null,
        allowsDeepLinking: false,
        landing: "",
        notification: {
            anchor: window.document.body,
        },
        advanced: {
            subId1: "",
            subId2: "",
            subId3: "",
            sharedId: "",
            mediaPartnerPropertyId: "",
        },
        protocolOptions: [
          {
            label: 'https://',
            value: 'https://'
          }
        ],
        linkValue: "",
        backupLinkValue: "",
        trackingUrl: "",
        protocol: "https://",
        directLinkTracking: false,
        disableEditing: false,
        EXPANDED_CONTAINER_HEIGHT: "auto",
        advancedToggled: false,
        container1height: 0,
        linkStyle: {
            color: "var(--strata-blue)",
            "text-decoration": "none",
            cursor: "pointer",
            "font-size": "14px",
        },
        updateKey: 0,
        fetchCreatorCampaignsUrl: "/secure/nositemesh/publisher/link/{cid}/creatorCampaignOptions.json",
        fetchCampaignTasksUrl: "/secure/nositemesh/publisher/link/tasks/{icid}/tasksOptions.json",
        fetchLandingPagesUrl: "/secure/nositemesh/publisher/link/campaign/{icid}/landingpages.json",
        programs: [],
        creatorCampaigns: [],
        campaignTasks: [],
        campaignTasksOptions: [],
        campaignLandingPages: [],
        campaignTrafficDestination: null,
        campaignMediaProperties: [],
        taskId: null,
        programId: null,
        ccId: null,
        sowId: null,
        type: "vanity",
        errorMessages: [],
				advancedInputPrefix: SUB_ID_PREFIX
    }),
    watch: {
        campaign: {
            immediate: false,
            handler(newVal, oldVal) {
                if (newVal && parseInt(newVal) !== parseInt(oldVal)) {
                    this.resetCreatorCampaignOptions(newVal);
                    this.getCampaignData(newVal);
                    this.$nextTick(() => this.getCreatorCampaignOptions(newVal));
                }
                // Use case: User "deselects" a brand/program
                if (!newVal && oldVal) {
                    this.resetCreatorCampaignOptions("");
                    this.allowsDeepLinking = false;
                    this.id = null;
                }
            }
        },
        ccId: {
            immediate: false,
            handler(newVal, oldVal) {
                if (newVal && parseInt(newVal) !== parseInt(oldVal) && this.creatorCampaigns.length > 0) {
                    this.clearShortLink();
                    this.getCampaignTasks(newVal);
                    this.$nextTick(() => this.getCampaignLandingPages(newVal));
                }
                // Use case: User "deselects" a campaign
                if (!newVal && oldVal) {
                    this.resetTasksAndLandingPages();
                    this.getCampaignData(this.campaign);
                }
            },
        },
        taskId: {
            handler(newVal, oldVal) {
                if (newVal) {
                    if (newVal.length > 0 || typeof newVal === "number") {
                        this.setMediaProperties(newVal);
                        if (parseInt(newVal) !== parseInt(oldVal)) {
                            this.clearShortLink();
                            this.getCampaignData(this.programId);
                        }
                    }
                }
            },
        },
    },
    mounted() {
        let brandedOptions = this.branding || {};
        if (isValidHexColor(brandedOptions.linkColor)) {
            this.linkStyle.color = brandedOptions.linkColor;
        }
        fetch(
          "/secure/nositemesh/publisher/link/campaignOptions.json",
          this.getFetchOptions("GET"),
        )
          .then((response) => responseCheck(response))
          .then((value) => {
              if (value === undefined) {
                  return;
              }
              this.context.campaigns = value;
              this.programs = value;
              if (value.length > 0) {
                  this.campaign = value[0].value;
                  this.programId = this.campaign;
                  this.loading = false;
              } else {
                  this.loading = false;
                  this.disabled = true;
              }
          });

        const propertyUrl =
          "/secure/nositemesh/publisher/mediakit/mediaPropertyOptions.json";
        fetch(propertyUrl, this.getFetchOptions("GET"))
          .then((response) => responseCheck(response))
          .then((value) => {
              if (value === undefined) {
                  return;
              }
              this.campaignMediaProperties = value;
              this.context.properties = value;
          });
    },
    methods: {
        getCampaignData(cid) {
            if (cid) {
                let url = `/secure/nositemesh/publisher/link/${cid}/shortLink.json?type=${this.type}`;
                if (this.ccId && this.taskId) {
                    url += `&ccId=${this.ccId}&taskId=${this.taskId}`;
                }
                if (this.advanced?.mediaPartnerPropertyId) {
                    url += `&mppid=${this.advanced.mediaPartnerPropertyId}`;
                }
                fetch(url, this.getFetchOptions("GET"))
                  .then((response) => responseCheck(response))
                  .then((value) => {
                      if (value === undefined) {
                          return;
                      }
                      this.id = value.id;
                      this.campaign =
                        this.campaign || value.campaign || this.passedCampaign;
                      this.programId = this.campaign;
                      this.landing = value.landing;
                      this.advanced.subId1 = value.advanced.subId1;
                      this.advanced.subId2 = value.advanced.subId2;
                      this.advanced.subId3 = value.advanced.subId3;
                      this.advanced.sharedId = value.advanced.sharedId;
                      this.advanced.mediaPartnerPropertyId =
                        value.advanced.mediaPartnerPropertyId;
                      if (value.ccId) {
                          this.ccId = value.ccId;
                      }
                      if (value.taskId) {
                          this.taskId = value.taskId;
                      }
                      if (value.sowId) {
                          this.sowId = value.sowId;
                      }
                      this.linkValue = value.linkValue;
                      this.backupLinkValue = value.linkValue;
                      this.trackingUrl = value.trackingUrl;
                      this.allowsDeepLinking = value.allowsDeepLinking;
                      this.directLinkTracking = value.directLinkTracking;
                      this.updateKey++;
                      this.parseLandingPage();
                  });
            }
        },
        getCreatorCampaignOptions(programId) {
            if (programId) {
                this.resetCreatorCampaignOptions(programId);
                fetch(
                  this.fetchCreatorCampaignsUrl.replace("{cid}", programId),
                  this.getFetchOptions("GET"),
                )
                  .then((response) => responseCheck(response))
                  .then((response) => {
                      if (response === undefined) {
                          return;
                      }
                      this.creatorCampaigns = response;
                  });
            }
        },
        getCampaignTasks(campaignId) {
            if (campaignId) {
                this.loading = true;
                fetch(
                  this.fetchCampaignTasksUrl.replace("{icid}", campaignId),
                  this.getFetchOptions("GET"),
                )
                  .then((response) => responseCheck(response))
                  .then((response) => {
                      this.loading = false;
                      if (response === undefined) {
                          return;
                      }
                      this.sowId = response[0]['scopeOfWorkId'];
                      this.campaignTasks = [...response];
                      this.campaignTasksOptions = [].concat(
                        this.campaignTasks.map((task) => task.options[0]),
                      );
                  })
                  .catch((error) => console.warn(error));
            }
        },
        getCampaignLandingPages(campaignId) {
            if (campaignId) {
                this.loading = true;
                fetch(
                  this.fetchLandingPagesUrl.replace("{icid}", campaignId),
                  this.getFetchOptions("GET"),
                )
                  .then((response) => responseCheck(response))
                  .then((response) => {
                      this.loading = false;
                      if (response === undefined) {
                          return;
                      }
                      this.landing = "";
                      this.campaignLandingPages = response["landingPagesAsOptions"];
                      this.programId = response.programId;
                      this.allowsDeepLinking = response["allowDeepLinking"];
                      this.directLinkTracking = response["allowDirectLinkTracking"];
                      this.campaignTrafficDestination = response["trafficDestination"];
                      this.disableEditing =
                        this.campaignTrafficDestination === "PROGRAM_DEFAULT";
                  })
                  .catch((error) => console.warn(error));
            }
        },
        setMediaProperties(taskId) {
            if (taskId) {
                const selectedTaskId = parseInt(taskId);
                if (isNaN(selectedTaskId)) return;

                let selectedTaskPropertyId = this.campaignTasks
                  .filter(
                    (wrapper) =>
                      wrapper["campaignTask"]["partnerTaskId"] === selectedTaskId,
                  )
                  .map((wrapper) => wrapper["encMediaPropertyId"])[0];
                if (selectedTaskPropertyId) {
                    let filteredProps = [...this.campaignMediaProperties].filter(
                      (prop) => prop.value === selectedTaskPropertyId,
                    );
                    if (filteredProps.length > 0) {
                        // Don't filter properties based on tasks until we get clarification from Product
                        //this.campaignMediaProperties = filteredProps;
                    }
                }
            }
        },
        toggleAdvanced: function () {
            if (this.$refs.advCt) {
                if (this.advancedToggled) {
                    this.advancedToggled = false;
                    this.container1height = 0;
                } else {
                    this.$refs.advCt.scrollTop = 0;
                    this.advancedToggled = true;
                    this.container1height = this.EXPANDED_CONTAINER_HEIGHT;
                }
            }
        },
        share(ctx, media) {
            const url = encodeURIComponent("https://" + this.linkValue);
            switch (media) {
                case "facebook":
                    window.open('https://www.facebook.com/sharer.php?u=' + url, '_blank');
                    break;
                case "twitter":
                    window.open(
                      "https://www.twitter.com/intent/tweet?url=" +
                      url +
                      "&text=Check%20this%20out!",
                      "_blank",
                    );
                    break;
                case "qrcode":
                    this.qrUrl = "https://" + this.linkValue;
                    this.qrOpen = true;
            }
        },
        createClicked() {
            const url = "/secure/nositemesh/publisher/link/shortLink.json";
            this.loading = true;
            this.errorMessages = [];
            fetch(url, {
                credentials: "include",
                method: "POST",
                body: this.dataModel,
                headers: this.getFetchHeaders(),
            })
              .then((response) => responseCheck(response))
              .then((value) => {
                  this.loading = false;
                  if (value === undefined) {
                      return;
                  }
                  if (value.errorMessages.length) {
                      this.errorMessages = value.errorMessages;
                      return;
                  }
                  this.id = value.id;
                  this.linkValue = value.linkValue;
                  this.trackingUrl = value.trackingUrl;
                  this.allowsDeepLinking = value.allowsDeepLinking;
                  this.directLinkTracking = value.directLinkTracking;
                  this.updateKey++;
                  this.doNotification(
                    "👍 " + this.messages["create_link_menu.link_generated"],
                  );
              })
              .catch(this.whoops);
        },
        doNotification(message) {
            this.notification = {
                anchor: window.document.body,
                message: message,
                isOpen: true,
            };
        },
        whoops: function () {
            return this.messages["create_link_menu.whoops"];
        },
        renameClick(argsObj) {
            const newValue = argsObj["new"];

            this.linkValue = newValue;
            this.loading = true;
            fetch("/secure/nositemesh/publisher/link/renameLink.json", {
                credentials: "include",
                method: "POST",
                body: this.dataModel,
                headers: this.getFetchHeaders(),
            })
              .then((response) => responseCheck(response))
              .then((value) => {
                  this.loading = false;
                  if (value === undefined) {
                      this.linkValue = this.backupLinkValue;
                      return;
                  }
                  this.disableEditing = true;
                  this.errorMessages = value.errorMessages;
                  if (!this.hasErrors()) {
                      this.linkValue = value.linkValue;
                      this.backupLinkValue = value.linkValue;
                      this.doNotification(
                        "👍 " + this.messages["create_link_menu.link_updated"],
                      );
                  } else {
                      this.linkValue = this.backupLinkValue;
                  }
              })
              .catch(this.whoops);
        },
        getFetchHeaders() {
            return {
                "Content-Type": "application/json",
                "Is-Ajax-Request": "true",
                uitk_csrf: this.csrf,
            };
        },
        getFetchOptions(method) {
            return {
                method: method,
                credentials: "include",
                headers: this.getFetchHeaders(),
            };
        },
        resetCreatorCampaignOptions(programId) {
            // Reset if the two values don't match OR user deselects a brand
            if (parseInt(programId) !== parseInt(this.programId) || isNaN(programId)) {
                this.campaign = programId;
                this.programId = programId;
                this.creatorCampaigns = [];
                this.resetTasksAndLandingPages();
                if (this.advanced && this.advanced?.mediaPartnerPropertyId) {
                    this.advanced.mediaPartnerPropertyId = null;
                }
                this.campaignTrafficDestination = null;
                this.campaignMediaProperties = this.context.properties;
            }
        },
        resetTasksAndLandingPages() {
            this.campaignTasks = [];
            this.campaignTasksOptions = [];
            this.campaignLandingPages.length = 0;
            this.taskId = "";
            this.ccId = "";
            this.clearShortLink();
        },
        hasErrors() {
            return this.errorMessages.length > 0;
        },
        clearErrors() {
            setTimeout(() => {
                this.errorMessages = [];
                if (this.$refs.shortLinkInput) {
                    this.$refs.shortLinkInput.editing = false;
                }
            }, 500);
        },
        clearShortLink() {
            this.linkValue = "";
            if (this.$refs.shortLinkInput) {
              this.linkValue = this.backupLinkValue;
            }
        },
        parseLandingPage() {
            if (this.trackingUrl.length > 0) {
                const params = new URLSearchParams(
                  this.trackingUrl.substring(this.trackingUrl.indexOf("?")),
                );
                if (params.has("u")) {
                    this.landing = params.get("u");
                }
            }
        },
        brandMarketplaceClick() {
            return (document.location.href =
              "/secure/mediapartner/marketplace/new-campaign-marketplace-flow.ihtml");
        },
    },
    computed: {
        buttonDisabled() {
          return this.campaignTasksOptions.length > 0 && !this.taskId && this.campaign;
        },
        dataModel: function () {
            return JSON.stringify({
                id: this.id,
                campaign: this.campaign || this.passedCampaign,
                allowsDeepLinking: this.allowsDeepLinking,
                landing: this.landing,
                advanced: {
                    subId1: this.advanced.subId1,
                    subId2: this.advanced.subId2,
                    subId3: this.advanced.subId3,
                    sharedId: this.advanced.sharedId,
                    propertyId: this.advanced.mediaPartnerPropertyId,
                },
                ccId: this.ccId,
                taskId: this.taskId,
                sowId: this.sowId,
                linkValue: this.linkValue,
                protocol: this.protocol,
                type: "vanity",
            });
        },
        showLandingPageInput() {
            return (
              this.campaignTrafficDestination === null ||
              this.campaignTrafficDestination === "INFLUENCER_CHOICE" ||
              this.campaignTrafficDestination === "PROGRAM_DEFAULT"
            );
        },
        showLinkGeneratorInput() {
            return (
              this.id !== null ||
              this.directLinkTracking === true ||
              this.errorMessages.length > 0
            );
        },
        getProgramLabel() {
            if (this.programId) {
                if (this.programs.length > 1) {
                    return this.programs.filter(
                      (program) => parseInt(program.value) === parseInt(this.programId),
                    )[0].label;
                }
                if (this.programs.length === 0) {
                    return this.programs[0].label;
                }
            }
            return "";
        },
        getSubheading() {
            return this.disabled
              ? this.messages["create_link_menu.description.empty"]
              : this.messages["create_link_menu.description.promote_brand"];
        },
    },
};
</script>

<style>
.dashboard-container {
    overflow-x: hidden !important;
}

.dashboard-container .dashboard-container-header a.actionLink[data^="-"] {
    align-self: flex-end !important;
}


.loader {
    position: absolute;
    background-color: var(--iui3-color-background-background-default, #f8fafb);
    height: 100%;
    width: 100%;
    text-align: center;
}

.fullWidth {
    width: 100%;
}

.margin15OnTop {
    margin-top: var(--iui3-space-gap-gap-default, 10px);
}
</style>

<style lang="less" scoped>
/**
 *  Mixin for focus rings
 */
.focus-outline() {
	outline: 1px solid var(--iui3-color-text-text-subdued, var(--storm-gray));
	border-radius: var(--iui3-space-radius-button-radius, 8px);
}

div.iui-tooltip {
    div.text-container:after {
        display: none;
    }

    div.iui-tooltip-arrow {
        top: calc(100% - 11px) !important;
    }
}

.create-link-widget-container {
    font-size: var(--iui-font-size-default);
    margin-top: -10px;
    input,
    select {
        font-size: var(--iui-font-size-default);
        height: 38px;
        border-radius: var(--iui-border-radius-default);
        border: var(--iui-border-default);
        color: var(--coal-black);
        background: var(--iui3-color-background-background-default);
        -webkit-appearance: none;
        outline: none;
        padding-left: var(--iui3-space-gap-gap-default, 10px);
        box-sizing: border-box;
    }

    select:-moz-focusring {
        color: transparent;
        text-shadow: 0 0 0 var(--coal-black);
    }

    input::placeholder {
        color: var(--bleakest-gray);
        font-weight: 400;
    }

    table {
        border-collapse: separate;
        border-spacing: 0 var(--iui3-space-padding-table-cell-padding-leftright-default, 10px);

        td.right {
            text-align: right;
        }
    }

    .subheading {
        color: var(--storm-gray);
        margin-top: -10px;
    }

		.btn-create:focus, .btn-clear:focus {
			.focus-outline();
		}
		button.styled-link{
			background: none;
			text-decoration: underline;
			outline: none;
			border: none;
			&:focus{
				.focus-outline();
			}
		}

    .link-widget-formelement-container {
        margin-top: var(--iui3-space-gap-gap-default, 10px);
    }

    table.inputsTable {
        td {
            padding: 0;

            &:nth-child(1) {
                font-weight: 500;
                font-size: var(--iui-font-size-default);
                padding-left: var(--iui3-space-gap-gap-default, 10px);
                vertical-align: middle;
            }

            &:nth-child(2) {
                width: 73%;
                padding-left: var(--iui3-space-gap-gap-small, 5px);
            }

            .right {
                text-align: right;
            }
        }
    }

    .advanced {
        overflow: hidden;
        transition: all ease 200ms;
    }

    .divider {
        background-color: var(--pale-gray);
        display: block;
        height: 1px;
        margin: var(--iui3-space-gap-gap-default, 10px) 0
            var(--iui3-space-gap-gap-large, 20px) -31px;
        width: 160%;
    }

    .link-gen-widget-linkSection {
        line-height: normal;

			.linkContainer{
				margin-right: var(--iui3-space-gap-gap-small, 5px);
			}
      .linkHttps {
        width: 92px;
				&:focus-within{
					:deep(button.iui-multi-select-input-button){
						border: 1px solid var(--iui3-color-text-text-subdued, var(--storm-gray));
					}
				}
      }

        .linkInput {
            flex: 1;
        }

        .linkContainer {
            display: flex;
            margin-top: var(--iui3-space-gap-gap-default, 10px);
            margin-bottom: var(--iui3-space-gap-gap-default, 10px);
        }

        .shareSection {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .rename-link-errors {
                align-self: center;
                display: flex;
                color: var(--error-red);
                flex-wrap: nowrap;
                font-size: var(--iui-font-size-default);
                justify-content: space-between;
                width: 100%;

                span {
                    align-self: center;
                }

                button.secondary {
                    align-self: flex-end;
                }
            }

            .shares {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                white-space: nowrap;
                width: 100%;

                .shares-label{
                    margin-right: 4px;
                }
                .shares-btn {
                    outline: 0;
                    border: 0;
                    max-width: 48px;
                    padding: 2px;
                    margin: 2px;
										background-color: transparent;
                    &:focus{
                        .focus-outline();
                    }
                }
                svg.iui-icon {
                    width: var(--iui-icon-large);
                    height: var(--iui-icon-large);
                    cursor: pointer;
										color: var(---iui3-color-text-text-default, var(--storm-gray));
                }
            }
        }
    }

    div.empty {
        background: url('data:image/svg+xml,<%3Fxml version="1.0" encoding="utf-8"%3F><svg viewBox="193.337 182.0095 113.3264 135.9815" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M 240.913 317.991 C 240.913 317.991 251.918 311.394 249.676 299.454 C 248.339 292.328 243.802 292.678 241.175 287.281 C 239.499 283.838 242.046 274.597 236.818 268.517 C 231.935 262.839 223.95 263.354 221.378 262.12 C 217.931 260.466 216.618 256.993 215.633 254.14 C 211.959 243.505 203.471 243.792 202.088 249.083 C 200.423 255.462 202.017 259.307 209.856 265.559 C 215.744 270.257 207.122 275.528 212.251 284.081 C 215.117 288.861 222.824 291.345 219.059 297.526 C 213.904 305.989 214.873 314.308 217.5 317.991 L 240.913 317.991 Z" fill="%23FCC799"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 208.802 254.518 C 208.886 254.435 209.02 254.436 209.102 254.521 C 209.13 254.548 211.91 257.385 215.529 262.289 C 218.868 266.814 223.628 274.08 227.344 282.994 C 230.645 290.912 234.301 302.045 233.29 317.991 L 232.865 317.991 C 233.876 302.118 230.237 291.038 226.952 283.158 C 219.874 266.179 208.911 254.931 208.8 254.819 C 208.718 254.736 208.719 254.601 208.802 254.518 Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 201.521 278.975 C 202.186 278.975 202.864 279.525 202.864 280.192 C 202.864 280.303 202.848 280.41 202.82 280.512 C 208.451 283.282 213.474 286.869 217.763 291.187 C 221.411 294.862 224.54 299.071 227.061 303.696 C 229.304 307.811 230.642 311.502 231.368 313.874 C 232.049 316.092 232.337 317.605 232.405 317.991 L 231.974 317.991 C 231.887 317.522 231.6 316.078 230.962 313.999 C 230.241 311.646 228.914 307.985 226.688 303.901 C 224.186 299.31 221.082 295.134 217.461 291.488 C 213.207 287.205 208.224 283.645 202.636 280.897 C 202.418 281.201 202.063 281.4 201.66 281.4 C 200.995 281.4 200.437 280.975 200.437 280.309 C 200.437 279.641 200.856 278.975 201.521 278.975 Z" fill="%23141414"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 194.424 292.721 C 195.091 292.721 195.77 293.273 195.77 293.939 L 195.77 293.94 C 197.834 294.31 201.317 295.083 207.649 297.415 C 216.076 300.518 221.9 305.938 225.303 309.938 C 228.99 314.271 230.711 317.926 230.728 317.963 C 230.732 317.972 230.734 317.982 230.738 317.991 L 230.268 317.991 C 229.907 317.267 228.203 314.002 224.969 310.202 C 221.601 306.246 215.836 300.885 207.501 297.815 C 201.202 295.495 197.742 294.727 195.693 294.359 C 195.522 294.818 195.081 295.147 194.562 295.147 C 193.896 295.147 193.337 294.722 193.337 294.055 C 193.337 293.389 193.757 292.721 194.424 292.721 Z" fill="%23141414"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 297.699 308.575 C 297.699 308.575 298.226 308.302 299.471 308.43 C 299.807 308.465 300.319 308.808 301.516 309.447 C 303.103 310.295 305.285 311.717 306.026 313.266 C 307.812 316.999 305.324 317.439 304.878 317.543 C 304.431 317.647 302.189 315.7 302.189 315.7 L 300.276 313.311 L 297.407 311.047 L 297.699 308.575 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 298.386 308.591 C 299.189 308.713 302.809 310.424 304.364 311.932 C 305.581 313.112 306.283 314.452 306.268 315.924 C 306.257 317.125 305.219 317.468 304.769 317.504 C 302.733 317.67 301.487 317.351 300.326 316.538 C 299.493 315.953 297.334 313.624 296.748 313.163 C 296.263 312.783 295.043 311.566 295.043 310.804 C 295.043 309.171 297.583 308.469 298.386 308.591 Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 297.297 304.501 C 297.297 304.501 298.666 309.015 298.796 309.173 C 298.856 309.246 301.04 310.569 300.723 310.636 C 300.351 310.714 299.164 309.566 297.986 310.742 C 296.945 311.78 297.477 312.295 297.647 312.667 C 297.867 313.145 297.851 313.039 297.659 312.9 C 296.218 311.855 295.505 311.22 295.235 310.494 C 295.045 309.98 291.892 306.101 291.892 306.101 L 297.297 304.501 Z" fill="%23BD884F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 300.847 312.75 C 301.109 312.293 300.811 311.852 300.689 312.296 C 300.627 312.52 300.204 313.082 299.453 313.371 C 299.302 313.423 299.057 313.708 299.693 313.642 C 300.119 313.537 300.643 313.105 300.847 312.75 Z" fill="%23FFB201"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 301.934 313.518 C 302.13 313.036 302.029 312.727 301.743 313.079 C 301.735 313.088 301.439 314.002 300.503 314.291 C 300.097 314.291 300.008 314.493 300.097 314.515 C 301.131 314.766 301.793 313.864 301.934 313.518 Z" fill="%23FFB201"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 278.796 307.245 L 277.673 314.082 C 277.673 314.082 276.584 314.681 274.866 315.068 C 273.148 315.456 270.165 315.227 270.108 315.068 C 270.051 314.91 268.997 313.697 270.715 313.063 C 272.434 312.429 272.951 312.052 273.137 311.169 C 273.217 310.79 272.982 306.855 272.982 306.855 L 278.796 307.245 Z" fill="%23BD884F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 262.223 317.636 L 278.403 317.636 C 278.553 317.179 278.684 316.7 278.661 316.32 L 262.442 316.659 C 262.345 316.942 262.271 317.279 262.223 317.636 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 278.117 311.656 C 278.117 311.656 276.99 312.37 276.649 313.066 C 275.854 313.24 272.88 313.29 273.061 313.075 C 273.638 312.389 272.88 311.716 272.426 311.716 C 271.971 311.716 268.802 313.775 268.386 313.775 C 267.97 313.775 263.721 315.336 263.191 315.649 C 262.662 315.962 262.449 316.73 262.449 316.73 L 278.65 316.73 C 278.65 316.73 279.215 312.8 278.117 311.656 Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 270.916 312.987 C 270.853 312.177 269.638 312.51 270.162 312.736 C 270.408 312.695 270.594 312.818 270.671 313.026 C 270.71 313.156 270.932 313.12 270.916 312.987 Z" fill="%23FFB201"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 270.13 313.531 C 270.066 312.721 268.851 313.055 269.375 313.281 C 269.621 313.239 269.807 313.362 269.885 313.57 C 269.923 313.7 270.145 313.664 270.13 313.531 Z" fill="%23FFB201"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 265.727 248.205 C 266.14 241.011 268.363 238.809 268.363 238.809 L 278.812 239.113 L 286.919 238.815 C 286.919 238.815 291.307 242.882 291.876 250.973 C 292.149 254.847 291.019 261.637 290.133 266.963 C 289.532 270.578 289.043 273.519 289.18 274.419 C 289.242 274.827 289.726 275.528 290.371 276.461 C 291.482 278.068 293.068 280.364 293.784 283.027 C 295.435 289.175 296.878 294.009 297.911 297.468 C 299.009 301.146 299.642 303.267 299.566 303.757 C 299.419 304.707 295.847 306.631 294.52 307.093 C 293.192 307.555 291.353 307.772 291.315 306.851 C 291.266 305.669 289.598 302.4 287.059 297.921 C 285.976 296.012 284.335 292.869 282.708 289.392 C 282.666 289.755 282.62 290.025 282.572 290.191 C 282.22 291.391 282.059 295.128 281.895 298.924 C 281.688 303.717 281.477 308.604 280.873 308.595 C 280.69 308.592 280.317 308.603 279.824 308.616 C 277.405 308.684 272.106 308.833 272.309 307.902 C 272.56 306.75 271.322 284.426 270.739 282.726 C 270.124 280.929 269.96 277.719 269.836 275.307 C 269.795 274.494 269.758 273.772 269.71 273.224 C 269.657 272.627 269.301 271.009 268.821 268.828 C 267.555 263.08 265.427 253.419 265.727 248.205 Z" fill="%23F5333F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 289.433 242.6 C 291.709 246.233 287.987 244.101 281.281 244.258 C 276.032 244.382 268.364 238.815 268.364 238.815 L 286.84 238.809 C 286.84 238.809 288.477 241.076 289.433 242.6 Z" fill="%23F5333F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 276.809 274.876 C 277.66 279.61 280.191 284.188 282.095 288.512 C 282.238 288.782 282.616 289.513 282.522 289.205 C 282.445 288.951 282.34 288.702 282.231 288.458 C 280.534 284.376 278.951 280.235 277.66 276.028 C 277.56 275.686 277.462 275.308 277.403 274.958 C 276.645 269.6 276.669 264.166 276.222 258.778 C 276.103 257.287 275.948 255.45 275.707 253.971 C 275.699 253.905 275.623 253.942 275.65 254.325 C 276.328 261.302 275.958 270.143 276.809 274.876 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 272.494 208.827 C 271.125 209.545 269.037 211.036 267.795 214.521 C 266.751 217.451 264.363 221.68 264.286 222.105 C 263.052 222.53 258.117 224.796 258.117 224.796 C 258.117 224.796 261.518 229.847 261.798 229.847 C 262.078 229.847 263.737 229.768 265.344 229.652 C 270.589 229.272 270.858 225.965 271.118 224.616 C 271.96 220.251 272.101 209.296 272.494 208.827 Z" fill="%23298DDA"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 280.6 202.032 C 280.6 202.032 279.463 207.223 280.227 207.763 C 280.609 208.032 282.242 208.429 282.242 208.429 C 282.242 208.429 278.22 211.375 275.762 211.451 C 273.303 211.527 271.66 210.15 271.932 209.651 C 272.34 208.905 275.22 208.238 275.328 207.573 C 275.45 206.815 275.396 203.497 275.396 203.497 L 280.6 202.032 Z" fill="%23BD884F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 281.16 208.744 C 281.16 208.744 276.715 211.386 275.351 211.066 C 274.418 210.847 274.53 209.065 274.426 208.284 C 273.567 208.361 271.82 209.177 271.203 210.361 C 270.383 211.931 270.295 215.405 269.71 218.197 C 268.401 224.434 269.782 237.73 269.782 237.73 C 269.782 237.73 277.114 240.94 279.076 239.39 C 280.084 238.594 277.522 234.38 277.321 227.601 C 277.12 220.822 276.872 218.693 277.628 216.425 C 278.383 214.158 281.16 208.744 281.16 208.744 Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 282.117 208.284 C 283.7 208.579 288.059 209.609 288.192 210.701 C 288.308 211.657 289.445 223.552 287.91 225.334 C 286.072 227.468 288.968 233.993 290.137 235.733 C 292.172 238.761 295.613 241.261 291.637 241.196 C 287.496 241.128 276.752 246.331 276.752 239.296 C 276.752 231.667 275.653 224.282 275.644 221.377 C 275.615 211.453 280.461 208.976 282.117 208.284 Z" fill="%23298DDA"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 272.337 208.92 C 271.061 209.646 267.699 214.348 268.351 218.783 C 268.76 221.569 269.123 230.742 268.282 233.86 C 267.44 236.979 265.975 239.589 265.994 241.307 C 266.003 242.09 269.331 242.484 270.303 242.127 C 272.608 241.278 272.392 239.275 272.061 235.278 C 271.282 225.866 271.305 209.82 274.463 208.284 C 273.704 208.31 272.69 208.72 272.337 208.92 Z" fill="%23298DDA"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 270.455 212.68 C 269.502 214.367 268.478 216.144 268.385 218.058 C 268.267 220.474 268.567 223.234 268.659 225.655 C 268.686 226.288 268.711 226.92 268.712 227.552 C 268.711 227.589 268.78 227.592 268.779 227.553 C 268.845 224.608 268.446 221.016 268.591 218.067 C 268.684 216.182 269.693 214.356 270.522 212.64 C 270.536 212.615 270.469 212.654 270.455 212.68 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 261.231 226.212 L 273.011 227.13 C 273.212 227.145 273.844 227.388 273.866 227.572 C 273.866 227.572 273.959 228.047 273.415 228.047 L 261.231 228.047 L 261.231 226.212 Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 245.174 228.048 L 263.618 228.048 L 258.529 215.613 C 258.22 214.91 257.566 214.209 256.534 214.209 L 241.114 214.219 C 239.457 214.208 239.249 214.774 239.605 215.666 C 240.632 218.234 243.272 225.423 244.179 227.437 C 244.346 227.807 244.739 228.048 245.174 228.048 Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 241.197 214.125 C 245.454 214.115 251.362 214.107 255.63 214.098 C 257.118 214.012 258.041 214.244 258.657 215.596 C 260.032 218.967 261.623 222.901 262.956 226.298 L 272.412 227.083 C 271.514 227.017 262.904 226.446 262.879 226.373 C 261.365 222.899 259.773 218.823 258.261 215.36 C 257.642 214.31 256.787 214.277 255.63 214.32 L 252.422 214.318 C 250.324 214.328 244.825 214.3 242.8 214.313 C 242.071 214.391 239.775 214.019 239.575 214.878 C 239.538 215.694 240.081 216.509 240.34 217.29 C 240.574 217.996 241.396 220.077 241.396 220.077 C 242.238 222.26 243.183 224.884 244.077 227.027 C 244.414 228.006 244.86 228.015 245.86 227.992 C 246.366 227.996 247.684 228.047 248.205 228.051 C 248.267 228.052 248.33 228.091 248.266 228.092 C 247.345 228.081 245.96 228.127 245.052 228.1 C 244.445 228.068 244.11 227.552 243.947 227.074 C 242.981 224.78 242.111 222.452 241.223 220.132 C 240.879 219.173 240.006 216.864 239.619 215.96 C 238.997 214.513 239.729 214.081 241.197 214.125 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 275.17 227.261 C 275.207 227.264 275.23 227.266 275.231 227.266 L 275.17 227.261 Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 254.277 228.013 L 250.994 228.013 C 249.83 228.032 250.439 225.841 249.167 226.054 C 248.081 226.236 248.13 226.822 248.243 228.004 C 248.023 227.751 247.605 227.668 247.462 227.754 C 247.257 227.877 247.486 227.913 247.831 228.422 C 248.231 229.011 249.366 229.561 250.719 229.666 C 251.126 229.698 253.465 230.026 253.465 230.026 L 254.277 228.013 Z" fill="%23BD884F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 273.43 226.926 C 273.43 226.926 272.517 226.328 271.735 226.413 C 270.691 226.525 270.608 226.092 270.34 226.47 C 270.282 226.553 270.466 226.819 270.95 226.918 C 271.602 227.051 271.329 227.422 271.329 227.422 C 271.329 227.422 269.062 227.919 268.743 227.972 C 268.567 228.001 268.519 228.462 269.851 228.825 C 270.545 229.015 271.537 229.02 272.707 229.056 C 273.032 229.066 276.774 230.117 276.774 230.117 L 277.004 228.402 L 277.121 226.619 L 273.43 226.926 Z" fill="%23BD884F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 261.759 229.849 C 261.759 229.849 252.364 230.198 251.779 230.101 C 251.194 230.004 252.38 228.034 252.38 228.034 L 260.869 228.034 L 261.759 229.849 Z" fill="%23298DDA"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 250.812 221.329 L 250.813 221.329 C 251.233 221.329 251.418 221.166 251.49 221.07 C 251.544 220.997 251.525 220.899 251.446 220.849 C 251.368 220.799 251.26 220.818 251.207 220.89 C 251.148 220.967 251.005 221.012 250.813 221.012 L 250.812 221.012 C 250.518 221.012 250.312 220.91 250.216 220.849 C 250.137 220.799 250.03 220.818 249.976 220.89 C 249.922 220.962 249.942 221.061 250.021 221.11 C 250.244 221.251 250.525 221.329 250.812 221.329 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 251.999 221.581 C 252.232 222.143 252.914 222.598 253.521 222.598 C 254.128 222.598 254.43 222.143 254.196 221.581 C 253.962 221.02 253.281 220.565 252.674 220.565 C 252.067 220.565 251.765 221.02 251.999 221.581 Z" fill="%23FF00A4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 247.679 221.581 C 247.913 222.143 248.594 222.598 249.201 222.598 C 249.808 222.598 250.11 222.143 249.876 221.581 C 249.642 221.02 248.961 220.565 248.354 220.565 C 247.747 220.565 247.445 221.02 247.679 221.581 Z" fill="%23FF00A4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 251.624 220.236 C 251.686 220.384 251.865 220.503 252.025 220.503 C 252.184 220.503 252.264 220.384 252.202 220.236 C 252.141 220.088 251.962 219.969 251.802 219.969 C 251.642 219.969 251.563 220.088 251.624 220.236 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 248.577 220.236 C 248.638 220.384 248.818 220.503 248.977 220.503 C 249.137 220.503 249.217 220.384 249.155 220.236 C 249.094 220.088 248.914 219.969 248.755 219.969 C 248.595 219.969 248.515 220.088 248.577 220.236 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 282.24 219.081 C 283.076 221.109 287.72 225.637 287.72 225.637 C 287.72 225.637 276.857 226.674 275.253 226.674 C 275.215 227.193 275.688 231.132 275.688 231.132 C 280.415 231.748 295.422 233.53 296.611 229.881 C 299.087 222.278 289.371 211.902 288.123 210.499 C 286.376 208.534 281.122 216.369 282.24 219.081 Z" fill="%23298DDA"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 275.279 226.624 C 279.449 226.442 283.249 225.805 287.43 225.467 C 285.957 224.016 284.526 222.523 283.298 220.89 C 282.877 220.314 282.494 219.742 282.244 219.083 C 282.236 219.062 282.176 218.891 282.199 218.883 C 283.175 220.714 284.778 222.469 286.296 223.992 C 286.806 224.498 287.325 224.999 287.854 225.485 C 287.942 225.561 288.062 225.696 287.759 225.715 C 284.554 225.912 281.344 226.28 278.146 226.554 C 277.074 226.626 276.512 226.672 275.434 226.675 C 275.261 226.676 275.213 226.623 275.279 226.624 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 275.645 231.116 C 279.889 231.655 284.027 232.18 288.316 232.059 C 288.391 232.052 288.32 232.118 288.238 232.125 C 285.289 232.419 278.882 231.795 277.918 231.624 C 276.122 231.305 275.722 231.227 275.645 231.116 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 268.445 206.225 C 269.23 207.838 271.014 209.234 272.209 209.234 C 275.299 209.234 279.722 204.566 279.722 204.566 C 280.01 204.307 280.251 203.943 280.449 203.535 C 281.235 203.627 282.707 203.253 283.156 202.101 C 283.48 201.268 283.263 200.099 282.587 199.924 C 281.986 199.768 281.504 199.974 281.13 200.265 C 280.417 198.546 275.357 190.197 272.593 189.876 C 270.738 189.661 270.746 190.335 270.755 191.114 C 270.761 191.585 270.767 192.095 270.361 192.469 C 270.167 192.649 269.951 192.8 269.729 192.955 C 268.761 193.631 267.665 194.398 267.619 198.02 C 267.612 198.55 267.539 199.073 267.462 199.619 C 267.229 201.285 266.963 203.179 268.445 206.225 Z" fill="%23BD884F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 280.913 201.625 C 281.196 201.102 281.878 200.778 282.466 201.144 C 282.6 201.227 282.416 201.231 282.36 201.225 C 281.66 201.141 281.387 201.369 281.157 201.735 C 281.377 201.785 281.596 201.965 281.625 202.168 C 281.642 202.292 281.572 202.691 281.526 202.547 C 281.501 202.469 281.562 201.9 281.041 201.95 C 281.033 201.951 280.851 202.24 280.8 202.261 C 280.712 202.297 280.784 201.864 280.913 201.625 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 277.409 206.653 C 277.339 206.662 276.8 207.021 276.635 207.14 C 276.012 207.591 275.487 207.929 274.72 208.397 C 274.573 208.487 274.225 208.661 274.234 208.705 C 274.247 208.766 274.713 208.666 274.85 208.602 C 275.663 208.222 276.458 207.506 277.025 207.04 C 277.21 206.887 277.465 206.645 277.409 206.653 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 276.172 198.628 C 274.858 197.453 273.354 195.965 273.354 195.447 C 273.621 196.887 273.631 197.281 274.211 198.506 C 273.328 198.152 271.339 195.447 271.18 193.822 C 269.937 196.214 268.507 195.084 267.654 198.039 C 266.72 196.945 267.33 192.322 269.309 190.61 C 270.168 189.867 270.809 189.964 271.18 190.071 C 271.712 187.622 275.509 187.929 276.44 188.273 C 276.306 186.142 278.159 182.101 280.027 182.044 C 281.896 181.986 285.86 181.494 288.387 187.254 C 289.408 189.583 289.405 190.759 287.155 196.719 C 286.186 199.287 290.23 200.125 289.904 200.398 C 289.15 201.03 285.13 200.949 284.555 198.171 C 283.967 195.326 284.1 195.18 283.957 194.318 C 284.082 195.864 283.904 197.876 282.107 199.758 C 281.432 200.271 281.098 199.954 280.171 201.23 C 279.993 201.475 279.426 202.823 279.205 202.379 C 278.94 201.845 279.623 200.013 279.44 199.997 C 278.772 199.939 277.186 199.535 276.172 198.628 Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 278.989 188.681 C 278.155 188.321 277.128 188.14 276.44 188.272 C 276.135 187.592 276.443 187.414 276.443 187.414 C 276.443 187.414 277.169 186.776 278.589 187.336 C 280.009 187.896 280.526 188.904 280.503 189.131 C 280.489 189.283 280.408 189.401 280.183 189.417 C 280.183 189.417 279.623 188.954 278.989 188.681 Z" fill="%23FCCC38"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 269.841 204.023 C 271.38 203.966 272.458 203.926 273.494 203.888 C 273.816 203.876 274.1 204.394 273.546 205.073 C 272.762 206.035 270.73 206.369 269.904 205.208 C 269.483 204.616 269.507 204.035 269.841 204.023 Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 270.938 201.281 C 270.54 201.623 269.542 202.997 270.441 203.195 C 270.627 203.236 271.476 203.256 271.351 203.086 C 271.251 202.951 270.624 203.031 270.533 202.774 C 270.414 202.436 270.847 201.774 271.117 201.32 C 271.163 201.242 271 201.214 270.938 201.281 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 269.131 200.714 C 268.976 200.622 268.849 200.485 268.77 200.208 C 268.708 199.991 268.838 199.963 268.904 200.026 C 268.93 200.051 268.959 200.084 268.991 200.121 C 269.106 200.255 269.263 200.438 269.515 200.469 C 269.683 200.49 269.932 200.447 270.186 200.284 C 270.347 200.18 270.489 200.178 270.398 200.384 C 270.278 200.659 269.584 200.984 269.131 200.714 Z M 274.585 201.197 C 273.802 201.581 272.831 201.186 272.852 200.492 C 272.859 200.269 273.01 200.265 273.095 200.417 C 273.315 200.806 273.982 201.177 274.771 200.693 C 274.772 200.692 274.772 200.692 274.773 200.691 C 274.835 200.653 275.009 200.546 275.077 200.614 C 275.184 200.721 274.989 200.999 274.585 201.197 Z" fill="%23090E2B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M 268.564 197.96 C 269.45 197.269 270.926 197.849 271.067 198.626 C 271.121 198.929 270.747 198.99 270.57 198.817 C 269.917 198.179 269.055 198.334 268.717 198.394 C 268.647 198.407 268.6 198.415 268.582 198.412 C 268.283 198.356 268.389 198.096 268.564 197.96 Z M 276.335 199.036 C 275.281 198.281 274.238 198.484 273.109 199.1 C 272.696 199.219 272.599 198.724 272.907 198.415 C 273.577 197.74 274.975 197.615 275.977 198.053 C 276.283 198.186 276.661 198.559 276.755 198.767 C 276.888 199.059 276.714 199.308 276.335 199.036 Z" fill="%23090E2B"/></svg>') no-repeat right bottom;
        background-size: 125px 150px;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        margin-bottom: -31px;
        min-height: 152px;
        padding-bottom: 0;
        gap: var(--iui3-space-gap-gap-large);

        .subheading {
            line-height: normal;
            width: 75%;
        }

        button.iui-btn.primary {
            width: fit-content;
        }
    }
}
</style>
