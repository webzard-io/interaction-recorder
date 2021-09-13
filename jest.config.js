// jest.config.js
// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  transform: {
    '.ts': 'ts-jest',
  },
  globals: {
    "ts-jest": {
      diagnostics: false,
      tsconfig: './__tests__/tsconfig.json'
    }
  },
  setupFilesAfterEnv: ["jest-extended"],
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['<rootDir>/__tests__/**/**.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '<rootDir>/build/'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverage: Boolean(process.env.COVERAGE),
  coverageDirectory: './__tests__/coverage',
};
module.exports = config