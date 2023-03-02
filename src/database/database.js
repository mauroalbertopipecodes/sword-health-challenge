require('dotenv').config();

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_FLAVOUR,
  },
);

(async () => {
  try {
    await sequelize.sync();
    console.log('Models synced with database!');
  } catch (error) {
    console.error('Error syncing models with database:', error);
  }
})();

module.exports = sequelize;
