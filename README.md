# lopm

[![NPM](https://img.shields.io/npm/v/lopm)](https://www.npmjs.com/package/lopm)

Monorepo supports local packages.

* [Installation](#Installation)  
* [Command](#Command)  
* [Getting Started](#Getting-Started) 
* [Getting Started with Turborepo](#Getting-Started-with-Turborepo)
## Why use `lopm`?

When using local packages in a monorepo, you might experience peer dependency problems because you use symbolic links.

But if you use `lopm`, copies the files declared in the `files` field in the `package.json`

In other words, it has the same effect as a package installed by the npm registry.

It is similar to [dependenciesMeta.*.injected](https://pnpm.io/package_json#dependenciesmeta) of pnpm, but sync is difficult periodically at current pnpm and does not support watch mode.

## Installation

- pnpm

```
$ pnpm install lopm -D -w
$ pnpm lopm -v
```

- yarn

```
$ yarn add lopm -D
$ yarn lopm -v
```

- npm

```
$ npm install lopm --save-dev
$ npm lopm -v
```

## Command
* `lopm list`  
  
   Displays a list of available local packages and local packages specified in the current project.
   * **Example**  
     
   ```json
   {
     "name": "foo",
     "dependencies": {
         "bar": "workspace:^1.0.0",
         "bar2": "workspace:^1.0.0"
     }
   }
   ```

   <img width="819" alt="image" src="https://user-images.githubusercontent.com/41789633/227414964-cc431ad0-a27d-44d2-916c-9da7700ef7a1.png">

* `lopm sync`  
  
   Hardlink the local packages.  
     
   <img width="817" alt="image" src="https://user-images.githubusercontent.com/41789633/227415615-e376f391-0297-4397-813e-b08807f20686.png">
   
   **Example:**
   `node_modules` capacity increases due to changes from pnpm symbolic links to hard links.
* `lopm run <command>`  
  
   The command entered in the parameter is executed.  
   While command is running, `lopm` runs in watch mode.  
   Monitor the `files` field in the local package `package.json` and when a change occurs, the `sync` command is executed after 3 seconds.  
     
   <img width="820" alt="image" src="https://user-images.githubusercontent.com/41789633/227417257-5295dcdf-4c52-43ee-a55c-3e3477e1d876.png">
   
## Getting Started

### `package.json` setting for local package

Specify `files` field to export out

- **example**

```js
"name": "bar"
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

The `lopm run <command>` command is in watch mode. Hard link again if any changes to the local package occur while the command is running.

The command `pnpm install` or `yarn install` will restore it.

- **example**
```js
"name": "foo"
...
"scripts": {
    "build": "lopm sync && vite build",
    "dev": "lopm run vite"
},
...
```

The `dependency` field must specify the local package name.  
Supports `workspace`, `link` and `file` protocols.


- **example**

```js
"name": "foo"
...
"dependencies": {
    "foo": "workspace:0.0.1",
    "foo2": "link:../../packages/foo",
    "foo3": "file:../../packages/foo",
},
...
```
### How to use after `sync`
If you followed the example above well, you can use it inside the `bar` package as follows:

```
$ pnpm lopm sync
```

```js
// This code in "bar" package
import { sum } from "foo";
```

## Getting Started with `Turborepo`
Similar to the original [Getting Started](#Getting-Started), except that there is a `scripts` field in package.json and a `turbo.json` file.

### `package.json` setting for app
```
"name": "bar"
...
"scripts": {
    "sync": "lopm sync",    
    "build": "vite build",
},
...
```

### `package.json` setting for root
```
"name": "monorepo-root"
...
"scripts": {
    "build": "turbo rub build --filter='./packages/bar'",
},
...
```

### `turbo.json`
```
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["sync"]
    },
  }
}
```

Even if you set this much, Turbo will sync before the build!
