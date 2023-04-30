(function () {
  "use strict";

  var root = window; // TODO: きちんと取る
  var URL = (root.URL || root.webkitURL);


  function deploy () {
    // TODO: filelistの外部化
    var filelist = [
      "index.html",
      "jszip.min.js",
      "quine-js-zip.js"
    ];

    var zip = new JSZip();
    var zipFolder = zip.folder("html");

    var emitGenerate = function () {
      zip.generateAsync({type:"blob", compression: "DEFLATE"}).then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "quine-js-zip.zip";
        a.click();
        URL.revokeObjectURL(url);
        // TODO: 必要な後処理を行う(無効化していたボタンを戻す等)
      });
    };

    var continuation;
    continuation = function (idx) {
      if (filelist.length <= idx) {
        emitGenerate();
        return;
      }
      var path = filelist[idx];
      fetch(path).then(function (res) {
        if (!res.ok) { throw new Error(res.statusText); }
        return res.blob();
      }).then(function (blob) {
        zipFolder.file(path, blob, {binary: true});
        setTimeout(continuation, 1, idx+1);
      }).catch(function (err) {
        // ネットワークエラー等で失敗する可能性がある
        // TODO: 本実装時にちゃんとした対応を考える…
        console.log("error", err);
      });
    };

    continuation(0);
  }

  root.quineJsZip = {deploy: deploy};
})()
