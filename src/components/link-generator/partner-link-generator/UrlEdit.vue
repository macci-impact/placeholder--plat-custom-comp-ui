<script>
import { Btn, CopyToClipboard, Icon } from "@impactinc/ui-component-library";

export default {
    name: "UrlEdit",
    components: {
			Btn,
      CopyToClipboard,
      Icon
    },
    props: {
        disableEdit: Boolean,
        linkValue: String,
        messages: Object,
        clipboardPrefix: String,
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
        disableEdit: {
            immediate: false,
            handler(newVal, oldVal) {
                if (newVal && oldVal && newVal !== oldVal) {
                    this.stopEditing();
                }
            }
        },
        linkValue: {
          immediate: true,
          handler(newVal) {
            this.internalLinkValue = newVal;
          }
        }
    },
    computed: {
        getLinkTitle() {
            if (!this.disableEdit) {
                return this.messages['create_link_menu.edit.title'] + ' ' + this.internalLinkValue;
            }
            return this.internalLinkValue;
        },
        getClipboardText() {
          if(this.editing) {
            return null;
          }
          return this.clipboardPrefix ? this.clipboardPrefix + this.internalLinkValue : 'https://' + this.internalLinkValue
        }
    },
    emits: ['notification', 'rename'],
    methods: {
        inputEditClick: function () {
            this.editing = true;
            this.linkUndoValue = this.internalLinkValue;
            let input = this.$refs.input;
            input.selectionStart = 0;
            input.selectionEnd = 0;
            input.setSelectionRange(input.value.length, input.value.length);
            input.focus();
            return false;
        },
        buttonCancelClick: function () {
            this.editing = false;
            this.internalLinkValue = this.linkUndoValue;
            this.$emit('notification', '🚫 ' + this.messages['create_link_menu.tooltip_canceled']);
            return false;
        },
        buttonSaveClick: function () {
            this.$emit('rename', { new: this.internalLinkValue, original: this.linkUndoValue });
            this.editing = false;
            this.linkUndoValue = '';
        },
        stopEditing: function () {
            this.editing = false;
            this.$emit('notification', '👍 ' + this.messages['create_link_menu.link_updated']);
        },
        blurHandler() {
            setTimeout(() => {
                this.editing = false;
                if (this.linkUndoValue.length) {
                    this.internalLinkValue = this.linkUndoValue;
                }
            }, 1000);
        }
    }
}
</script>
<template>
    <div class="url-edit">
        <div class="input-with-button">
            <input ref="input"
                   :title="getLinkTitle"
                   :placeholder="placeholder"
                   v-model="internalLinkValue"
                   autocomplete="off"
									 class="editableInput styled-focus-within"
                   :class="[{'inputNotEditing': !editing }]"
                   :readonly="!editing"
                   @focus="inputEditClick"
            />
            <CopyToClipboard
							:btnCls="editing ? 'btn-copy disabled' : 'btn-copy primary'"
							:label="messages['create_link_menu.label.button.copy']" emoji="👍"
							:success-message="messages['create_link_menu.copy.notification']" :passed-text="getClipboardText"
							:inert="editing"
						>

						</CopyToClipboard>
        </div>

        <transition name="fade">
            <div v-if="editing" class="edit-icons">
							<btn
								class="urlEditIconButton confirm"
								size="small"
								is-icon-only
								@click="buttonSaveClick"
							>
								<icon name="check" :title="messages['create_link_menu.save.title']"/>
							</btn>
							<btn
								class="urlEditIconButton confirm cancel"
								size="small"
								is-icon-only
								@click="buttonCancelClick"
							>
								<icon name="times" :title="messages['create_link_menu.cancel']"/>
							</btn>
            </div>
        </transition>
    </div>
</template>
<style lang="less" scoped>
.focus-outline() {
	outline: 2px solid var(--iui3-color-text-text-subdued, var(--storm-gray));
}


.url-edit {
    position: relative;

    .input-with-button {
        display: flex;
        .editableInput {
            background: var(--iui3-color-background-background-default, #FFFFFFFF);
            border-radius:  var(--iui-border-radius-default, 8px);;
            border: var(--iui-border-default);
            box-sizing: border-box;
            color: var(--iui3-color-text-text-default, #2D3E50);;
            cursor: text;
            display: block;
            flex-grow: 3;
            font-size: var(--iui3-typography-font-size-regular-text, 14px);
            height: var(--iui3-space-height-input-height-default, 38px);
            outline: none;
            padding: 0 var(--iui3-space-padding-input-padding-leftright, 10px);
            width: 100%;
						margin-right: var(--iui3-space-gap-gap-small, 5px);

            &.inputNotEditing {
                color: var(--iui3-color-text-text-subdued, #6C7784FF);
                font-size: var(--iui3-typography-font-size-regular-text, 14px);
            }
						&:focus{
							.focus-outline();
						}
        }

        btn.primary {
            flex-grow: 1;
        }
				:deep(.iui-copy-to-clipboard){
					&:focus-within{
						border-radius: var(--iui3-space-radius-button-radius, 8px);
						.focus-outline();
					}
				}
    }

    .edit-icons {
        /* TODO: No token for this */
        bottom: -40px;
        position: absolute;
				display: flex;

        .edit {
            /* TODO: This is for the pencil icon, no theme token for it */
            color: var(--strata-blue);
            cursor: pointer;
        }

        .urlEditIconButton {
            cursor: pointer;
            height: var(--iui3-size-vnext-size-18, 28px);
            width: var(--iui3-size-vnext-size-18, 28px);
						display: flex;
						align-items: center;
						justify-content: center;
						background: none;
						outline: 2px solid transparent;
            &.confirm {
                color: var(--iui3-color-icon-icon-default, #2d3e50ff);
                margin-right: var(--iui3-space-gap-gap-small, 5px);
            }

            &.cancel {
                color: var(--iui3-color-critical-icon-critical, #c00800ff);
                //height: var(--iui3-space-height-icon-height-small, 10px);
            }
						&:focus{
							background: transparent;
							.focus-outline();
						}
						&:hover{
							background: transparent;
						}
        }

        svg.iui-icon.edit {
            height: var(--iui3-space-height-icon-height-default, 16px);
            width: var(--iui3-space-width-icon-width-default, 16px);
        }

    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
}
</style>
