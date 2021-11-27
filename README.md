# Calucon Crypto Bot

Here i should write some text... soon...

## Installation (Linux)

### Setup NodeJS

```sh
# Download latest NodeJS setup
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh

# Adds NodeJS to apt repositories
sudo bash nodesource_setup.sh

# Install NodeJS and build-essentials
sudo apt install nodejs build-essential git
```

### Setup Bot

```sh
# Get code from GitHub
git clone https://github.com/Calucon/calucon_crypto_bot.git

# Go into Bot directory
cd calucon_crypto_bot

# Install NodeJS dependencies
npm i

# Build Application
npx tsc
```

### Configure Bot

> All required fields for your #env files are explained below!

```sh
# Create .env file and set all parameters
nano build/.env
```

### Run Bot using PM2

> About PM2: _PM2 is a daemon process manager that will help you manage and keep your application online 24/7_

```sh
# Install PM2
sudo npm install pm2 -g

# Make sure PM2 restarts at system reboot
pm2 startup systemd

# Start Bot
pm2 start build/index.js
```

Please note: some versions of PM2 require you to modify your `$PATH` variable in order for it to run at system startup.

### Update Bot

```sh
# Stop bot
pm2 stop build/index.js

# Update code
git pull

# Update node dependencies
npm i

# Rebuild bot
npx tsc

# Start bot again
pm2 start build/index.js
```

## BotFather Commands

Using BotFather you can modify your bot. This allows you to define a set of commands that are available for quick access.
After setting them up, an additional button should appear next to where you can type messaages. Clicking this button opens the quick access menu for commands.

```*
help - Display help message
validatordetails - Check validator details
croprice - Display CRO price
```

## .ENV

```sh
# Token given from BotFather after creating your bot
BOT_TOKEN = "telegram bot token"
# API Token received from CoinMarketCap
CMC_API_KEY = "coin market cap api key"
# API Token received from Crypto.com
CDC_API_KEY = "crypto com api key"

# Validator Address
VALIDATOR = "validator crocncl address"
# Validator Consensus Public Address
VALIDATOR_CONS_PUB_KEY = "validator crocnclconspub address"

# Full path to where the chain-maind executable is stored
CHAIN_MAIND = "full path including chain-maind executable"
# Chain-Maind node to query data from
# use "http://localhost:26657" if running your own node
CHAIN_MAIND_NODE = "https://mainnet.crypto.org:26657"
```

### Obtain validator consensus public key

First, query validator details. In there is a field called `consensus_pubkey` which should look similar like this:  

```*
consensus_pubkey: {
  '@type': '/cosmos.crypto.ed25519.PubKey',
  key: 'Agasur4Nrh+QWVwwGLMmFOSEJEfh8AUpglOgZ061aqc='
}
```

Afterwards execute `chain-maind debug publey $key` and replace the `$key` variable with the string/key in the output above.
If this was done correctly, you should get a result like this:

```*
./chain-maind.exe debug pubkey Agasur4Nrh+QWVwwGLMmFOSEJEfh8AUpglOgZ061aqc=

Address: EE7E127C36DC3BFD1152840A043CB3344548CC0D
Hex: 0206ACBABE0DAE1F90595C3018B32614E4842447E1F005298253A0674EB56AA7
JSON (base64): {"type":"tendermint/PubKeyEd25519","value":"Agasur4Nrh+QWVwwGLMmFOSEJEfh8AUpglOgZ061aqc="}
Bech32 Acc: cropub1zcjduepqqgr2ew47pkhplyzetscp3vexznjggfz8u8cq22vz2wsxwn44d2nsa96u7u
Bech32 Validator Operator: crocnclpub1zcjduepqqgr2ew47pkhplyzetscp3vexznjggfz8u8cq22vz2wsxwn44d2nsxrny99
Bech32 Validator Consensus: crocnclconspub1zcjduepqqgr2ew47pkhplyzetscp3vexznjggfz8u8cq22vz2wsxwn44d2ns2nrf0r
```

## Configuring Crypto Pairs

By default the bot does not show any pairs when performing the `/croprice` command.  
To add/remove/list pairs, there is the `/config` command:

### List all pairs

This command lists all added pairs grouped by API in the following format:  
`coinA - coinB [decimals]`

```sh
/config pair list

#Example output
Available Pairs:

[Crypto.com]
VVS - USDC [8]
CRO - USDC [5]

[Coinbase]
CRO - USD [5]
```

### Add/Update pair

> **Note:**
>
>- In order to update a pair (update decimals), execute the same command as you would to add a pair. This will overwrite the existing entry.
>- If the trading pair does not exist on the API, the `/croprice` command will return `NaN` for this pair

```sh
/config pair add {api} {coinA} {coinB} {decimals}

# Example command
/config pair add DCD CRO USDC 5

# Example output
Pair added!
CRO - USDT [5]
```

Parameters:

- `{api}` -> Either `CDC` for Crypto.com or `CB` from Coinbase are currently supported
- `{coinA}` -> first part of the trading pair
- `{coinB}` -> second part of the trading pair
- `{decimals}` -> number of decimals to show after the comma

### Remove pair

> **Note:** Even if the pair does not exists in the current config, the bot will still give you a success message.

```sh
/config pair remove {api} {coinA} {coinB}

# Example command
/config pair remove CDC CRO USDC

# Example output
Pair removed!
CRO - USDT
```
