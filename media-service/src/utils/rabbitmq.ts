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

async function consumeEvent(
    routingKey: string,
    callback: (msg: any| null) => void
) {
    if (!channel) {
        await connectRabbitmq();
    }

    if (!channel) {
        logger.error("RabbitMQ channel is not available");
        return;
    }

    // Create a temporary, exclusive queue
    const q = await channel.assertQueue("", { exclusive: true });

    // Bind the queue to the exchange with the routing key
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    // Consume messages from the queue
    channel.consume(q.queue, (msg) => {
        if (msg !== null) {
           const content=JSON.parse(msg.content.toString())
           callback(content)
           channel?.ack(msg)
        }
    });

    logger.info(`Consuming events for routing key: ${routingKey}`);
}


export { publishEvent ,consumeEvent};
