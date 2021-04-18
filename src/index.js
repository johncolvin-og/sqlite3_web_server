import pkg from 'argparse';
import * as path from 'path';
import { Sqlite3Client } from './sqlite3_client.js';
const { ArgumentParser } = pkg;
import querystring from 'querystring';
import 'sqlite3';
import {
  sql_header_row_to_html,
  sql_row_to_html,
} from './sqlite3_view_factory.js';
import express from 'express';
import { readdirSync, createReadStream } from 'fs';
import { get_file_ext } from './file_utils.js';
import 'process';
import { query_input_parser } from './services/services.js'

function get_default_port() {
  return 0;
}

function get_port(port_arg) {
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
  return (
    readdirSync(process.cwd()).filter((f) => get_file_ext(f) == 'sqlite')[0] ||
    undefined
  );
}

function get_database(database_arg) {
  return database_arg == undefined ? get_default_database() : database_arg;
}

function run_sql_query(query, res) {
  new Sqlite3Client(database).run_query(
    query,
    (col_headers) => res.write(sql_header_row_to_html(col_headers)),
    (row) => res.write(sql_row_to_html(row)),
    () => res.end()
  );
}

// Parse args (init port and database file)
const parser = new ArgumentParser({
  description: 'Sqlite web server arg parser',
});
parser.add_argument('-p', '--port', { help: 'The port on which to listen' });
parser.add_argument('-d', '--database', {
  help: 'The database on which to execute queries',
});
var args = parser.parse_args();
const port = get_port(args['port']);
const database = get_database(args['database']);
console.info(`Starting server for database '${database}'`);

const mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript',
};

const app = express();

function run_query(query, res) {
  console.info(`Executing query ${query}`);
  res.writeHead(200, { 'Content-type': 'text/html' });
  run_sql_query(query, res);
}

app.get(`/sql_query=*`, (req, res) => {
  console.info(`Received request for ${req.url}`);
  let query_in = querystring.parse(req.url.substr(1))['sql_query'];
  let query = query_input_parser.parse(query_in);
  run_query(query, res);
});

app.get('/*', function (req, res) {
  console.info(`Received request for ${req.url}`);
  let cwd = path.join(process.cwd(), '.');
  let file = path.join(cwd, req.path.replace(/\/$/, '/index.html'));
  if (file.indexOf(cwd + path.sep) !== 0) {
    return res.status(403).end('Forbidden');
  }
  let type = mime[path.extname(file).slice(1)] || 'text/plain';
  let rstream = createReadStream(file);
  rstream.on('open', function () {
    res.set('Content-Type', type);
    rstream.pipe(res);
  });
  rstream.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
});

var listener = app.listen(port, function () {
  console.log(`Listening on http://localhost:${listener.address().port}/`);
});
