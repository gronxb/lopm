#!/usr/bin/env node
import "source-map-support/register";

import { spawn, sync, showList } from "./command";

import { Command } from "commander";
import { version as packageVersion } from "../package.json";
import { isWorkspace } from "./utils/workspace";

const cwd = process.cwd();
const program = new Command();

program
  .name("lopm")
  .description("CLI to Support Monorepo for local packages")
  .version(packageVersion, "-v, --version", "output the current version");

program
  .command("list")
  .description(
    "Displays a list of available local packages and local packages specified in the current project."
  )
  .action(async () => {
    try {
      if (!isWorkspace(cwd)) {
        throw new Error("This project is not a workspace");
      }

      await showList(cwd);
    } catch (e) {
      console.error(e);
    }
  });

program
  .command("sync")
  .description(
    "Hard links the files declared in the `files` field in the `package.json`"
  )
  .action(async () => {
    try {
      if (!isWorkspace(cwd)) {
        throw new Error("This project is not a workspace");
      }

      await sync(cwd);
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
      if (!isWorkspace(cwd)) {
        throw new Error("This project is not a workspace");
      }

      const commands = program.args.slice(1);
      await spawn(cwd, commands);
    } catch (e) {
      console.error(e);
    }
  });

program.parse();
