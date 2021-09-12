import { PackageJSON } from "@changesets/types";
declare type Options = {
    cwd?: string;
    tools?: Array<"yarn" | "bolt" | "pnpm" | "root">;
};
export declare type Workspace = {
    config: PackageJSON;
    name: string;
    dir: string;
};
export default function getWorkspaces(opts?: Options): Promise<Array<Workspace> | null>;
export {};
