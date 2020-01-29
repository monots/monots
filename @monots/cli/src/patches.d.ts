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
