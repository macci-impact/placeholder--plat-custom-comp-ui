/**
 * Vue 3.5 introduced ability to use custom elements without shadow DOM, but
 * currently has a bug that's blocking our adoption https://github.com/vuejs/core/issues/12630
 *
 * Until that's resolved, this class let's us mount our Vue components as web
 * components using light DOM.
 */
import { createApp } from "vue";

class LightDOMElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.app = createApp(this.constructor.component);
    this.instance = this.app.mount(this);
  }

  static define(tagName, component) {
    this.component = component;
    customElements.define(tagName, this);
  }
}

export default LightDOMElement;
