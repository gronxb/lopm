import * as fs from "fs-extra";
import { resolve } from "path";
import {
  getLocalPackageInfos,
  getLinkFields,
  getPackageManager,
} from "./utils/package";

import { copyFilesToNodeModules, unlinkAlreadyModules } from "./utils/module";

import childProcess from "child_process";
import { watch } from "chokidar";
import debounce from "lodash-es/debounce";
import { log } from "./utils/log";

export const sync = async () => {
  const linkFields = await getLinkFields();
  if (linkFields.length === 0) {
    throw new Error("Not Found link field in package.json");
  }

  linkFields.forEach(({ name }) => {
    log("find local package:", name);
  });

  const packageInfos = await getLocalPackageInfos(linkFields);

  const isNodeModules = await fs.pathExists(
    resolve(process.cwd(), "node_modules")
  );
  if (!isNodeModules) {
    await fs.mkdir(resolve(process.cwd(), "node_modules"));
  }

  await unlinkAlreadyModules(packageInfos);
  await Promise.all(
    packageInfos.map((packageInfo) => copyFilesToNodeModules(packageInfo))
  );
};

export const spawn = async (args: string[]) => {
  const packageManager = await getPackageManager(process.cwd());
  if (!packageManager) {
    new Error("Not Found package manager");
    return;
  }
  await sync();

  const child = childProcess.spawn(packageManager, args, {
    stdio: "inherit",
  });

  child.on("SIGINT", (code: number) => {
    process.exit(code);
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
        !path.includes(resolve(process.cwd(), packageInfo.path))
      ) {
        return;
      }

      await copyFilesToNodeModules(packageInfo);

      log("changed package:", packageInfo.name);
    }, 3000);

    return {
      name: packageInfo.name,
      watchedPath:
        packageInfo.files?.map((file) => resolve(packageInfo.path, file)) ?? [],
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
