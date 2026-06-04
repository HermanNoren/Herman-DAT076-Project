const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  // Migrates + seeds each test file's PGlite instance before its tests run.
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
};