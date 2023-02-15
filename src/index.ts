#!/usr/bin/env node
import "source-map-support/register";

import * as fs from "fs-extra";
import { resolve } from "path";
import {
  copyFilesToNodeModules,
  currentPath,
  getLocalPackagesInfo,
  getLinkFields,
  getPackageManager,
  unlinkAlreadyModules,
} from "./helper";
import packagesJson from "../package.json";
import chalk from "chalk";
import { getWorkspaceRoot } from "workspace-tools";
import childProcess from "child_process";
import { watch } from "chokidar";
import { debounce } from "lodash-es";

export const sync = async () => {
  const linkFields = await getLinkFields();
  linkFields.forEach(({ name }) => {
    console.log(chalk.blue("🔥 find local package:"), chalk.green(name));
  });

  const packagesInfo = await getLocalPackagesInfo(linkFields);

  const isNodeModules = await fs.pathExists(
    resolve(currentPath, "node_modules")
  );
  if (!isNodeModules) {
    await fs.mkdir(resolve(currentPath, "node_modules"));
  }

  await unlinkAlreadyModules(packagesInfo);
  await copyFilesToNodeModules(packagesInfo);
};

export const addPackage = () => {
  console.log("🔥 Not Yet");
};

const help = () => {
  console.log("");
  console.log(chalk.blue("$ [pnpm or yarn] lopm <options>"));
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
  console.log(
    "   <command>:     The command entered in the parameter is executed. Local packages found during execution are placed in watch mode, and 'sync' commands are executed when they change."
  );
  console.log("");
};

const init = async () => {
  const workspaceRoot = getWorkspaceRoot(currentPath);
  const packageManager = await getPackageManager(currentPath);

  // make workspace root json file
  if (!workspaceRoot) {
    throw new Error(chalk.red("🔥 Not Found workspace root"));
  }
  const workspaceJsonPath = resolve(workspaceRoot, "lopm.json");
  const isLopmJson = fs.pathExistsSync(workspaceJsonPath);
  if (!isLopmJson) {
    fs.writeJSONSync(
      workspaceJsonPath,
      {
        packageManager,
      },
      { spaces: 2 }
    );
  }
};

const spawn = async (args: string[]) => {
  const packageManager = await getPackageManager(currentPath);
  if (!packageManager) {
    new Error(chalk.red("🔥 Not Found package manager"));
    return;
  }
  await sync();
  const child = childProcess.spawn(packageManager, args, {
    stdio: "inherit",
  });
  child.on("close", (code: number) => {
    process.exit(code);
  });

  const linkFields = await getLinkFields();
  const packagesInfo = await getLocalPackagesInfo(linkFields);

  const targetWatchPath = packagesInfo
    .map(
      (packageInfo) =>
        packageInfo.files?.map((file) => resolve(packageInfo.path, file)) ?? []
    )
    .flat();

  const watchFn = debounce(async (eventName: string, path: string) => {
    switch (eventName) {
      case "modified":
      case "change": {
        const findPackageInfo = packagesInfo.find((packageInfo) =>
          path.includes(resolve(currentPath, packageInfo.path))
        );

        if (!findPackageInfo) {
          return;
        }

        await copyFilesToNodeModules([findPackageInfo]);
        console.log(
          chalk.blue("🔥 changed package:"),
          chalk.green(findPackageInfo.name)
        );
        return;
      }
      default: {
        return;
      }
    }
  }, 3000);

  targetWatchPath.forEach((watchPath) => {
    watch(watchPath, {
      awaitWriteFinish: true,
      atomic: false,
      followSymlinks: false,
    }).on("raw", watchFn);
  });
};

(async () => {
  if (process.argv.includes("-v") || process.argv.includes("--version")) {
    console.log(chalk.blue("🔥 lopm version", packagesJson.version));
    return;
  } else if (process.argv.includes("-h") || process.argv.includes("--help")) {
    help();
    return;
  } else if (process.argv.includes("init")) {
    await init();
    return;
  } else if (process.argv.includes("add")) {
    await addPackage();
    return;
  } else if (process.argv.includes("sync") || process.argv.length === 2) {
    await sync();
    return;
  } else {
    await spawn(process.argv.slice(2));
    return;
  }
})();
