# Discord HZMIR Selfbot

A Discord selfbot built with Node.js that provides automated interaction features. This bot responds to commands with a `.` prefix and includes functionality for automatic reactions, auto-pinging users, and chatpack (auto-response) features.

## ⚠️ Important Warning

This is a **selfbot** - it runs on a user account rather than a bot account. Using selfbots is against Discord's Terms of Service and may result in your account being banned. Use at your own risk.
## Installation

1. Clone this repository:
```bash
git clone https://github.com/Hmzrhell/HZMIR-selfbot.git
cd HZMIR-selfbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file or add to your hosting platform's secrets:
   ```
   DISCORD_BOT_TOKEN=your_discord_user_token_here
   DISCORD_USER_ID=your_discord_user_id_here
   ```

## Getting Your Credentials

### Discord User Token
1. Open Discord in your browser (not the app)
2. Press `F12` to open Developer Tools
3. Go to the `Console` tab
4. Paste this code and press Enter:
   ```javascript
   (webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
   ```
5. Copy the token (without quotes)

### Discord User ID
1. Enable Developer Mode in Discord: Settings → Advanced → Developer Mode
2. Right-click your username anywhere
3. Click "Copy User ID"

## Usage

Start the bot:
```bash
node bot.js
```