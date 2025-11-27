<template>
    <div class="preview-link">
        <div class="preview-link-body">
            <div class="url-holder">
                {{url}}
            </div>

            <div class="preview-link-actions">
                <btn class="secondary " is-circle @click="copyUrl" data-testid="btn-copy-url">
                    <icon name="copy"/>
                </btn>
                <btn class="secondary" @click="openInNewTab" data-testid="btn-preview-url">
                    Preview
                </btn>
            </div>
        </div>
        <div class="notification-anchor" ref="notificationAnchor">
            <notification
                    v-if="notificationAnchor"
                    :offset-y="10"
                    :is-open="showNotification"
                    :show-duration="3"
                    :anchor="notificationAnchor"
                    :transition-duration="1"
                    @close="showNotification = false"
            >
                Url copied to clipboard
            </notification>
        </div>
    </div>
</template>

<script>

import {Btn, Icon, Notification} from "@impactinc/ui-component-library";

export default {
    name: 'PreviewLink',
    components: {
        Btn,
        Icon,
        Notification,
    },
    props: {
        url: String
    },
    data() {
        return {
            showNotification: false,
            notificationAnchor: null,
        }
    },
    methods: {
        copyUrl() {
            navigator.clipboard.writeText(this.url)
            this.showNotification = true;
        },
        openInNewTab() {
            window.open(this.url + "?preview=t", '_blank')
        }
    },
    emits: ['copied'],
    mounted() {
        this.notificationAnchor = this.$refs.notificationAnchor;
    }

}
</script>

<style lang="less" scoped>
.preview-link-body {
    display: flex;
    align-items: center;
    padding: var(--iui3-space-gap-gap-large, 16px);
    justify-content: space-between;
    gap: var(--iui3-space-gap-gap-default, 8px);
    align-self: stretch;
    border-radius: var(--iui3-space-radius-input-radius, 8px);
    border: 1px solid var(--iui3-color-border-border-default, #CACFD3);

    .preview-link-actions {
        display: flex;
        align-items: center;
        gap: var(--iui3-space-gap-gap-default, 8px);

    }
}

</style>