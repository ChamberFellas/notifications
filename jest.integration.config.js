/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/integration/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
