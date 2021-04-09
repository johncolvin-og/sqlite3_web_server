import { assert_type } from './assert.js';
export { get_file_ext, split_file_ext };

function split_file_ext(file_path) {
  assert_type(file_path, 'string', 'file_path');
  let i = file_path.lastIndexOf('.');
  if (i < 0 || i == file_path.length - 1) {
    return '';
  }
  return [file_path.substr(0, i), file_path.substr(i + 1)];
}

function get_file_ext(file_path) {
  assert_type(file_path, 'string', 'file_path');
  let parts = file_path.split('.');
  if (parts.length < 2) {
    return '';
  }
  return parts.pop();
}
