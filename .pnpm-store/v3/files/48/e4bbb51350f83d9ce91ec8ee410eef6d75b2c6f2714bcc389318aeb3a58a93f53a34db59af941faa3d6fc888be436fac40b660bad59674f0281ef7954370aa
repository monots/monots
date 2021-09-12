import { Package } from "@manypkg/get-packages";
declare type ErrorType = {
    type: "MULTIPLE_DEPENDENCY_TYPES";
    workspace: Package;
    dependencyType: "devDependencies" | "optionalDependencies";
    dependencyName: string;
};
declare const _default: {
    type: "all";
    validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => ErrorType[];
    fix: (error: ErrorType, options: import("./utils").Options) => void | {
        requiresInstall: boolean;
    };
    print: (error: ErrorType, options: import("./utils").Options) => string;
};
export default _default;
