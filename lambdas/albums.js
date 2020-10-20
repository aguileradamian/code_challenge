const mysql = require('mysql');

// Queries
var addAlbum = " insert into albums (title, release_date, album_type) values ('<title>', '<release_date>', '<album_type>');";
var addTrackToAlbum = " insert into albums_tracks (album, track) values ('<album>', '<track>');";
var addArtistToAlbum = " insert into albums_artists (album, artist) values ('<album>', '<artist>');";
var getAlbum = " select * from albums where title = '<title>'; select artist from albums_artists where album = '<title>'; select track from albums_tracks where album = '<title>';";
var deleteAlbum = " delete from albums where title = '<title>';";
var updateAlbum = " update albums set release_date = '<release_date>', album_type = '<album_type>' where title = '<title>';";
var clearArtists = " delete from albums_artists where album = '<title>';";
var clearTracks = " delete from albums_tracks where album = '<title>';";

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
    query += getAlbum.replace(/<title>/g, event.data.title);
  }

  if (event.action == "delete") {
    query += clearArtists.replace("<title>", event.data.title);
    query += clearTracks.replace("<title>", event.data.title);
    query += deleteAlbum.replace("<title>", event.data.title);
  }

  if (event.action == "add") {
    if (event.data.album_type != "album" &&
      event.data.album_type != "single" &&
      event.data.album_type != "compilation") {
      throw "Invalid Album Type";
    }

    query += addAlbum
      .replace("<title>", event.data.title)
      .replace("<release_date>", event.data.release_date)
      .replace("<album_type>", event.data.album_type);

    query += getArtistsInserts(event.data);
    query += getTracksInserts(event.data);
  }

  if (event.action == "update") {
    if (event.data.album_type != "album" &&
      event.data.album_type != "single" &&
      event.data.album_type != "compilation") {
      throw "Invalid Album Type";
    }

    query += clearArtists.replace("<title>", event.data.title);
    query += clearTracks.replace("<title>", event.data.title);
    query += updateAlbum
      .replace("<title>", event.data.title)
      .replace("<release_date>", event.data.release_date)
      .replace("<album_type>", event.data.album_type);

    query += getArtistsInserts(event.data);
    query += getTracksInserts(event.data);
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

function getArtistsInserts(data) {
  var query = "";
  data.artists.forEach(a => {
    query += addArtistToAlbum
      .replace("<album>", data.title)
      .replace("<artist>", a);
  });

  return query;
}

function getTracksInserts(data) {
  var query = "";
  data.tracks.forEach(t => {
    query += addTrackToAlbum
      .replace("<album>", data.title)
      .replace("<track>", t);
  });

  return query;
}
