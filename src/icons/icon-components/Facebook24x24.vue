<template>
  <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
  >
    <path
        d="M15.048 7.98799H16.8008V4.93519C16.4984 4.89359 15.4584 4.79999 14.2472 4.79999C11.72 4.79999 9.9888 6.38959 9.9888 9.31119V12H7.2V15.4128H9.9888V24H13.408V15.4136H16.084L16.5088 12.0008H13.4072V9.64959C13.408 8.66319 13.6736 7.98799 15.048 7.98799Z"
        :fill="color"
    />
  </svg>
</template>

<script>
// @group ICONS
export default {
  name: "Facebook24x24",
  props: {
    color: { type: String, default: "var(--text)" },
  },
};
</script>
