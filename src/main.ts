#!/usr/bin/env node
import "source-map-support/register";

import { Command } from "commander";

import { version as packageVersion } from "../package.json";
import { showList, spawn, sync } from "./command";
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
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  });

program
  .command("sync")
  .description("Hardlink the local packages")
  .action(async () => {
    try {
      if (!isWorkspace(cwd)) {
        throw new Error("This project is not a workspace");
      }

      await sync(cwd);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  });

program
  .command("run")
  .argument("<command>", "string to split")
  .description(
    "The command entered in the parameter is executed. While command is running, 'lopm' runs in watch mode."
  )
  .action(async () => {
    try {
      if (!isWorkspace(cwd)) {
        throw new Error("This project is not a workspace");
      }

      const commands = program.args.slice(1);
      await spawn(cwd, commands);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  });

program.parse();
