/**
 * A simple story that renders the HelloWorld view component directly.
 * No mocking is involved, this is purely display
 */// https://www.npmjs.com/package/vue-component-type-helpers
import { http, HttpResponse } from "msw";
import type { Meta, StoryObj } from "@storybook/vue3";
import HelloWorld from "./HelloWorld.vue";
import HelloWorldController from "./HelloWorldController.vue";
import { HELLO_WORLD_FAKE_ENDPOINT } from "@/data/endpoints";


const meta: Meta<PagePropsAndCustomArgs> = {
  component: HelloWorld,
  render: (args) => ({
    components: { HelloWorld },
    setup() {
      return { args };
    },
    template: `
      <hello-world v-bind="args">
            
      </hello-world>
    `,
  }),
};
export default meta

type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {
  args: {
    message: "Hello, World!"
  },
};
