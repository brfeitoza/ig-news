module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  modulePaths: ['<rootDir>/src/'],
  moduleNameMapper: {
    '\\.(scss|css|sass)$': 'identity-obj-proxy',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.tsx',
    '!**/*.spec.tsx',
    '!**/_app.tsx',
    '!**/_document.tsx',
  ],
  coverageReporters: ['lcov', 'json'],
};
