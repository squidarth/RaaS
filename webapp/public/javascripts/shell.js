window.Shell = (function() {
  "use strict";

  function Shell() {
    if (!(this instanceof Shell)) return new Shell();
  }


  Shell.fromTextArea = function(textarea, options) {
    if (options.shellChar == null) options.shellChar = ">";
    var outputLineList = options.outputLineList || {};

    options.lineNumbers = true;
    options.lineNumberFormatter = function(line) {
      if (outputLineList[line] != null) {
        return "";
      } else {
        return options.shellChar;
      }
    };

    var cm = CodeMirror.fromTextArea(textarea, options);

    var shell = Shell();
    cm.outputLineList = outputLineList;

    shell.cm = cm;
    return shell;
  };

  Shell.prototype.getCm = function() {
    return this.cm;
  };

  Shell.prototype.getDoc = function() {
    return this.cm.getDoc();
  };

  Shell.prototype.addOutput = function(content) {
    var doc = this.cm.getDoc();
    var lastLine = doc.lastLine();

    doc.setValue(doc.getValue() + "\n" + content + "\n");
    this.removeCarrot(lastLine + 2);
    doc.setCursor(lastLine + 3, 0);
  };

  Shell.prototype.removeCarrot = function(line) {
    this.cm.outputLineList[line.toString()] = 1;
    this.cm.refresh();
  };
  
  return Shell;
})();
