<template>
    <div :class="getContainerClass()">
        <img :src="getImagePath(context)" :alt="resourceType" :class="getImageClass(context)"
             v-on:error="handleImageError(context.genericThumbnailDisplayUrl, $event)"/>
    </div>
</template>

<script>
export default {
    name: "ImagePreview",
    props: {
        context: {
            type: Object,
            default: () => {
            }
        },
        resourceType: {
            type: String,
            default: ''
        },
        cardView: Boolean
    },
    methods: {
        getImagePath: (ctx) => {
            return ctx?.hasThumbnail && (ctx?.previewUrl || ctx?.customUrl) ? (ctx.previewUrl || ctx.customUrl) : ctx.genericThumbnailDisplayUrl;
        },
        getImageClass: (ctx) => {
            return ctx?.hasThumbnail && ctx?.previewUrl ? 'preview' : 'generic-thumb';
        },
        getContainerClass() {
            return this?.cardView ? 'imgPreview card-view' : 'imgPreview'
        },
        handleImageError: (defaultSrc, event) => {
            const img = event.target;
            img.src = '';
            img.src = defaultSrc;
            img.className = 'generic-thumb';

            return null;
        }
    }
}
</script>

<style lang="less" scoped>
.imgPreview {
    align-items: center;
    border-radius: 8px;
    border: var(--flash-gray) solid 1px;
    box-sizing: border-box;
    display: flex;
    height: 85px;
    justify-content: center;
    max-width: 85px;
    overflow: hidden;
    padding: 45px;

    img {
        height: auto;
        max-width: 85px;

        &.generic-thumb {
            max-width: 40px;
        }
    }
    &.card-view {
        align-self: center;
        border-radius: 0;
        border-width: 0;
        height: auto;
        justify-self: center;
        margin-bottom: 30px;
        margin-top: 10px;
        max-height: 120px;
        max-width: 146px;
        padding-top: 36px;

        img {
            height: auto;
            max-height: 146px;
            max-width: 146px;

            &.generic-thumb {
                max-height: 85px;
                max-width: 85px;
                padding-top: 0;
            }
        }
    }
}
</style>
