const mysql = require('mysql2/promise');
const _ = require('lodash');

const connect = function* () {
  return yield mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
  });
}

/**
 * Get table Object list.
 * @param {*str} database 
 */
const showTables = function* (database) {
  try {
    const connection = yield connect();

    const [rows, fields] = yield connection.query(`show table status from ${database}`);
    const tables = rows.map(row => ({
      name: row.Name,
      comment: row.Comment
    }))

    connection.end();
    return tables;
  } catch (err) {
    yield Promise.reject(err);
  }
}

/**
 * Get column Object list. 
 * @param {*str} database 
 * @param {*str} table 
 */
const showColumns = function* (database, table) {
  try {
    const connection = yield connect();

    const [rows, fields] = yield connection.query(`show full columns from ${database}.${table}`);
    const regMaxL = /\((\d+)\)$/
    const columns = rows.map(row => ({
      name: row.Field,
      propertyName: _.camelCase(row.Field),
      type: row.Type,
      maxlength: regMaxL.exec(row.Type) ? regMaxL.exec(row.Type)[1] : undefined,
      allowNull: /YES/i.test(row.Null),
      defaultTo: row.Default,
      comment: row.Comment
    }))
    connection.end();
    return columns;
  } catch (err) {
    yield Promise.reject(err);
  }
}

module.exports = {
  connect,
  showTables,
  showColumns
}
