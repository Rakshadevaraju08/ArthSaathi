/**
 * Entry point of the application. Responsible for initializing network configurations
 * and spinning up the HTTP server layer.
 */
const app = require('./app');
const env = require('./src/config/environment');
// const { connectDB } = require('./src/config/db'); // <-- COMMENT THIS OUT

const PORT = env.PORT || 5000;

async function startServer() {
  // Ensure Database connectivity before opening network ports
  // await connectDB(); // <-- COMMENT THIS OUT TOO

  app.listen(PORT, () => {
    console.log(`🚀 ArthSaathi Server running in [${env.NODE_ENV}] mode on port ${PORT}`);
    console.log(`💡 Note: Database connection is currently bypassed for rapid mock testing.`);
  });
}

startServer();