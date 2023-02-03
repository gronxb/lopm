#!/usr/bin/env node
import { resolve, join } from "path";
import fs from "fs/promises";
import fse from "fs-extra";
const [, , ...args] = process.argv;

const readPackagesJson = async (path) => {
  const data = await fs.readFile(path, "utf8");
  return JSON.parse(data);
};

console.log("Hello World", args);
const findLinkPackages = async () => {
  try {
    const packageJson = await readPackagesJson(resolve("packages.json"));
    const linkPackages = Object.entries(packageJson.dependencies)
      .filter(([_, value]) => {
        if (value.startsWith("link")) {
          return true;
        }
      })
      .map(([key, value]) => ({
        name: key,
        path: value.split(":")[1],
      }));

    return linkPackages;
  } catch (e) {
    throw new Error("🔥 findLinkPackages error");
  }
};

const run = async () => {
  console.log(process.cwd());

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

  const isNodeModules = await fse.existsSync(
    resolve(currentPath, "node_modules")
  );
  console.log(isNodeModules);
  if (!isNodeModules) {
    await fs.mkdir(resolve(currentPath, "node_modules"));
  }

  for (const targetFile of targetFiles) {
    targetFile.name.split("/").reduce(async (path, newPath) => {
      const _path = await path;
      const makePath = resolve(_path, newPath);
      const isAlreadyPath = fse.existsSync(makePath);
      if (!isAlreadyPath) {
        await fs.mkdir(makePath);
      }
      console.log(makePath);
      return makePath;
    }, Promise.resolve(resolve(currentPath, "node_modules")));
  }

  for (const targetFile of targetFiles) {
    for (const file of targetFile.files) {
      await fse.copySync(
        join(targetFile.path, file),
        join(currentPath, "node_modules", targetFile.name, file)
      );
    }
  }
  console.log(targetFiles);
};

run();
