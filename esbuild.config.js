import { build } from "esbuild";
import pkg from "./package.json" assert { type: "json" };

build({
  entryPoints: ["./src/main.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: "cjs",
  external: Object.keys(pkg.dependencies),
  platform: "node",
  outfile: "./bin/index.cjs",
});
