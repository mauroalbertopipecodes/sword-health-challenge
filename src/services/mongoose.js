const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connection.on('connected', () => {
  console.info('[MONGODB] Connected Successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MONGODB] Failed to Connect: ${err}`);
  process.exit(1);
});

exports.connect = () => {
  const mongoURI = process.env.MONGO_URI;

  mongoose.connect(mongoURI, {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return mongoose.connection;
};
