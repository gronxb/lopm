# localpkg

Monorepo supports local packages.

## Why use `localpkg`?

When using local packages in a monorepo, you might experience peer dependency problems because you use symbolic links.

Hardlink the files declared in the 'files' field in the 'package.json'

## Usage

```sh
> pnpm localpkg # or yarn, npm
```
