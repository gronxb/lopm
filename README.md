# lopkg

[![NPM](https://img.shields.io/npm/v/@lopkg/cli)](https://www.npmjs.com/package/@lopkg/cli)

Monorepo supports local packages.

## Why use `lopkg`?

When using local packages in a monorepo, you might experience peer dependency problems because you use symbolic links.

But if you use `lopkg`, hard links the files declared in the `files` field in the `package.json`

In other words, it has the same effect as a package installed by the npm registry.

## Installation

- local

```sh
> pnpm add @lopkg/cli -D # or yarn / npm
> pnpm lopkg -v
```

- global

```sh
> pnpm add -g @lopkg/cli # or yarn global add @lopkg/cli / npm install -g @lopkg/cli
> lopkg -v
```

## `package.json` setting for local package

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

## `package.json` setting for app

After `pnpm install` or `yarn install`, synchronization must be performed through the `lopkg` command.  
That is, it must be done immediately before build or development.

- **example**

```json
"name": "bar"
...
"scripts": {
    "build": "lopkg && vite build",
    "dev": "lopkg && vite"
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
