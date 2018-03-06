  

# Node G-Drive Utils
Utility functions for google drive.


## Installation Steps

a. Use this [link](https://console.developers.google.com/start/api?id=drive) to create or select a project in the Google Developers Console and automatically turn on the API. Click **Continue**, then **Go to credentials**.

b. On the **Add credentials to your project** page, click the **Cancel** button.

c. At the top of the page, select the **OAuth consent screen** tab. Select an **Email address**, enter a **Product name** if not already set, and click the **Save** button.

d. Select the **Credentials** tab, click the **Create credentials** button and select **OAuth client ID**.

e. Select the application type **Other**, enter the name "Drive API Quickstart", and click the **Create** button.

f. Click **OK** to dismiss the resulting dialog.

g. Click the **Download icon** (Download JSON) button to the right of the client ID.

h. Move this file to your working directory and rename it `client_secret.json`.

i. Generate auth token by using this [script](https://github.com/kumar-ideas2it/node-gdrive-utils/blob/developement/lib/generateToken.js) and move auth_token file to your working directory


    ```npm install --save **pkg-name** ```

## Create service

    ```
    var GDriveUtil = require("gdrive-utils");
    var client_secret = require('./client_secret.json')
    var auth_token = require('./auth_token.json')

    var gdriveUtil = new GDriveUtil(client_secret, auth_token)
    
    ```

## Methods

 - listFiles(cb)

	get file list

    ```
    gdriveUtil.listFiles(function(err, files) {
         // write your code here
    });
    ```

 - createFile(options, cb)

    create a file on your drive

    ```
    gdriveUtil.createFile('files/file.png' ,function(err, res) {
         // write your code here
    });
    ```
    (or)

    ```
    gdriveUtil.createFile({
        fileUrl: 'files/file.png',
        folderName: 'folderName'
    } ,function(err, res) {
         // write your code here
    });
    ```
    params: options{ fileUrl, folderName } (or) filepath
    If you want to create a file on you base path, you can give your file path directly. Otherwise you want to create a file in particular directory, give {fileUrl, folderName}.

 - deleteAllFiles(cb)

    This method is used to delete all files in your drive

    ```
    gdriveUtil.deleteAllFiles(name, function(err, files) {
         // write your code here
    });
    ```

 - deleteFileByName(filename, cb)

    Delete your file name by file name

    ```
    gdriveUtil.deleteFileByName(name, function(err, files) {
         // write your code here
    });
    ```

 - deleteFileById(fileid, cb)

    Delete your file name by file id
    
    ```
    gdriveUtil.deleteFileById(fileId, function(err, files) {
         // write your code here
    });
    ```

 - createFolder(foldername, cb)

    Create a folder

    ```
    gdriveUtil.createFolder(folderName, function(err, files) {
         // write your code here
    });
    ```

 - isExist(filename, cb)

    Check file present in your drive or not

    ```
    gdriveUtil.isExist(filename, function(status) {
         // write your code here
    });
    ```