const express = require('express');
const app = express();
app.use(express.static('res'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/res/main.html');
});