/**
 * @isDeprecated
 */
function getValue() {
  // this is a comment
  return 'foo';
}

/**
 * @return {String} foo
 */
function ok() {
  // this is a comment
  getValue();
  return 'foo';
}

ok();
getValue();

// var something = getValue;
