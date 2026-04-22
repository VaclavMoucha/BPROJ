const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "res/img/uploads/" });

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "adminadmin") {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

router.post("/upload", upload.single("img"), (req, res) => {
  const url = "/img/uploads/" + req.file.filename;
  res.json({ url });
});

module.exports = router;