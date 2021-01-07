// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = {
  globalSetup: '<rootDir>/jest.setup.js', // TODO update it to run only at a TestSuite
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
  },
  testPathIgnorePatterns: ['integration'], // by default we ignore integration test
  moduleFileExtensions: ['js', 'ts', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest',
    '.*\\.(vue)$': 'vue-jest',
  },
  collectCoverage: false, // default to not collecting covearge
  collectCoverageFrom: [
    '<rootDir>/components/**/*.vue',
    '<rootDir>/pages/**/*.vue',
    '<rootDir>/server/**/*.ts',
    '<rootDir>/shared/**/*.ts',
  ],
  reporters: [
    'default',
    [
      'jest-stare',
      {
        'resultDir': 'reports/jest-stare',
        'reportTitle': 'jest-stare!',
        'additionalResultsProcessors': [
          'jest-junit'
        ],
        'coverageLink': '../../coverage/lcov-report/index.html',
        'jestStareConfigJson': 'jest-stare.json'
      }
    ],
    ['jest-junit', {
      outputDirectory: './reports/jest/',
      outputName: 'junit.xml',
    }],
    ['./node_modules/jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: './reports/jest/test-report.html',
    }],
  ],
};
