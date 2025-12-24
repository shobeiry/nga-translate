// Karma configuration file, see link for more information
// https://karma-runner.github.io/latest/config/configuration-file.html

process.on('uncaughtException', err => {
  if (err && err.code === 'ERR_SERVER_NOT_RUNNING') {
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {
        random: false,
      },
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../coverage/nga-translate'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    autoWatch: false,
    singleRun: true,
    restartOnFileChange: false,
  });
};
