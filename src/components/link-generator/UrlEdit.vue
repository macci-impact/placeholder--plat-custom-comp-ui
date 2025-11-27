<template>
    <div class="url-edit">
        <div>
            <div  v-if="tooltipText" style="width: 100%; text-align: center">
                <span style="position: relative;">
                    <span class="irTooltipTextBox">
                        {{tooltipText}}
                    </span>
                </span>
            </div>

            <input ref="input"
                   :title="internalLinkValue"
                   :placeholder="placeholder"
                   v-model="internalLinkValue"
                   @click="inputClick"
                   autocomplete="off"
                   :class="['editableInput',{'inputNotEditing': !editing }, {'editDisabled' : disableEdit}]"
                   :readonly="!editing"
            />
          <CopyToClipboard btnCls="none" ref="copyEl" :passed-text="internalLinkValue"></CopyToClipboard>

        </div>


        <div class="edit-icons" v-if="!disableEdit">
            <template v-if="editing">
              <icon name="check" class="urlEditIconButton confirm" @click="buttonSaveClick" :title="messages['create_link_menu.save.title']"/>
              <icon name="times" class="urlEditIconButton cancel" @click="buttonCancelClick" :title="messages['create_link_menu.cancel']"/>
            </template>

            <template v-else>
                <icon name="edit" @click="buttonEditClick" />
            </template>

        </div>
    </div>
</template>

<script>
import { Icon, CopyToClipboard } from "@impactinc/ui-component-library";
export default {
    name: "UrlEdit",
    components: {
        Icon,
        CopyToClipboard
    },
    props: {
        clipboardPrefix: String,
        disableEdit: Boolean,
        linkValue: String,
        messages: Object
    },
    data: function () {
        return {
            linkUndoValue: '',
            internalLinkValue: this.linkValue,
            editing: false,
            tooltipText: '',
            placeholder: ''
        }
    },
    watch: {
        disableEdit: function (disable) {
            if(disable) {
                this.stopEditing();
            }
        }
    },
    methods: {

        buttonEditClick: function () {
            this.editing = true;
            this.linkUndoValue = this.internalLinkValue;

            var input = this.$refs.input;
            input.selectionStart = 0;
            input.selectionEnd = 0;
            input.setSelectionRange(input.modelValue?.length,input.modelValue?.length);
            input.focus();

            return false;
        },

        buttonCancelClick: function () {
            this.editing = false;
            this.internalLinkValue = this.linkUndoValue;
            this.$emit('notification', this.messages['create_link_menu.tooltip_canceled'], '🚫');
            return false;
        },

        buttonSaveClick: function () {
            this.editing = false;
            this.$emit('saveClick', this.internalLinkValue)
        },
        stopEditing: function () {

            this.editing = false;
            this.$emit('notification', "Saved");
        },
        inputClick : function (ctx) {
            if(!this.editing) {
              let url = this.clipboardPrefix ? this.clipboardPrefix + this.internalLinkValue : "https://" + this.internalLinkValue
              this.$refs.copyEl.copyToClipboard(url);
            }
        },

        message: function (ctx, value) {
            this.tooltipText = value;
            setTimeout(function () {
                this.tooltipText = undefined;
            }.bind(this), 1000)
        }

    }
}
</script>

<style scoped>
.url-edit {
    position: relative;
}
/* TODO: This is for the small box next to the URL which has the pencil icon and if editing, shows a green check mark
    and a red cross for ok/cancel. So these values are pretty specific to make all of that look good */
.edit-icons {
    width: 45px;
    position: absolute;
    right: 0;
    top: 8px;
    text-align: center;
    font-size: 16px !important;
}

.inputNotEditing {
    cursor: pointer;
}

.urlEditIconButton {
    cursor: pointer;
    margin-right: 5px;
    height: var(--iui-icon-large);
    width: var(--iui-icon-large);
}

.editableInput {
    display: block;
    font-size: var(--iui3-typography-font-size-regular-text, 14px);
    height: var(--iui3-space-height-input-height-default, 38px);
    border-radius: var(--iui-border-radius-default, 8px);
    border: var(--iui-border-default, 1px solid #CACFD3);
    color: var(--iui3-color-text-text-default, #2D3E50);
    background: var(--iui3-color-background-background-default, #FFFFFFFF);
    outline: none;
    box-sizing: border-box;
    padding-right: 44px;
    width: 100%;
}
.editDisabled {
    padding-right: var(--iui3-space-padding-input-padding-leftright, 10px);
}
.edit {
    color: var(--strata-blue, #14B1F7);
}

.confirm {
    color: var(--iui3-color-icon-icon-default, #2d3e50ff);
}

.cancel {
    color: var(--iui3-color-critical-icon-critical, #c00800ff);
}

.irTooltipTextBox {
    font-size: var(--iui3-typography-font-size-regular-text, 14px);
    background-color: var(--iui3-color-icon-icon-default, #2d3e50ff);
    color: var(--iui3-color-icon-icon-invert, #ffffffff);
    text-align: center;
    padding: 0 var(--iui3-space-padding-input-padding-leftright, 10px);
    box-sizing: border-box;
    border-radius: var(--iui3-space-radius-tooltip-radius, 8px);
    height: var(--iui3-space-height-input-height-small, 30px);
    bottom: 10px;
    width: 120px;
    left: -60px;
    /* Tooltip text position */
    position: absolute;
    z-index: 1;
}
.irTooltipTextBox::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    /* TODO: Not sure what tokens to use for this */
    margin-left: -3px;
    /* TODO: Not sure what to do with these either */
    border: 5px solid;
    border-color: #000 transparent transparent transparent;
}
.iui-copy-to-clipboard {
  display: none;
}

</style>
