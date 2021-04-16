import sqlite3 from 'sqlite3';
import { assert_type } from './assert.js';
export { Sqlite3Client };

class Sqlite3Client {
  constructor(database_path) {
    assert_type(database_path, 'string', database_path);
    this.database_path = database_path;
  }

  run_query = (query, on_column_headers, on_row, on_complete) => {
    // state
    let row_count = 0;
    // handlers
    function _on_row(err, row) {
      if (err) {
        console.error(err);
        return;
      }
      if (row_count == 0) {
        on_column_headers(row);
      }
      on_row(row);
      row_count += 1;
    }

    function _on_complete(err, count) {
      if (err) {
        console.error(err);
      }
      if (row_count != count) {
        console.error(
          `Discrepancy in row counts: ${row_count} were evaluated, but 'count'
          in the sqlite callback is ${count}`
        );
      }
      console.log(`Finished executing sql query (produced ${count} rows)`);
      on_complete();
    }

    function on_error(err) {
      if (err) {
        console.error(err);
      }
    }

    var db = new sqlite3.Database(
      this.database_path,
      sqlite3.OPEN_READONLY,
      on_error
    );

    console.info('Connecting to sqlite database...');
    db.serialize(() => {
      console.info('Connected to sqlite database');
      db.each(query, _on_row, _on_complete);
    });
    db.close((err) => {
      on_error(err);
      console.info('Disconnected from sqlite database');
    });
  };
}
