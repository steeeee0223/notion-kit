import { Blob } from "node:buffer";

import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

// Shiki loads its WASM through Blob.stream(), which jsdom does not implement.
vi.stubGlobal("Blob", Blob);
