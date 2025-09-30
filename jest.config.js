module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@store/(.*)$': '<rootDir>/store/$1',
    '^@types$': '<rootDir>/types',
    '^@app/(.*)$': '<rootDir>/app/$1'
  }
};
