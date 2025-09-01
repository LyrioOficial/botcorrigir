// deploy-commands.js
const { REST, Routes } = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "ComandosSlash");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd?.data) {
        commands.push(cmd.data.toJSON());
    }
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
    try {
        console.log("⏳ Atualizando (registrando) slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId), // REGISTRO RÁPIDO (guild)
            { body: commands }
        );

        console.log("✅ Slash commands atualizados com sucesso!");
    } catch (err) {
        console.error(err);
    }
})();