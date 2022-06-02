export default {
  "package.json": "{\n  \"name\": \"root\",\n  \"scripts\": {\n    \"postinstall\": \"monots prepare\"\n  },\n  \"dependencies\": {},\n  \"monots\": {\n    \"packages\": [\n      \"packages/*\"\n    ]\n  }\n}\n",
  "pnpm-workspace.yaml": "packages:\n  - 'packages/*'\n",
  "packages/scoped__add/package.json": "{\n  \"name\": \"@scoped/add\",\n  \"version\": \"1.0.0\",\n  \"main\": \"\",\n  \"module\": \"\",\n  \"browser\": \"\",\n  \"types\": \"\",\n  \"monots\": {\n    \"entrypoints\": [\n      \"index.ts\",\n      \"other.ts\"\n    ],\n    \"extraExports\": {\n      \"./extra\": \"./extra.js\"\n    },\n    \"addExportsToEntrypoints\": true\n  }\n}\n",
  "packages/scoped__add/src/index.ts": "export function a() {\n  console.log('a');\n}\n",
  "packages/scoped__add/src/other.ts": "export default function () {\n  return 'other';\n}\n"
};