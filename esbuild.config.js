import { build } from "esbuild";

build({
  entryPoints: ["./src/index.js"],
  bundle: true,
  format: "esm",
  outdir: "./bin",
});
