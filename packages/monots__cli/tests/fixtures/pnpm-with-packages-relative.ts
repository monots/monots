export default {
  "package.json": "{\n  \"name\": \"root\",\n  \"scripts\": {\n    \"postinstall\": \"monots prepare\"\n  },\n  \"dependencies\": {},\n  \"monots\": {\n    \"baseTsconfig\": \"./relative/tsconfig.json\",\n    \"packages\": [\n      \"packages/*\"\n    ]\n  }\n}\n",
  "pnpm-workspace.yaml": "packages:\n  - 'packages/*'\n",
  "relative/tsconfig.json": "{}\n",
  "packages/scoped__b/package.json": "{\n  \"name\": \"@scoped/b\",\n  \"version\": \"2.0.0\",\n  \"main\": \"\",\n  \"module\": \"\",\n  \"browser\": \"\",\n  \"dependencies\": {\n    \"@scoped/c\": \"^1.0.0\"\n  }\n}\n",
  "packages/scoped__a/package.json": "{\n  \"name\": \"@scoped/a\",\n  \"version\": \"1.0.0\",\n  \"main\": \"\",\n  \"module\": \"\",\n  \"browser\": \"\",\n  \"types\": \"\",\n  \"dependencies\": {\n    \"@scoped/b\": \"^2.0.0\"\n  }\n}\n",
  "packages/scoped__b/src/index.ts": "export function a() {\n  console.log('a');\n}\n",
  "packages/scoped__a/src/index.ts": "export function a() {\n  console.log('a');\n}\n"
};