const test = require('tape');

const analyze = require('../lib/analyze');

const basicTest = (text, fileName, config) => {
  test(text, t => {
    const report = analyze(fileName, config);

    t.deepEqual(report.deprecatedFunctionsNames, ['getValue'],
      'getValue should be deprecated'
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

test('should detect no deprecated functions', t => {
  const fileName = './tests/fixtures/code-no-deprecations.js';
  const report = analyze(fileName);

  t.deepEqual(report.deprecatedFunctionsNames, [],
    'there should be no deprecated functions'
  );
  t.end();
});
