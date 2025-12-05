/*
  WebComponentTemplate.js
  A simple, self-explanatory Web Component that mirrors familiar Vue concepts.

  How this maps to Vue:
  - <template>           -> the _render() method sets this.shadowRoot.innerHTML
  - <script setup> data  -> instance fields (this._state) act as reactive-like data
  - props                -> attributes and properties (observedAttributes + getters/setters)
  - methods              -> class methods (e.g., _increment, _emit)
  - emits                -> CustomEvent via this.dispatchEvent(new CustomEvent(...))
  - lifecycle hooks      -> connectedCallback, attributeChangedCallback, disconnectedCallback
  - v-model-like binding -> property setter updates UI and dispatches an input/change event

  Usage:
    <web-component-template
      data-title="Counter"
      :data-count="10"            (in frameworks, pass as a string or set property via ref)
    ></web-component-template>

  Listen to events:
    element.addEventListener('update', (e) => console.log(e.detail))

  In Vue templates:
    <web-component-template
      :data-title="title"
      :data-count="count"
      @update="onUpdate"
    />

  Note: Attributes are strings in HTML; pass JSON strings for complex props, or set properties directly in JS.
*/

class WebComponentTemplate extends HTMLElement {
  // Vue: props definition equivalent
  // Here we define which attributes (props) we observe for changes.
  static get observedAttributes() {
    return ["data-title", "data-count"]; // props
  }

  constructor() {
    super();
    // Vue: template is compiled; Web Components: we attach a Shadow DOM to host our markup/styles.
    this.attachShadow({ mode: "open" });

    // Vue: data() return value; Here we store component state on the instance.
    this._state = {
      title: "Counter", // maps to props with a default
      count: 0,          // internal reactive-like data
    };
  }

  // Vue: props updates trigger re-render; Here attribute changes call attributeChangedCallback.
  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "data-title") {
      this._state.title = newValue || "Counter";
    } else if (name === "data-count") {
      const parsed = Number(newValue);
      this._state.count = Number.isFinite(parsed) ? parsed : this._state.count;
    }
    this._render();
  }

  // Vue: mounted() lifecycle; Here connectedCallback is invoked when added to the DOM.
  connectedCallback() {
    this._render();
    this._wireEvents();
  }

  // Vue: beforeUnmount/unmounted; For cleanup (listeners, intervals, etc.).
  disconnectedCallback() {
    // No-op in this template, but you could remove listeners or cancel timers here.
  }

  // Vue: methods
  _increment() {
    this._state.count += 1;
    this._emit("update", { count: this._state.count }); // Vue: emit('update', payload)
    this._render();
  }

  _decrement() {
    this._state.count -= 1;
    this._emit("update", { count: this._state.count });
    this._render();
  }

  // Vue: emits
  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  // Vue: v-model-like pattern
  // In Vue, v-model syncs a prop and emits an update event.
  // Here we expose a property that updates state and emits an event.
  get modelValue() {
    return this._state.count;
  }
  set modelValue(val) {
    const next = Number(val);
    if (!Number.isFinite(next)) return;
    this._state.count = next;
    this._emit("update", { count: this._state.count });
    this._render();
  }

  // Vue: template
  _render() {
    const { title, count } = this._state;
    this.shadowRoot.innerHTML = /*html*/`
      <style>
        :host { display: block; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; }
        .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; }
        .title { font-weight: 700; margin-bottom: 8px; }
        .value { font-size: 24px; margin: 8px 0; }
        .actions { display: flex; gap: 8px; align-items: center; }
        button { border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
        input[type="number"] { border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; width: 120px; }
        .field { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
      </style>
      <div class="card">
        <div class="title">${title}</div>
        <div class="value">${count}</div>
        <div class="field">
          <label for="countInput">Count</label>
          <input id="countInput" type="number" value="${count}" />
        </div>
        <div class="actions">
          <button id="dec">-</button>
          <button id="inc">+</button>
        </div>
      </div>
    `;
  }

  // Vue: mounted() event wiring
  _wireEvents() {
    const inc = this.shadowRoot.getElementById("inc");
    const dec = this.shadowRoot.getElementById("dec");
    const input = this.shadowRoot.getElementById("countInput");
    if (inc) inc.onclick = () => this._increment();
    if (dec) dec.onclick = () => this._decrement();

    // v-model-like: typing updates modelValue and emits events
    if (input) {
      input.oninput = (e) => {
        const next = Number(e.target.value);
        if (!Number.isFinite(next)) return;
        this._state.count = next;
        // Emit both a generic input and Vue-style update:modelValue
        this._emit("input", { value: this._state.count });
        this._emit("update:modelValue", this._state.count);
        this._emit("update", { count: this._state.count });
        this._render();
        this._wireEvents();
      };
      input.onchange = (e) => {
        const next = Number(e.target.value);
        if (!Number.isFinite(next)) return;
        this._state.count = next;
        this._emit("change", { value: this._state.count });
        this._emit("update:modelValue", this._state.count);
        this._emit("update", { count: this._state.count });
        this._render();
        this._wireEvents();
      };
    }
  }
}

// Safe global registration (like app.component in Vue)
if (!customElements.get("web-component-template")) {
  customElements.define("web-component-template", WebComponentTemplate);
}

// Optional: export the class for module-based consumption
export { WebComponentTemplate };
