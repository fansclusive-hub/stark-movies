import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import MediaGrid from '@/components/MediaGrid';
import { searchMediaRemote, type MediaItem } from '@/lib/api';

const CATEGORIES = [
  { id: 'popular', label: 'Popular Anime', query: 'anime' },
  { id: 'shonen', label: 'Shonen', query: 'shonen anime' },
  { id: 'seinen', label: 'Seinen', query: 'seinen anime' },
  { id: 'isekai', label: 'Isekai', query: 'isekai anime' },
  { id: 'action', label: 'Action', query: 'action anime' },
  { id: 'romance', label: 'Romance', query: 'romance anime' },
  { id: 'fantasy', label: 'Fantasy', query: 'fantasy anime' },
  { id: 'slice_of_life', label: 'Slice of Life', query: 'slice of life anime' },
  { id: 'drama', label: 'Drama', query: 'drama anime' },
  { id: 'sci-fi', label: 'Sci-Fi', query: 'sci-fi anime' },
  { id: 'horror', label: 'Horror', query: 'horror anime' },
  { id: 'movie', label: 'Movies', query: 'anime movie' },
];

export default function AnimePage() {
  const [anime, setAnime] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Helper to generate year-based query for Anime
  const getQuery = (baseQuery: string, pageNum: number) => {
    // Page 1 -> 2024, Page 2 -> 2023, etc.
    const year = 2025 - (pageNum - 1);
    const finalQuery = `${baseQuery} ${year}`;
    console.log(`[AnimePage] Generated Query: "${finalQuery}" for Page ${pageNum}`);
    return finalQuery;
  };

  // Initial load or category change
  useEffect(() => {
    let isMounted = true;

    async function loadInitialAnime() {
      setLoading(true);
      setPage(1);
      setAnime([]);
      setHasMore(true);

      const category = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
      try {
        const query = getQuery(category.query, 1);
        const results = await searchMediaRemote(query, 1);

        if (isMounted) {
          const animeWithType = results.map(item => ({
            ...item,
            type: 'anime' as const
          }));

          setAnime(animeWithType);
          if (results.length === 0) setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load anime:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialAnime();
    return () => { isMounted = false; };
  }, [activeCategory]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    const category = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

    try {
      const query = getQuery(category.query, nextPage);
      const results = await searchMediaRemote(query, nextPage);

      if (results.length === 0) {
        if (2025 - (nextPage - 1) < 1990) setHasMore(false);
        else setHasMore(false);
      } else {
        const newAnime = results.map(item => ({
          ...item,
          type: 'anime' as const
        }));

        setAnime(prev => {
          const uniqueNewAnime = newAnime.filter(
            newItem => !prev.some(existing => existing.imdb_id === newItem.imdb_id)
          );
          return [...prev, ...uniqueNewAnime];
        });
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more anime:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, activeCategory]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore, loading]);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header and Tabs */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Anime</h1>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide border-b border-white/10">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`text-sm md:text-base whitespace-nowrap pb-2 font-medium transition-colors relative group ${activeCategory === category.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                {category.label}
                {/* Active Indicator (Red Line) */}
                {activeCategory === category.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
                {/* Hover Indicator (Subtle) */}
                {activeCategory !== category.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Grid */}
        <MediaGrid items={anime} loading={loading && anime.length === 0} />

        {/* Loading Indicator / Observer Target */}
        <div ref={observerTarget} className="py-8 flex justify-center h-20">
          {loading && hasMore && (
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {!hasMore && anime.length > 0 && (
            <p className="text-gray-500">No more anime to load</p>
          )}
        </div>
      </div>
    </main>
  );
}
