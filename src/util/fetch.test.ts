import { fetchJson } from "./fetch";
// import { HELLO_WORLD_FAKE_ENDPOINT } from "@/data/endpoints";
import { it, expect } from "vitest";

it.skip("Resolves the endpoint correctly", async () => {
  const available = await fetchJson("/hello/world/fake/api.json");

  expect(window.getCsrfToken).toBeCalledTimes(1);
  expect(available).toEqual("Hello, World from the backend API mock!");
});
