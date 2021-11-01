import { getDependentsGraph } from '@changesets/get-dependents-graph';
import { getPackagesSync } from '@manypkg/get-packages';
import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';
import withNextTranspile from 'next-transpile-modules';
import { readPackageUpSync } from 'read-pkg-up';

function getPackageJsonName() {
  const packageJson = readPackageUpSync({ cwd: process.cwd() })?.packageJson;

  if (!packageJson || !packageJson.name) {
    throw new Error('Invalid installation of `monots`');
  }

  return packageJson.name;
}

interface RecursivelyUpdateDependentsProps {
  searchName: string;
  graph: Map<string, string[]>;
  names: Set<string>;
}

function recursivelyUpdateDependents(props: RecursivelyUpdateDependentsProps): void {
  const { searchName, graph, names } = props;

  for (const [name, dependents] of graph.entries()) {
    if (!dependents.includes(searchName) || names.has(name)) {
      continue;
    }

    names.add(name);
    recursivelyUpdateDependents({ graph, names, searchName: name });
  }
}

function withMonots(nextConfig?: NextConfig) {
  const names = new Set<string>();
  const graph = getDependentsGraph(getPackagesSync(process.cwd()));
  const searchName = getPackageJsonName();
  recursivelyUpdateDependents({ graph, names, searchName });

  return withNextTranspile([...names], { resolveSymlinks: true })(nextConfig);
}

export = withMonots;
