import type { NpmPluginProps } from '../types.js';

export interface NpmWorkspaceProps extends NpmPluginProps {}

export class NpmWorkspace {
  /**
   * Create a workspace and load all packages.
   */
  static async create() {}

  private constructor() {}
}

export interface NpmWorkspace extends monots.NpmWorkspace {}

declare global {
  namespace monots {
    interface NpmWorkspace {}
  }
}
