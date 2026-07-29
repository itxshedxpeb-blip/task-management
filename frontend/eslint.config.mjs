import next from "eslint-config-next";

const eslintConfig = [
  { ignores: ["android/**/*"] },
  ...next,
];

export default eslintConfig;
