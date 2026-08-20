import postgres from 'postgres';
const sql=postgres(process.env.DATABASE_URL);
const r=await sql`
  with ranked as (
    select pt.*, row_number() over (
        partition by pt.person_id, pt.team_id, pt.role, coalesce(pt.start_date,'1000-01-01')
        order by
          case when pt.end_date is null then 3
               when extract(month from pt.end_date)=1  and extract(day from pt.end_date)=1  then 2
               when extract(month from pt.end_date)=12 and extract(day from pt.end_date)=31 then 1
               else 0 end,
          pt.end_date desc nulls last, pt.id) rn
    from person_team pt)
  select p.full_name, t.name team,
         to_char(min(k.end_date),'YYYY-MM-DD') kept_end,
         count(*) filter (where k.rn=1)::int keepers,
         count(*) filter (where k.rn>1)::int dropped,
         array_agg(to_char(k.end_date,'YYYY-MM-DD') order by k.rn) all_ends
  from ranked k join person p on p.id=k.person_id join team t on t.id=k.team_id
  where (k.person_id,k.team_id,k.role,coalesce(k.start_date,'1000-01-01')) in (
    select person_id,team_id,role,coalesce(start_date,'1000-01-01') from person_team
    group by 1,2,3,4 having count(*)>1)
  group by p.full_name, t.name
  order by p.full_name limit 12`;
for(const x of r) console.log(`${x.full_name.slice(0,22).padEnd(24)} ${x.team.slice(0,24).padEnd(26)} keeps=${String(x.all_ends[0])} drops=[${x.all_ends.slice(1).join(', ')}]`);
// Does any group lose its only non-null end date?
const bad=await sql`
  with ranked as (
    select pt.*, row_number() over (
        partition by pt.person_id, pt.team_id, pt.role, coalesce(pt.start_date,'1000-01-01')
        order by
          case when pt.end_date is null then 3
               when extract(month from pt.end_date)=1  and extract(day from pt.end_date)=1  then 2
               when extract(month from pt.end_date)=12 and extract(day from pt.end_date)=31 then 1
               else 0 end,
          pt.end_date desc nulls last, pt.id) rn
    from person_team pt)
  select count(*)::int c from (
    select person_id,team_id,role,coalesce(start_date,'1000-01-01') s
    from ranked group by 1,2,3,4
    having bool_or(rn=1 and end_date is null) and bool_or(rn>1 and end_date is not null)) x`;
console.log('\ngroups where a null end date is kept over a real one:',bad[0].c);
await sql.end();
