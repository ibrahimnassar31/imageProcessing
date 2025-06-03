export default {
    testEnvironment: 'node',
    transform: {
      '^.+\\.js$': 'babel-jest', // تحويل ملفات .js باستخدام babel-jest
    },
    setupFilesAfterEnv: ['./tests/setup.js'],
  };