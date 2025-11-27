import type { Meta, StoryObj } from "@storybook/vue3";
import LinkGeneratorWidget from "./LinkGeneratorWidget.vue";

const meta: Meta<PagePropsAndCustomArgs> = {
    component: LinkGeneratorWidget,
    render: (args) => ({
        components: { LinkGeneratorWidget },
        setup() {
            return { args };
        },
        template: `
      <link-generator-widget v-bind="args">
            
      </link-generator-widget>
    `,
    }),
};
export default meta;



type Story = StoryObj<PagePropsAndCustomArgs>;

export const Primary: Story = {
    args: {
        csrf: "csrf_string",
        messages: {
            'create_link_menu.whoops': 'whoops that is an error',
            'create_link_menu.title': 'my title',
            'create_link_menu.description.promote_brand': 'promote brand',
            'create_link_menu.heading.campaigns': 'campaign heading',
            'create_link_menu.heading.publishers': 'publisher heading',
            'create_link_menu.enter_landing_placeholder': 'landing placeholder',
            'create_link_menu.enter_landing_url': 'url',
            'mp_ad_search_get_code.value_sub_id1': 'subid1',
            'mp_ad_search_get_code.value_sub_id2': 'subid2',
            'mp_ad_search_get_code.value_sub_id3': 'subid3',
            'mp_ad_search_get_code.value_sub_id4': 'subid4',
            'mp_ad_search_get_code.value_media_property': 'mprop',
            'mp.dashboard.create_a_link.no_link': 'not available'
        },
        context:  {
            campaigns: [
                {
                    label: '11111',
                    value: '1'
                },
                {
                    label: '22222',
                    value: '2'
                },
                {
                    label: '333333',
                    value: '3'
                },
                {
                    label: '4444',
                    value: '4'
                },
                {
                    label: '66666',
                    value: '6'
                },
                {
                    label: '77777',
                    value: '7'
                },
                {
                    label: '888888',
                    value: '8'
                },
                {
                    label: '999999',
                    value: '9'
                },
                {
                    label: 'ten',
                    value: '10'
                },
                {
                    label: 'eleven',
                    value: '11'
                },
                {
                    label: 'twelve',
                    value: '12'
                }
            ],
                properties: []
        },
        passedCampaign: 123,
        tableContext: null
    },
};
