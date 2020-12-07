export const initMongoDb = async () => {
  const mongoose = require('mongoose');
  console.log('Connecting mongodb ...');
  await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  console.log('Connected mongodb!');
};

export const initDotEnv = () => {
  const envPath = process.env.DOTENV_PATH || 'template.env';
  console.log('DotEnv envPath = ', envPath, ' if you want to change it, restart and set DOTENV_PATH');

  require('dotenv').config({
    path: envPath,
  });
};

export const initUnhandledRejectionCatcher = () => {
  process.on('unhandledRejection', function(err, details) {
    console.error(err);
    console.error(details);
  });
};
