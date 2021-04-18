export { sql_header_row_to_html, sql_row_to_html };

function sql_header_row_to_html(column_names) {
  let html = '<tr class="sql-header-row">\n';
  for (let cn in column_names) {
    html += `  <td class="sql-header-cell">${cn}</td>\n`;
  }
  html += `</td>\n`;
  return html;
}

function sql_row_to_html(row) {
  let html = '<tr class="sql-row">\n';
  for (let p in row) {
    html += `  <td class=\"sql-cell\">${row[p]}</td>\n`;
  }
  html += '</td>\n';
  return html;
}
