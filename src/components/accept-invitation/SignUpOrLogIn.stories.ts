import type { Meta, StoryObj } from "@storybook/vue3";

import SignUpOrLogIn from "./SignUpOrLogIn.vue";

const meta: Meta<PagePropsAndCustomArgs> = {
    components: { SignUpOrLogIn },
    component: SignUpOrLogIn,
    render: (args) => ({
        components: { SignUpOrLogIn },
        setup() {
            return { args };
        },
        template: `
<SignUpOrLogIn v-bind="args">
</SignUpOrLogIn>
`,
    }),
};
export default meta;

type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {
    args: {
        enabledSsoProviders: [],
        hasEmailLogin: true,
        join: "Join",
        member: "Member",
        network: "Network",
        signUpWithEmailText: "Sign up with email",
        signUpWithEmailUrl: "/signup",
        or: "or",
        loginUrl: "/login",
        alreadyHaveAccount: "Already have an account?",
        signInBtn: "Sign in",
    }
};