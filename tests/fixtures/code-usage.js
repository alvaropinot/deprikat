ok();
getValue();

var something = getValue;

something();

function foo() {
  return getValue();
}
