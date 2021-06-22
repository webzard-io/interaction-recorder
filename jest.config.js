module.exports = {
  transform: {
    '.ts': 'ts-jest',
  },
  globals: {
    "ts-jest": {
      diagnostics: false,
    }
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['<rootDir>/__tests__/**/**.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '<rootDir>/build/'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverage: true,//Boolean(process.env.COVERAGE),
  coverageDirectory :'./__tests__/coverage'
}