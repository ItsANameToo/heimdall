'use strict'

const axios = require("axios")
const resolve = require("path").resolve
const delay = require("delay")
const pluralize = require('pluralize')
const slots = require("@arkecosystem/crypto").slots

exports.plugin = {
    pkg: require('../package.json'),
    defaults: {
        enabled: false
    },
    async register (container, options) {
        if (!options.enabled) {
            return
        }

        const logger = container.resolvePlugin('logger')
        const emitter = container.resolvePlugin('event-emitter')
        const dbService = container.resolvePlugin('database')
        const blockchain = container.resolvePlugin('blockchain')
        const config = container.getConfig()

        logger.info('[HEIMDALL] Reporting for duty! I\'ll keep you informed about forging!')

        emitter.on('block.applied', async block => {
            try {
                const lastBlock = blockchain.getLastBlock()
                const delegatesCount = config.getMilestone(lastBlock).activeDelegates
                const currentSlot = slots.getSlotNumber(lastBlock.data.timestamp)

                let activeDelegates = await dbService.getActiveDelegates(lastBlock.data.height)
                activeDelegates = activeDelegates.map(delegate => delegate.publicKey)

                const nextForgers = []
                for (let i = 1; i <= delegatesCount; i++) {
                    const delegate = activeDelegates[(currentSlot + i) % delegatesCount]

                    if (delegate) {
                        nextForgers.push(delegate)
                    }
                }

                // Only log this if user wants to see it
                if (options.forgingOrder.enabled) {
                    const limit = options.forgingOrder.limit || 5
                    let nextForgerNames = []
                    nextForgerNames = nextForgers.slice(0, limit).map(pubkey => dbService.walletManager.findByPublicKey(pubkey).username)
                    logger.debug(`[HEIMDALL] forging order: ${JSON.stringify(nextForgerNames)}`)
                }

                // Loop over pubkeys to check when it's our turn to forge
                let secondsToForge = 0
                for (let i = 0; i < nextForgers.length; i++) {
                    if (nextForgers[i] === options.publicKey) break
                    secondsToForge += 8
                }
                const minutes = Math.floor(secondsToForge / 60)
                const seconds = secondsToForge % 60
                const timeToForge = minutes ? minutes + 'm ' + seconds + 's' : seconds + 's'

                // Calculate time left until round's end
                const secondUntilRoundEnd = (delegatesCount - (lastBlock.data.height % delegatesCount)) * 8
                const roundMin = Math.floor(secondUntilRoundEnd / 60)
                const roundSec = secondUntilRoundEnd % 60
                const timeUntilRoundEnd = roundMin ? roundMin + 'm ' + roundSec + 's' : roundSec + 's'

                // checkmark = forging slot has passed, hourglass = forging spot still to come
                const forgeEmoji = secondsToForge > secondUntilRoundEnd ? ':trident:' : ':hourglass_flowing_sand:'

                logger.debug(`[HEIMDALL] ${options.delegate} - time until forging: ${timeToForge} ${forgeEmoji} | round end: ${timeUntilRoundEnd}`)
            } catch (error) {
                logger.debug(`[HEIMDALL] could not get forging order: ${error}`)
            }
        })
    }
}