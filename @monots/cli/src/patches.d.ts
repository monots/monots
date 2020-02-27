declare module 'ink-link' {
  import { ComponentType } from 'react';

  namespace Link {
    export interface LinkProps {
      /**
       * The URL to link to.
       *
       * For files you should prepend the `file://` hostname.
       */
      url?: string;

      /**
       * Determines whether the URL should be printed in parens after the text for unsupported terminals:
       *
       * @default true
       *
       * For example: My website (https://sindresorhus.com).
       */
      fallback?: ((text: string, url: string) => string) | boolean;
    }
  }

  const Link: ComponentType<Link.LinkProps>;

  export = Link;
}

declare module 'ink-spinner' {
  import * as cliSpinners from 'cli-spinners';
  import { Component } from 'react';

  interface SpinnerProps {
    type?: cliSpinners.SpinnerName;
  }

  class Spinner extends Component<SpinnerProps> {}

  export = Spinner;
}
