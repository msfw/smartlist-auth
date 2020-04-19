const rabbitProcessor = require('../RabbitConnector.js')

const subscriberBase = (queues = [], OnCaptureMessage) => {
    rabbitProcessor((channel) => {
        if (queues) {
            queues.forEach(queue => {
                channel.assertQueue(queue.name, queue.options)
                channel.consume(queue.name, (msg) => {
                    try {
                        OnCaptureMessage(msg.content.toString())
                    } catch (error) {
                        console.error(error)
                    }
                }, queue.consumeOptions)
            })
        } else
            console.error("Please inform queues to subscriber.")
    }, true)
}

module.exports = subscriberBase