export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/*.test.js'],
  setupFiles: ['<rootDir>/src/tests/setup.js'],
  verbose: true,
  maxWorkers: 1,
}
