import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Film, AlertCircle, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { getMovieEmbedUrl, ServerId, fetchMediaDetails } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WatchMoviePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const title = searchParams.get('title') || id;
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(false);
  const [server, setServer] = useState<ServerId>('1');

  useEffect(() => {
    async function checkMediaType() {
      if (!id) return;
      const { type } = await fetchMediaDetails(id);
      if (type === 'series') {
        const titleParam = title ? `?title=${encodeURIComponent(title)}` : '';
        navigate(`/tv/${id}/1/1${titleParam}`, { replace: true });
      }
    }
    checkMediaType();
  }, [id, title, navigate]);

  useEffect(() => {
    setShowFallback(false);

    // Show fallback options after 5 seconds if user might be seeing a 404
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Invalid media ID</p>
      </div>
    );
  }

  const handleAutoFallback = () => {
    navigate(`/tv/${id}/1/1?title=${encodeURIComponent(title || '')}`);
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
      // You could add a toast here, for now a simple alert or just silent copy
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
                <Film className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground capitalize">Movie</span>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">ID: {id}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModeSwitch('movie')}
              className="h-8 px-3 bg-primary/20 border-primary/50"
            >
              Movie
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModeSwitch('tv')}
              className="h-8 px-3 glass"
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
            Watching Movie: <span className="text-primary">{title}</span>
          </h1>
        </div>

        {/* Fallback UI - Now ABOVE the player */}
        {showFallback && (
          <div className="mb-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-strong border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">Video not loading?</h3>
                <p className="text-muted-foreground text-sm">
                  It might be a TV Series or anime. Try switching the mode above or use the quick switch:
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={handleAutoFallback}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  Try TV Series Mode
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Player */}
        <VideoPlayer
          key={`${id}-${server}`}
          embedUrl={getMovieEmbedUrl(id, server)}
          title={`Movie ${title}`}
          mediaId={id}
          mediaType="movie"
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
      </div>
    </main>
  );
}