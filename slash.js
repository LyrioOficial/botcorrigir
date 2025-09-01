const fs = require("fs");
const path = require("path");
const { Collection, REST, Routes } = require("discord.js");
const config = require("../config.json");

module.exports = (client) => {
    client.slashCommands = new Collection();

    const commandsPath = path.join(__dirname, "..", "ComandosSlash");
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

    const slashArray = [];

    for (const file of files) {
        console.log("[DEBUG] Tentando carregar arquivo:", file); // mostra todos os arquivos
        const cmd = require(path.join(commandsPath, file));

        if (!cmd?.data || !cmd?.execute) {
            console.log(`[SLASH] Ignorando ${file} (faltando data/execute)`);
            continue;
        }

        client.slashCommands.set(cmd.data.name, cmd);
        slashArray.push(cmd.data.toJSON());
        console.log(`[SLASH] Comando válido carregado: ${cmd.data.name}`); // mostra cada comando válido
    }

    console.log(`[SLASH] Total de comandos válidos carregados: ${slashArray.length}`);

    // 🔹 Só registra depois do bot estar pronto
    client.once("ready", async () => {
        const rest = new REST({ version: "10" }).setToken(config.token);

        try {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, config.guildId),
                { body: slashArray }
            );
            console.log(`⚡ Comandos registrados no servidor ${config.guildId}!`);
        } catch (err) {
            console.error("Erro ao registrar slash commands:", err);
        }
    });
};