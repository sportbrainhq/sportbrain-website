import postgres from 'postgres';
import {readFileSync} from 'fs';
const updates=JSON.parse(readFileSync('/tmp/updates.json','utf8'));
const sql=postgres(process.env.DATABASE_URL);
let n=0;
await sql.begin(async (tx)=>{
  for(const u of updates){
    const r=await tx`update person set nationality=${u.to}, updated_at=now() where id=${u.id}`;
    n+=r.count;
  }
});
console.log('rows updated:',n,'of',updates.length);
await sql.end();
