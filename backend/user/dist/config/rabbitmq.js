import amqp from "amqplib";
let channel;
export const ConnectRabbitmq = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password
        });
        channel = await connection.createChannel();
        console.log("connected to Rabbitmq ✅");
    }
    catch (error) {
        console.error("failed to connect to rabbit", error);
    }
};
export const publishTOQueue = async (queueName, message) => {
    if (!channel) {
        console.log("rabbitmq channel is not initalized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true
    });
};
//# sourceMappingURL=rabbitmq.js.map