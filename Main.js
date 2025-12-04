const { Client, MessageEmbed } = require('discord.js-selfbot-v13');
const fs = require('fs');

const CONFIG_FILE = 'config.json';
const VERSION = '1.0.0';

let config = {
  prefix: '.',
  theme: {
    name: 'Hmzir',
    title: 'Hmzir',
    footer: 'hmzir.dev',
    color: '#9B59B6'
  }
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {}
}

function saveConfig() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

const commands = {
  utility: {
    name: 'Utility',
    description: 'Utilities',
    commands: {
      'ping': 'Check bot latency'
    }
  },
  settings: {
    name: 'Settings',
    description: 'Settings',
    commands: {
      'prefix': 'Change bot prefix',
      'ctitle': 'Customize embed title',
      'cfooter': 'Customize embed footer',
      'ccolor': 'Customize embed color'
    }
  },
  misc: {
    name: 'Misc',
    description: 'Miscellaneous',
    commands: {
      'about': 'Bot information'
    }
  }
};

let commandCount = Object.values(commands).reduce((acc, cat) => acc + Object.keys(cat.commands).length, 0);
commandCount += 2;

const colors = {
  reset: '\x1b[0m',
  purple: '\x1b[35m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  green: '\x1b[32m'
};

const client = new Client({
  checkUpdate: false
});

const token = process.env.DISCORD_BOT_TOKEN?.trim();
const authorizedUserId = process.env.DISCORD_USER_ID?.trim();

function displayBanner() {
  console.clear();
  const banner = `
${colors.purple}    *        ${colors.gray}o${colors.purple}                                           ${colors.gray}o
       ${colors.gray}-${colors.purple}  ${colors.gray}o${colors.purple}
            ${colors.cyan}██╗  ██╗███╗   ███╗███████╗██╗██████╗ 
            ${colors.cyan}██║  ██║████╗ ████║╚══███╔╝██║██╔══██╗
            ${colors.purple}███████║██╔████╔██║  ███╔╝ ██║██████╔╝
            ${colors.purple}██╔══██║██║╚██╔╝██║ ███╔╝  ██║██╔══██╗
            ${colors.blue}██║  ██║██║ ╚═╝ ██║███████╗██║██║  ██║
            ${colors.blue}╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝╚═╝  ╚═╝
${colors.gray}    *   -                                              o     *
              ${colors.white}The Ultimate Discord Selfbot${colors.reset}
`;
  console.log(banner);
}

function displayStatus(user, guilds, friends) {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  console.log(`${colors.gray}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}[+]${colors.white} CONNECTED${colors.reset}`);
  console.log(`${colors.green}[+]${colors.white} ${user.tag} ${colors.gray}|${colors.white} ${guilds} Guilds ${colors.gray}|${colors.white} ${friends} Friends${colors.reset}`);
  console.log(`${colors.green}[+]${colors.white} Prefix: ${colors.cyan}${config.prefix}${colors.reset}`);
  console.log(`${colors.gray}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log();
  console.log(`${colors.gray}${time} ${colors.gray}|${colors.white} Ready ${colors.gray}|${colors.cyan} ${commandCount} commands ${colors.gray}|${colors.purple} Type ${config.prefix}help for commands${colors.reset}`);
  console.log(`${colors.gray}>${colors.reset}`);
}

function createEmbed() {
  const embed = new MessageEmbed().setColor(config.theme.color);
  if (config.theme.footer) embed.setFooter({ text: config.theme.footer });
  return embed;
}

if (!token) {
  console.error(`${colors.purple}[!]${colors.reset} ERROR: DISCORD_BOT_TOKEN is not set!`);
  process.exit(1);
}

if (!authorizedUserId) {
  console.error(`${colors.purple}[!]${colors.reset} ERROR: DISCORD_USER_ID is not set!`);
  process.exit(1);
}

console.log(`${colors.purple}[*]${colors.white} Connecting to Discord...${colors.reset}`);
client.login(token);

client.on('ready', async () => {
  displayBanner();
  const guilds = client.guilds.cache.size;
  const friends = client.relationships?.friendCache?.size || 0;
  displayStatus(client.user, guilds, friends);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  if (message.author.id !== authorizedUserId) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    await message.delete().catch(() => {});

    if (command === 'help') {
      const category = args[0]?.toLowerCase();
      
      if (!category) {
        const embed = createEmbed()
          .setTitle(config.theme.title)
          .setDescription('`<>` is required | `[]` is optional');
        
        let categoriesText = '';
        categoriesText += `\`${config.prefix}help [category]\` » Display category commands\n`;
        categoriesText += `\`${config.prefix}search <command>\` » Search for a command\n\n`;
        categoriesText += '**Categories**\n\n';
        
        for (const [key, cat] of Object.entries(commands)) {
          categoriesText += `\`${config.prefix}${key}\` » ${cat.description}\n`;
        }
        
        embed.addFields(
          { name: `Commands » ${commandCount}`, value: categoriesText }
        );
        
        embed.addFields({ name: 'Version', value: VERSION });
        
        await message.channel.send({ embeds: [embed] });
      } else if (commands[category]) {
        const cat = commands[category];
        const embed = createEmbed()
          .setTitle(`${config.theme.title} - ${cat.name}`);
        
        let cmdText = '';
        for (const [cmd, desc] of Object.entries(cat.commands)) {
          cmdText += `\`${config.prefix}${cmd}\` » ${desc}\n`;
        }
        
        embed.setDescription(cmdText || 'No commands in this category.');
        await message.channel.send({ embeds: [embed] });
      }
    }

    else if (commands[command]) {
      const cat = commands[command];
      const embed = createEmbed()
        .setTitle(`${config.theme.title} - ${cat.name}`);
      
      let cmdText = '';
      for (const [cmd, desc] of Object.entries(cat.commands)) {
        cmdText += `\`${config.prefix}${cmd}\` » ${desc}\n`;
      }
      
      embed.setDescription(cmdText || 'No commands in this category.');
      await message.channel.send({ embeds: [embed] });
    }

    else if (command === 'search') {
      const query = args[0]?.toLowerCase();
      if (!query) {
        return message.channel.send(`Usage: \`${config.prefix}search <command>\``);
      }
      
      let results = [];
      for (const [catKey, cat] of Object.entries(commands)) {
        for (const [cmd, desc] of Object.entries(cat.commands)) {
          if (cmd.includes(query) || desc.toLowerCase().includes(query)) {
            results.push({ cmd, desc, category: cat.name });
          }
        }
      }
      
      const embed = createEmbed().setTitle(`Search Results: "${query}"`);
      if (results.length > 0) {
        let text = '';
        for (const r of results.slice(0, 10)) {
          text += `\`${config.prefix}${r.cmd}\` » ${r.desc} *(${r.category})*\n`;
        }
        embed.setDescription(text);
      } else {
        embed.setDescription('No commands found.');
      }
      await message.channel.send({ embeds: [embed] });
    }

    else if (command === 'ping') {
      const sent = await message.channel.send('Pinging...');
      const ping = sent.createdTimestamp - message.createdTimestamp;
      await sent.edit(`Pong! Latency: \`${ping}ms\` | API: \`${Math.round(client.ws.ping)}ms\``);
    }

    else if (command === 'about') {
      const embed = createEmbed()
        .setTitle(config.theme.title)
        .setDescription('The Ultimate Discord Selfbot')
        .addFields(
          { name: 'Version', value: VERSION, inline: true },
          { name: 'Commands', value: commandCount.toString(), inline: true },
          { name: 'Prefix', value: config.prefix, inline: true },
          { name: 'Guilds', value: client.guilds.cache.size.toString(), inline: true }
        );
      await message.channel.send({ embeds: [embed] });
    }

    else if (command === 'prefix') {
      const newPrefix = args[0];
      if (!newPrefix) {
        return message.channel.send(`Current prefix: \`${config.prefix}\`\nUsage: \`${config.prefix}prefix <new_prefix>\``);
      }
      
      const oldPrefix = config.prefix;
      config.prefix = newPrefix;
      saveConfig();
      
      const embed = createEmbed()
        .setTitle('Prefix Updated')
        .setDescription(`\`${oldPrefix}\` → \`${config.prefix}\`\n\nNew prefix saved permanently!`);
      await message.channel.send({ embeds: [embed] });
    }

    else if (command === 'ctitle') {
      const title = args.join(' ');
      if (!title) return message.channel.send(`Current title: \`${config.theme.title}\`\nUsage: \`${config.prefix}ctitle <title>\` or \`${config.prefix}ctitle none\``);
      
      config.theme.title = title === 'none' ? 'Hmzir' : title;
      saveConfig();
      await message.channel.send(`Title set to: ${config.theme.title}`);
    }

    else if (command === 'cfooter') {
      const footer = args.join(' ');
      if (!footer) return message.channel.send(`Current footer: \`${config.theme.footer}\`\nUsage: \`${config.prefix}cfooter <footer>\` or \`${config.prefix}cfooter none\``);
      
      config.theme.footer = footer === 'none' ? null : footer;
      saveConfig();
      await message.channel.send(`Footer set to: ${config.theme.footer || 'none'}`);
    }

    else if (command === 'ccolor') {
      const color = args[0];
      if (!color) return message.channel.send(`Current color: \`${config.theme.color}\`\nUsage: \`${config.prefix}ccolor <#hex>\``);
      
      config.theme.color = color;
      saveConfig();
      const embed = createEmbed().setDescription('Color updated!');
      await message.channel.send({ embeds: [embed] });
    }

  } catch (error) {
    console.error(`${colors.purple}[!]${colors.reset} Command error:`, error.message);
  }
});
