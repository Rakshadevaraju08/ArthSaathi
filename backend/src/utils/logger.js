// Clean console abstraction for explicit execution auditing
module.exports = {
  info: (msg, data = '') => console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, data),
  warn: (msg, data = '') => console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, data),
  error: (msg, data = '') => console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, data)
};