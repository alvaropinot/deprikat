const esprima = require('esprima');
const walk = require('esprima-walk');
const fs = require('fs');

const TYPES = {
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  CALL_EXPRESSION: 'CallExpression'
};

// TODO remove this helper
function log(thing){
  console.log(JSON.stringify(thing, null, 2));
}

const _getFunctionDeclarations = collection =>
  collection.filter((element => element.type === TYPES.FUNCTION_DECLARATION));

const _getDepecratedComments = (comments, deprecatedTag) =>
  comments.filter(
    comment => comment.value.search(new RegExp(deprecatedTag)) !== -1
  );

// relation between functions and comments is:
// c.loc.end.line + 1 === f.loc.start.line
const _getRelatedComment = (functionDeclarationLine, deprecratedComments) =>
  deprecratedComments
    .filter(comment => comment.loc.end.line + 1 === functionDeclarationLine);

const _getDepecratedFunctions = (functionDeclarations, deprecratedComments) =>
  functionDeclarations.filter(declaration =>
    _getRelatedComment(declaration.loc.start.line, deprecratedComments).length === 1
  );

const _getFunctionCalls = (ast) => {
  const functionCalls = [];
  walk(ast, (node) =>
    node.type === TYPES.CALL_EXPRESSION && functionCalls.push(node)
  );
  return functionCalls;
}

const analyze = (file, opts = {}) => {
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
  // log(ast);
  const _functionDeclarations = _getFunctionDeclarations(ast.body);
  // log(_functionDeclarations)
  const _deprecratedComments = _getDepecratedComments(
    ast.comments, config.deprecatedTag
  );
  // log(ast.comments)
  // log(_deprecratedComments)
  const _depecratedFunctions = _getDepecratedFunctions(
    _functionDeclarations, _deprecratedComments
  );
  const deprecatedFunctionsNames = _depecratedFunctions.map((f) => f.id.name);
  // log(depecratedFunctions[0].id.name);
  // function filterCallExpressions(elements){
  //   return elements.filter(e => e.type === TYPES.CALL_EXPRESSION);
  // }
  log(deprecatedFunctionsNames)
  // log(ast.body.filter(e => e.body.body));
  const _functionCalls = _getFunctionCalls(ast);
  // log(_functionCalls);
  const warnings = _functionCalls
    .map((fn) => (
      {
        location: fn.loc.end,
        name: fn.callee.name
      })
    )
    .filter(fn => deprecatedFunctionsNames.includes(fn.name))
    // sort warnings by line position
    .sort((a, b) => a.location.line - b.location.line);

  log(warnings);

  return {
    deprecatedFunctionsNames,
    warnings,
    file
  };
}

module.exports = {
  analyze
};
