const mysql = require('mysql');

// Queries
var addTrack = " insert into tracks (title, duration, disc_number, track_number) values ('<title>', <duration>, <disc_number>, <track_number>);";
var addTrackToAlbum = " insert into albums_tracks (album, track) values ('<album>', '<track>');";
var addArtistToTrack = " insert into tracks_artists (track, artist) values ('<track>', '<artist>');";
var getTrack = " select * from tracks where title = '<title>'; select artist from tracks_artists where track = '<title>'; select album from albums_tracks where track = '<title>';";
var deleteTrack = " delete from tracks where title = '<title>';";
var updateTrack = " update tracks set duration = <duration>, disc_number = <disc_number>, track_number = <track_number> where title = '<title>';";
var clearArtists = " delete from tracks_artists where track = '<title>';";
var clearTracks = " delete from albums_tracks where track = '<title>';";

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
    query += getTrack.replace(/<title>/g, event.data.title);
  }

  if (event.action == "delete") {
    query += clearArtists.replace("<title>", event.data.title);
    query += clearTracks.replace("<title>", event.data.title);
    query += deleteTrack.replace("<title>", event.data.title);
  }

  if (event.action == "add") {    
    query += addTrack
      .replace("<title>", event.data.title)      
      .replace("<duration>", event.data.duration)
      .replace("<disc_number>", event.data.disc_number)
      .replace("<track_number>", event.data.track_number);

    query += getArtistsInserts(event.data);
    query += addTrackToAlbum.replace("<track>", event.data.title).replace("<album>", event.data.album);
  }

  if (event.action == "update") {
    query += clearArtists.replace("<title>", event.data.title);
    query += clearTracks.replace("<title>", event.data.title);
    query += updateTrack
      .replace("<title>", event.data.title)      
      .replace("<duration>", event.data.duration)
      .replace("<disc_number>", event.data.disc_number)
      .replace("<track_number>", event.data.track_number);

    query += getArtistsInserts(event.data);
    query += addTrackToAlbum.replace("<track>", event.data.title).replace("<album>", event.data.album);
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
    query += addArtistToTrack
      .replace("<track>", data.title)
      .replace("<artist>", a);
  });

  return query;
}
