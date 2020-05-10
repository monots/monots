import { FatalError, FixableError } from './errors';
import { info, success } from './logger';
import { confirms, errors, infos, inputs } from './messages';
import { Package } from './package';
import { Project } from './project';
import { promptInput } from './prompt';
import { isFieldValid, isUmdNameSpecified } from './validate';

async function doInit(pkg: Package) {
  if (pkg.entrypoints.every((entrypoint) => isFieldValid.main(entrypoint))) {
    info(infos.validField('main'), pkg.name);
  } else {
    const canWriteMainField = await confirms.writeMainField(pkg);

    if (!canWriteMainField) {
      throw new FatalError(errors.deniedWriteMainField, pkg.name);
    }

    pkg.setFieldOnEntrypoints('main');
  }

  const allEntrypointsAreMissingAModuleField = pkg.entrypoints.every(
    (entrypoint) => entrypoint.json.module === undefined,
  );
  const someEntrypointsAreNotValid = pkg.entrypoints.some(
    (entrypoint) => !isFieldValid.module(entrypoint),
  );

  if (allEntrypointsAreMissingAModuleField || someEntrypointsAreNotValid) {
    const canWriteModuleField = await confirms.writeModuleField(pkg);

    if (canWriteModuleField) {
      pkg.setFieldOnEntrypoints('module');
    } else if (!allEntrypointsAreMissingAModuleField) {
      throw new FixableError(
        errors.fieldMustExistInAllEntrypointsIfExistsDeclinedFixDuringInit('module'),
        pkg.name,
      );
    }
  } else {
    info(infos.validField('module'), pkg.name);
  }

  const someEntrypointsHaveAMaybeInvalidUmdBuild = pkg.entrypoints.some(
    (entrypoint) => entrypoint.json['umd:main'] !== undefined,
  );
  const someUmdMainFieldsAreInvalid = pkg.entrypoints.some(
    (entrypoint) => !isFieldValid['umd:main'](entrypoint),
  );
  const someUmdNamesAreNotSpecified = pkg.entrypoints.some(
    (entrypoint) => !isUmdNameSpecified(entrypoint),
  );

  if (
    someEntrypointsHaveAMaybeInvalidUmdBuild &&
    (someUmdMainFieldsAreInvalid || someUmdNamesAreNotSpecified)
  ) {
    const shouldWriteUMDBuilds = await confirms.fixUmdBuild(pkg);

    if (shouldWriteUMDBuilds) {
      pkg.setFieldOnEntrypoints('umd:main');

      for (const entrypoint of pkg.entrypoints) {
        const umdName = await promptInput(inputs.getUmdName, entrypoint);
        entrypoint.json.preconstruct.umdName = umdName;
      }
    } else {
      throw new FixableError(
        errors.fieldMustExistInAllEntrypointsIfExistsDeclinedFixDuringInit('umd:main'),
        pkg.name,
      );
    }
  }

  const someEntrypointsHaveABrowserField = pkg.entrypoints.some(
    (entrypoint) => entrypoint.json.browser !== undefined,
  );

  const someEntrypointsHaveAnInvalidBrowserField = pkg.entrypoints.some(
    (entrypoint) => !isFieldValid.browser(entrypoint),
  );

  if (someEntrypointsHaveABrowserField && someEntrypointsHaveAnInvalidBrowserField) {
    const shouldFixBrowserField = await confirms.fixBrowserField(pkg);

    if (shouldFixBrowserField) {
      pkg.setFieldOnEntrypoints('browser');
    } else {
      throw new FixableError(
        errors.fieldMustExistInAllEntrypointsIfExistsDeclinedFixDuringInit('browser'),
        pkg.name,
      );
    }
  }

  await Promise.all(pkg.entrypoints.map((x) => x.save()));
}

export default async function init(directory: string) {
  const project = await Project.create(directory);

  await Promise.all(project.packages.map(doInit));

  success('initialised project!');
}
