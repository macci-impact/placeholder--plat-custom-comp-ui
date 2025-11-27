<template>
    <div class="core-component horizontal-tabs" :class="className" v-if="mutableItems.length > 0">
        <div
            v-for="item in mutableItems"
            :ref="item.key"
            :key="item.key"
            :data-key="item.key"
            :class="[{ 'disabled-item': item.isDisabled, 'selected': item.isSelected }, getClass()]"
            @click="onItemClick(item.key, item.isDisabled)"
        >
            {{ item.label }}
            <div class="unread-tab" v-if="item.isUnread"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: "HorizontalTabs",
    props: {
        // [{label, key, isSelected, isDisabled}]
        items: {type: Array, default: () => []},
        className: String,
        customTabClass: String,
        autoSelectFirstItem: { type: Boolean, default: true }
    },
    emits: ['click'],
    data: () => ({
        mutableItems: []
    }),
    watch: {
        items: {
            immediate: true,
            deep: true,
            handler: function (items = []) {
                this.mutableItems = this.shallowCopyArray(items);

                // IF none are selected then select the first
                if (this.autoSelectFirstItem &&
                    this.mutableItems.length &&
                    this.mutableItems.every(x => x.isSelected === false)) {
                    let first = this.mutableItems[0];
                    this.onItemClick(first.key, first.isDisabled);
                }
            }
        }
    },
    methods: {
        onItemClick(key, isDisabled) {
            if (isDisabled === true) return;
            this.mutableItems = this.mutableItems.map(x => {
                return Object.assign(x, {isSelected: x.key === key});
            });
            if (key === 'partner-messages') {
                this.$emit('markRead', false);
            }
            this.$emit("click", key); // start here
            this.$emit("update:modelValue", key);
            this.$emit("select", key);
        },
        shallowCopyArray(items) {
            return items.map(x => Object.assign({}, x));
        },
        resetItems(items) {
            this.items = items;
        },
        getClass() {
            return 'horizontal-tab-item' + (this.customTabClass ? ' ' + this.customTabClass : '');
        }
    }
};
</script>

<style lang="less" scoped>
.horizontal-tabs {
    text-align: center;
    display: flex;
    background-color: var(--pale-gray);
    border-radius: 30px;
    padding: var(--iui3-space-gap-gap-small, 5px);

    .horizontal-tab-item {
        flex: 1 1 auto;
        color: var(--coal-black);
        border-radius: 30px;
        font-size: var(--iui-font-size-default, 14px);
        line-height: 24px;
        padding: var(--iui3-space-padding-tab-padding-topbottom, 3px) var(--iui3-space-padding-button-padding-leftright, 10px);
        user-select: none;

        .unread-tab {
            width: 6px;
            height: 6px;
            border-radius: 100%;
            background-color: var(--strata-blue);
            display: inline-block;
            position: relative;
            top: -6px;
            left: -2px;
        }

        &.selected:not(.disabled-item) {
            background: var(--iui3-color-background-background-default, #ffffff);
            box-shadow: 0 2px 2px rgba(0, 0, 0, 0.08);
        }

        &:hover:not(.disabled-item) {
            color: var(--strata-blue);
            cursor: pointer;
        }

        &.disabled-item {
            color: var(--serenity-gray) !important;
        }

        &.disabled-item:hover,
        &.disabled-item:selected {
            background: var(--pale-gray) !important;
            color: var(--serenity-gray) !important;
            cursor: default !important;
        }

        &.wide-tab-item {
            padding: var(--iui3-space-padding-tab-padding-topbottom, 3px) 4.5vw;
        }

        &.table-filter-tab {
            border-radius: var(--iui-border-radius-default) !important;
            white-space: nowrap;

            &:hover:not(.selected):not(.disabled-item) {
                background: var(--pale-gray) !important;
                color: var(--coal-black) !important;
            }

            &.selected,
            &.selected:hover,
            &.selected:not(.disabled-item) {
                background: var(--pale-gray) !important;
            }
        }
    }

    .horizontal-tab-item ~ .horizontal-tab-item {
        margin-left: var(--iui3-space-gap-gap-default, 10px);
    }
}
</style>
