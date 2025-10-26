/** @type {import("eslint").Linter.Config} */
export default {
  extends: ["@repo/eslint-config/react-internal"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
};
