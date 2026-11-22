import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const globalForAuth = globalThis as unknown as {
  mongoClient?: MongoClient;
  betterAuthInstance?: ReturnType<typeof createAuth>;
};

function getMongoClient(): MongoClient {
  if (!globalForAuth.mongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is required for Better Auth");
    }
    globalForAuth.mongoClient = new MongoClient(uri);
  }
  return globalForAuth.mongoClient;
}

function createAuth() {
  const client = getMongoClient();
  const db = client.db();
  const baseURL = (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    database: mongodbAdapter(db, { client }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins: [baseURL],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    ...(googleClientId && googleClientSecret
      ? {
          socialProviders: {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          },
        }
      : {}),
    user: {
      modelName: "users",
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
          input: false,
        },
        isBlocked: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        phone: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
    plugins: [
      jwt({
        jwt: {
          issuer: baseURL,
          audience: baseURL,
          expirationTime: "15m",
        },
      }),
      nextCookies(),
    ],
  });
}

/**
 * Lazily creates and caches the Better Auth server instance so Next.js build
 * evaluation does not require runtime MongoDB credentials.
 */
export function getAuth() {
  if (!globalForAuth.betterAuthInstance) {
    globalForAuth.betterAuthInstance = createAuth();
  }
  return globalForAuth.betterAuthInstance;
}
