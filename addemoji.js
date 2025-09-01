const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addemoji")
    .setDescription("Adiciona emojis no servidor")
    .addSubcommand(subcommand =>
      subcommand
        .setName("adicionar")
        .setDescription("Crie um emoji personalizado no servidor")
        .addStringOption(option =>
          option
            .setName("emoji")
            .setDescription("Cole um emoji de outro servidor (opcional)")
        )
        .addAttachmentOption(option =>
          option
            .setName("arquivo")
            .setDescription("Envie uma imagem para usar como emoji (opcional)")
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),

  async execute(interaction) {
    if (interaction.options.getSubcommand() !== "adicionar") return;

    const emojiInput = interaction.options.getString("emoji");
    const arquivo = interaction.options.getAttachment("arquivo");

    let imageUrl;
    // nome sempre = nome do servidor (sem espaços, pq o Discord não aceita)
    let nome = interaction.guild.name.replace(/\s+/g, "_");

    // Emoji de outro servidor
    if (emojiInput) {
      const match = emojiInput.match(/<(a)?:\w+:(\d+)>/);
      if (!match) {
        return interaction.reply({
          content: "❌ O emoji informado não é válido.",
          ephemeral: true,
        });
      }
      const animated = match[1];
      const id = match[2];
      imageUrl = `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}`;
    }

    // Arquivo enviado
    else if (arquivo) {
      if (!arquivo.contentType || !arquivo.contentType.startsWith("image/")) {
        return interaction.reply({
          content: "❌ O arquivo enviado deve ser uma **imagem**.",
          ephemeral: true,
        });
      }
      imageUrl = arquivo.url;
    }

    // Nenhum fornecido
    else {
      return interaction.reply({
        content: "❌ Você precisa fornecer um **emoji ou arquivo**.",
        ephemeral: true,
      });
    }

    try {
      const emoji = await interaction.guild.emojis.create({
        attachment: imageUrl,
        name: nome,
      });

      return interaction.reply({
        content: `✅ Emoji adicionado com sucesso: <${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`,
      });
    } catch (error) {
      console.error(`[ERRO AO ADICIONAR EMOJI]`, error);
      return interaction.reply({
        content: "❌ Não consegui adicionar o emoji. O servidor pode já ter atingido o limite de emojis.",
        ephemeral: true,
      });
    }
  },
};