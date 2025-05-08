import dotenv from "dotenv";
import logger from "./logger";
import amq from "amqplib";

dotenv.config();

let connection = null;
let channel: amq.Channel | null = null;

const EXCHANGE_NAME = "message_event";

async function connectRabbitmq() {
    try {
        connection = await amq.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
        logger.info("connected to rabbitmq");
        return channel;
    } catch (error) {
        logger.error("Error connecting to rabbit mq", error);
    }
}

export default connectRabbitmq;

async function publishEvent(routingkey: string, message: any) {
    if (!channel) {
        await connectRabbitmq();
    }
    if (!channel) {
        logger.error("RabbitMQ channel is not available");
        return;
    }
    channel.publish(EXCHANGE_NAME, routingkey, Buffer.from(JSON.stringify(message)));
    logger.info("event published");
}

export { publishEvent };
