export declare let checks: {
    EXTERNAL_MISMATCH: {
        type: "all";
        validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => {
            type: "EXTERNAL_MISMATCH";
            workspace: any;
            dependencyName: string;
            dependencyRange: string;
            highestDependencyRange: string;
        }[];
        fix: (error: {
            type: "EXTERNAL_MISMATCH";
            workspace: any;
            dependencyName: string;
            dependencyRange: string;
            highestDependencyRange: string;
        }, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: {
            type: "EXTERNAL_MISMATCH";
            workspace: any;
            dependencyName: string;
            dependencyRange: string;
            highestDependencyRange: string;
        }, options: import("./utils").Options) => string;
    };
    INTERNAL_MISMATCH: {
        type: "all";
        validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => import("./INTERNAL_MISMATCH").ErrorType[];
        fix: (error: import("./INTERNAL_MISMATCH").ErrorType, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: import("./INTERNAL_MISMATCH").ErrorType, options: import("./utils").Options) => string;
    };
    INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP: {
        type: "all";
        validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => {
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
            workspace: any;
            peerVersion: string;
            dependencyName: string;
            devVersion: string;
            idealDevVersion: string;
        }[];
        fix: (error: {
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
            workspace: any;
            peerVersion: string;
            dependencyName: string;
            devVersion: string;
            idealDevVersion: string;
        }, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: {
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
            workspace: any;
            peerVersion: string;
            dependencyName: string;
            devVersion: string;
            idealDevVersion: string;
        }, options: import("./utils").Options) => string;
    };
    INVALID_PACKAGE_NAME: {
        type: "all";
        validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => {
            type: "INVALID_PACKAGE_NAME";
            workspace: any;
            errors: string[];
        }[];
        fix?: (error: {
            type: "INVALID_PACKAGE_NAME";
            workspace: any;
            errors: string[];
        }, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: {
            type: "INVALID_PACKAGE_NAME";
            workspace: any;
            errors: string[];
        }, options: import("./utils").Options) => string;
    };
    MULTIPLE_DEPENDENCY_TYPES: {
        type: "all";
        validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => {
            type: "MULTIPLE_DEPENDENCY_TYPES";
            workspace: any;
            dependencyType: "devDependencies" | "optionalDependencies";
            dependencyName: string;
        }[];
        fix: (error: {
            type: "MULTIPLE_DEPENDENCY_TYPES";
            workspace: any;
            dependencyType: "devDependencies" | "optionalDependencies";
            dependencyName: string;
        }, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: {
            type: "MULTIPLE_DEPENDENCY_TYPES";
            workspace: any;
            dependencyType: "devDependencies" | "optionalDependencies";
            dependencyName: string;
        }, options: import("./utils").Options) => string;
    };
    ROOT_HAS_DEV_DEPENDENCIES: {
        type: "root";
        validate: (rootPackage: any, allPackages: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => {
            type: "ROOT_HAS_DEV_DEPENDENCIES";
            workspace: any;
        }[];
        fix: (error: {
            type: "ROOT_HAS_DEV_DEPENDENCIES";
            workspace: any;
        }, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: {
            type: "ROOT_HAS_DEV_DEPENDENCIES";
            workspace: any;
        }, options: import("./utils").Options) => string;
    };
    UNSORTED_DEPENDENCIES: {
        type: "all";
        validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => {
            type: "UNSORTED_DEPENDENCIES";
            workspace: any;
        }[];
        fix: (error: {
            type: "UNSORTED_DEPENDENCIES";
            workspace: any;
        }, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: {
            type: "UNSORTED_DEPENDENCIES";
            workspace: any;
        }, options: import("./utils").Options) => string;
    };
    INCORRECT_REPOSITORY_FIELD: {
        type: "all";
        validate: (workspace: any, allWorkspaces: Map<string, any>, rootWorkspace: any, options: import("./utils").Options) => {
            type: "INCORRECT_REPOSITORY_FIELD";
            workspace: any;
            currentRepositoryField: string;
            correctRepositoryField: string;
        }[];
        fix: (error: {
            type: "INCORRECT_REPOSITORY_FIELD";
            workspace: any;
            currentRepositoryField: string;
            correctRepositoryField: string;
        }, options: import("./utils").Options) => void | {
            requiresInstall: boolean;
        };
        print: (error: {
            type: "INCORRECT_REPOSITORY_FIELD";
            workspace: any;
            currentRepositoryField: string;
            correctRepositoryField: string;
        }, options: import("./utils").Options) => string;
    };
};
