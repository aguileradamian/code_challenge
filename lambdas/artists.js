const mysql = require('mysql');

// Queries
var addArtist = " insert into artists (name) values ('<name>');";
var getArtist = " select * from artists where name = '<name>'; select album from albums_artists where artist = '<name>'; select track from tracks_artists where artist = '<name>';";
var deleteArtist = " delete from artists where name = '<name>';";
var updateArtist = " update artists set name = '<new_name>' where name = '<name>'; update albums_artists set artist = '<new_name>' where artist = '<name>'; update tracks_artists set artist = '<new_name>' where artist = '<name>';";
var clearArtists = " delete from albums_artists where artist = '<name>';";
var clearTracks = " delete from tracks_artists where artist = '<name>';";

exports.handler = (event, context, callback) => {

  const con = mysql.createConnection({
    host: process.env.sqlHost,
    user: process.env.sqlUser,
    password: process.env.sqlPass,
    port: 3306,
    multipleStatements: true
  });

  var query = "use challengedb; ";

  if (event.action == "get") {
    query += getArtist.replace(/<name>/g, event.data.name);
  }

  if (event.action == "delete") {
    query += clearArtists.replace("<name>", event.data.name);
    query += clearTracks.replace("<name>", event.data.name);
    query += deleteArtist.replace("<name>", event.data.name);
  }

  if (event.action == "add") {
    query += addArtist.replace("<name>", event.data.name);
  }

  if (event.action == "update") {    
    query += updateArtist.replace(/<name>/g, event.data.name).replace(/<new_name>/g, event.data.new_name);    
  }

  con.query(query, function(err, result) {
    if (err) throw err;
    var response = {
      message: "Operation Successful: " + event.action,
      body: result
    };
    callback(null, response);
  });

  con.end();
};