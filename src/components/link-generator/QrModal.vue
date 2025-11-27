<template>
    <modal :bind="modalParams" :is-open="modalOpen" @primaryClick="done" @close="closeQrModal" class="qr-modal">
        <template v-slot:content>
            <div class = "qrModal">
                <img v-if="qrUrl" id="qrimg" :src="qrUrl" :title="url" />
            </div>
        </template>
    </modal>
</template>

<script>
import { Modal } from '@impactinc/ui-component-library';
import QRious from "qrious";

export default {
    name: "QrModal",
    components: {
        Modal, QRious
    },
    props: {
        messages: Object,
        url: String,
        isOpen: Boolean
    },
    data: function(){
        return {
            qrUrl: '',
            value: '',
            modalOpen: false,
            modalParams : {
                primaryButtonLabel: this.messages['scan_qr_code_popup_button.download'],
                secondaryButtonLabel: 'Cancel',
                width: '200px',
                height: '200px',
                title: this.messages['scan_qr_code_popup_title'],
            }
        }
    },
    methods: {
        closeQrModal(){
            this.modalOpen = false
            this.$emit("qrClose")
        },
        done: function () {
            var downloadLink = document.createElement("a");
            downloadLink.href = this.qrUrl;
            downloadLink.download = "qrcode.png";
            downloadLink.click();
            this.modalOpen = false;
            this.$emit("qrClose");
        }
    },
    watch: {
        isOpen: {
            handler:function(open) {
                this.modalOpen = open;
                if(open && this.url) {
                    this.qrUrl = new QRious({
                        value: this.url,
                        size: 150
                    }).toDataURL();
                }
            }
        }
    }
}
</script>

<style scoped lang="less">
.qrModal {
  padding: var(--iui3-space-gap-gap-large);
  text-align: center
}
</style>
