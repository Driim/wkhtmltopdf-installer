var BinWrapper = require('bin-wrapper');
var path = require('path');
var logSymbols = require('log-symbols');

/**
 * Variables
 */

var BIN_VERSION = '0.12.3';
var BASE = process.env.WKHTMLTOPDF_CDNURL || 'https://github.com/Driim/wkhtmltopdf-installer/blob/master/downloads/';
var URL = BASE + BIN_VERSION + "/";
const wkhtmltopdfFile = process.platform === 'win32' ? 'wkhtmltopdf.exe' : 'wkhtmltopdf';
const wkhtmltoimageFile = process.platform === 'win32' ? 'wkhtmltoimage.exe' : 'wkhtmltoimage';

/**
 * Initialize a new BinWrapper
 */

var bin = (
  new BinWrapper({ strip: 0 })
  .src(URL + 'macosx.zip?raw=true', 'darwin')
  .src(URL + 'linux-x86_64.tar.gz?raw=true', 'linux', 'x64')
  .src(URL + 'windows.zip?raw=true', 'win32')
  .dest(path.join(__dirname, '../vendor'))
);

let locationPdf;
let locationImage;

/**
 * Module exports
 */

module.exports.v = BIN_VERSION;
module.exports.path = function() {
  var locationPath
  var binPaths

  if (locationPdf && locationImage) {
    binPaths = {
      pdf: locationPdf,
      image: locationImage
    }
  } else {
    locationPath = path.join(__dirname, "location.js")
    binPaths = require(locationPath)

    if (path.basename(binPaths.pdf) !== binPaths.pdf) {
      // if path in location.js is relative resolve to absolute
      binPaths.pdf = path.resolve(locationPath, binPaths.pdf)
      binPaths.image = path.resolve(locationPath, binPaths.image)
    }
  }

  return binPaths;
};

module.exports.localPath = function() {
  bin.use(wkhtmltopdfFile);
  const pdf = bin.path();

  bin.use(wkhtmltoimageFile);
  const image = bin.path();

  return { pdf, image };
};

module.exports.download = function(cb) {
  bin.run(['--version'], function (err) {
    if (err) {
      console.log(logSymbols.error, err);
      console.log("Try running vendor/wkhtmltopdf to get more detailed error output.");
      return cb(err);
    }

    bin.use(wkhtmltopdfFile);
    locationPdf = bin.path();

    bin.use(wkhtmltoimageFile)
    locationImage = bin.path();

    console.log(logSymbols.success, ' Done! wkhtmltopdf binary available at ' + path.relative(path.join(__dirname, '../'), locationPdf));
    console.log(logSymbols.success, ' Done! wkhtmltoimage binary available at ' + path.relative(path.join(__dirname, '../'), locationImage));
    cb();
  });
};
