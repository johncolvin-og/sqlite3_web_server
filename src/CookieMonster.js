class CookieMonster {
  constructor(init_str = undefined) {
    this.entries = {};
    if (init_str != undefined) {
      let entry_strs = init_str.split(';');
      for (entry_str of entry_strs) {
        let kvp = entry_str.split('=');
        if (kvp.length > 1) {
          this.entries[kvp[0]] = kvp[1];
        } else if (kvp.length == 1) {
          this.entries[kvp[0]] = '';
        }
      }
    }
  }
}
