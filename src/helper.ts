import { resolve } from "path";
import * as fs from "fs-extra";
import chalk from "chalk";

import type { PackageJson } from "type-fest";
import type { FilesField, LinkField } from "./type";

export const currentPath = process.cwd();

export const readPackagesJson = async (path: string) => {
  const data = await fs.readFile(path, "utf8");
  return JSON.parse(data) as PackageJson;
};

export const getLinkFields: () => Promise<LinkField[]> = async () => {
  try {
    const packageJson = await readPackagesJson(resolve("package.json"));
    if (!packageJson.dependencies) {
      throw new Error(
        chalk.red("🔥 Not Found 'dependencies' field in package.json")
      );
    }

    const linkPackages = Object.entries(packageJson.dependencies)
      .filter(([key, value]) => {
        if (value!.startsWith("link")) {
          console.log(chalk.blue("🔥 find local package:", key));
          return true;
        }
      })
      .map(([key, value]) => ({
        name: key,
        path: value!.split(":")[1],
      }));

    return linkPackages;
  } catch (e) {
    throw new Error(
      chalk.red("🔥 No linked 'dependencies' field found in package.json")
    );
  }
};

export const getFilesFields: (
  linkFields: LinkField[]
) => Promise<FilesField[]> = async (linkFields) => {
  return Promise.all(
    linkFields.map(async (linkField) => {
      const packageJson = await readPackagesJson(
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

export const unlinkAlreadyModules = async (filesFields: FilesField[]) => {
  const uniqueFolders = new Set(
    filesFields.map((field) => field.name.split("/")[0])
  );

  for (const uniqueFolder of uniqueFolders) {
    console.log(chalk.blue("🔥 unlink", uniqueFolder));
    await fs.rm(resolve(currentPath, "node_modules", uniqueFolder), {
      recursive: true,
      force: true,
    });
  }
};

export const copyFilesToNodeModules = async (filesFields: FilesField[]) => {
  for (const field of filesFields) {
    if (!field.files) {
      throw new Error(chalk.red("🔥 Not Found 'files' field in package.json"));
    }

    for (const file of field.files) {
      const targetPath = resolve(field.path, file);
      const descPath = resolve(currentPath, "node_modules", field.name, file);
      await fs.copy(targetPath, descPath, {
        overwrite: true,
      });
      console.log(chalk.blue("🔥 copy", targetPath, "to", descPath));
    }
  }
};
