// client-user/metro.config.cjs
// Configuración de Metro en CommonJS porque el proyecto usa "type": "module".
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
