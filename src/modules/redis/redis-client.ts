import { createClient } from "redis";
import { Redis as IoRedis } from "ioredis";

import { config } from "../../config";

export class RedisClient {
  private static instance: RedisClient;

  static async init() {
    if (this.instance) {
      return;
    }
    this.instance = new RedisClient();
    await this.instance.connect();
  }

  static getInstance(): RedisClient {
    if (!this.instance) {
      throw new Error("RedisClient not initialized");
    }
    return this.instance;
  }

  public connected: boolean = false;

  public readonly ioClient: IoRedis;
  public readonly nodeClient: ReturnType<typeof createClient>;

  constructor() {
    this.ioClient = this.createIoClient();
    this.nodeClient = this.createNodeClient();
  }

  private createNodeClient() {
    const client = createClient({
      url: config.redisUrl,
      socket: {
        reconnectStrategy: (retries, cause) => {
          if (retries > 5) return false;

          const exponentialDelay = Math.min(Math.pow(2, retries) * 50, 2000);

          return exponentialDelay;
        },
      },
    });

    client.on("error", (error) => this.handleError(error));
    client.on("disconnect", () => this.handleDisconnect());

    return client;
  }

  private createIoClient() {
    const client = new IoRedis(config.redisUrl, {
      lazyConnect: true,
    });

    client.on("error", (error) => this.handleError(error));
    client.on("disconnect", () => this.handleDisconnect());

    return client;
  }

  private handleDisconnect() {
    this.connected = false;
    console.log("Disconnected from Redis");
  }

  private handleError(error: Error) {
    this.connected = false;
    console.error("Redis connection error:", error);
  }

  private async connect() {
    try {
      await this.nodeClient.connect();
      await this.ioClient.connect();
      this.connected = true;
      console.log("Connected to Redis successfully");
    } catch (error) {
      this.connected = false;
      console.error("Failed to connect to Redis", error);
    }
  }
}
