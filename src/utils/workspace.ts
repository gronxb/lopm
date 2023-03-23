import { basename } from "path";
import {
  findPackageRoot,
  getWorkspaces,
  searchUp,
  WorkspaceInfo,
} from "workspace-tools";

export const isWorkspace = (cwd: string) => {
  const workspaces = getWorkspaces(cwd);
  return workspaces.length > 0;
};

export const getPackageManager = (cwd: string) => {
  const lockFile = searchUp(
    ["yarn.lock", "pnpm-workspace.yaml", "package-lock.json"],
    cwd
  );

  if (!lockFile) {
    return null;
  }

  switch (basename(lockFile)) {
    case "yarn.lock":
      return "yarn";
    case "pnpm-workspace.yaml":
      return "pnpm";
    case "package-lock.json":
      return "npm";
    default:
      return null;
  }
};

export const getLocalPackages = (cwd: string) => {
  const workspaces = getWorkspaces(cwd);

  return workspaces.filter((workspace) =>
    workspace.packageJson.files?.includes("package.json")
  );
};

export const getMyPackageInfo = (cwd: string) => {
  const workspaces = getWorkspaces(cwd);

  return workspaces.find(
    (workspace) => workspace.path === findPackageRoot(cwd)
  );
};

export const getLocalDependencies = (cwd: string): WorkspaceInfo => {
  const myPackageInfo = getMyPackageInfo(cwd);

  if (!myPackageInfo) {
    throw new Error("Not Found `package.json`");
  }
  const { packageJson } = myPackageInfo;

  const workspaces = getWorkspaces(cwd);

  return Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })
    .filter(
      ([_, version]) =>
        version.startsWith("file:") ||
        version.startsWith("link:") ||
        version.startsWith("workspace:")
    )
    .map(([name]) => workspaces.find((workspace) => workspace.name === name)!);
};
