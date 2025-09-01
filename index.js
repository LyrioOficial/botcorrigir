// index.js
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

// importa os bancos
const db = require("./database.js");   // SQLite ou outro
const botdb = require("./botdb.js");   // wio.db v3

// ========= Client =========
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,  // precisa pra AFK
        GatewayIntentBits.MessageContent  // precisa pra AFK
    ]
});

// ========= Coleções =========
client.slashCommands = new Collection();

// ========= AFK =========
client.afk = new Map();

// deixa os bancos acessíveis em qualquer lugar pelo client
client.db = db;       // database.js
client.botdb = botdb; // botdb.js (wio.db v3)

// ========= Handlers =========
const loadHandlers = () => {
    const handlersPath = path.join(__dirname, "Handler");
    fs.readdirSync(handlersPath).forEach(file => {
        if (file.endsWith(".js")) {
            const handler = require(path.join(handlersPath, file));

            if (typeof handler === "function") {
                handler(client);
                console.log(`[HANDLER] Carregado: ${file}`);
            } else {
                console.log(`[HANDLER] Ignorado: ${file} (não exporta função)`);
            }
        }
    });
};

// ========= Start =========
loadHandlers();
client.login(config.token);