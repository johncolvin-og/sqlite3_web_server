// const path = require('path');
// Sqlite3Client = require('./Sqlite3Client').Sqlite3Client;
// import Sqlite3Client from './Sqlite3Client';
// const Sqlite3Client = require('./Sqlite3Client.js').Sqlite3Client;
// import {join } from 'path';
// import path_pkg from 'path';
// const {path } = path_pkg;
import * as path from 'path';
import { Sqlite3Client } from './Sqlite3Client.js';
import collection_pkg from 'collections';
const { List } = collection_pkg;
// import { List } from 'collections';
// import { ArgumentParser } from 'argparse/argparse.js';
// import 'argparse';
import pkg from 'argparse';
const { ArgumentParser } = pkg;
import querystring from 'querystring';
import 'sqlite3';
import express from 'express';
import { readdirSync, createReadStream } from 'fs';
import 'process';
// import { ArgumentParser } from 'argparse';
// var List = require('collections/list');
// const { ArgumentParser } = require('argparse');
// const querystring = require('querystring');
// const sqlite3 = require('sqlite3');
// const express = require('express');
// const fs = require('fs');
// const { exit } = require('process');

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
  // let files = readdirSync('/');
  // for (f in files) {
  //   let parts = f.split('.');
  //   if (parts.length > 1) {
  //     console.info(`Default database is: ${parts[parts.length - 1]}`);
  //     return parts.pop();
  //   }
  // }
  // return undefined;
  return './engine.sqlite';
}

function get_database(database_arg) {
  return database_arg == undefined ? get_default_database() : database_arg;
}

function sql_header_row_to_html(column_names) {
  let html = '<TR class="sql_header_row">\n';
  for (let cn in column_names) {
    html += `  <TD>${cn}</TD>\n`;
  }
  html += `</TD>\n`;
  return html;
}

function sql_row_to_html(row) {
  let html = '<TR class="sql_row">\n';
  for (let p in row) {
    html += `  <TD class=\"sql_cell\">${row[p]}</TD>\n`;
  }
  html += '</TD>\n';
  return html;
}

function run_sql_query(query, req, res) {
  console.info('Sqlite3Client type is ' + typeof Sqlite3Client);
  console.info('Keys are: ' + Object.keys(Sqlite3Client).join(', '));
  new Sqlite3Client('./engine.sqlite').run_query(
    query,
    (col_headers) => res.write(sql_header_row_to_html(col_headers)),
    (row) => res.write(sql_row_to_html(row)),
    () => { res.end(); }
  );
}

// Parse args (determine port and database file)
const parser = new ArgumentParser({
  description: 'Sqlite web server arg parser',
});

parser.add_argument('-p', '--port', { help: 'The port on which to listen' });
parser.add_argument('-d', '--database', {
  help: 'The database on which to execute queries',
});
var args = parser.parse_args();

// port
const port = get_port(args['port']);
console.dir(args);
console.dir(`Port ${port}`);
// database file
const database = get_database(args['database']);

// var dir = join(__dirname, '.');
// var dir = '/home/john/Documents/repos/private/sqlite3_web_server/src/.';
var dir = '.';

var mime = {
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

app.get(`/sql_query=*`, function (req, res) {
  console.info(`parsing ${req.url.substr(1)}`);
  let sql_query = querystring.parse(req.url.substr(1))['sql_query'];
  console.log(`Executing sql query: ${sql_query}`);
  res.writeHead(200, { 'Content-type': 'text/html' });
  run_sql_query(sql_query, req, res);
});

app.get('/*', function (req, res) {
  console.info(`Received request url ${req.url}`);
  var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
  console.info("url translates to file " + file);
  // if (file == 'index.html') {
  file = './' + file;
  console.info("url adapted to file " + file);
  // }
  if (file.indexOf(dir + path.sep) !== 0) {
    return res.status(403).end('Forbidden');
  }
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = createReadStream(file);
  s.on('open', function () {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function () {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
});

var listener = app.listen(port, function () {
  console.info(`Hosting dir ${dir}`);
  console.log(`Listening on http://localhost:${listener.address().port}/`);
});
