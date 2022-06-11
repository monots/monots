import type { NpmPackageProps } from '../types.js';
import { NpmEntrypoint } from './npm-entrypoint.js';

export class NpmPackage extends NpmEntrypoint {
  private constructor(props: NpmPackageProps) {}
}
