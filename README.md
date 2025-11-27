# platform-assets-ui-template

This is a template repo designed to make setting up new Platform Assets UI repos simple and following similar conventions.

To use it:

1. Create a new repo in Github, and select this template from the Template Drop down options.
2. Find instances of the strings `[your-project-name]`, `your-project-name` and `your_project_name` and replace with your project name, e.g. 'checklist-assets'
3. If you are on core, search and replace instances of `onboarding-ui` to `platform-ui`
4. Add 2 secrets to your Github repo that will be needed for CI/CD https://github.com/ImpactInc/[your-repo-name]/settings/secrets/actions

- GSJS
  - The Google service account token need for your project to be able to deploy to Google Storage
  - Will need to be created by Anatoli
- NPM_AUTH_TOKEN
  - The token needed to retrieve npm packages from private repos
  - Used for UICL
  - Create a Github personal access token (GH > Settings > Developer Settings > Personal Access Tokens) and then use it for this secret

4. Remove these instructions from this doc, and then you have a template for your own README document to modify as desired
5. Continue with Project Setup section below

---

# [your-project-name]

## Project Setup

1. Copy the .npmrc.sample file to .npmrc
1. Create a Github personal access token (GH > Settings > Developer Settings > Personal Access Tokens) and add it to the .npmrc
1. Set your node to the current Node required for this repo

```sh
nvm use
```

4. Install dependencies

```sh
npm install
```

## Development

In writing components, it is recommended to use the the Hook View Controller (HVC) pattern to best separate concerns and allow for easy testability and refactoring. (In Vue, this is Composable View Controller)

Hook / Composable (useGetHelloWorld.ts)

- Pure TS file which contains and/or imports functions from utility files
- Provides generic, reusable Vue refs and lifecycle methods
- E.g. can do a fetch onMounted, where the fetch comes from `util/fetch.ts`

View (HelloWorld.vue)

- Receives props from controller
- Handles display concerns
- Emits events like clicks up to controller to handle

Controller (HelloWorldController.vue):

- Provides the domain context
- Connects view and hook

### Storybook

Storybook is the primary environment used for building components.

Stories can be used to test View display and Controller and Hook logic, by using MSW which is wired in by default. See HelloWorld.stories.

```sh
npm run storybook
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Mocking

The project uses Mock Service Worked (MSW) to mock network requests.

- You can add additional handlers in `src/mocks/handlers.ts`
- Mocked requests are used both in Storybook and Vitest.
- Handlers can be overridden in Storybook to test different UI for different response scenarios, for example:

```
/**
 * Mocks creator not being available
 */
export const NotAvailable = {
  ...IsAvailable,
  parameters: {
    msw: {
      handlers: [
        http.get(IS_CREATOR_UPGRADE_AVAILABLE, () => {
          return HttpResponse.json(false);
        }),
      ],
    },
  },
};
```

### Images and other assets

Images should generally use SVG format and leverage one of the following patterns:

1. Bigger than icon?

   a. Create a folder for your project on ui.impact.com in [the assets folder](https://console.cloud.google.com/storage/browser/ui-impact-com/onboarding-ui/cross-sell/assets/)

   b. Add a source controlled copy of the asset, to be used for recovery in case the CDN image ever gets deleted or overwritten

   1. Add or use existing folder in project root called `cdn-assets`
   2. Put folders that match your CDN folders
   3. Add README.md to `cdn-assets` with the location of your project's CDN folder

2. Icon size, and doesn't need to be modified with CSS (e.g. use it exactly as is)?
   a. Insert via CSS using `content: url()`

```html
<span class="icon-circle-plus-orange"></span>
```

```css
.icon-circle-plus-orange {
  content: url("data:image/svg+xml,<svg ... svg stuff ></svg>");
}
```

3. Icon size, and needs to be modified with CSS?
   - Inline the image in the Vue template
   - Not preferred b/c more expensive to have this in DOM but a fine fallback option
   - For UICL Icons this is the way to do it for now
   - Once we upgrade to Vue 3, we can re-adopt the UICL Icon component

## Testing

### Run and watch Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run all tests once

```sh
npm run test
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Build and deploy

### UMD (Default)

The default build produces a UMD bundle, which can then be attached to the global window object and used within core. For an example of this pattern see the User Management repo loader:

https://github.com/ImpactInc/platform-user-management-ui/blob/main/public/add_user_management_components.js

### Web component

The web component build outputs custom elements like <this-is-my-custom-element /> which are made available by including the `index.js` file in the core page.

To leverage this pattern, rename the following two files to override the default UMD ones.

- `vite.config.ts-web-components` -> `vite-config.ts`
- `src/main.ts-web-components` -> `src/main.ts`

## CI / CD

Several Github Actions support build and deploy processes.

//TODO: Rushed docs; improve!

- Node.js CI - Runs the unit tests when a PR is created
- Bucket deployment - Deploys a branch to the specified bucket in CDN on demand
- Storybook branch deployment — Deploys a storybook build from a specified branch to CDN

### Env friend

//TODO: Rushed docs; improve!

To speed dev, test and deploy cycles, we use a loader to specify which build artifact to load and use [tool.js](https://js-cdn.impact.com/npm/envfriend@0.0.16/dist/tool.js)

By default, when using env friend and a loader (see dist/add_platform_custom_components.js), the version deployed to `production` bucket on the CDN will be used to load the JS output file.

During CD, the build can also be deployed to different buckets e.g. `stage6`. Env friend can be set so that for the bundle in your project, the path to the JS output file is overridden with the environment you want to point to. Envfriend can also set an override to point to localhost.

Please see the following file for instructions on how to install and use the chrome extension for quickly setting the environment variable to control which
https://gist.github.com/anatolipr/103a9a99eb4b14f1b25291509666b7cb

An example of how to use this in production for a web component build would be:

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Add-on integration service</title>
    <script src="https://cdn.jsdelivr.net/npm/vue@2.7.10"></script>
    <script src="[path-to-your-CDN]/add_platform_custom_components.js"></script>
  </head>

  <body>
    <div id="app">
      <custom-integration></custom-integration>
    </div>
  </body>
</html>
```


### Package Deployment

Update version in package.json<br>
publish by running the command: 

```html
npm publish
```
To use it in another project, import it as dependency in package.json like so:
```
"devDependencies": {
    "@impactinc/platform-custom-components": "1.0.2",
}
```
You can import components in your other project as shown below:
```
import { TableToggle } from "@impactinc/platform-custom-components";
```