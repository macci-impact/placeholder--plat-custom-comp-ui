<template>
    <div
        class="table-container" :style="{width: width + 'px', height: height + 'px'}">
        <div
            style="position: sticky"
            class="grid-row header">
            <div v-on:mousedown.stop="toggleAll">
            <input
                v-bind:indeterminate.prop="indeterminate"
                :checked="allSelected"
                class="checkboxes muted"
                type="checkbox" />
            </div>
            <div>Permission</div>
            <div>Level</div>
            <div>Description</div>
        </div>
        <div
            class="grid-row"
            v-for="option in options"
            v-bind:key="option.label">
            <input
                style="width: 15px; height: 15px"
                class="checkboxes"
                type="checkbox"
                v-model="option.checked" />
            {{option.label}}
            <div v-if="option.metaData.levelOptions.length === 1">{{option.metaData.levelOptions[0].label}}</div>
            <div v-else>
                <select class="selects" v-model="option.value">
                    <option
                        v-bind:value="opt.value"
                        v-for="opt in option.metaData.levelOptions"
                        v-bind:key="opt.label">
                        {{opt.label}}
                    </option>
                </select>
            </div>
            <div
                v-if="optionMap[option.value] && optionMap[option.value].metaData">
                {{optionMap[option.value].metaData.description}}
            </div>
        </div>
        <input type="hidden" :value="formHiddenInputValue" :name="fieldName">
    </div>
</template>

<style>

.grid-row {
    border-top: unset;
    border-bottom: 1px solid;
    border-left: unset;
    border-right: unset;
    border-color: var(--iui3-color-border-border-default);
    background-color: var(--iui3-color-background-background-default);
    display: grid;
    grid-template-columns: 1fr 20fr 10fr 30fr 1fr;
    align-items: center;
    justify-content: flex-start;
    padding: 11px 20px;
    column-gap: 10px;
    font-size: 12px;
    line-height: var(--iui-line-height-small);
    color: var(--iui3-color-text-text-default, #121212);
}

.header {
    font-weight: 600;
}

.table-container {
    border-radius: 8px;
    border: 1px solid #CACFD3;
    font-family: 'Mulish', sans-serif;
    font-size: 14px;
    accent-color: black;
    overflow: scroll;
}

.checkboxes {
    width: 15px;
    height: 15px;
    margin-left: 10px;
    margin-right: 10px;
    border: 1px solid;
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
}

.muted {
    pointer-events: none;
}

.selects {
    margin: 0;
    padding: 3px
}

</style>


<script>
  export default {

      name: "RolesAndPermissions",

      props: {
          compositeJsonClass: {type: String, required: true},
          context: {type: Object, required: true},
          fieldName: {type: String, required: true},
          value: {type: Object, required: true},
          width: {type: Number, required: false, default: 800},
          height: {type: Number, required: false, default: 480},
      },


      /*
      Sample props
      {
            fieldName: "foo",
            compositeJsonClass: "FOO.class",
            width: 800,
            value: [
                {
                    id: 73,
                    checked: true
                },
            ],
            context: {
                options: [
                    {
                        value: undefined,
                        label: "Template Term Rules",
                        metaData: {
                            levelOptions: [
                                {
                                    value: 73,
                                    label: "Manage",
                                    metaData: {
                                        description: "Create, edit, and delete rules that apply to all template terms"
                                    }
                                },
                                {
                                    value: 33,
                                    label: "View",
                                    metaData: {
                                        description: "View template terms"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        value: undefined,
                        label: "Ads and Creatives",
                        metaData: {
                            levelOptions: [
                                {
                                    value: 32,
                                    label: "Manage",
                                    metaData: {
                                        description: "Manage only"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
       */

      created() {


          this.options = this.context.options.map(option => {
              option.checked = false;
              for (let i = 0; i < option?.metaData?.levelOptions.length; i++) {
                  const candidate = option?.metaData?.levelOptions[i];
                  if (candidate && candidate.value
                      && this.valuePerIdMap[candidate.value]?.checked) {
                      option.value = candidate.value
                      option.checked = true
                      break;
                  }
              }
              option.value = option.value || option?.metaData?.levelOptions[0]?.value;
            return {...option}
          });
      },

      methods: {
          toggleAll() {
              const newVal = !(this.indeterminate || this.allSelected);

              this.options.forEach(option => {
                  option.checked = newVal;
              })
          }
      },

      computed: {
          valuePerIdMap() {
              return (this.value||[]).reduce((a, nv) => {a[nv.id] = nv; return a}, {})
          },
          allSelected() {
              for (const option of this.options) {
                  if (!option.checked) {
                      return false;
                  }
              }
              return true;
          },

          someSelected() {
              if (this.allSelected) {
                  return false;
              }

              for (const option of this.options) {
                  if (option.checked) {
                      return true;
                  }
              }
              return false;
          },

          indeterminate() {
              return this.allSelected ? false : this.someSelected;
          },

          optionMap() {
              const result = {};
              this.options.forEach(option => {
                  (option.metaData.levelOptions || []).forEach(moption => {
                      result[moption.value] = moption
                  })
              });
              return result;
          },

          _resultForSubmit: {
              cache: false,
              get() {

                  return this.options.reduce((a, nv) => {a.push({
                      id: nv.value,
                      checked: nv.checked
                  }); return a}, [])
                      .filter(option => !! option.id)
              }
          },

          formHiddenInputValue: {
              cache: false,
              get() {
                  let results = this._resultForSubmit;
                  results.push({
                      id:this.context.defaultPermissionId,
                      checked:true
                  });
                  return this.compositeJsonClass + JSON.stringify(results);
              }
          }

      },
      data() {
          return {
              options: [],
              defaultPermissionId:""
          }
      }
  }
</script>
