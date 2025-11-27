<template>
  <dialog ref="dialog" part="loadMask" class="loadMask">
    <LoadingDots v-if="visible" />
  </dialog>
</template>

<script>
import { LoadingDots } from "@impactinc/ui-component-library";

export default {
  name: "LoadMask",
  components: {
    LoadingDots
  },
  props: {
    visible: Boolean,
  },
  mounted() {
    if(this.visible) {
      this.$refs.dialog.showModal()
    }
  },
  watch: {
    visible: {
      handler(newV,oldV) {
        if(this.$refs.dialog) {
          if(newV) {
            this.$refs.dialog.showModal()
          }
          else {
            this.$refs.dialog.close();
          }
        }
      }
    }
  }
};
</script>

<style scoped lang="less">
.loadMask {
  display: contents;
  border: none;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  opacity: 50%;
  max-width: 100vw;
  max-height: 100vh;
  .loadingDots {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;

  }
}
.loadMask[open] { animation: fadeIn .12s ease-out; }
@keyframes fadeIn { from { opacity:.7; transform: translateY(-4px);} }
</style>