import { build } from "esbuild";

build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: "./bin/index.cjs",
});
