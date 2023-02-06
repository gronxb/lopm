import { build } from "esbuild";

build({
  entryPoints: ["./src/index.js"],
  bundle: true,
  external: ["fs", "path", "constants", "stream", "assert", "util"],
  format: "esm",
  outdir: "./bin",
});
