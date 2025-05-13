import dotenv from "dotenv";
import logger from "./logger";
import amq from "amqplib";

dotenv.config();

let connection = null;
let channel: amq.Channel | null = null;

const EXCHANGE_NAME = "message_event";
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

async function connectRabbitmq() {
    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
        try {
            connection = await amq.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
            channel = await connection.createChannel();
            await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
            logger.info("connected to rabbitmq");
            return channel;
        } catch (error) {
            retryCount++;
            logger.error(`Error connecting to rabbit mq (attempt ${retryCount}/${MAX_RETRIES}):`, error);
            if (retryCount < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                logger.error("Failed to connect to RabbitMQ after multiple retries.");
                throw error; // Re-throw the error after all retries fail
            }
        }
    }
    return null; // Should not reach here if the loop works correctly
}

export default connectRabbitmq

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
