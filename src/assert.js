export { assert_type };

function assert_type(obj, type, name) {
  if (typeof obj != type) {
    throw `${name} must be of type string (actually ${typeof obj})`;
  }
}
