const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
console.log('PASSWORD:', process.env.DB_PASSWORD);
