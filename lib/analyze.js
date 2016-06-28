const esprima = require('esprima');
const walk = require('esprima-walk');
const fs = require('fs');

const TYPES = {
  FUNCTION_DECLARATION: 'FunctionDeclaration',
  CALL_EXPRESSION: 'CallExpression'
};

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

  const _functionDeclarations = _getFunctionDeclarations(ast.body);

  const _deprecratedComments = _getDepecratedComments(
    ast.comments, config.deprecatedTag
  );

  const _depecratedFunctions = _getDepecratedFunctions(
    _functionDeclarations, _deprecratedComments
  );
  const deprecatedFunctionsNames = _depecratedFunctions.map((f) => f.id.name);

  return {
    deprecatedFunctionsNames,
    file
  };
}

module.exports = {
  analyze
};
