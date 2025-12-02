class SampleComponent extends HTMLElement {
  constructor() {
    super();

  this.attachShadow({mode: 'open'});
  this.shadowRoot.innerHTML = /*html*/`
       <div>Sample Component</div>
    `
    }
}

customElements.define('sample-component', SampleComponent)