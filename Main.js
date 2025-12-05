const { Client, CustomStatus } = require('discord.js-selfbot-v13');
const fs = require('fs');

const CONFIG_FILE = 'config.json';
const VERSION = '1.0.0';

let config = {
  prefix: '.',
  theme: {
    name: 'Hmzir',
    title: 'Hmzir',
    footer: 'hmzir.dev',
    description: 'on'
  },
  startup: 'online'
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
  profile: {
    name: 'Profile',
    description: 'Profile settings',
    commands: {
      'profile': 'View profile info',
      'nick': 'Change your nickname',
      'invisiblenick': 'Make nickname invisible',
      'junknick': 'Pure junk nickname'
    },
    userControl: {
      'online': 'Online status',
      'idle': 'Idle status',
      'dnd': 'Do not disturb status',
      'offline': 'Offline status',
      'startup': 'Startup status',
      'cstatus': 'Custom status'
    }
  },
  settings: {
    name: 'Settings',
    description: 'Settings',
    commands: {
      'prefix': 'Change bot prefix',
      'ctitle': 'Customize the title',
      'cfooter': 'Customize the footer',
      'description': 'Hide/Show <> | []'
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

let commandCount = Object.values(commands).reduce((acc, cat) => {
  let count = Object.keys(cat.commands).length;
  if (cat.userControl) count += Object.keys(cat.userControl).length;
  return acc + count;
}, 0);
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

function padRight(str, len) {
  return str + ' '.repeat(Math.max(0, len - str.length));
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
  
  const startupStatus = config.startup || 'online';
  const statusMap = { online: 'online', idle: 'idle', dnd: 'dnd', offline: 'invisible' };
  await client.user.setStatus(statusMap[startupStatus] || 'online');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  if (message.author.id !== authorizedUserId) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fullCommand = args.length > 0 ? `${config.prefix}${command} ${args.join(' ')}` : `${config.prefix}${command}`;
  console.log(`${colors.gray}${time} ${colors.gray}|${colors.cyan} Command ${colors.gray}|${colors.white} ${fullCommand}${colors.reset}`);

  try {
    await message.delete().catch(() => {});

    if (command === 'help') {
      const category = args[0]?.toLowerCase();
      
      if (!category) {
        let msg = '';
        if (config.theme.description === 'on') {
          msg += '> ```\n';
          msg += '> <> is required | [] is optional\n';
          msg += '> ```\n';
        }
        msg += '> ```\n';
        msg += `> ${config.theme.title}\n`;
        msg += '> \n';
        msg += `> Commands       » ${commandCount}\n`;
        msg += '> ```\n';
        msg += '> ```\n';
        msg += '> Categories\n';
        msg += '> \n';
        msg += `> ${config.prefix}help [category] » Display category commands\n`;
        msg += `> ${config.prefix}search <command> » Search for a command\n`;
        
        for (const [key, cat] of Object.entries(commands)) {
          msg += `> ${padRight(config.prefix + key, 16)} » ${cat.description}\n`;
        }
        
        msg += '> ```\n';
        msg += '> ```\n';
        msg += '> Version\n';
        msg += '> \n';
        msg += `> ${VERSION}\n`;
        msg += '> ```\n';
        msg += `> \n> **Enabled Protections** » 0 | ${config.theme.footer}`;
        
        await message.channel.send(msg);
      } else if (commands[category]) {
        const cat = commands[category];
        let msg = '';
        if (config.theme.description === 'on') {
          msg += '> ```\n';
          msg += '> <> is required | [] is optional\n';
          msg += '> ```\n';
        }
        msg += '> ```\n';
        msg += `> ${config.theme.title} - ${cat.name}\n`;
        msg += '> ```\n';
        msg += '> ```\n';
        msg += `> ${cat.name} commands\n`;
        msg += '> \n';
        
        for (const [cmd, desc] of Object.entries(cat.commands)) {
          msg += `> ${padRight(config.prefix + cmd, 16)} » ${desc}\n`;
        }
        
        if (cat.userControl) {
          msg += '> \n';
          msg += '> User Control\n';
          msg += '> \n';
          for (const [cmd, desc] of Object.entries(cat.userControl)) {
            msg += `> ${padRight(config.prefix + cmd, 16)} » ${desc}\n`;
          }
        }
        
        msg += '> ```\n';
        msg += `> \n> **Enabled Protections** » 0 | ${config.theme.footer}`;
        
        await message.channel.send(msg);
      }
    }

    else if (commands[command]) {
      const cat = commands[command];
      let msg = '';
      if (config.theme.description === 'on') {
        msg += '> ```\n';
        msg += '> <> is required | [] is optional\n';
        msg += '> ```\n';
      }
      msg += '> ```\n';
      msg += `> ${config.theme.title} - ${cat.name}\n`;
      msg += '> ```\n';
      msg += '> ```\n';
      msg += `> ${cat.name} commands\n`;
      msg += '> \n';
      
      for (const [cmd, desc] of Object.entries(cat.commands)) {
        msg += `> ${padRight(config.prefix + cmd, 16)} » ${desc}\n`;
      }
      
      if (cat.userControl) {
        msg += '> \n';
        msg += '> User Control\n';
        msg += '> \n';
        for (const [cmd, desc] of Object.entries(cat.userControl)) {
          msg += `> ${padRight(config.prefix + cmd, 16)} » ${desc}\n`;
        }
      }
      
      msg += '> ```\n';
      msg += `> \n> **Enabled Protections** » 0 | ${config.theme.footer}`;
      
      await message.channel.send(msg);
    }

    else if (command === 'search') {
      const query = args[0]?.toLowerCase();
      if (!query) {
        let msg = '> ```\n';
        msg += `> Usage: ${config.prefix}search <command>\n`;
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      let results = [];
      for (const [catKey, cat] of Object.entries(commands)) {
        for (const [cmd, desc] of Object.entries(cat.commands)) {
          if (cmd.includes(query) || desc.toLowerCase().includes(query)) {
            results.push({ cmd, desc, category: cat.name });
          }
        }
        if (cat.userControl) {
          for (const [cmd, desc] of Object.entries(cat.userControl)) {
            if (cmd.includes(query) || desc.toLowerCase().includes(query)) {
              results.push({ cmd, desc, category: cat.name });
            }
          }
        }
      }
      
      let msg = '> ```\n';
      msg += `> Search Results: "${query}"\n`;
      msg += '> ```\n';
      msg += '> ```\n';
      
      if (results.length > 0) {
        for (const r of results.slice(0, 10)) {
          msg += `> ${padRight(config.prefix + r.cmd, 16)} » ${r.desc} (${r.category})\n`;
        }
      } else {
        msg += '> No commands found.\n';
      }
      
      msg += '> ```\n';
      msg += `> \n> **Enabled Protections** » 0 | ${config.theme.footer}`;
      
      await message.channel.send(msg);
    }

    else if (command === 'ping') {
      const sent = await message.channel.send('> ```\n> Pinging...\n> ```');
      const ping = sent.createdTimestamp - message.createdTimestamp;
      let msg = '> ```\n';
      msg += `> Latency        » ${ping}ms\n`;
      msg += `> API Latency    » ${Math.round(client.ws.ping)}ms\n`;
      msg += '> ```';
      await sent.edit(msg);
    }

    else if (command === 'about') {
      let msg = '> ```\n';
      msg += `> ${config.theme.title}\n`;
      msg += '> \n';
      msg += '> The Ultimate Discord Selfbot\n';
      msg += '> ```\n';
      msg += '> ```\n';
      msg += `> Version        » ${VERSION}\n`;
      msg += `> Commands       » ${commandCount}\n`;
      msg += `> Prefix         » ${config.prefix}\n`;
      msg += `> Guilds         » ${client.guilds.cache.size}\n`;
      msg += '> ```\n';
      msg += `> \n> **Enabled Protections** » 0 | ${config.theme.footer}`;
      
      await message.channel.send(msg);
    }

    else if (command === 'prefix') {
      const newPrefix = args[0];
      if (!newPrefix) {
        let msg = '> ```\n';
        msg += `> Current prefix » ${config.prefix}\n`;
        msg += '> \n';
        msg += `> Usage: ${config.prefix}prefix <new_prefix>\n`;
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      const oldPrefix = config.prefix;
      config.prefix = newPrefix;
      saveConfig();
      
      let msg = '> ```\n';
      msg += '> Prefix Updated\n';
      msg += '> \n';
      msg += `> ${oldPrefix} → ${config.prefix}\n`;
      msg += '> \n';
      msg += '> New prefix saved permanently!\n';
      msg += '> ```';
      await message.channel.send(msg);
    }

    else if (command === 'ctitle') {
      const title = args.join(' ');
      if (!title) {
        let msg = '> ```\n';
        msg += '> Selfbot theme settings\n';
        msg += '> \n';
        msg += `> Current title  » ${config.theme.title}\n`;
        msg += '> \n';
        msg += `> Usage: ${config.prefix}ctitle <title>\n`;
        msg += `> Use "${config.prefix}ctitle none" to reset\n`;
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      config.theme.title = title === 'none' ? 'Hmzir' : title;
      saveConfig();
      
      let msg = '> ```\n';
      msg += `> Title set to: ${config.theme.title}\n`;
      msg += '> ```';
      await message.channel.send(msg);
    }

    else if (command === 'cfooter') {
      const footer = args.join(' ');
      if (!footer) {
        let msg = '> ```\n';
        msg += '> Selfbot theme settings\n';
        msg += '> \n';
        msg += `> Current footer » ${config.theme.footer || 'none'}\n`;
        msg += '> \n';
        msg += `> Usage: ${config.prefix}cfooter <footer>\n`;
        msg += `> Use "${config.prefix}cfooter none" to reset\n`;
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      config.theme.footer = footer === 'none' ? 'hmzir.dev' : footer;
      saveConfig();
      
      let msg = '> ```\n';
      msg += `> Footer set to: ${config.theme.footer}\n`;
      msg += '> ```';
      await message.channel.send(msg);
    }

    else if (command === 'description') {
      const toggle = args[0]?.toLowerCase();
      if (!toggle || (toggle !== 'on' && toggle !== 'off')) {
        let msg = '> ```\n';
        msg += '> Description settings\n';
        msg += '> \n';
        msg += `> Current state  » ${config.theme.description || 'on'}\n`;
        msg += '> \n';
        msg += `> Usage: ${config.prefix}description <on/off>\n`;
        msg += '> Hide/Show <> | []\n';
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      config.theme.description = toggle;
      saveConfig();
      
      let msg = '> ```\n';
      msg += `> Description ${toggle === 'on' ? 'enabled' : 'disabled'}\n`;
      msg += '> ```';
      await message.channel.send(msg);
    }

    else if (command === 'profile') {
      const user = client.user;
      let msg = '> **Profile**\n';
      if (config.theme.description === 'on') {
        msg += '> ```\n';
        msg += '> <> is required | [] is optional\n';
        msg += '> ```\n';
      }
      msg += '> ```\n';
      msg += '> Current profile\n';
      msg += '> \n';
      msg += `> ${padRight('User', 16)} » ${user.tag}\n`;
      msg += `> ${padRight('Username', 16)} » ${user.username}\n`;
      msg += `> ${padRight('Discriminator', 16)} » ${user.discriminator}\n`;
      msg += '> ```\n';
      msg += '> ```\n';
      msg += '> Nickname Control\n';
      msg += '> \n';
      msg += `> ${config.prefix}nick <name>     » Change your nickname\n`;
      msg += `> ${config.prefix}invisiblenick   » Make your nickname invisible\n`;
      msg += `> ${config.prefix}junknick        » Pure junk nickname\n`;
      msg += '> ```\n';
      msg += '> ```\n';
      msg += '> User Control\n';
      msg += '> \n';
      msg += `> ${config.prefix}online          » Online status\n`;
      msg += `> ${config.prefix}idle            » Idle status\n`;
      msg += `> ${config.prefix}dnd             » Do not disturb status\n`;
      msg += `> ${config.prefix}offline         » Offline status\n`;
      msg += `> ${config.prefix}startup <status> » Startup\n`;
      msg += `> ${config.prefix}cstatus <text>  » Custom status\n`;
      msg += '> ```\n';
      msg += `> \n> **Enabled Protections** » 0 | ${config.theme.footer}`;
      await message.channel.send(msg);
    }

    else if (command === 'nick') {
      const nickname = args.join(' ');
      if (!nickname) {
        let msg = '> ```\n';
        msg += `> Usage: ${config.prefix}nick <name>\n`;
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      if (!message.guild) {
        let msg = '> ```\n';
        msg += '> This command can only be used in a server\n';
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      try {
        await message.guild.members.me.setNickname(nickname);
        let msg = '> ```\n';
        msg += `> Nickname changed to: ${nickname}\n`;
        msg += '> ```';
        await message.channel.send(msg);
      } catch (e) {
        let msg = '> ```\n';
        msg += '> Failed to change nickname\n';
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

    else if (command === 'invisiblenick') {
      if (!message.guild) {
        let msg = '> ```\n';
        msg += '> This command can only be used in a server\n';
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      try {
        await message.guild.members.me.setNickname('\u200B');
        let msg = '> ```\n';
        msg += '> Nickname set to invisible\n';
        msg += '> ```';
        await message.channel.send(msg);
      } catch (e) {
        let msg = '> ```\n';
        msg += '> Failed to change nickname\n';
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

    else if (command === 'junknick') {
      if (!message.guild) {
        let msg = '> ```\n';
        msg += '> This command can only be used in a server\n';
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      const junkChars = '̶̷̸̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼͇͈͉͍͎̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏̐̑̒̓̔̽̾̿̀́͂̓̈́͆͊͋͌̕̚ͅ͏͓͔͕͖͙͚͐͑͒͗͛ͣͤͥͦͧͨͩͪͫͬͭͮͯ͘͜͟͢͝͞͠͡';
      let junkNick = '';
      for (let i = 0; i < 5; i++) {
        junkNick += junkChars[Math.floor(Math.random() * junkChars.length)];
      }
      
      try {
        await message.guild.members.me.setNickname(junkNick);
        let msg = '> ```\n';
        msg += '> Junk nickname applied\n';
        msg += '> ```';
        await message.channel.send(msg);
      } catch (e) {
        let msg = '> ```\n';
        msg += '> Failed to change nickname\n';
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

    else if (command === 'online') {
      try {
        await client.user.setStatus('online');
        let msg = '> ```\n';
        msg += '> Status set to online\n';
        msg += '> ```';
        await message.channel.send(msg);
      } catch (e) {
        let msg = '> ```\n';
        msg += '> Failed to set status\n';
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

    else if (command === 'idle') {
      try {
        await client.user.setStatus('idle');
        let msg = '> ```\n';
        msg += '> Status set to idle\n';
        msg += '> ```';
        await message.channel.send(msg);
      } catch (e) {
        let msg = '> ```\n';
        msg += '> Failed to set status\n';
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

    else if (command === 'dnd') {
      try {
        await client.user.setStatus('dnd');
        let msg = '> ```\n';
        msg += '> Status set to do not disturb\n';
        msg += '> ```';
        await message.channel.send(msg);
      } catch (e) {
        let msg = '> ```\n';
        msg += '> Failed to set status\n';
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

    else if (command === 'offline') {
      try {
        await client.user.setStatus('invisible');
        let msg = '> ```\n';
        msg += '> Status set to offline\n';
        msg += '> ```';
        await message.channel.send(msg);
      } catch (e) {
        let msg = '> ```\n';
        msg += '> Failed to set status\n';
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

    else if (command === 'startup') {
      const status = args[0]?.toLowerCase();
      const validStatuses = ['online', 'idle', 'dnd', 'offline'];
      
      if (!status || !validStatuses.includes(status)) {
        let msg = '> ```\n';
        msg += '> Startup settings\n';
        msg += '> \n';
        msg += `> Current startup » ${config.startup || 'online'}\n`;
        msg += '> \n';
        msg += `> Usage: ${config.prefix}startup <online/idle/dnd/offline>\n`;
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      config.startup = status;
      saveConfig();
      
      let msg = '> ```\n';
      msg += `> Startup status set to: ${status}\n`;
      msg += '> ```';
      await message.channel.send(msg);
    }

    else if (command === 'cstatus') {
      const text = args.join(' ');
      
      if (!text) {
        let msg = '> ```\n';
        msg += `> Usage: ${config.prefix}cstatus <text>\n`;
        msg += `> Use "${config.prefix}cstatus none" to clear\n`;
        msg += '> ```';
        return message.channel.send(msg);
      }
      
      try {
        if (text === 'none') {
          await client.user.setActivity(null);
          let msg = '> ```\n';
          msg += '> Custom status cleared\n';
          msg += '> ```';
          await message.channel.send(msg);
        } else {
          const customStatus = new CustomStatus().setState(text);
          await client.user.setActivity(customStatus);
          let msg = '> ```\n';
          msg += `> Custom status set to: ${text}\n`;
          msg += '> ```';
          await message.channel.send(msg);
        }
      } catch (e) {
        let msg = '> ```\n';
        msg += `> Failed to set custom status: ${e.message}\n`;
        msg += '> ```';
        await message.channel.send(msg);
      }
    }

  } catch (error) {
    console.error(`${colors.purple}[!]${colors.reset} Command error:`, error.message);
  }
});
