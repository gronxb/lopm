export type LinkField = Record<"name" | "path", string>;
export type LocalPackageInfo = {
  name: string;
  path: string;
  files: string[] | undefined;
};

export type PackageManager = "pnpm" | "yarn";

export type HelperOptions = {
  log: boolean;
};
