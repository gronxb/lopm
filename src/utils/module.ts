import * as fs from "fs-extra";
import { normalize, resolve } from "path";
import type { WorkspaceInfo } from "workspace-tools";
import { Workspace } from "../types";

export const unlinkAlreadyModules = async (
  cwd: string,
  workspaceInfo: WorkspaceInfo
) => {
  const alreadyModules = new Set(
    workspaceInfo.map((workspace) => workspace.name)
  );

  for (const alreadyModule of alreadyModules) {
    await fs.rm(normalize(resolve(cwd, "node_modules", alreadyModule)), {
      recursive: true,
      force: true,
    });
  }
};

export const copyFilesToNodeModules = async (
  cwd: string,
  { path, packageJson }: Workspace
) => {
  if (!packageJson.files) {
    throw new Error("Not Found 'files' field in package.json");
  }

  for (const file of packageJson.files) {
    const targetPath = resolve(path, file);
    const descPath = resolve(cwd, "node_modules", packageJson.name, file);

    await fs.copy(targetPath, descPath, {
      overwrite: true,
      dereference: true,
    });
  }
};
