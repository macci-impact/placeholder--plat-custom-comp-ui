<template>
    <div class="btn-toggle-container" :class="customClass">
        <div class="btn-toggle-inner-container">
            <HorizontalTabs
                :items="items"
                :class-name="customClass"
                :custom-tab-class="customTabClass"
                @click="onToggleClick"
            />
        </div>
    </div>
</template>

<script>
import HorizontalTabs from "../../general/HorizontalTabs.vue";

export default {
    name: "TableToggle",
    components: { HorizontalTabs },
    props: {
        items: Array,
        parameterName: String,
        additionalParams: String,
        overrideDefault: Boolean,
        customClass: String,
        customTabClass: String
    },
    methods: {
        onToggleClick(key) {
            if (this.overrideDefault) {
                this.$emit('toggleClicked', key);
            } else {
                let url = window.location.pathname + "?" + this.parameterName + "=" + key + (this.additionalParams ? "&" + this.additionalParams : "");
                window.location.assign(url);
            }
        }
    }
}
</script>

<style lang="less" scoped>
.toggle-separator {
    width: 100%;
    height: 1px;
    border-width: 0;
    background-color: var(--pale-gray);
}
.btn-toggle-container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;

    .btn-toggle-inner-container {
        margin: var(--iui3-space-gap-gap-large ,20px);

        .horizontal-tabs {

            .horizontal-tab-item:hover:not(.selected) {
                color: var(--strata-blue);
            }

            .horizontal-tab-item.selected,
            .horizontal-tab-item.selected:hover {
                color: var(--coal-black);
            }
        }
    }
}
</style>
