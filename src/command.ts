import * as fs from "fs-extra";
import { resolve } from "path";
import {
  getLocalPackages,
  getLocalDependencies,
  getPackageManager,
} from "./utils/workspace";

import { copyFilesToNodeModules, unlinkAlreadyModules } from "./utils/module";

import childProcess from "child_process";
import { watch } from "chokidar";
import debounce from "lodash-es/debounce";
import { log } from "./utils/log";
import chalk from "chalk";

export const sync = async (cwd: string) => {
  const localDependencies = getLocalDependencies(cwd);
  if (localDependencies.length === 0) {
    throw new Error("Not Found local dependencies");
  }

  localDependencies.forEach(({ name }) => {
    log("find local package:", name);
  });

  const isNodeModules = await fs.pathExists(resolve(cwd, "node_modules"));
  if (!isNodeModules) {
    await fs.mkdir(resolve(cwd, "node_modules"));
  }

  await unlinkAlreadyModules(cwd, localDependencies);
  await Promise.all(
    localDependencies.map((localDependency) =>
      copyFilesToNodeModules(cwd, localDependency)
    )
  );

  console.log(chalk.green("🔥 Done"));
};

export const spawn = async (cwd: string, args: string[]) => {
  const packageManager = getPackageManager(cwd);

  if (!packageManager) {
    new Error("Not Found package manager");
    return;
  }

  await sync(cwd);

  const child = childProcess.spawn(packageManager, args, {
    stdio: "inherit",
  });

  child.on("SIGINT", (code: number) => {
    process.exit(code);
  });

  child.on("close", (code: number) => {
    process.exit(code);
  });

  const localDependencies = getLocalDependencies(cwd);

  const targetWatches = localDependencies.map((localDependency) => {
    const watchFn = debounce(async (eventName: string, path: string) => {
      if (
        eventName === "unlink" ||
        eventName === "unlinkDir" ||
        !path.includes(resolve(cwd, localDependency.path))
      ) {
        return;
      }

      await copyFilesToNodeModules(cwd, localDependency);

      log("changed package:", localDependency.name);
    }, 3000);

    return {
      name: localDependency.name,
      watchedPath:
        localDependency.packageJson.files?.map((file: string) =>
          resolve(localDependency.path, file)
        ) ?? [],
      watchFn,
    };
  });

  targetWatches.forEach(({ watchedPath, watchFn }) => {
    watch(watchedPath, {
      atomic: 3000,
      ignoreInitial: true,
    }).on("all", watchFn);
  });
};

export const showList = (cwd: string) => {
  const localDependencies = getLocalDependencies(cwd);
  const localPackages = getLocalPackages(cwd);

  log("Using Local Dependencies");
  localDependencies.forEach(({ name }) => {
    console.log(chalk.green("-", name));
  });

  console.log("");

  log("Available Local Packages");
  localPackages.forEach(({ name }) => {
    const isDependency = localDependencies.some(
      (localDependency) => localDependency.name === name
    );

    console.log(isDependency ? chalk.green("-", name) : ["-", name].join(" "));
  });
};
