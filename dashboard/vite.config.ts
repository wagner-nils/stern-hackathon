import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vitest/config";

// One self-contained index.html: opens offline in the meeting and can be published as a Claude artifact.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  test: { environment: "node" },
});
