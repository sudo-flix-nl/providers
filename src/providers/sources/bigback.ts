import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  console.log("Scraping!")
  const baseUrl = 'https://bigback.dev.sudo-flix.nl';
  let url: string;

  if (ctx.media.type === 'movie') {
    url = `${baseUrl}/movie/${ctx.media.tmdbId}`;
  } else {
    url = `${baseUrl}/show/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;
  }
  console.log(`Boutta make the request to ${url}`)
  const data = await ctx.fetcher.full(url, { // Will implement an is_available endpoint in the bigback later, so its a little easier.
    headers: {
      Range: 'bytes=0-511',
    },
  });

  console.log(data)

  if (!(data.statusCode >= 200 && data.statusCode < 300)) throw new NotFoundError('No media found.');

  return {
    stream: [
      {
        id: 'bigback-dev',
        captions: [],
        qualities: {
          unknown: {
            type: 'mp4',
            url,
          },
        },
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
  rank: 300,
  disabled: false,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});