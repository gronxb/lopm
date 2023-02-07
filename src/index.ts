#!/usr/bin/env node
import * as fs from "fs-extra";
import { resolve } from "path";
import {
  copyFilesToNodeModules,
  currentPath,
  getFilesFields,
  getLinkFields,
  unlinkAlreadyModules,
} from "./helper";
import packagesJson from "../package.json";
import chalk from "chalk";

const sync = async () => {
  const linkFields = await getLinkFields();
  const filesFields = await getFilesFields(linkFields);

  const isNodeModules = await fs.pathExists(
    resolve(currentPath, "node_modules")
  );
  if (!isNodeModules) {
    await fs.mkdir(resolve(currentPath, "node_modules"));
  }

  await unlinkAlreadyModules(filesFields);
  await copyFilesToNodeModules(filesFields);
  console.log(chalk.blue("🔥 Local package sync Done !"));
};

const addPackage = () => {
  console.log("🔥 Not Yet");
};

const help = () => {
  console.log("");
  console.log(chalk.blue("$ [pnpm or yarn] localpkg <options>"));
  console.log("");
  console.log(" options:");
  console.log("");
  console.log("   -h:            Shows this help message");
  console.log("   -v:            Shows this package version");
  console.log(
    "   sync:          Hard links the files declared in the `files` field in the `package.json`"
  );
  console.log(
    "   add <pkg>:     Added a local package with the link value in the `dependencies` field. It is then hard-linked"
  );
  console.log("");
};

(async () => {
  if (process.argv.includes("-v") || process.argv.includes("--version")) {
    console.log(chalk.blue("🔥 localpkg version", packagesJson.version));
    return;
  } else if (process.argv.includes("-h") || process.argv.includes("--help")) {
    await help();
    return;
  } else if (process.argv.includes("add")) {
    await addPackage();
    return;
  } else if (process.argv.includes("sync") || process.argv.length === 2) {
    await sync();
    return;
  }
})();
