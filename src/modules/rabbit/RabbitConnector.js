const amqp = require('amqplib/callback_api')
const rabbitUrl = `amqp://${process.env.RABBIT_SERVER}:${process.env.RABBIT_PORT}`

const rabbitProcessor = (rabbitCommand, isSubscriber = false) => {
    amqp.connect(rabbitUrl, (err, connection) => {
        if (err) throw err;
        connection.createChannel((err, channel) => {
            if (err) throw err;
            rabbitCommand(channel)
        })
        if (!isSubscriber)
            setTimeout(() => {
                connection.close();                
            }, 500);
    })
}

module.exports = rabbitProcessor;