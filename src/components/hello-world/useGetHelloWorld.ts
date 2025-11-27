import { onMounted, ref } from "vue";
import { fetchJson } from "@/util/fetch";
import { HELLO_WORLD_FAKE_ENDPOINT } from "@/data/endpoints";

/**
 * Composable that returns the greeting from the backend
 */
export function useGetHelloWorld() {
  const greeting = ref("");
  const error = ref<string | undefined>(undefined);

  onMounted(async () => {
    const data = await fetchJson(HELLO_WORLD_FAKE_ENDPOINT);
    if (!data) {
      error.value = `Sorry, we ran into a problem with your request`;
      return;
    }
    greeting.value = data;
  });
  return { greeting, error };
}
