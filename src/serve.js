const path = require('path');
var List = require('collections/list');
const {ArgumentParser} = require('argparse');
const querystring = require('querystring');
const sqlite3 = require('sqlite3');
const express = require('express');
const fs = require('fs');
const {exit} = require('process');

function get_default_port() {
  return 0;
}

function get_port(port_arg) {
  const default_port = 8080;
  if (port_arg == undefined) {
    return get_default_port();
  } else {
    var port = Number.parseInt(port_arg);
    if (Number.isNaN(port) || port < 0 || port >= 65536) {
      console.error(`Invalid port ${port}`);
      exit(1);
    }
    return port;
  }
}

function get_default_database() {
  var files = fs.readdirSync('/');
  for (f in files) {
    var parts = f.split('.');
    if (parts.length > 1) {
      return parts.pop();
    }
  }
  return undefined;
}

function get_database(database_arg) {
  return database_arg == undefined ? get_default_database() : database_arg;
}

function sql_header_row_to_html(column_names) {
  html = '<TR class=\"sql_header_row\">\n';
  for (cn in column_names) {
    html += `  <TD>${cn}</TD>\n`;
  }
  html += `</TD>\n`;
  return html;
}

function sql_row_to_html(row) {
  html = '<TR class=\"sql_row\">\n';
  for (p in row) {
    html += `  <TD class=\"sql_cell\">${row[p]}</TD>\n`;
  }
  html += '</TD>\n';
  return html;
}

function run_sql_query(query, req, res) {
  // state
  let row_count = 0;
  let column_names = new List();
  // handlers
  function on_row(err, row) {
    if (!err) {
      if (column_names.length == 0) {
        for (cn in Object.keys(row)) {
          column_names.push(cn);
        }
        res.write(sql_header_row_to_html(row));
      }
      res.write(sql_row_to_html(row));
      row_count += 1;
    }
  };

  function on_complete(err, count) {
    if (err) {
      console.error(err);
    }
    if (row_count != count) {
      console.error(`Discrepancy in row counts: ${row_count} were evaluated,
                but 'count' in the sqlite callback is ${count}`);
    }
    console.log(`Finished executing sql query (produced ${count} rows)`);
    res.end();
  };

  function write_rows() {
    db.each(query, on_row, on_complete);
  }

  function on_disconnect(err) {
    if (err) {
      console.error(err);
    } else {
      console.info('Connected to sqlite database');
    }
  }
  // execution
  let db = new sqlite3.Database(
      'engine.sqlite', sqlite3.OPEN_READONLY, on_disconnect);

  db.serialize(write_rows);
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.info('Disconnected from sqlite database');
  });
}

// Parse args (determine port and database file)
const parser =
    new ArgumentParser({description: 'Sqlite web server arg parser'});

parser.add_argument('-p', '--port', {help: 'The port on which to listen'});
parser.add_argument(
    '-d', '--database', {help: 'The database on which to execute queries'});
var args = parser.parse_args();

// port
const port = get_port(args['port']);
console.dir(args);
console.dir(`Port ${port}`);
// database file
const database = get_database(args['database']);

var dir = path.join(__dirname, '.');

var mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};

const app = express();

app.get(`/sql_query=*`, function(req, res) {
  console.info(`parsing ${req.url.substr(1)}`);
  let sql_query = querystring.parse(req.url.substr(1))['sql_query'];
  console.log(`Executing sql query: ${sql_query}`);
  res.writeHead(200, {'Content-type': 'text/html'});
  run_sql_query(sql_query, req, res);
});

app.get('/*', function(req, res) {
  console.info(`Received request url ${req.url}`);
  var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
  if (file.indexOf(dir + path.sep) !== 0) {
    return res.status(403).end('Forbidden');
  }
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);
  s.on('open', function() {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function() {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
});

var listener = app.listen(port, function() {
  console.info(`Hosting dir ${dir}`);
  console.log(`Listening on http://localhost:${listener.address().port}/`);
});
