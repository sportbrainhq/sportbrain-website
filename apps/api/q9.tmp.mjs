import postgres from 'postgres';
const sql=postgres(process.env.DATABASE_URL);
const r=await sql`select p.full_name, p.nationality, em.external_id qid
  from person p join external_mapping em on em.entity_id=p.id and em.provider='wikidata' and em.entity_type='person'
  where p.full_name in ('Lionel Messi','Kaká','Miroslav Klose','Cristiano Ronaldo','Pelé','Zinedine Zidane','Neymar','Diego Maradona')`;
for(const x of r) console.log(x.qid.padEnd(12), x.nationality?.padEnd(16), x.full_name);
await sql.end();
