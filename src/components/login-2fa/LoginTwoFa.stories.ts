import type { Meta, StoryObj } from "@storybook/vue3";
import LoginTwoFa from "./LoginTwoFa.vue";


const meta: Meta<PagePropsAndCustomArgs> = {
    component: LoginTwoFa,
    render: (args) => ({
        components: { LoginTwoFa },
        setup() {
            return { args };
        },
        template: `
          ToDo: Mock fetch
      <login-two-fa v-bind="args" >
      </login-two-fa>
    `,
    }),
};
export default meta

type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {
    args: {
        preSavedDeviceName: 'pre-saved name',
        otherOptionsLabel: 'other options',
        allVerificationOptions: [
            {
                contactMethod: 'method',
                label: 'opt label'
            },
            {
                contactMethod: 'method2',
                label: 'opt label2'
            }
        ],
        preferredMethod: 'preferred',
        logoUrl: 'data:image/webp;base64,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',
        csrfToken: 'csrf_string',
    }
};