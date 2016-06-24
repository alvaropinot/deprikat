const test = require('tape');

const deprikat = require('../');

const basicTest = (text, fileName, config) => {
  test(text, function (t) {
    const report = deprikat.analyze(fileName, config);

    t.deepEqual(report.deprecatedFunctionsNames, ['getValue'],
      'getValue should be deprecated'
    );
    t.equal(report.warnings.length, 2, 'there should be two warnings');
    t.equal(report.warnings[0].name, 'getValue',
      'errors must have a function name'
    );
    t.deepEqual(
      report.warnings[0].location,
      {
        line: 14,
        column: 12
      },
      'the error should be at a location with line and column'
    );
    t.ok(report.warnings[0].location.line <= report.warnings[1].location.line,
      'the errors must be in line order'
    );
    t.equal(report.file, fileName,
      'errors must be reported within a file'
    );
    t.end();
  });
}

basicTest(
  'should return depecrated function names and have a default config',
  './tests/fixtures/code-a.js',
  {}
);

basicTest(
  'should allow custom regex for tags',
  './tests/fixtures/code-custom-tag.js',
  {
    deprecatedTag: '@\\bisDeprecated\\b'
  }
);

test('should detect no deprecated functions', function (t) {
  const fileName = './tests/fixtures/code-no-deprecations.js';
  const report = deprikat.analyze(fileName);

  t.deepEqual(report.deprecatedFunctionsNames, [],
    'there should be no deprecated functions'
  );
  t.equal(report.warnings.length, 0, 'there should be no warnings');
  t.end();
});
