const express = require("express");
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
