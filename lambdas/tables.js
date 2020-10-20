const mysql = require('mysql');

var query = "use challengedb;  create table albums (	     title varchar(100) not null,     release_date date,     album_type varchar(20),     primary key (title) );  create table tracks (	     title varchar(100) not null,        duration int,     disc_number int,     track_number int,     primary key (title) );  create table artists (	     name varchar(100) not null,     primary key (name) );  create table albums_artists (	     album varchar(100),     artist varchar(100)        );  create table albums_tracks (	     album varchar(100),     track varchar(100)        );  create table tracks_artists (	     track varchar(100),     artist varchar(100)        );";

exports.handler = (event, context, callback) => {
    
    const con = mysql.createConnection({
        host: process.env.sqlHost,
        user: process.env.sqlUser,
        password: process.env.sqlPass,
        port: 3306,
        multipleStatements: true
    });

    con.query(query, function (err, result) {
        if (err) throw err;
        var response = {
            message: "Tables created successfully.",
            body: result
        };
        callback(null, response);
    });
    con.end();
};