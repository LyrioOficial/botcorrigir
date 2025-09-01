// ComandosSlash/mute.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms"); // npm i ms

// Função pra formatar tempo legível em PT-BR
function formatarTempo(ms) {
  const segundos = Math.floor(ms / 1000) % 60;
  const minutos = Math.floor(ms / (1000 * 60)) % 60;
  const horas = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const dias = Math.floor(ms / (1000 * 60 * 60 * 24));

  let partes = [];
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? "dia" : "dias"}`);
  if (horas > 0) partes.push(`${horas} ${horas === 1 ? "hora" : "horas"}`);
  if (minutos > 0) partes.push(`${minutos} ${minutos === 1 ? "minuto" : "minutos"}`);
  if (segundos > 0 && partes.length === 0) partes.push(`${segundos} ${segundos === 1 ? "segundo" : "segundos"}`);

  return partes.join(", ");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silencia um usuário por um tempo definido.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName("usuário")
        .setDescription("Usuário que será mutado")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("tempo")
        .setDescription("Tempo do mute (ex: 10m, 1h, 2d)")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("motivo")
        .setDescription("Motivo do mute")
        .setRequired(false)),

  async execute(interaction) {
    const membro = interaction.options.getMember("usuário");
    const tempoStr = interaction.options.getString("tempo");
    const motivo = interaction.options.getString("motivo") || "Não informado";

    if (!membro) {
      return interaction.reply({ content: "Usuário não encontrado.", ephemeral: true });
    }

    if (membro.id === interaction.user.id) {
      return interaction.reply({ content: "Você não pode aplicar mute em si mesmo.", ephemeral: true });
    }

    if (membro.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "Não é possível aplicar mute em administradores.", ephemeral: true });
    }

    const tempoMs = ms(tempoStr);
    if (!tempoMs) {
      return interaction.reply({ content: "Tempo inválido. Exemplos válidos: `10m`, `1h`, `2d`.", ephemeral: true });
    }

    const tempoFormatado = formatarTempo(tempoMs);

    try {
      // Embed para DM
      const dmEmbed = new EmbedBuilder()
        .setColor(0xff0000) // vermelho
        .setTitle(`⛔ Você foi mutado em ${interaction.guild.name}`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription(
          `📌 **Servidor:** ${interaction.guild.name}\n` +
          `⏰ **Tempo:** ${tempoFormatado}\n` +
          `📝 **Motivo:** ${motivo}\n\n` +
          "Durante esse período, você não poderá enviar mensagens ou falar em canais de voz."
        )
        .setFooter({
          text: `Punição aplicada por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await membro.send({ embeds: [dmEmbed] }).catch(() => {});

      // Aplica o mute
      await membro.timeout(tempoMs, motivo);

      // Resposta para o staff
      await interaction.reply({
        content: `✅ Usuário **${membro.user.tag}** foi mutado por ${tempoFormatado}.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error(error);
      interaction.reply({ content: "Ocorreu um erro ao aplicar o mute.", ephemeral: true });
    }
  }
};