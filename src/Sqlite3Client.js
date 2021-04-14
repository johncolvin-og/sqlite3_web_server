import sqlite3 from 'sqlite3';
export { Sqlite3Client };

class Sqlite3Client {
  constructor(database_path) {
    if (typeof (database_path) != 'string') {
      throw `Database must be a file path (actually ${typeof database_path})`;
    }
    this.database_path = database_path;
  }

  run_query = (query, on_column_headers, on_row, on_complete) => {
    // state
    let row_count = 0;
    let column_names = [];
    // handlers
    function _on_row(err, row) {
      if (err) {
        console.error(err);
        return;
      }
      if (row_count == 0) {
        for (let cn in Object.keys(row)) {
          console.info("column names are " + column_names);
          column_names.push(cn);
        }
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
        console.error(`Discrepancy in row counts: ${row_count} were evaluated,
                but 'count' in the sqlite callback is ${count}`);
      }
      console.log(`Finished executing sql query (produced ${count} rows)`);
      on_complete();
    }

    function write_rows() {
      console.info("write rows: " + query);
      db.each(query, _on_row, _on_complete);
    }

    function on_disconnect(err) {
      if (err) {
        console.error(err);
      } else {
        console.info('Connected to sqlite database');
      }
    }

    var db = new sqlite3.Database(
      this.database_path,
      sqlite3.OPEN_READONLY,
      on_disconnect
    );

    console.info("execution time");
    db.serialize(write_rows);
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.info('Disconnected from sqlite database');
    });
  };
}
