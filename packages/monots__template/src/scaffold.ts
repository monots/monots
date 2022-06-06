import degit from 'degit';

export interface ScaffoldProps {
  /**
   * The source to download from github.
   *
   * These are all allowed:
   *
   * #### GitHub
   *
   * - github:user/repo
   * - git@github.com:user/repo
   * - https://github.com/user/repo
   *
   * #### GitLab
   *
   * - gitlab:user/repo
   * - git@gitlab.com:user/repo
   * - https://gitlab.com/user/repo
   *
   * #### BitBucket
   *
   * - bitbucket:user/repo
   * - git@bitbucket.org:user/repo
   * - https://bitbucket.org/user/repo
   *
   * #### Sourcehut
   *
   * - git.sr.ht/user/repo
   * - git@git.sr.ht:user/repo
   * - https://git.sr.ht/user/repo
   *
   */
  repo: string;

  /**
   * The target directory to download the source into.
   */
  destination: string;
  onInfo?: (info: degit.Info) => void;
  onWarn?: (warning: degit.Info) => void;
}

/**
 * Scaffold a template source folder using `degit`.
 */
export async function scaffold(props: ScaffoldProps) {
  const emitter = degit(props.repo, { force: true });

  if (props.onInfo) {
    emitter.on('info', props.onInfo);
  }

  if (props.onWarn) {
    emitter.on('info', props.onWarn);
  }

  await emitter.clone(props.destination);
}
