const express = require('express');
const { Client, GatewayIntentBits, Partials, PermissionsBitField, AuditLogEvent } = require('discord.js');

// 1. 24/7 SERVER
const app = express();
app.get('/', (req, res) => res.send('PREMIUM ANTI-NUKE 24/7 ONLINE!'));
app.listen(3000, () => console.log('Keep Alive Started'));

// 2. CAPITAL TOKEN - SECRETS LO BOT_TOKEN
const TOKEN = process.env.BOT_TOKEN?.trim();
if (!TOKEN) {
  console.log("❌ Secrets lo BOT_TOKEN (CAPITAL) ledu!");
  process.exit();
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.GuildMember]
});

// WHITELIST - Vallani kick cheyadu
const WHITELIST = []; // Kavali ante user id lu ikkada add chey - ex: ["123456789"]

client.once('ready', () => {
  console.log(`✅ MAIN BOT ONLINE: ${client.user.tag} - FULL ANTI-NUKE ACTIVE`);
});

// COMMON KICK FUNCTION
async function punish(guild, userId, reason) {
  try {
    if (WHITELIST.includes(userId)) return;
    if (userId === guild.ownerId) return;
    if (userId === client.user.id) return;

    const member = await guild.members.fetch(userId).catch(()=>null);
    if (!member) return;
    if (member.user.bot) return;
    if (!member.kickable) return console.log(`❌ ${member.user.tag} ni kick cheyalenu - Role high`);

    await member.kick(reason);
    console.log(`🔨 KICKED: ${member.user.tag} | Reason: ${reason}`);
  } catch (e) {
    console.log("Punish Error:", e.message);
  }
}

// CHANNEL CREATE -> KICK + CHANNEL DELETE
client.on('channelCreate', async (channel) => {
  await new Promise(r => setTimeout(r, 800));
  const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 }).catch(()=>null);
  if (!logs) return;
  const log = logs.entries.first();
  if (!log) return;
  await channel.delete().catch(()=>{});
  punish(channel.guild, log.executor.id, `Channel Create: ${channel.name}`);
});

// CHANNEL DELETE -> KICK
client.on('channelDelete', async (channel) => {
  await new Promise(r => setTimeout(r, 800));
  const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 }).catch(()=>null);
  if (!logs) return;
  const log = logs.entries.first();
  if (!log) return;
  punish(channel.guild, log.executor.id, `Channel Delete: ${channel.name}`);
});

// ROLE CREATE -> KICK + ROLE DELETE
client.on('roleCreate', async (role) => {
  await new Promise(r => setTimeout(r, 800));
  const logs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 }).catch(()=>null);
  if (!logs) return;
  const log = logs.entries.first();
  if (!log) return;
  await role.delete().catch(()=>{});
  punish(role.guild, log.executor.id, `Role Create: ${role.name}`);
});

// ROLE DELETE -> KICK
client.on('roleDelete', async (role) => {
  await new Promise(r => setTimeout(r, 800));
  const logs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 }).catch(()=>null);
  if (!logs) return;
  const log = logs.entries.first();
  if (!log) return;
  punish(role.guild, log.executor.id, `Role Delete: ${role.name}`);
});

// BOT ADD CHESTE -> ADD CHESINA VADINI KICK
client.on('guildMemberAdd', async (member) => {
  if (!member.user.bot) return; // Manishi aithe vadileyi, bot aithe ne kick
  await new Promise(r => setTimeout(r, 1000));
  const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 }).catch(()=>null);
  if (!logs) return;
  const log = logs.entries.first();
  if (!log) return;

  // Bot ni kick + add chesina vadini kuda kick
  if (member.id !== client.user.id) {
    await member.kick('Anti-Bot: Bot add cheyadam not allowed').catch(()=>{});
  }
  punish(member.guild, log.executor.id, `Bot Add chesadu: ${member.user.tag}`);
  console.log(`🤖 BOT ADD DETECTED: ${log.executor.tag} added ${member.user.tag} - KICKED`);
});

// PREFIX KICK
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content.startsWith('!kick')) {
    const member = message.mentions.members.first();
    if (member && member.kickable) {
      await member.kick();
      message.reply(`✅ ${member.user.tag} kicked`);
    }
  }
});

client.login(TOKEN);
