import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

const baseUrl = 'https://bigback.dev.sudo-flix.nl';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const mediaType = ctx.media.type;
  const movieId = ctx.media.tmdbId;

  const watchPageUrl =
    mediaType === 'movie'
      ? `${baseUrl}/movie/${movieId}`
      : `${baseUrl}/show/${ctx.media.episode.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;

  ctx.progress(50);

  const resp = await fetch(watchPageUrl, {headers: {"content-range": "bytes 0-512"}});

  if (!(resp.status >= 200 && resp.status < 300)) throw new NotFoundError('No media found.')

  ctx.progress(90);

  return {
      embeds: [],
      stream: [
        {
          id: 'primary',
          type: 'file',
          qualities: {
            "unknown": {
              type: 'mp4',
              url: watchPageUrl
            },
          },
          flags: [],
          captions: [],
        },
      ],
  };
}

export const bigbackScraper = makeSourcerer({
  id: 'bigback',
  name: 'bigback',
  rank: 100000,
  disabled: false,
  flags: [],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
