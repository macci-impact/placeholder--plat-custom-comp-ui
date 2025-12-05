import TwoFaSendAndVerify from './TwoFaSendAndVerify.vue';

export default {
  title: 'src/components-shared/TwoFaSendAndVerify',
  component: TwoFaSendAndVerify,
};

const Template = (args) => ({
  components: {TwoFaSendAndVerify},
  setup() {
    return {args};
  },
  template: `
		<div style="padding: 24px;">
			<TwoFaSendAndVerify v-bind="args"/>
		</div>
  `,
});

export const Default = Template.bind({});
Default.args = {};


const TemplateLight = (args) => ({
  components: {TwoFaSendAndVerify},
  setup() {
    return {args};
  },
  template: `
		<div class="vnext-light" style="padding: 24px;">
			<TwoFaSendAndVerify v-bind="args"/>
		</div>
  `,
});

export const Light = TemplateLight.bind({});
Light.args = {};

const TemplateVnextDark = (args) => ({
  components: {TwoFaSendAndVerify},
  setup() {
    return {args};
  },
  template: `
    <style>
      .vnext-dark{
        background-color: #222;
      }
    </style>
		<div class="vnext-dark" style="padding: 24px; background-color: #222">
			<TwoFaSendAndVerify v-bind="args"/>
		</div>
  `,
});
export const Dark = TemplateVnextDark.bind({});