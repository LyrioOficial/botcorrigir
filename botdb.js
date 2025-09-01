const { JsonDB } = require("wio.db");

// cria/abre os bancos
const ticketsDB = new JsonDB({ databasePath: "./db/tickets.json" });
const configDB  = new JsonDB({ databasePath: "./db/config.json" });
const ranksDB   = new JsonDB({ databasePath: "./db/ranks.json" });

module.exports = { ticketsDB, configDB, ranksDB };