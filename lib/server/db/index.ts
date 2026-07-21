// Guards the connection string against ever being pulled into a client bundle.
// The schema files deliberately omit this — drizzle-kit loads them outside Next.
import "server-only";

import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.PG_CONNECTION_STRING as string);
export default db;
