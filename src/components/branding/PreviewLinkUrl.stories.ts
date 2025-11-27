import type { Meta, StoryObj } from "@storybook/vue3";
import PreviewLinkUrl from "./PreviewLinkUrl.vue";

type PagePropsAndCustomArgs = typeof PreviewLinkUrl & {
    copyLink: () => void;
};

const meta: Meta<PagePropsAndCustomArgs> = {
    component: PreviewLinkUrl,
    argTypes: {
        url: {
            control: 'text',
            description: 'URL to display'
        },
        copyLink: {
            action: 'copyLink',
            description: 'Event emitted when copy button is clicked'
        }
    },
    render: (args) => ({
        components: { PreviewLinkUrl },
        setup() {
            return { args };
        },
        template: `
            <preview-link-url v-bind="args" @copyLink="args.copyLink">
                <div>Optional slot content here</div>
            </preview-link-url>
        `,
    }),
};

export default meta;

type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {
    args: {
        url: 'https://impact.com',
    }
};

