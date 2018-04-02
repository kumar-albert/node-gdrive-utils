/**
 * Utility functions(Upload/Download files,check the files available in the drive)
 * for google drive api.
 *
 * @author Kumar Albert
 */

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
 * @constructor GDriveUtil
 * @param {Object} credentials 
 * @param {Object} auth_token 
 */
function GDriveUtil(credentials, auth_token) {
  if (credentials && auth_token) {
    this.clientSecret = credentials.installed.client_secret;
    this.clientId = credentials.installed.client_id;
    this.redirectUrl = credentials.installed.redirect_uris[0];
    this.auth = new googleAuth();
    this.oauth2Client = new this.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUrl);
    this.oauth2Client.credentials = auth_token;
    oauth2Client = this.oauth2Client;
  }
}


/**
 * Get service for drive access
 * @method getService
 * @param {Function} cb 
 */
function getService(cb) {
  if (oauth2Client) {
    return cb(google.drive({ version: 'v3', auth: oauth2Client }))
  }
}

/**
 * Create a file in your google drive
 * @method createFile
 * @memberOf GDriveUtil
 * @param {Object} options 
 * @param {Function} cb 
 */
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

/**
 * Get folder id
 * @method getFolderId
 * @param {Object} options 
 * @param {Function} folderCB 
 */
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

/**
 * Parsing options for upload process
 * @method parseOptions
 * @param {Object} options 
 * @param {Function} parseCB 
 */
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


/**
 * Getting all files from google drive
 * @memberOf GDriveUtil
 * @method getFiles
 */
function getFiles() {
  listFiles(function (err, files) {
    console.log(files);
    getService(function (service) {
      if (files && files.length) {
        files.forEach(function (file) {
          var filename = file.name;
          var dest = fs.createWriteStream(filename);
          var mimeType = mime.lookup(filename);
          if(mimeType) {
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
          } else {
            service.files.get({
              fileId: file.id,
              mimeType: 'application/*'
            })
              .on('end', function () {
                console.log('Done');
              })
              .on('error', function (err) {
                console.log('Error during download', err);
              })
              .pipe(dest);
          }
        });
      }
    });
  });
}


/**
 * Delete all files
 * @memberOf GDriveUtil
 * @method deleteAllFiles
 * @param {Function} cb 
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

/**
 * Get file by it's name from google drive
 * @memberOf GriveUtil
 * @method getFileByName
 * @param {String} name 
 */
function getFileByName(name) {
  listFiles(function (err, files) {
    getService(function (service) {
      files.forEach(function (file) {
        var filename = file.name;
        if (file.name.search(name) !== -1) {
          fs.exists(filename, function (isExist) {
            if (isExist) {
              filename = "copy_" + file.name;
            }
            var dest = fs.createWriteStream(filename);
            var mimeType = mime.lookup(filename);
            if(mimeType) {
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
            } else {
              service.files.get({
                fileId: file.id,
                mimeType: 'application/*'
              })
                .on('end', function () {
                  console.log('Done');
                })
                .on('error', function (err) {
                  console.log('Error during download', err);
                })
                .pipe(dest);
            }
          });
        }
      });
    });
  });
}

/**
 * Get file by it's from google drive
 * @method getFileById
 * @param {Number} id 
 */
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

/**
 * Delete file by it's name
 * @memberOf GDriveUtil
 * @method deleteFileByName
 * @param {String} name 
 * @param {Function} cb 
 */
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

/**
 * Delete file by it's id
 * @memberOf GDriveUtil
 * @method deleteFileById
 * @param {Number} id 
 * @param {Function} cb 
 */
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

/**
 * Create a folder in google drive
 * @memberOf GDriveUtil
 * @method createFolder
 * @param {String} name 
 * @param {Function} cb 
 */
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

/**
 * Check file exists or not in google drive
 * @memberOf GDriveUtil
 * @method isExist
 * @param {String} name 
 * @param {Function} cb 
 */
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
 * List all files from google drive
 * @memberOf GDriveUtil
 * @method listFiles
 * @param {Function} listCB 
 */
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

GDriveUtil.prototype.listFiles = listFiles;
GDriveUtil.prototype.isExist = isExist;
GDriveUtil.prototype.createFile = createFile;
GDriveUtil.prototype.createFolder = createFolder;
GDriveUtil.prototype.deleteFileById = deleteFileById;
GDriveUtil.prototype.deleteFileByName = deleteFileByName;
GDriveUtil.prototype.deleteAllFiles = deleteAllFiles;
GDriveUtil.prototype.getFiles = getFiles;
GDriveUtil.prototype.getFileByName = getFileByName;

module.exports = GDriveUtil;