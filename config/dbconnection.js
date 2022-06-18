var mysql = require('mysql');
const config = require('./config.json')

var pool = mysql.createPool(
    {   
        connectionLimit: 20,
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        port: config.database.db_port
    }
);

exports.executequery = function (query) {
    return new Promise((result, reject) => {
        // get the connection for connection pool
        pool.getConnection((error, connection) => {
            // if error during getting connection
            if (error) reject(error)
            
            connection.query(query, function (err, rows, fields) {
                //release Connection
                connection.release();
                if (err) result(err);
                
                result(rows);
            });
            
        });
    });
}

exports.executevaluesquery = function (query, values) {
    return new Promise((result, reject) => {
        // get the connection for connection pool
        pool.getConnection((error, connection) => {

            if (error) reject(error)

            connection.query(query, values, function (err, rows, fields) {
                //release Connection
                connection.release();
                if (err) reject(err);
                
                result(rows);
            });
        });
    });
}