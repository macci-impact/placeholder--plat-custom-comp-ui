<template>
  <div class="month-day-year-input">
    <div class="mdyi-ct">
      <NumberInput v-model="yearValue" :max-length="4" class="mdy-el" :class="{error : partialValues && !yearValue}" placeholder="Year" @blur="blurYear" />
      <MultiSelectInput ref="monthField" v-model="monthValue" :items="months" class="mdy-el monthField" :class="{error : partialValues && !monthValue}"  placeholder="Month" is-single-select is-prevent-deselect close-on-select btn-cls="mdy-el-btn" @focus="focus" />
      <NumberInput v-model="dayValue" :max-length="2" class="mdy-el" :class="{error : partialValues && !dayValue}" placeholder="Day" />
    </div>
    <HiddenInput v-if="internalValue" :field-name="fieldName" :value="internalValue" />
  </div>
</template>

<script setup lang="ts">
import { MultiSelectInput, NumberInput, HiddenInput, getMonthLength } from "@impactinc/ui-component-library";
import { ref, InputHTMLAttributes, watch, computed } from "vue";

defineOptions({ name: "MonthDayYearInput" });

interface MonthDayYearInputProps {
  /**
   * Whether inputs are disabled.
   */
  isDisabled?: InputHTMLAttributes["disabled"];
  /**
   * Whether inputs are read only.
   */
  isReadOnly?: InputHTMLAttributes["readonly"];
  fieldName: InputHTMLAttributes["name"];
  /**
   * The highest year available to select (defaults to current year)
   */
  maxYear?: number;
  /**
   * The lowest year available to select (defaults to current year minus 120)
   */
  minYear?: number;
}

const months = [
  {
    label: "January",
    value: 1
  },
  {
    label: "February",
    value: 2
  },
  {
    label: "March",
    value: 3
  },{
    label: "April",
    value: 4
  }
  ,{
    label: "May",
    value: 5
  },
  {
    label: "June",
    value: 6
  },
  {
    label: "July",
    value: 7
  },
  {
    label: "August",
    value: 8
  },
  {
    label: "September",
    value: 9
  },
  {
    label: "October",
    value: 10
  },
  {
    label: "November",
    value: 11
  },
  {
    label: "December",
    value: 12
  }
]

const props = withDefaults(defineProps<MonthDayYearInputProps>(), {
  maxYear: new Date().getFullYear(),
  minYear: new Date().getFullYear() - 120
});

const internalValue = ref();
const monthValue = ref();
const dayValue = ref();
const yearValue = ref();
const monthField = ref("monthField");

const emit = defineEmits<{
  focus: [event: FocusEvent];
}>();

const partialValues = computed(() => {
  const hasNoValues = !yearValue.value && !dayValue.value && !monthValue.value;
  const hasAllValues = monthValue.value && dayValue.value && yearValue.value;
  return !(hasAllValues || hasNoValues);
})


watch(yearValue, async (newValue) => {

  if(newValue?.toString().length === 4) {
    if(newValue > props.maxYear) {
      yearValue.value = props.maxYear;
    }
    if(newValue < props.minYear) {
      yearValue.value = props.minYear;
    }
  }
  adjustDays();
});

watch(monthValue, async () => {
  adjustDays();
});

watch(dayValue, async () => {
  adjustDays();
  internalValue.value = yearValue.value && monthValue.value && dayValue.value ? yearValue.value + '-' + monthValue.value + '-' + dayValue.value : undefined;
})

const blurYear = () => {
  if(yearValue.value?.toString().length < 4) {
    yearValue.value = props.minYear;
  }
};

function adjustDays() {
  const monthNumberDays = getMonthLength(yearValue.value, monthValue.value) || 31;
  if(dayValue.value && dayValue.value < 1) {
    dayValue.value = 1;
  }
  else if(dayValue.value > monthNumberDays) {
    dayValue.value = monthNumberDays;
  }
}

const doFocus = () => {
  monthField.value?.focus();
};

const focus = (event: FocusEvent) => {
  emit("focus", event);
};

defineExpose({ doFocus });
</script>

<style lang="less">
.mdyi-ct {
  display: flex;
  align-items: center;
  column-gap: 10px;
  .mdy-el {
    flex-grow: 1;
    min-width: 0 !important;
    &.monthField {
      flex: none;
      &.error button {
        border-color: var(--error-red);
      }
    }
    &.error {
      border-color: var(--error-red);
    }
  }
}
.mdy-el-btn {
  min-width: 0 !important;
}

</style>