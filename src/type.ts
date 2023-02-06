export type LinkField = Record<"name" | "path", string>;
export type FilesField = {
  name: string;
  path: string;
  files: string[] | undefined;
};
