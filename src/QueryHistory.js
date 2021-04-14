const default_query_history_key = 'query_history';
const default_delimiter = ';';

class QueryHistory {
  constructor(
      store, query_history_key = default_query_history_key,
      delimiter = default_delimiter, auto_write_to_store = true) {
    this.store = store;
    this.query_history_key = query_history_key;
    this.delimiter = delimiter;
    this.auto_write_to_store = auto_write_to_store;
    this.entries = [];
    this.read_from_store();
  }

  read_from_store() {
    this.entries = [];
    let history_str = this.store.getItem(this.query_history_key);
    if (history_str) {
      for (let query of history_str.split(';')) {
        if (query && query != 'null' && !(this.entries.includes(query))) {
          console.info('adding query to history: ' + query);
          this.entries.push(query);
        }
      }
    }
    return this.entries;
  }

  add(query) {
    if (query && !this.entries.includes(query)) {
      this.entries.push(query);
      if (this.auto_write_to_store) {
        this.write_to_store();
      }
      return true;
    }
    return false;
  }

  remove(query) {
    let orig_len = this.entries.length;
    this.entries.remove(query);
    let was_removed = this.entries.length != orig_len;
    if (was_removed && this.auto_write_to_store) {
      this.write_to_store();
    }
    return was_removed;
  }

  write_to_store() {
    this.store.setItem(
        this.query_history_key, this.entries.join(this.delimiter));
  }

  match_entries(pattern = undefined) {
    if (!pattern) {
      return this.entries;
    }
    return this.entries;
  }
}
