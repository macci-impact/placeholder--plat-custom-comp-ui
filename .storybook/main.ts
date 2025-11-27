export default {
  stories: ["../src/**/*.mdx", "../**/*.stories.@(js|jsx|mjs|ts|tsx)", "../**/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  core: {
    builder: "@storybook/builder-vite",
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import("vite");

    return config;
  },

  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },

  docs: {
    autodocs: true,
  },
};
