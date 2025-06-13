import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  console.log("Scraping!")
  const baseUrl = 'https://bigback-dev.sudo-flix.nl';
  let url: string;

  url = ctx.media.type === 'movie' ? 
    `${baseUrl}/availability/movie/${ctx.media.tmdbId}` : 
    `${baseUrl}/availability/show/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;
  
  console.log(`Boutta make the request to ${url}`)
  const resp = await fetch(url);

  if (resp.status !== 200) throw new NotFoundError('No media found.');

  const quals = await resp.json()

  let qualities: { [key: string]: any } = {}

  quals.forEach((element: string) => {
    qualities[element] = {
      type: 'mp4',
      url: ctx.media.type === "movie" ? 
        `${baseUrl}/stream/movie/${ctx.media.tmdbId}/${element}` : 
        `${baseUrl}/stream/show/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}/${element}`
    }
  });

  return {
    stream: [
      {
        id: 'bigback-dev',
        captions: [],
        qualities,
        type: 'file',
        flags: [flags.CORS_ALLOWED],
      },
    ],
    embeds: [],
  };
}

export const bigbackScraper = makeSourcerer({
  id: 'bigback',
  name: 'Bigback',
  rank: 150,
  disabled: false,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});