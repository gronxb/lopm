#!/usr/bin/env node
import "source-map-support/register";

import packagesJson from "../package.json";
import chalk from "chalk";
import { addPackage, help, spawn, sync } from "./command";

(async () => {
  const prefix = process.argv.length > 2 ? process.argv[2] : "";
  const commands = process.argv.slice(3);

  switch (prefix) {
    case "version": {
      console.log(chalk.blue("🔥 lopm version", packagesJson.version));
      return;
    }
    case "add": {
      await addPackage();
      return;
    }
    case "sync": {
      await sync();
      return;
    }
    case "run": {
      await spawn(commands);
      return;
    }
    default:
    case "help": {
      help();
      return;
    }
  }
})();
