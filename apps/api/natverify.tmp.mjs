import postgres from 'postgres';
import {readFileSync} from 'fs';
const before=new Map(JSON.parse(readFileSync('/tmp/person_nationality_backup.json','utf8')).map(r=>[r.id,r]));
const sql=postgres(process.env.DATABASE_URL);
console.log('--- reported cases ---');
for(const n of ['Lionel Messi','Kaká','Miroslav Klose','Cristiano Ronaldo','Pelé','Neymar','Zinedine Zidane','Diego Maradona','Ben Stokes','Mario Andretti'])
  console.log('  ',(await sql`select full_name,nationality from person where full_name=${n} limit 1`)[0]);
const now=await sql`select id,full_name,nationality from person`;
let changed=0,nulled=0;
for(const r of now){const b=before.get(r.id);if(!b)continue;
  if(b.nationality!==r.nationality)changed++;
  if(b.nationality&&!r.nationality)nulled++;}
console.log(`\nchanged=${changed} newly-null=${nulled}`);
console.log('\n--- top nationality values now ---');
console.log(await sql`select nationality, count(*)::int from person where nationality is not null group by 1 order by 2 desc limit 12`);
await sql.end();
