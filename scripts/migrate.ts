import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
config({path:'.env.local'});config();
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL before running migrations.');
const pool=new Pool({connectionString:process.env.DATABASE_URL});
try{await pool.query(await readFile(new URL('../drizzle/0000_init.sql',import.meta.url),'utf8'));console.log('CRM schema ready. Each demo session seeds its own isolated records.');}finally{await pool.end();}
