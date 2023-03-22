import { WorkspaceInfo } from "workspace-tools";

export type Flatten<A> = A extends readonly (infer T)[] ? T : never;
export type Workspace = Flatten<WorkspaceInfo>;
