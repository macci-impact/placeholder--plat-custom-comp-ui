import type { Preview } from "@storybook/vue";
import { initialize, mswLoader } from "msw-storybook-addon";
import { handlers } from "../src/mocks/handlers";
import "../src/assets/styles.css";

// Initialize MSW with our already-defined handlers
initialize(
  {
    serviceWorker: {
      // Since we deploy Storybook not at the root directory, we need to specify the service worker
      // is in the same directory as the Storybook's index.html
      url: "./mockServiceWorker.js",
    },
  },
  [...handlers]
);

// Stub global window fns
(<any>window).getCsrfToken = function () {
  return "fakeToken";
};
(<any>window).parent.getCsrfToken = function () {
  return "fakeToken";
};
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
};
document.body.classList.add('v2');
export default preview;
