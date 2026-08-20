import postgres from 'postgres';
import {writeFileSync} from 'fs';
const sql=postgres(process.env.DATABASE_URL);
const r=await sql`select p.id, p.full_name, p.nationality, em.external_id qid
  from person p join external_mapping em on em.entity_id=p.id and em.provider='wikidata' and em.entity_type='person'
  order by p.notability desc nulls last`;
writeFileSync('/tmp/qids.json',JSON.stringify(r));
console.log('people with wikidata qid:',r.length);
console.log('with nationality set:',r.filter(x=>x.nationality).length);
await sql.end();
