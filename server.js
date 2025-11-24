const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'res')));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'res/html/main.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'res/html/About.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});