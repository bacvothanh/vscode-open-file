const vscode = require('vscode');

const preferences = vscode.workspace.getConfiguration('open-local-file-from-path');
const custRegExp = new RegExp(preferences.get('regExp'));


const showError = message => vscode.window.showErrorMessage(`Open local file From Path: ${message}`);
const parseUri = function (path) {
  path = path.replaceAll('\\', '/');
  let prefix = 'file:///';
  let domain = path.split('/')[0];

  if (domain.indexOf('.') > -1) {
    prefix = 'file://';
  }

  return vscode.Uri.parse(prefix + path);
}

exports.activate = context => {
  //Register command
  const openFileFromPath = vscode.commands.registerCommand('extension.openLocalFileFromPath', () => {

    let editor = vscode.window.activeTextEditor;
    let range = editor.document.getWordRangeAtPosition(editor.selection.active, custRegExp);

    if (typeof range === 'undefined') {
      showError("Current cursor position is not valid, check the 'open-local-file-from-path.regExp' option to configure your RegExp match");
      return false;
    }

    let matchArray = editor.document.getText(range).match(custRegExp);

    let found = false;
    for (var i = 1; i < matchArray.length; i++) {
      if (typeof matchArray[i] !== 'undefined') {
        found = i;
        break;
      }
    }

    if (found == false) {
      showError("No match found");
      return false;
    }

    let lastMatch = matchArray[found].trim().replaceAll('\\', '/');
    let prefix = 'file:///';
    let domain = lastMatch.split('/')[0];
    if (domain.indexOf('.') > -1) {
      prefix = 'file://';
    }
    let url = vscode.Uri.parse(prefix + lastMatch);
    vscode.commands.executeCommand('vscode.open', url);
  });

  context.subscriptions.push(openFileFromPath);
};

exports.deactivate = () => { };