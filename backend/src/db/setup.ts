import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if(!DATABASE_URL) {
  console.error('Database url not found.');
}

// You can specify any property from the node-postgres connection options
export const db = drizzle({ 
  connection: { 
    connectionString: DATABASE_URL,
    ssl: true
  },
  schema
});
