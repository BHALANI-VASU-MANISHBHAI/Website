import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    tls: process.env.REDIS_URL?.includes("rediss://") || true, // enable TLS
    rejectUnauthorized: false, // allow self-signed certs (Redis Cloud needs this)
  },
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error", err);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

export { redisClient };
