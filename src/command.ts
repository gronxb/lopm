import * as fs from "fs-extra";
import { resolve } from "path";
import {
  copyFilesToNodeModules,
  currentPath,
  getLocalPackageInfos,
  getLinkFields,
  getPackageManager,
  unlinkAlreadyModules,
} from "./helper";
import chalk from "chalk";

import childProcess from "child_process";
import { watch } from "chokidar";
import debounce from "lodash-es/debounce";

export const sync = async () => {
  const linkFields = await getLinkFields();
  linkFields.forEach(({ name }) => {
    console.log(chalk.blue("🔥 find local package:"), chalk.green(name));
  });

  const packageInfos = await getLocalPackageInfos(linkFields);

  const isNodeModules = await fs.pathExists(
    resolve(currentPath, "node_modules")
  );
  if (!isNodeModules) {
    await fs.mkdir(resolve(currentPath, "node_modules"));
  }

  await unlinkAlreadyModules(packageInfos);
  await Promise.all(
    packageInfos.map((packageInfo) => copyFilesToNodeModules(packageInfo))
  );
};

export const addPackage = () => {
  console.log("🔥 Not Yet");
};

export const help = () => {
  console.log("");
  console.log(chalk.blue("$ [pnpm or yarn] lopm <options>"));
  console.log("");
  console.log(" options:");
  console.log("");
  console.log("   version:       Shows this package version");
  console.log(
    "   sync:          Hard links the files declared in the `files` field in the `package.json`"
  );
  console.log(
    "   add <pkg>:     Added a local package with the link value in the `dependencies` field. It is then hard-linked"
  );
  console.log(
    "   run <command>:     The command entered in the parameter is executed. Local packages found during execution are placed in watch mode, and 'sync' commands are executed when they change."
  );
  console.log("");
};

export const spawn = async (args: string[]) => {
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
  const packageInfos = await getLocalPackageInfos(linkFields);

  const targetWatches = packageInfos.map((packageInfo) => {
    const watchFn = debounce(async (eventName: string, path: string) => {
      if (
        eventName === "unlink" ||
        eventName === "unlinkDir" ||
        !path.includes(resolve(currentPath, packageInfo.path))
      ) {
        return;
      }

      await copyFilesToNodeModules(packageInfo);
      console.log(
        chalk.blue("🔥 changed package:"),
        chalk.green(packageInfo.name)
      );
    }, 3000);

    return {
      name: packageInfo.name,
      watchedPath:
        packageInfo.files?.map((file) => resolve(packageInfo.path, file)) ?? [],
      watchFn,
    };
  });

  targetWatches.forEach(({ name, watchedPath, watchFn }) => {
    watch(watchedPath, {
      atomic: 3000,
      ignoreInitial: true,
    }).on("all", watchFn);
  });
};
