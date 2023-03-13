# lopm

[![NPM](https://img.shields.io/npm/v/lopm)](https://www.npmjs.com/package/lopm)

Monorepo supports local packages.

## Why use `lopm`?

When using local packages in a monorepo, you might experience peer dependency problems because you use symbolic links.

But if you use `lopm`, hard links the files declared in the `files` field in the `package.json`

In other words, it has the same effect as a package installed by the npm registry.

It is similar to [dependenciesMeta.*.injected](https://pnpm.io/package_json#dependenciesmeta) of pnpm, but sync is difficult periodically at current pnpm and does not support watch mode.
## Installation

- local

```sh
> pnpm add lopm -D -w # or yarn / npm
> pnpm lopm -v
```

- global

```sh
> pnpm add -g lopm # or yarn global add lopm / npm install -g lopm
> lopm -v
```

## Getting Started

### `package.json` setting for local package

Specify `files` field to export out

- **example**

```json
"name": "foo"
...
"files": [
    "dist",
    "package.json"
],
...
```

### `package.json` setting for app

After `pnpm install` or `yarn install`, synchronization must be performed through the `lopm sync` command.  
That is, it must be done immediately before build or development.

The `lopm run <command>` command is in surveillance mode. Hard link again if any changes to the local package occur while the command is running.

The command `pnpm install` or `yarn install` will restore it.

- **example**
```json
"name": "bar"
...
"scripts": {
    "build": "lopm sync && vite build",
    "dev": "lopm run vite"
},
...
```

The `dependency` field must specify the package name and link keyword to use, and the path where the local package resides must be specified as the relative path.

- **example**

```json
"name": "bar"
...
"dependencies": {
    "foo": "link:../../packages/foo",
},
...
```

If you followed the example above well, you can use it inside the `bar` package as follows:

```js
// This code in "bar" package
import { sum } from "foo";
```
