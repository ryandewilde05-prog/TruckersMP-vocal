const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

// ─── CONFIG ───────────────────────────────────────────
const LOG_CHANNEL_ID  = process.env.LOG_CHANNEL_ID;
const STAFF_ROLE_ID   = process.env.STAFF_ROLE_ID;
// ──────────────────────────────────────────────────────

client.on('voiceStateUpdate', async (oldState, newState) => {
  const logChannel = newState.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;

  const user    = newState.member.user;
  const mention = `<@${user.id}>`;
  const staff   = `<@&${STAFF_ROLE_ID}>`;
  const embed   = new EmbedBuilder()
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `ID : ${user.id}` })
    .setTimestamp();

  let content = '';

  // 🟢 Rejoint un vocal
  if (!oldState.channelId && newState.channelId) {
    embed
      .setColor(0x57F287)
      .setTitle('🟢 Connexion vocale')
      .addFields(
        { name: '👤 Utilisateur', value: mention, inline: true },
        { name: '🔊 Salon rejoint', value: `**${newState.channel.name}**`, inline: true },
      );
    content = `${staff} — ${mention} a rejoint un vocal.`;

  // 🔴 Quitte un vocal
  } else if (oldState.channelId && !newState.channelId) {
    embed
      .setColor(0xED4245)
      .setTitle('🔴 Déconnexion vocale')
      .addFields(
        { name: '👤 Utilisateur', value: mention, inline: true },
        { name: '🔇 Salon quitté', value: `**${oldState.channel.name}**`, inline: true },
      );
    content = `${staff} — ${mention} a quitté un vocal.`;

  // 🟡 Change de salon vocal
  } else if (oldState.channelId !== newState.channelId) {
    embed
      .setColor(0xFEE75C)
      .setTitle('🟡 Changement de salon')
      .addFields(
        { name: '👤 Utilisateur', value: mention, inline: true },
        { name: '🔀 Déplacement', value: `**${oldState.channel.name}** → **${newState.channel.name}**`, inline: true },
      );
    content = `${staff} — ${mention} a changé de salon vocal.`;

  // 🔇 Mute serveur
  } else if (!oldState.serverMute && newState.serverMute) {
    embed
      .setColor(0xFF6B6B)
      .setTitle('🔇 Mute serveur appliqué')
      .addFields({ name: '👤 Utilisateur', value: mention, inline: true });
    content = `${staff} — ${mention} a été mute (serveur).`;

  // 🔊 Démute serveur
  } else if (oldState.serverMute && !newState.serverMute) {
    embed
      .setColor(0x43B581)
      .setTitle('🔊 Mute serveur retiré')
      .addFields({ name: '👤 Utilisateur', value: mention, inline: true });
    content = `${staff} — ${mention} a été démute (serveur).`;

  // 📹 Stream démarré
  } else if (!oldState.streaming && newState.streaming) {
    embed
      .setColor(0x9B59B6)
      .setTitle('📹 Stream démarré')
      .addFields(
        { name: '👤 Utilisateur', value: mention, inline: true },
        { name: '🔊 Salon', value: `**${newState.channel.name}**`, inline: true },
      );
    content = `${staff} — ${mention} a commencé un stream.`;

  } else {
    return;
  }

  await logChannel.send({ content, embeds: [embed] });
});

client.once('ready', () => console.log(`✅ Bot connecté : ${client.user.tag}`));
client.login(process.env.TOKEN);
