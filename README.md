
# Node G-Drive Utils

    Utility functions for google drive.


## Installation Steps

    npm install --save <pkg-name>

## Methods

    listFiles(cb);
        get file list       
    createFile(options, cb);
        create a file on your drive
        params: options{ fileUrl, folderName } (or) filepath , cb
         If you want to create a file on you base path, you can give your file path directly. Otherwise you want to create a file in particular directory, give {fileUrl, folderName}. 
    <!-- getFiles(cb) -->

    deleteFiles(cb)
        This method is used to delete all files in your drive
    <!-- getFileByName(filename, cb) -->
    <!-- getFileById(fileid, cb) -->

    deleteFileByName(filename, cb)
        Delete your file name by file name
    deleteFileById(fileid, cb)
        Delete your file name by file id
    createFolder(foldername, cb)
       Create a folder