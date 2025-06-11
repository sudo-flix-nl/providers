import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const baseUrl = 'https://bigback.dev.sudo-flix.nl';
  let url: string;

  if (ctx.media.type === 'movie') {
    url = `${baseUrl}/movie/${ctx.media.tmdbId}`;
  } else {
    url = `${baseUrl}/show/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;
  }

  const data = await ctx.proxiedFetcher.full(url, {
    headers: {
      redirect: 'manual',
      Range: 'bytes=0-511',
    },
  });

  if (!(data.statusCode >= 200 && data.statusCode < 300)) throw new NotFoundError('No media found.');

  const streamUrl = data.headers.get('location') || data.finalUrl;
  if (!streamUrl) throw new NotFoundError('No media URL found.');

  return {
    stream: [
      {
        id: 'bigback-dev',
        captions: [],
        qualities: {
          unknown: {
            type: 'mp4',
            url: streamUrl,
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