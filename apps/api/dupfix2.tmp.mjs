import postgres from 'postgres';
const sql=postgres(process.env.DATABASE_URL);
// Rank within each (person, team, role, start_date) group and keep exactly one.
// Preference: a precise end date, then a Dec-31 year-end (the correct reading of
// "ended that year"), then Jan-01, then null. Ties broken by id for determinism.
const doomed=await sql`
  with ranked as (
    select pt.id, pt.person_id, pt.team_id, pt.role, pt.start_date, pt.end_date,
      row_number() over (
        partition by pt.person_id, pt.team_id, pt.role, coalesce(pt.start_date,'1000-01-01')
        order by
          case
            when pt.end_date is null then 3
            when extract(month from pt.end_date)=1  and extract(day from pt.end_date)=1  then 2
            when extract(month from pt.end_date)=12 and extract(day from pt.end_date)=31 then 1
            else 0
          end,
          pt.end_date desc nulls last,
          pt.id
      ) rn
    from person_team pt
  )
  select r.id, p.full_name, t.name team,
         to_char(r.start_date,'YYYY-MM-DD') starts, to_char(r.end_date,'YYYY-MM-DD') ends
  from ranked r join person p on p.id=r.person_id join team t on t.id=r.team_id
  where r.rn > 1 order by p.full_name limit 4000`;
console.log('rows to delete:',doomed.length);
doomed.slice(0,10).forEach(d=>console.log(`   ${d.full_name} / ${d.team}: ${d.starts} -> ${d.ends}`));
await sql.end();
