import { configApp } from "@adonisjs/eslint-config";
export default [
  ...configApp(),
  {
    rules: {
      "@unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": ["error"],
    },
  },
  {
    files: ["app/migration/*.ts"],
    rules: {
      "@unicorn/filename-case": "off",
      "@typescript-eslint/naming-convention": "off",
    },
  },
  {
    ignores: ["build/**"],
  },
];
