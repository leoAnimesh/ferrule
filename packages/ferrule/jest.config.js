module.exports = {
  projects: [
    {
      displayName: 'native',
      preset: '@react-native/jest-preset',
      rootDir: __dirname,
      testMatch: ['<rootDir>/test/native/**/*.test.tsx'],
      moduleNameMapper: { '^ferrule/lib/feather$': '<rootDir>/src/feather.ts', '^ferrule$': '<rootDir>/src/index.ts', '^ferrule-native$': '<rootDir>/../ferrule-native/src/index.ts' },
      // Reanimated's official Jest resolver: real API, JS-driven animation instead of native worklets.
      resolver: 'react-native-reanimated/jest/resolver',
      transformIgnorePatterns: ['/node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|react-native-worklets)/)'],
    },
    {
      // Real DOM semantics through react-native-web: roles, keyboard, focus.
      displayName: 'web',
      testEnvironment: 'jsdom',
      globals: { __DEV__: true },
      setupFiles: ['<rootDir>/test/web/setup.js'],
      rootDir: __dirname,
      testMatch: ['<rootDir>/test/web/**/*.test.tsx'],
      moduleFileExtensions: ['web.ts', 'web.tsx', 'web.js', 'ts', 'tsx', 'js', 'jsx', 'json'],
      moduleNameMapper: {
        '^ferrule/lib/feather$': '<rootDir>/src/feather.ts', '^ferrule$': '<rootDir>/src/index.ts',
        '^react-native$': 'react-native-web',
        '^react-native-reanimated$': 'react-native-reanimated/src/index',
        '^react-native-worklets$': 'react-native-worklets/src/index',
      },
      transformIgnorePatterns: ['/node_modules/(?!(react-native-web|react-native-reanimated|react-native-worklets)/)'],
    },
  ],
};
