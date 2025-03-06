import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL, // Use a single URL for Redis connection
  socket: {
    reconnectStrategy: (retries) => {
      console.warn(` Redis reconnect attempt: ${retries}`);
      if (retries > 5) return false;
      return Math.min(retries * 200, 5000);
    },
  },
});

redisClient.on("connect", () => console.log("✅ Redis Client Connected"));
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.ping();
  } catch (err) {
    console.error("🔥 Redis connection failed:", err);
    process.exit(1);
  }
})();


export default redisClient;