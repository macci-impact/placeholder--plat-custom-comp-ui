import { createApp } from "vue"

function loadWithEnvFriend(contentLoader) {
  console.log("Loading with EnvFriend");
  if (!window.__envfriend) {
    const script = document.createElement("script");
    script.setAttribute(
      "src",
      "https://js-cdn.impact.com/npm/envfriend@0.0.16/dist/tool.js"
    );
    script.onload = contentLoader;
    document.head.appendChild(script);
  } else {
    contentLoader();
  }
}

function addCustomComponents() {
  console.log("Adding Custom Components");
  const project = "platform-ui/custom-components";
  const environments = {
    configuration: {
      environments: [
        {
          id: "production",
        },
        {
          id: "stage6",
        },
        {
          id: "stage11",
        },
        {
          id: "stage11v3",
        },
        {
          id: "test",
        },
      ],
    },
  };

  __envfriend
      .getEnvironmentUrl(
          "https://ui.assets.impact.com/platform-ui/custom-components/{env}/platform-custom-ui.es.js",
          {project, environments},
      )
      .then((url) => {
        let script = document.createElement("script");
        script.setAttribute("src", url);
        script.onload = loadLinkGeneratorModal;
        script.type = "module";
        document.head.appendChild(script);
      });
}

function loadLinkGeneratorModal(){
  console.log("loading LinkGeneratorModal");

  const LINK_GENERATOR_MODAL_OPEN_EVENT = "LinkGeneratorModalOpenEvent";

  const openLinkGeneratorSlideout = (data) => {
    console.log('data', data)
    document.dispatchEvent(
        new CustomEvent(LINK_GENERATOR_MODAL_OPEN_EVENT, {
          detail: {
            data: JSON.parse(JSON.stringify(data)),
          },
        }),
    );
  };

  const renderLinkGeneratorSlideout = (
      elementId = "LinkGeneratorSlideout",
  ) => {
    document.body.insertAdjacentHTML(
        "beforeend",
        `<div id="${elementId}"></div>`,
    );

    const app1 = createApp({
      el: `#${elementId}`,
      //Vue doesn't support appending content in the body
      beforeCreate() {},
      components: {
        LinkGeneratorSlideout: window['platform-custom-components'].LinkGeneratorSlideout,
      },
      template: `<LinkGeneratorSlideout />`,
      data: () => {},
    });

    app1.mount(`#${elementId}`);
  };

  renderLinkGeneratorSlideout()
  window.custom_page_methods = window.custom_page_methods || {};
  window.custom_page_methods.openLinkGeneratorSlideout = openLinkGeneratorSlideout;

}

loadWithEnvFriend(addCustomComponents);
