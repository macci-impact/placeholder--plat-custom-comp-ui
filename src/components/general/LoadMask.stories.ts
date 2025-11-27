import type { Meta, StoryObj } from "@storybook/vue3";
import { ref, onMounted } from 'vue';

import LoadMask from "./LoadMask.vue";


const meta: Meta<PagePropsAndCustomArgs> = {
  components: { LoadMask },
  component: LoadMask,
  render: (args) => ({
    components: { LoadMask },
    setup() {

      onMounted(() => {
            console.log('mounted story')
      });
      return { args };
    },
    template: `
<LoadMask v-bind="args" />
`,
  }),
};
export default meta;

type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {

    args: {


    }
};