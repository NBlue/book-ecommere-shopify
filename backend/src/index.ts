import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Well done!');
});

app.listen(process.env.PORT, () => {
  console.log('The application is listening on port 3000!');
});
