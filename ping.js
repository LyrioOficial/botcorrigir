const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("[:bust_in_silhouette: Utilidades] Veja o meu ping"),

    async execute(interaction, client) {
        try {
            await interaction.reply({
                content: ` Olá **${interaction.user.username}**, meu ping é \`${client.ws.ping}ms\`.`,
                flags: 64 // resposta só visível para quem usou
            });
        } catch (error) {
            console.error("Erro ao executar o comando ping:", error);
            await interaction.reply({
                content: "Ocorreu um erro ao executar o comando.",
                flags: 64
            });
        }
    }
};