import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';

const cors = require('cors');
const reviewRoute = require('./routes/reviewRoute');

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ limit: '50mb' }));

app.use('/v1/review', reviewRoute);

app.listen(process.env.PORT, () => {
  console.log('The application is listening on port 9000!');
});
