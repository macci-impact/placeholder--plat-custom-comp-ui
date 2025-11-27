import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "./node.js";

window.getCsrfToken = vi.fn(() => "fakeToken");
/**
 * Sets up server for mocking in Vitest tests
 */
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
