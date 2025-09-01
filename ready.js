const { REST, Routes } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: "ready",
    once: true,
    async run(client) {
        console.log(`✅ Logado como ${client.user.tag}`);

        // 🔹 Status apenas "online", sem atividade
        client.user.setPresence({ status: "online" });

        // 🔹 Carrega os comandos
        const guildId = config.guildId;
        const commands = client.slashCommands.map(cmd => cmd.data.toJSON());

        const rest = new REST({ version: "10" }).setToken(config.token);

        try {
            console.log("⚡ Registrando slash commands no servidor...");
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: commands }
            );
            console.log("🚀 Slash commands registrados com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao registrar slash commands:", error);
        }
    }
};