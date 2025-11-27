import { http, HttpResponse } from "msw";
import { HELLO_WORLD_FAKE_ENDPOINT } from "../data/endpoints";

// Mocks that will be used both in Storybook and Vitest
export const handlers = [
  /**
   * Template for simple JSON response
   */
  http.get(HELLO_WORLD_FAKE_ENDPOINT, () => {
    return HttpResponse.json("Hello, World from the backend API mock!");
  }),
];
