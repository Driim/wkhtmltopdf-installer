var bin = require('./');
var logSymbols = require('log-symbols');
var path = require('path');
var fs = require('fs');
var which = require('which');

const binexePdf = process.platform === 'win32' ? 'wkhtmltopdf.exe' : 'wkhtmltopdf';
const binexeImage = process.platform === 'win32' ? 'wkhtmltoimage.exe' : 'wkhtmltoimage';

function download() {
  bin.download(function(err) {
    var locationPath;

    if (!err) {
      locationPath = path.join(__dirname, "location.js")
      const { pdf, image } = bin.localPath()
      // converting to relative format to keep working when files are moved to another base location
      // see https://github.com/pofider/node-wkhtmltopdf-installer/issues/6
      pdf = path.relative(locationPath, pdf);
      image = path.relative(locationPath, image);

      const locationFileData = `module.exports.pdf = '${pdf.replace(/\\/g, "\\\\")}'\n`
        + `module.exports.image = '${image.replace(/\\/g, "\\\\")}'\n`;
      fs.writeFileSync(locationPath, locationFileData);
    }
  });
}

// TODO: check wkhtmltoimage file too
which('wkhtmltopdf', function (er, resolvedPath) {
  if (er) {
    console.log(logSymbols.warning, "Global command wkhtmltopdf doesn't seem to work. Downloading wkhtmltopdf localy to /vendor ...");
    return download();
  }

  const locationFileData = `module.exports.pdf = '${binexePdf.replace(/\\/g, "\\\\")}'\n`
        + `module.exports.image = '${binexeImage.replace(/\\/g, "\\\\")}'\n`;
  fs.writeFileSync(path.join(__dirname, "location.js"), locationFileData);
  console.log(logSymbols.success, "Using global wkhtmltopdf and wkhtmltoimage");
});
