#!/usr/bin/env node
import "source-map-support/register";

import { spawn, sync } from "./command";

import { Command } from "commander";
import { version as packageVersion } from "../package.json";

const program = new Command();

program
  .name("lopm")
  .description("CLI to Support Monorepo for local packages")
  .version(packageVersion, "-v, --version", "output the current version");

program
  .command("sync")
  .description(
    "Hard links the files declared in the `files` field in the `package.json`"
  )
  .action(async () => {
    try {
      await sync();
    } catch (e) {
      console.error(e);
    }
  });

program
  .command("run")
  .argument("<command>", "string to split")
  .description(
    "The command entered in the parameter is executed. Local packages found during execution are placed in watch mode, and 'sync' commands are executed when they change."
  )
  .action(async () => {
    try {
      const commands = program.args.slice(1);
      await spawn(commands);
    } catch (e) {
      console.error(e);
    }
  });

program.parse();
