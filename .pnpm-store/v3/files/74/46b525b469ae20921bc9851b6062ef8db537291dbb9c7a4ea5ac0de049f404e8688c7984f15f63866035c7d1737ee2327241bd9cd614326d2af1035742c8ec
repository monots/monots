import { Package } from "@manypkg/get-packages";
declare type ErrorType = {
    type: "ROOT_HAS_DEV_DEPENDENCIES";
    workspace: Package;
};
declare const _default: {
    type: "root";
    validate: (rootPackage: any, allPackages: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => ErrorType[];
    fix: (error: ErrorType, options: import("./utils").Options) => void | {
        requiresInstall: boolean;
    };
    print: (error: ErrorType, options: import("./utils").Options) => string;
};
export default _default;
