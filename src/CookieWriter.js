class CookieWriter {
  static write(name, value, exp_days = 7, path = '/', same_site = 'Strict') {
    let exp_date = new Date();
    exp_date.setTime(exp_date.getTime() + (exp_days * 24 * 60 * 60 * 1000));
    let cookie = `${name}=${value};expires=${exp_date.toUTCString()};path=${
        path};SameSite=${same_site}`;
    return cookie;
  }

  static append_value(
      name, curr, value, delim = ',', skip_if_duplicate = true) {
    if (value == undefined || value == '') {
      return;
    }
    let label = `${name}=`;
    let i = curr.indexOf(label);
    let curr_values_str = curr.substring(i + label.length);
    let end = curr_values_str.indexOf(';');
    if (end > 0) {
      curr_values_str = curr_values_str.substring(0, end);
    }
    let true_end = end + i + label.length;
    if (skip_if_duplicate) {
      let curr_values = curr_values_str.split(delim);
      for (let v of curr_values) {
        if (v == value) {
          return;
        }
      }
    }
    return curr.substring(0, i) + label + curr_values_str + delim + value +
        curr.substring(true_end);
  }

  static clear_cookies(cookie) {
    var cookies = cookie.split(';');
    var result = cookie;

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf('=');
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      result = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    return result;
  }
}
