import postgres from 'postgres';
import {createHash} from 'crypto';
const ALLOWED=[20,40,60,120,250,500,960,1280];
const aw=w=>ALLOWED.find(x=>x>=w)??1280;
const shardOf=f=>{const h=createHash('md5').update(f,'utf8').digest('hex');return `${h[0]}/${h[0]}${h[1]}`};
function thumbnail(base,shard,filename,width){
  const e=encodeURIComponent(filename).replace(/%2F/g,'/');const l=filename.toLowerCase();
  if(l.endsWith('.svg'))return `${base}/thumb/${shard}/${e}/${width}px-${e}.png`;
  if(l.endsWith('.png')||l.endsWith('.jpg')||l.endsWith('.jpeg'))return `${base}/thumb/${shard}/${e}/${width}px-${e}`;
  return `${base}/${shard}/${e}`;
}
export function imageUrl(source,width=160){
  if(!source)return null;const target=aw(width);
  const url=source.replace(/^http:\/\//,'https://');
  const fp=url.match(/Special:FilePath\/([^?#]+)/);
  if(fp){const fn=decodeURIComponent(fp[1]??'').replace(/ /g,'_');
    return thumbnail('https://upload.wikimedia.org/wikipedia/commons',shardOf(fn),fn,target);}
  const t=url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/thumb\/([^/]+\/[^/]+\/[^/]+)\/\d+px-([^/?#]+)/);
  if(t){const[,h,p,r]=t;return `${h}/thumb/${p}/${target}px-${r}`;}
  return url.replace(/[?&]utm_[^&]*/g,'').replace(/\?$/,'');
}
const sql=postgres(process.env.DATABASE_URL);
const rows=await sql`select name, logo_url from team where logo_url is not null order by name`;
await sql.end();
let ok=0;const fails=[];
const CONC=4;let i=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchRetry(u){
  for(let a=0;a<4;a++){
    const res=await fetch(u,{method:'HEAD',redirect:'follow',headers:{'User-Agent':'SportBrain/1.0 (crest availability check; contact yash@studiographene.com)'}});
    if(res.status===429){await sleep(1500*(a+1));continue;}
    return res;
  }
  return {ok:false,status:'429x4',headers:{get:()=>''}};
}
async function worker(){
  while(i<rows.length){const r=rows[i++];const u=imageUrl(r.logo_url,80);
    try{const res=await fetchRetry(u);
      if(res.ok&&(res.headers.get('content-type')||'').startsWith('image/'))ok++;
      else fails.push([res.status,r.name,r.logo_url,u]);
    }catch(e){fails.push(['ERR',r.name,r.logo_url,e.message]);}
    await sleep(60);}
}
await Promise.all(Array.from({length:CONC},worker));
console.log(`total=${rows.length} ok=${ok} bad=${fails.length}`);
console.log('--- failures ---');
for(const f of fails)console.log(f[0],'|',f[1],'|',f[3]);
