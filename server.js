const mongoose = require('mongoose');
const app = require('./app');

const localDB = process.env.LOCAL_DB;

const cloudDB = process.env.CLOUD_DB.replace(
  '<password>',
  process.env.DB_PASSWORD
);

mongoose
  .connect(localDB)
  .then(() => console.log('Local DB Connection Successful'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
