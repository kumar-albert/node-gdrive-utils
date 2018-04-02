

# Node G-Drive Utils
> Utility functions(Upload/Download files,check the files available in the drive) for google drive api.


## Installation Steps

a. Use this [link](https://console.developers.google.com/start/api?id=drive) to create or select a project in the Google Developers Console and automatically turn on the API. Click **Continue**, then **Go to credentials**.

b. On the **Add credentials to your project** page, click the **Cancel** button.

c. At the top of the page, select the **OAuth consent screen** tab. Select an **Email address**, enter a **Product name** if not already set, and click the **Save** button.

d. Select the **Credentials** tab, click the **Create credentials** button and select **OAuth client ID**.

e. Select the application type **Other**, enter the name "Drive API Quickstart", and click the **Create** button.

f. Click **OK** to dismiss the resulting dialog.

g. Click the **Download icon** (Download JSON) button to the right of the client ID.

h. Move this file to your working directory and rename it `client_secret.json`.

i. Generate auth token by using this [script](https://github.com/kumar-ideas2it/node-gdrive-utils/blob/developement/lib/generateToken.js) and move `auth_token.json` file to your working directory


```shell
npm install --save gdrive-utils
```

## Create service
```js
var GDriveUtil = require("gdrive-utils");
var client_secret = require('./client_secret.json')
var auth_token = require('./auth_token.json')

var gdriveUtil = new GDriveUtil(client_secret, auth_token);
```
    

## Methods

- listFiles(cb)
get file list

```js
gdriveUtil.listFiles(function(err, files) {
        // write your code here
});
```

- createFile(options, cb)

create a file on your drive

```js
gdriveUtil.createFile('files/file.png' ,function(err, res) {
        // write your code here
});
```
(or)

```js
gdriveUtil.createFile({
    fileUrl: 'files/file.png',
    folderName: 'folderName'
} ,function(err, res) {
        // write your code here
});
```
params: options{ fileUrl, folderName } (or) filepath
If you want to create a file on you base path, you can give your file path directly. Otherwise you want to create a file in particular directory, give {fileUrl, folderName}.


- getFiles(cb)

This method is used to download all files from your drive

```js
gdriveUtil.getFiles(function(err, res) {
        // write your code here
});
```

- getFileByName(cb)

This method is used to download file by it's name from your drive

```js
gdriveUtil.getFileByName(filename, function(err, res) {
        // write your code here
});
```


- deleteAllFiles(cb)

This method is used to delete all files in your drive

```js
gdriveUtil.deleteAllFiles(name, function(err, res) {
        // write your code here
});
```

- deleteFileByName(filename, cb)

Delete your file name by file name

```js
gdriveUtil.deleteFileByName(name, function(err, res) {
        // write your code here
});
```

- deleteFileById(fileid, cb)

Delete your file name by file id

```js
gdriveUtil.deleteFileById(fileId, function(err, res) {
        // write your code here
});
```

- createFolder(foldername, cb)

Create a folder

```js
gdriveUtil.createFolder(folderName, function(err, res) {
        // write your code here
});
```

- isExist(filename, cb)

Check file present in your drive or not

```js
gdriveUtil.isExist(filename, function(status) {
        // write your code here
});
```

## Support
[<img src='https://www.ideas2it.com/images/tiny-home-images/logo.png' title='​Ideas2IT Technology Services Pvt.Ltd' height='36px'>](https://www.ideas2it.com)