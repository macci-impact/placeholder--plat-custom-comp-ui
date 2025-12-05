class WebComponentTemplateSimple extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this._render();
    }

    _render() {
      this.shadowRoot.innerHTML = /*html*/`
        <style>
          .web-component{
              outline: 2px solid hotpink;
          }
        </style>
        <div class="web-component">
          This is a shadow dom web-component
        </div>
      `;
    }
}

if (!customElements.get("web-component-template-simple")) {
    customElements.define("web-component-template-simple", WebComponentTemplateSimple);
}

// Optional: export the class for module-based consumption
export {WebComponentTemplateSimple};

