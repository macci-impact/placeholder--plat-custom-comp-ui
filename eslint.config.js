import impactVueConfig from "@impactinc/frontend-vue-eslint-config";

export default [
  ...impactVueConfig,
  {
    rules: {
      // // TODO remove this rule switching off when all the errors are fixed
      // "no-undef": "off",
      // // TODO remove this rule switching off when all the errors are fixed
      // "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      // // TODO remove this rule switching off when all the errors are fixed
      // "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      // // TODO remove this rule switching off when all the errors are fixed
      // "n/no-callback-literal": "off",
      // // TODO remove this rule switching off when all the errors are fixed
      // "sonarjs/cognitive-complexity": "off",
      // // TODO remove this rule switching off when all the errors are fixed
      // "sonarjs/no-duplicate-string": "off",
      // "promise/always-return": ["error", { ignoreLastCallback: true }],
      // // TODO remove this rule switching off when all the errors are fixed
      // "promise/prefer-await-to-callbacks": "off",
      // // TODO remove this rule switching off when all the errors are fixed
      // "vue/multi-word-component-names": "off",
      // // TODO remove this rule switching off when all the errors are fixed
      // "vue/require-default-prop": "off",
    },
  },
  {
    // ignores: ["**/WidgetDataView.vue"],
  },
];
