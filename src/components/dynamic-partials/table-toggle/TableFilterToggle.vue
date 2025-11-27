<template>
    <div class="tab-toggle-container">
        <div class="tab-toggle-inner-container">
            <horizontal-tabs
                :items="decoratedItems"
                :class-name="'table-filter-tabs'"
                :custom-tab-class="'table-filter-tab'"
                :auto-select-first-item=false
                @click="onToggleClick"
            />
        </div>
    </div>
</template>

<script>
import HorizontalTabs from '../../general/HorizontalTabs.vue';

export default {
    name: 'TableFilterToggle',
    components: {HorizontalTabs},
    props: {
        items: Array,
        parameterName: String,
        additionalParams: String,
        overrideDefault: Boolean
    },
    data: () => ({
        decoratedItems: []
    }),
    methods: {
        onToggleClick(key) {
            let url = window.location.pathname + "?" + this.parameterName + "=" + key + (this.additionalParams ? "&" + this.additionalParams : "");
            window.location.assign(url);
        }
    },
    beforeMount() {
        this.items.forEach(obj => {
            const item = {
                key: obj.key,
                label: obj.label,
                isSelected: "true" === obj.isSelectedString,
                isDisabled: "true" === obj.isDisabledString
            }
            this.decoratedItems.push(item);
        });
    }
}
</script>

<style lang="less" scoped>
.tab-toggle-container {
    align-items: flex-start;
    border-top: var(--iui-border-light);
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;

    .tab-toggle-inner-container {
        margin: 20px 20px 0 0;

        .horizontal-tabs.table-filter-tabs {
            background-color: transparent !important;
            border-radius: var(--iui-border-radius-default) !important;
        }
    }
}
</style>
