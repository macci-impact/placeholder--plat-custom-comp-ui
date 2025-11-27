import type { Meta, StoryObj } from "@storybook/vue3";

import TableToggle from "./TableToggle.vue";
const meta: Meta<PagePropsAndCustomArgs> = {
    component: TableToggle,
    render: (args) => ({
        components: { TableToggle },
        setup() {
            return { args};
        },
        template: `
<table-toggle v-bind="args">
</table-toggle>
`,
    }),
};
export default meta;

type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {

    args: {
        items: [
            {
                label: 'item 1',
                key: '111'
            }
        ],
        parameterName: 'paramName',
        additionalParams: '',
        overrideDefault: false,


    }
};