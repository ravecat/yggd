const { readFileSync } = require("fs");
const { join } = require("path");

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(readFileSync(join(__dirname, ".spec.swcrc"), "utf-8"));

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: "@rvct/shared",
  preset: "../../jest.preset.js",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/**/*.spec.[jt]s?(x)", "<rootDir>/tests/**/*.test.[jt]s?(x)"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.[tj]sx?$": ["@swc/jest", swcJestConfig],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  coverageDirectory: "test-output/jest/coverage",
};
