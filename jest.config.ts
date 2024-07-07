import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts'],
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};

export default config;
