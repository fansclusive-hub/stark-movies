import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Tv, ChevronDown, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { getTVEmbedUrl, ServerId, fetchTVShowDetails, fetchSeasonDetails, fetchMediaDetails } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function WatchTVPage() {
  const { id, season = '1', episode = '1' } = useParams<{
    id: string;
    season: string;
    episode: string;
  }>();
  const [searchParams] = useSearchParams();
  const title = searchParams.get('title') || id;
  const navigate = useNavigate();
  const [server, setServer] = useState<ServerId>('1');
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkMediaType() {
      if (!id) return;
      const { type } = await fetchMediaDetails(id);
      if (type === 'movie') {
        const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
        navigate(`/movie/${id}${titleParam}`, { replace: true });
      }
    }
    checkMediaType();
  }, [id, title, navigate]);

  if (!id) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Invalid TV show ID</p>
      </div>
    );
  }

  const currentSeason = parseInt(season) || 1;
  const currentEpisode = parseInt(episode) || 1;
  const embedUrl = getTVEmbedUrl(id, currentSeason, currentEpisode, server);

  // Fetch metadata effects
  useEffect(() => {
    async function loadShowDetails() {
      if (!id) return;
      const details = await fetchTVShowDetails(id);
      setTotalSeasons(details.totalSeasons);
    }
    loadShowDetails();
  }, [id]);

  useEffect(() => {
    async function loadSeasonDetails() {
      if (!id) return;
      setLoading(true);
      const details = await fetchSeasonDetails(id, currentSeason);
      setTotalEpisodes(details.episodes);
      setLoading(false);
    }
    loadSeasonDetails();
  }, [id, currentSeason]);

  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);
  const episodes = Array.from({ length: Math.max(totalEpisodes, 1) }, (_, i) => i + 1);

  const handleSeasonChange = (newSeason: string) => {
    const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
    navigate(`/tv/${id}/${newSeason}/1${titleParam}`);
  };

  const handleEpisodeChange = (newEpisode: string) => {
    const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
    navigate(`/tv/${id}/${currentSeason}/${newEpisode}${titleParam}`);
  };

  const handleModeSwitch = (newMode: 'movie' | 'tv' | 'anime') => {
    const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
    if (newMode === 'movie') navigate(`/movie/${id}${titleParam}`);
    else if (newMode === 'tv') navigate(`/tv/${id}/1/1${titleParam}`);
    else if (newMode === 'anime') navigate(`/anime/${id}/1/sub${titleParam}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>

        {/* Media info */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">TV Series</span>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">ID: {id}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModeSwitch('movie')}
              className="h-8 px-3 glass"
            >
              Movie
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModeSwitch('tv')}
              className="h-8 px-3 bg-primary/20 border-primary/50"
            >
              TV Series
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModeSwitch('anime')}
              className="h-8 px-3 glass"
            >
              Anime
            </Button>

          </div>
        </div>

        {/* Title above player */}
        <div className="mb-6 max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Watching: <span className="text-primary">{title}</span>
            <span className="ml-3 text-lg font-normal text-muted-foreground">S{currentSeason} E{currentEpisode}</span>
          </h1>
        </div>

        {/* Video Player */}
        <VideoPlayer
          key={`${id}-${currentSeason}-${currentEpisode}-${server}`}
          embedUrl={embedUrl}
          title={`TV Show ${title} S${currentSeason}E${currentEpisode}`}
          mediaId={id}
          mediaType="tv"
          season={currentSeason}
          episode={currentEpisode}
        />

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setServer('1')}
              className={cn(
                "h-9 px-6 transition-all duration-300",
                server === '1'
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  : "glass hover:bg-white/10"
              )}
            >
              Server 1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setServer('2')}
              className={cn(
                "h-9 px-6 transition-all duration-300",
                server === '2'
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  : "glass hover:bg-white/10"
              )}
            >
              Server 2
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-9 px-6 glass gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          <p className="text-muted-foreground text-xs text-center max-w-md">
            Switch to VidPlay or any other cloud if UpCloud doesn't load.
            If one server fails, try the other.
          </p>
        </div>

        {/* Season/Episode Controls */}
        <div className="mt-6 max-w-6xl mx-auto">
          <div className="glass-strong rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Season Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Season</span>
                <Select value={currentSeason.toString()} onValueChange={handleSeasonChange}>
                  <SelectTrigger className="w-24 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {seasons.map((s) => (
                      <SelectItem key={s} value={s.toString()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Episode Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Episode</span>
                <Select value={currentEpisode.toString()} onValueChange={handleEpisodeChange} disabled={loading}>
                  <SelectTrigger className="w-24 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {episodes.map((e) => (
                      <SelectItem key={e} value={e.toString()}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current info */}
              <div className="ml-auto text-sm text-muted-foreground">
                Now watching: <span className="text-foreground font-medium">Season {currentSeason}, Episode {currentEpisode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}