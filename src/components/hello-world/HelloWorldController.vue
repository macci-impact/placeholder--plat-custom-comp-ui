<script setup lang="ts">
/**
 * Demonstrates controller pattern for a component
 */
import HelloWorld from "./HelloWorld.vue";
import { useGetHelloWorld } from "./useGetHelloWorld";

const { greeting, error } = useGetHelloWorld();

async function handleClick() {
  console.log("Button clicked");
}
</script>

<template>
  <HelloWorld
    :error="error"
    :message="greeting"
    @btn-click="handleClick"
  ></HelloWorld>
</template>
