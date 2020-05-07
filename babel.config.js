const ignore = [
  '**/__tests__',
  '**/__mocks__',
  '**/__fixtures__',
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const nonTestPreset = [['@babel/preset-env']];
const nonTestEnv = { ignore, presets: nonTestPreset };

const presets = [['@babel/preset-env', { targets: { node: '12' } }]];

module.exports = {
  presets,
  overrides: [
    { test: /\.ts$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: false }]] },
    { test: /\.tsx$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: true }]] },
    {
      test: /\.tsx?$/,
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
      ],
    },
  ],
  plugins: [
    'annotate-pure-calls',
    'dev-expression',
    'macros',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
  babelrcRoots: ['.', '@monots/*', 'docs/.babelrc.js', 'packages/*'],
  sourceType: 'unambiguous',
};
