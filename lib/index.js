

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var mime = require('mime-types')
var SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];

var service = null;
var TOKEN_PATH = 'gdrive.json';
var oauth2Client = null;


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {

      oauth2Client.credentials = JSON.parse(token);
      console.log(JSON.parse(token));
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  // try {
  //   fs.mkdirSync("./");
  // } catch (err) {
  //   if (err.code != 'EEXIST') {
  //     throw err;
  //   }
  // }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}




function createFile(options, cb) {
  getService(function (service) {
    parseOptions(options, function (err, data) {
      getFolderId(options, function (err, id) {
        if (data) {
          data.meta.parents = id;
          service.files.create({
            resource: data.meta,
            media: data.media,
            fields: 'id'
          }, function (err, file) {
            if (err) {
              return cb ? cb(err) : err;
            }
            return cb ? cb(null, file.id) : file.id;
          });
        }
      });
    });
  });
}

function getFolderId(options, folderCB) {
  if (options.folderId) {
    return folderCB(null, [folderId]);
  } else if (options.folderName) {
    listFiles(function (err, files) {
      files.forEach(function (file) {
        if (file.name.search(options.folderName) !== -1) {
          return folderCB(null, [file.id]);
        }
      });
    });
  } else {
    return folderCB(null, []);
  }
}


function parseOptions(options, parseCB) {
  var fileMetadata = {};
  var media = {};
  if (typeof options === "string") {
    var arr = options.split("/");
    var file = arr[arr.length - 1];
    fs.exists(options, function (isExist) {
      if (isExist) {
        media.body = fs.createReadStream(options);
        media.mimeType = mime.lookup(file);
        fileMetadata.name = file;
      } else {
        return parseCB("File not found!");
      }
      return parseCB(null, { meta: fileMetadata, media: media });
    });
  } else if (typeof options === "object") {
    fileMetadata.name = options.name;
    fs.exists(options.fileUrl, function (isExist) {
      var arr = options.fileUrl.split("/");
      var file = arr[arr.length - 1];
      if (isExist) {
        media.body = fs.createReadStream(options.fileUrl);
        media.mimeType = mime.lookup(options.fileUrl);
        fileMetadata.name = file;
      } else {
        return parseCB("File not found!");
      }
      return parseCB(null, { meta: fileMetadata, media: media });
    });
  } else {
    return parseCB("Options not a valid!");
  }
}


/** */
function getFiles() {
  listFiles(function (err, files) {
    console.log(files);
    getService(function (service) {
      files.forEach(function (file) {
        var filename = file.name;
        var dest = fs.createWriteStream(filename);
        service.files.get({
          fileId: file.id,
          alt: 'media'
        })
          .on('end', function () {
            console.log('Done');
          })
          .on('error', function (err) {
            console.log('Error during download', err);
          })
          .pipe(dest);
      });
    });
  });
}


/**
 * 
 * @param {*} cb 
 */
function deleteAllFiles(cb) {
  listFiles(function (err, files) {
    console.log(files);
    getService(function (service) {
      if (files && files.length) {
        files.forEach(function (file) {
          service.files.delete({
            fileId: file.id,
          }, function (err) {
            if (err) {
              return cb ? cb(err) : err;
            } else {
              return cb ? cb(null, "Deleted Successfully!") : "Deleted Successfully!";
            }
          });
        });
      }
    });
  });
}


function getFileByName(name) {
  listFiles(function (err, files) {
    console.log(files);
    getService(function (service) {
      files.forEach(function (file) {
        var filename = file.name;
        if (file.name.search(name) !== -1) {
          fs.exists(filename, function (isExist) {
            if (isExist) {
              filename = "copy_" + file.name;
            }
            var dest = fs.createWriteStream(filename);
            service.files.get({
              fileId: file.id,
              alt: 'media'
            })
              .on('end', function () {
                console.log('Done');
              })
              .on('error', function (err) {
                console.log('Error during download', err);
              })
              .pipe(dest);
          });
        }
      });
    });
  });
}


function getFileById(id) {
  getService(function (service) {
    var dest = fs.createWriteStream(id);
    service.files.get({
      fileId: id,
      alt: 'media'
    })
      .on('end', function () {
        console.log('Done');
      })
      .on('error', function (err) {
        console.log('Error during download', err);
      })
      .pipe(dest);
  });
}

function deleteFileByName(name, cb) {
  listFiles(function (err, files) {
    getService(function (service) {
      if (files && files.length) {
        files.forEach(function (file) {
          if (file.name.search(name) !== -1) {
            service.files.delete({
              fileId: file.id,
            }, function (err) {
              if (err) {
                return cb ? cb(err) : err;
              } else {
                return cb ? cb(null, "Deleted Successfully!") : "Deleted Successfully!";
              }
            });
          }
        });
      }
    });
  });
}

function deleteFileById(id, cb) {
  getService(function (service) {
    service.files.delete({
      fileId: id,
    }, function (err) {
      if (err) {
        return cb ? cb(err) : err;
      } else {
        return cb ? cb(null, "Deleted Successfully!") : "Deleted Successfully!";
      }
    });
  });
}


function createFolder(name, cb) {
  getService(function (service) {
    var fileMetadata = {
      'name': name,
      'mimeType': 'application/vnd.google-apps.folder'
    };
    service.files.create({
      resource: fileMetadata,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        return cb ? cb(err) : err;
      } else {
        return cb ? cb(file) : file;
      }
    });
  });
}

function isExist(name, cb) {
  listFiles(function (err, files) {
    getService(function (service) {
      for(var i = 0; i < files.length; i++) {
        if (files[i].name.search(name) === 0) {
          return cb ? cb(true) : true;
        }
      }
      return cb ? cb(false) : false;
    });
  });
}


  /**
 * 
 * @param {*} cb 
 */
function getService(cb) {
  if (oauth2Client) {
    return cb(google.drive({ version: 'v3', auth: oauth2Client }))
  }
}

function listFiles(listCB) {
  getService(function (service) {
    service.files.list({
      fields: "nextPageToken, files(id, name)"
    }, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return listCB ? listCB(err) : err;
      }
      var files = response.files;
      return listCB ? listCB(null, files) : files;
    });
  });
}


function GDriveUtil(credentials, auth_token) {
  if (credentials && auth_token) {
    this.clientSecret = credentials.installed.client_secret;
    this.clientId = credentials.installed.client_id;
    this.redirectUrl = credentials.installed.redirect_uris[0];
    this.auth = new googleAuth();
    this.oauth2Client = new this.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUrl);
    this.oauth2Client.credentials = auth_token;
    oauth2Client = this.oauth2Client
  }
} 


GDriveUtil.prototype.listFiles = listFiles;
GDriveUtil.prototype.isExist = isExist;
GDriveUtil.prototype.createFile = createFile;
GDriveUtil.prototype.createFolder = createFolder;
GDriveUtil.prototype.deleteFileById = deleteFileById;
GDriveUtil.prototype.deleteFileByName = deleteFileByName;
GDriveUtil.prototype.deleteAllFiles = deleteAllFiles;



module.exports = GDriveUtil;