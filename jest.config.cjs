const swcTransform = [
  '@swc/jest',
  {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: true
      },
      transform: {
        decoratorMetadata: true,
        react: {
          runtime: 'automatic'
        }
      },
      target: 'es2022'
    },
    module: {
      type: 'commonjs'
    }
  }
];

module.exports = {
  projects: [
    {
      displayName: 'api',
      rootDir: '.',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/apps/api/src/**/*.spec.ts'],
      transform: {
        '^.+\\.(t|j)sx?$': swcTransform
      },
      moduleNameMapper: {
        '^@chess-ledger/shared$': '<rootDir>/packages/shared/src/index.ts'
      }
    },
    {
      displayName: 'shared',
      rootDir: '.',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/shared/src/**/*.spec.ts'],
      transform: {
        '^.+\\.(t|j)sx?$': swcTransform
      }
    }
  ],
  collectCoverageFrom: [
    'apps/api/src/**/*.ts',
    'packages/shared/src/**/*.ts',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/*.dto.ts'
  ]
};
