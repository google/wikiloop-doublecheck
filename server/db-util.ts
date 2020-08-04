export const initMongoDb = async () => {
  const mongoose = require('mongoose');
  console.log(`Connecting mongodb ...`);
  await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });
  console.log(`Connected mongodb!`);
}

export const initDotEnv = () => {
  const envPath = process.env.DOTENV_PATH || 'template.env';
  console.log(`DotEnv envPath = `, envPath, ' if you want to change it, restart and set DOTENV_PATH');

  require('dotenv').config({
    path: envPath
  });
}

