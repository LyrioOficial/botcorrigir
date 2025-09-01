const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// cria/conecta ao arquivo do banco de economia
const dbPath = path.resolve(__dirname, "economia.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Erro ao abrir o banco:", err.message);
  else console.log("📦 Banco de economia conectado em", dbPath);
});

// tabela de economia
db.run(`
  CREATE TABLE IF NOT EXISTS economia (
    userId TEXT NOT NULL,
    guildId TEXT NOT NULL,
    saldo INTEGER DEFAULT 0,
    lastDaily INTEGER DEFAULT 0,
    PRIMARY KEY (userId, guildId)
  )
`);

module.exports = db;