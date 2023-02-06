#!/usr/bin/env node
import * as fs from "fs-extra";
import { resolve } from "path";
import {
  copyFilesToNodeModules,
  currentPath,
  getFilesFields,
  getLinkFields,
  unlinkAlreadyModules,
} from "./helper";

const sync = async () => {
  const isNodeModules = await fs.pathExists(
    resolve(currentPath, "node_modules")
  );
  if (!isNodeModules) {
    await fs.mkdir(resolve(currentPath, "node_modules"));
  }

  const linkFields = await getLinkFields();
  const filesFields = await getFilesFields(linkFields);

  await unlinkAlreadyModules(filesFields);
  await copyFilesToNodeModules(filesFields);
  console.log("🔥 Done");
};

sync();
