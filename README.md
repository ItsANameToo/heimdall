# Heimdall

> Delegate forging order plugin

## Features

- Show the time until it's your turn to forge
- Show if you have already forged in the current round
- Show time until end of round
- Show list of next forging delegates

## Installation

### Clone

Note that this is for core v2.2+ only

```bash
yarn global add @itsanametoo/heimdall
```

### Register Plugin

Edit the plugin config file located at:

`~/.config/ark-core/{mainnet|devnet|testnet}/plugins.js`

Add the following snippet to the end of the file (or at least after core-p2p gets included):

```javascript
module.exports = {
    '@arkecosystem/core-event-emitter': {},
    '@arkecosystem/core-logger-winston': {},
    ...
    // Snippet to add
    '@itsanametoo/heimdall': {
        enabled: true, // Enables the plugin, default value is false
        publicKey: 'examplePublicKey1', // The public key of your delegate wallet
        delegate: 'username', // The username of the delegate
        forgingOrder: {
            enabled: true, // Enables the forging order logging (per block)
            limit: 5 // The amount of delegates it will show
        }
    }
}
```

### Enabling

Before the plugin will be picked up by the core implementation, you need to restart the process. The easiest way to achieve this is by running the `pm2 restart all` command. Afterwards you can check if everything is running fine again with the `pm2 logs` command.

### Example Logs

#### Default time-until-forging:

`[HEIMDALL] itsanametoo - time until forging: 1m 4s ⏳ | round end: 1m 28s`

This log line contains the following information:

* the delegate that we are looking out for (`itsanametoo` in this case)
* the time until it's our turn to forge (`1m 4s` in this case)
* an emoji indicating whether we are still due to forge in this round (hourglass ⏳) or have already passed our slot (trident 🔱). _Note that this is not an indication whether the node successfully forged, only whether the slot has passed_
* and lastly the amount of time left until the round ends (`1m 28s` in this case)

#### Optional forging order:

`[HEIMDALL] forging order: ["darkface","darkdel","boldninja","genesis_34","techbytes"]`

When enabled, this shows (per block) the order of the next `n` delegates that will be forging.
By default it will show 5 delegates, but you can customize this to your liking.

## Update Notes

In case of updates, this section will describe the steps needed to successfully update the plugin if there are any additional steps

## Credits

- [ItsANameToo](https://github.com/itsanametoo)
- [All Contributors](../../contributors)

## License

[MIT](LICENSE) © ItsANameToo
