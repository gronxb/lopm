import { resolve } from "path";
import * as fs from "fs-extra";

import type { PackageJson } from "type-fest";
import type { LocalPackageInfo, LinkField, PackageManager } from "../type";
import { getWorkspaceRoot } from "workspace-tools";

export const readPackageJson = async (path: string) => {
  const data = await fs.readFile(path, "utf8");
  return JSON.parse(data) as PackageJson;
};

export const getLinkFields = async () => {
  const packageJson = await readPackageJson(resolve("package.json"));

  const linkPackages = [
    ...Object.entries(packageJson?.dependencies ?? {}),
    ...Object.entries(packageJson?.devDependencies ?? {}),
  ]
    .filter(([_, value]) => {
      if (value!.startsWith("link")) {
        return true;
      }
      return false;
    })
    .map(([key, value]) => ({
      name: key,
      path: value!.split(":")[1],
    }));

  return linkPackages as LinkField[];
};

export const getLocalPackageInfos: (
  linkFields: LinkField[]
) => Promise<LocalPackageInfo[]> = async (linkFields) => {
  return Promise.all(
    linkFields.map(async (linkField) => {
      const packageJson = await readPackageJson(
        resolve(linkField.path, "package.json")
      );

      return {
        name: linkField.name,
        path: linkField.path,
        files: packageJson.files,
      };
    })
  );
};

export const getPackageManager = async (cwd: string) => {
  const workspaceRoot = getWorkspaceRoot(cwd);

  if (!workspaceRoot) {
    throw new Error("Not Found workspace root");
  }

  const packageJson = await readPackageJson(
    resolve(workspaceRoot, "package.json")
  );
  if (packageJson.packageManager) {
    const packageManager = packageJson.packageManager.split("@")[0];
    switch (packageManager) {
      case "yarn":
      case "pnpm":
        return packageManager;
    }
  }

  const yarnLockPath = resolve(workspaceRoot, "yarn.lock");
  const pnpmLockPath = resolve(workspaceRoot, "pnpm-lock.yaml");

  const isYarn = await fs.pathExists(yarnLockPath);
  const isPnpm = await fs.pathExists(pnpmLockPath);

  if (isYarn) {
    return "yarn";
  } else if (isPnpm) {
    return "pnpm";
  }
  return null;
};

export const noop = () => {};
