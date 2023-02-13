import { build } from "esbuild";

build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  format: "cjs",
  external: ["fsevents"],
  platform: "node",
  outfile: "./bin/index.cjs",
});
