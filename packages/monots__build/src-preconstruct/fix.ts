import { Entrypoint } from './entrypoint';
import { BatchError, FatalError } from './errors';
import * as logger from './logger';
import { inputs } from './messages';
import { Project } from './project';
import { promptInput } from './prompt';
import {
  EXPERIMENTAL_FLAGS,
  FORMER_FLAGS_THAT_ARE_ENABLED_NOW,
  isUmdNameSpecified,
} from './validate';
import { fixPackage } from './validate-package';

async function fixEntrypoint(entrypoint: Entrypoint) {
  if (entrypoint.json['umd:main'] !== undefined && !isUmdNameSpecified(entrypoint)) {
    const umdName = await promptInput(inputs.getUmdName, entrypoint);
    entrypoint.json.monots.umdName = umdName;
    await entrypoint.save();
    return true;
  }

  return false;
}

export default async function fix(directory: string) {
  const project = await Project.create(directory, true);
  let didModifyProject = false;

  if (project.json.monots.___experimentalFlags_WILL_CHANGE_IN_PATCH) {
    const errors: FatalError[] = [];
    Object.keys(project.json.monots.___experimentalFlags_WILL_CHANGE_IN_PATCH).forEach((key) => {
      if (FORMER_FLAGS_THAT_ARE_ENABLED_NOW.has(key)) {
        didModifyProject = true;
        delete (project.json.monots.___experimentalFlags_WILL_CHANGE_IN_PATCH as any)[key];
      } else if (!EXPERIMENTAL_FLAGS.has(key)) {
        errors.push(
          new FatalError(
            `The experimental flag ${JSON.stringify(key)} in your config does not exist`,
            project.name,
          ),
        );
      }
    });

    if (didModifyProject) {
      if (Object.keys(project.json.monots.___experimentalFlags_WILL_CHANGE_IN_PATCH).length === 0) {
        delete (project.json.monots as any).___experimentalFlags_WILL_CHANGE_IN_PATCH;
      }

      await project.save();
    }

    if (errors.length) {
      throw new BatchError(errors);
    }
  }

  const didModifyPackages = (
    await Promise.all(
      project.packages.map(async (pkg) => {
        const didModifyInPkgFix = await fixPackage(pkg);
        const didModifyInEntrypointsFix = (
          await Promise.all(pkg.entrypoints.map(fixEntrypoint))
        ).some((x) => x);
        return didModifyInPkgFix || didModifyInEntrypointsFix;
      }),
    )
  ).some((x) => x);

  logger.success(
    didModifyProject || didModifyPackages ? 'fixed project!' : 'project already valid!',
  );
}
