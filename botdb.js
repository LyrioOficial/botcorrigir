const { Database } = require("wio.db");

// cria/abre os bancos
const ticketsDB = new Database("./db/tickets.json");
const configDB  = new Database("./db/config.json");
const ranksDB   = new Database("./db/ranks.json");

module.exports = { ticketsDB, configDB, ranksDB };