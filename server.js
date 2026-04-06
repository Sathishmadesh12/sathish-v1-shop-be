require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 ShopFlow API → http://localhost:${PORT}`);
    console.log(`🔗 Health → http://localhost:${PORT}/api/health\n`);
  });
};

process.on('unhandledRejection', (err) => { console.error(err); process.exit(1); });
start();
