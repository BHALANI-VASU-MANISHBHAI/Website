import { createClient } from "redis";

const redisClient = createClient({
  username: "default",
  password: "EfOO0c34fFw3PyBii0g4WJCR8ALxy2w1",
  socket: {
    host: "redis-12872.c263.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 12872,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

export { redisClient };
