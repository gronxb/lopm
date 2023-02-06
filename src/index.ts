#!/usr/bin/env node
import { resolve } from "path";
import * as fs from "fs-extra";
import { PackageJson } from "type-fest";

const readPackagesJson = async (path: string) => {
  const data = await fs.readFile(path, "utf8");
  return JSON.parse(data) as PackageJson;
};

const findLinkPackages = async () => {
  try {
    const packageJson = await readPackagesJson(resolve("package.json"));
    if (!packageJson.dependencies) {
      throw new Error("🔥 Not Found 'dependencies' field in package.json");
    }

    const linkPackages = Object.entries(packageJson.dependencies)
      .filter(([key, value]) => {
        if (value!.startsWith("link")) {
          console.log("🔥 find local package:", key);
          return true;
        }
      })
      .map(([key, value]) => ({
        name: key,
        path: value!.split(":")[1],
      }));

    return linkPackages;
  } catch (e) {
    throw new Error("🔥 No linked 'dependencies' field found in package.json");
  }
};

const run = async () => {
  const currentPath = process.cwd();
  const links = await findLinkPackages();
  const targetFiles = await Promise.all(
    links.map(async (link) => {
      const packageJson = await readPackagesJson(
        resolve(link.path, "package.json")
      );

      return {
        name: link.name,
        path: link.path,
        files: packageJson.files,
      };
    })
  );

  const isNodeModules = await fs.pathExists(
    resolve(currentPath, "node_modules")
  );
  if (!isNodeModules) {
    await fs.mkdir(resolve(currentPath, "node_modules"));
  }

  const uniqueFolders = new Set(
    targetFiles.map((targetFile) => targetFile.name.split("/")[0])
  );

  for (const uniqueFolder of uniqueFolders) {
    console.log("🔥 unlink", uniqueFolder);
    await fs.rm(resolve(currentPath, "node_modules", uniqueFolder), {
      recursive: true,
      force: true,
    });
  }

  for (const targetFile of targetFiles) {
    if (!targetFile.files) {
      throw new Error("🔥 Not Found 'files' field in package.json");
    }

    for (const file of targetFile.files) {
      const targetPath = resolve(targetFile.path, file);
      const descPath = resolve(
        currentPath,
        "node_modules",
        targetFile.name,
        file
      );
      await fs.copy(targetPath, descPath, {
        overwrite: true,
      });
    }
  }
  console.log("🔥 Done");
};

run();
