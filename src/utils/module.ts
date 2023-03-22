import { LocalPackageInfo } from "../type";
import * as fs from "fs-extra";
import { normalize, resolve } from "path";

export const unlinkAlreadyModules = async (
  packagesInfo: LocalPackageInfo[]
) => {
  const alreadyModules = new Set(
    packagesInfo.map((packageInfo) => packageInfo.name)
  );

  for (const module of alreadyModules) {
    await fs.rm(normalize(resolve(process.cwd(), "node_modules", module)), {
      recursive: true,
      force: true,
    });
  }
};

export const copyFilesToNodeModules = async (packageInfo: LocalPackageInfo) => {
  if (!packageInfo.files) {
    throw new Error("Not Found 'files' field in package.json");
  }

  for (const file of packageInfo.files) {
    const targetPath = resolve(packageInfo.path, file);
    const descPath = resolve(
      process.cwd(),
      "node_modules",
      packageInfo.name,
      file
    );

    await fs.copy(targetPath, descPath, {
      overwrite: true,
      dereference: true,
    });
  }
};
