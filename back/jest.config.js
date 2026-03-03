/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^./middlewares/expressjwt.config$': '<rootDir>/__mocks__/expressjwt.config.ts'
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/app.test.ts',
    "/node_modules/",
    "/dist/"
  ],
};