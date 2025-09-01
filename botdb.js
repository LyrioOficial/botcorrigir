const wio = require("wio.db");

// cria/abre os bancos
const ticketsDB = new wio.JsonDB({ databasePath: "./db/tickets.json" });
const configDB  = new wio.JsonDB({ databasePath: "./db/config.json" });
const ranksDB   = new wio.JsonDB({ databasePath: "./db/ranks.json" });

module.exports = { ticketsDB, configDB, ranksDB };