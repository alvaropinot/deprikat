const esprima = require('esprima');
const walk = require('esprima-walk');
const fs = require('fs');

const TYPES = {
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  CALL_EXPRESSION: 'CallExpression'
};

const _getFunctionCalls = (ast) => {
  const functionCalls = [];
  walk(ast, (node) =>
    node.type === TYPES.CALL_EXPRESSION && functionCalls.push(node)
  );
  return functionCalls;
}

const reporter = (file, deprecatedFunctionsNames, opts = {}) => {
  const defaults = {
    encoding: 'utf-8',
    deprecatedTag: /@\bdeprecated\b/
  };

  const config = Object.assign(defaults, opts);

  const data = fs.readFileSync(file, config.encoding);

  const esprimaOpts = {
    tolerant: true,
    comment: true,
    // tokens: true,
    range: true,
    loc: true
  };

  const ast = esprima.parse(data, esprimaOpts);

  const _functionCalls = _getFunctionCalls(ast);

  const warnings = _functionCalls
    .map((fn) => (
      {
        location: fn.loc.start,
        name: fn.callee.name
      })
    )
    .filter(fn => deprecatedFunctionsNames.includes(fn.name))
    // sort warnings by line position
    .sort((a, b) => a.location.line - b.location.line);

  return {
    deprecatedFunctionsNames,
    warnings,
    file
  };
}

module.exports = reporter;
