import type { Meta, StoryObj } from "@storybook/vue3";
import { ref, onMounted } from 'vue';

import MonthDayYearInput from "./MonthDayYearInput.vue";

const meta: Meta<PagePropsAndCustomArgs> = {
    component: MonthDayYearInput,
    render: (args) => ({
        components: { MonthDayYearInput },
        setup() {
            const modalRef = ref(null);
            onMounted(() => {
                if (modalRef.value) {
                    modalRef.value.show(); // Call the method on the component
                }
            });
            return { args, modalRef };
        },
        template: `
            <div>
    <month-day-year-input v-bind="args" v-model="args.v"  ref="mdyi" field-name="testing">
    </month-day-year-input>
            </div>
`,
    }),
};
export default meta;

type Story = StoryObj<PagePropsAndCustomArgs>;


let dt = new Date().toISOString().split('T')[0];

export const Primary: Story = {
    args: {
        v: dt
    }
};