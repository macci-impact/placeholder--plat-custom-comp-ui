import type { Meta, StoryObj } from "@storybook/vue3";
import { ref, onMounted } from 'vue';

import PsaLanding from "./PsaLanding.vue";


const meta: Meta<PagePropsAndCustomArgs> = {
  components: { PsaLanding },
  component: PsaLanding,
  render: (args) => ({
    components: { PsaLanding },
    setup() {

      onMounted(() => {
            console.log('mounted story')
      });
      return { args };
    },
    template: `
<PsaLanding v-bind="args" />
`,
  }),
};
export default meta;

type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {

    args: {
        title: 'My Title',
    }
};