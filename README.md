# Calucon Crypto Bot

Here i should write some text... soon...

## BotFather Commands

```*
validatordetails - Check Validator Details
croprice - Display CRO price
```

## .ENV

```env
BOT_TOKEN = "telegram bot token"
CMC_API_KEY = "coin market cap api key"
CDC_API_KEY = "crypto com api key"

VALIDATOR = "validator crocncl address"
VALIDATOR_CONS_PUB_KEY = "validator consensus public key (bech32)"

CHAIN_MAIND = "full path including chain-maind executable"
CHAIN_MAIND_NODE = "https://mainnet.crypto.org:26657"
```

### Obtain validator consensus public key

First, query validator details. In there is a field called `consensus_pubkey` which should look similar like this:  

```json
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
