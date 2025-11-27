<template>
  <div v-if="!isDisabled" class="shimmerWrapper" :style="{width, height,borderRadius}">
    <div class="shimmer" :style="{width, height, borderRadius}"></div>
    <div class="shimmerContent">
      <slot v-if="includeChildren"></slot>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script>
export default {
  name: 'DefaultShimmer',
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    includeChildren: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      validator: value => {
        return /^(\d+(?:\.\d+)?)(px|%)$/.test(value);
      },
      required: true
    },
    height: {
      type: String,
      validator: value => {
        return /^(\d+(?:\.\d+)?)(px|%)$/.test(value);
      },
      required: true
    },
    borderRadius: {
      type: String,
      validator: value => {
        return /^(\d+(?:\.\d+)?)(px)$/.test(value);
      },
      required: true
    }
  },
};
</script>

<style scoped lang="less">
@keyframes shimmer {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

.shimmerWrapper {
  position: relative;
  overflow: visible;
  box-sizing: border-box;
}


.shimmer {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(242, 243, 244, 1);
  animation: shimmer 1s infinite;
  box-sizing: border-box;
}

.shimmerContent {
  position: relative;
}
</style>
