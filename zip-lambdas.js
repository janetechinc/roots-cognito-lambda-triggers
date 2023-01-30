const AdmZip = require('adm-zip');

async function createZip () {
  try {
    const zip = new AdmZip();
    const outputFile = 'jane-cognito-trigger-lambdas.zip';
    zip.addLocalFolder('./dist', 'dist');
    zip.addLocalFolder('./node_modules', 'node_modules');
    zip.writeZip(outputFile);
  } catch (e) {
    console.error(e);
  }
}

createZip();
