import { WikipediaClient } from './src/integrations/providers/wikipedia/wikipedia.client';
import { WikipediaProvider } from './src/integrations/providers/wikipedia/wikipedia.provider';

async function main() {
  const client = new WikipediaClient();
  const provider = new WikipediaProvider(client);
  for (const title of [
    'Jon Jones',
    'Amanda Nunes',
    'Khabib Nurmagomedov',
    'Fedor Emelianenko',
    'Andrew Tate',
  ]) {
    console.log(title, ':', await provider.fetchMmaTitles(title));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
