import postgres from 'postgres';
import {writeFileSync} from 'fs';
const sql=postgres(process.env.DATABASE_URL);
const rows=await sql`select id, full_name, nationality from person`;
writeFileSync('/tmp/person_nationality_backup.json',JSON.stringify(rows));
console.log('backed up',rows.length,'person rows');
await sql.end();
