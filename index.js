let express = require("express");
let bodyParser = require('body-parser');
let uuidv4 = require("uuid/v4");
let fs = require("fs");
let { spawn } = require("child_process");
let apikeyhelper = require('./apikeyhelper');

var app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
  "use strict";
  if (req.headers["content-type"].toLowerCase() !== "application/json") {
    res.status(400).json({ status: 400, error: true, reason: "Content-Type must be application/json" });
    return;
  }

  next();
});

app.use(function(req, res, next) {
  "use strict";
  if (!apikeyhelper.verifyApiKey(req.headers["x-api-key"])) {
    res.status(401).json({ status: 401, error: true, reason: "Unauthorized"});
    return;
  }

  next();
});

// FAIL HELPERS

var failMalformed = function(res) {
  res.status(400).json({ status: 400, error: true, reason: "request malformed" });
}

var failServerError = function(res) {
  res.status(500).json({ status: 500, error: true, reason: "internal server error" });
}

// END FAIL HELPERS

app.post("/generate", async function(req, res) {
  "use strict";

  var context = uuidv4();
  var directory = "/tmp/" + context;
  await fs.mkdir(directory, function() {});

  var cleanup = function() {
    spawn("rm", ["-r", directory]);
  }

  var files = req.body.files;

  if (!(files && files.length)) {
    cleanup();
    failMalformed(res);
    return;
  }

  for (var i = 0; i < files.length; i++) {
    var name = files[i].filename;
    var content = files[i].content;

    if (!(name && content)) {
      cleanup();
      failMalformed(res);
      return;
    }
    await fs.writeFile(directory + "/" + name, Buffer.from(content, "base64"), function(err) { });
  }

  var mainfile = req.body.mainfile;
  var mainfileExtension = req.body.mainfileExtension;
  if (!(mainfile && mainfileExtension)) {
    cleanup();
    failMalformed(res);
    return;
  }

  var relaxed = spawn("relaxed", [directory + "/" + mainfile + "." + mainfileExtension, "--build-once"]);

  relaxed.on("close", code => {
    // TODO: Check if file exists else return internal server error.

    if (code == 0) {
      var fileName = directory + "/" + mainfile + ".pdf";
      res.status(200).sendFile(fileName, function(err) {
        cleanup();
      })
    } else {
      failServerError(res);
      cleanup();
    }
  });

  relaxed.on("error", err => { });
});

var port = process.env.PORT || 8000;
app.listen(port, function() {
  "use strict";
  console.log("Listening...");
});
