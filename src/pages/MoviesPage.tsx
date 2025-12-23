import { useState, useEffect, useRef, useCallback } from 'react';
import { Film } from 'lucide-react';
import MediaGrid from '@/components/MediaGrid';
import { searchMediaRemote, type MediaItem } from '@/lib/api';

const CATEGORIES = [
  { id: 'popular', label: 'Most popular', query: 'movie' },
  { id: 'rating', label: 'Most rating', query: 'top rated movie' },
  { id: 'recent', label: 'Most recent', query: 'movie' },
  { id: 'action', label: 'Action', query: 'action movie' },
  { id: 'adventure', label: 'Adventure', query: 'adventure movie' },
  { id: 'animation', label: 'Animation', query: 'animation movie' },
  { id: 'comedy', label: 'Comedy', query: 'comedy movie' },
  { id: 'crime', label: 'Crime', query: 'crime movie' },
  { id: 'documentary', label: 'Documentary', query: 'documentary' },
  { id: 'drama', label: 'Drama', query: 'drama movie' },
  { id: 'family', label: 'Family', query: 'family movie' },
  { id: 'fantasy', label: 'Fantasy', query: 'fantasy movie' },
  { id: 'history', label: 'History', query: 'history movie' },
  { id: 'horror', label: 'Horror', query: 'horror movie' },
  { id: 'music', label: 'Music', query: 'music movie' },
  { id: 'mystery', label: 'Mystery', query: 'mystery movie' },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Helper to generate year-based query
  const getQuery = (baseQuery: string, pageNum: number) => {
    // Page 1 -> 2024 (Current peak), Page 2 -> 2023, etc.
    // Starting with 2025 might be too sparse, 2024 is safer for "Popular"
    const year = 2025 - (pageNum - 1);
    const finalQuery = `${baseQuery} ${year}`;
    console.log(`[MoviesPage] Generated Query: "${finalQuery}" for Page ${pageNum}`);
    return finalQuery;
  };

  // Initial load or category change
  useEffect(() => {
    let isMounted = true;

    async function loadInitialMovies() {
      setLoading(true);
      setPage(1);
      setMovies([]);
      setHasMore(true);

      const category = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
      try {
        // Page 1
        const query = getQuery(category.query, 1);
        const results = await searchMediaRemote(query, 1);

        if (isMounted) {
          const moviesWithType = results.map(item => ({
            ...item,
            type: 'movie' as const
          }));

          setMovies(moviesWithType);
          if (results.length === 0) setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load movies:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialMovies();
    return () => { isMounted = false; };
  }, [activeCategory]);

  // Load more function - Stable callback
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    const category = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

    try {
      // Fetch next year's content
      const query = getQuery(category.query, nextPage);
      const results = await searchMediaRemote(query, nextPage); // Pass page just in case API supports it too

      if (results.length === 0) {
        // If a year returns 0, maybe we stop, or we could try skipping (but simpler to stop)
        // Check if we hit a really old year, stop
        if (2025 - (nextPage - 1) < 1990) setHasMore(false);
        else if (results.length === 0) {
          // For now, if empty, assume end of relevant content
          setHasMore(false);
        }
      } else {
        const newMovies = results.map(item => ({
          ...item,
          type: 'movie' as const
        }));

        setMovies(prev => {
          const uniqueNewMovies = newMovies.filter(
            newMovie => !prev.some(existing => existing.imdb_id === newMovie.imdb_id)
          );
          // If all duplicates (e.g. search overlap), stop infinite loop risk? 
          // But year change should prevent most duplicates.
          return [...prev, ...uniqueNewMovies];
        });
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more movies:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, activeCategory]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log('[MoviesPage] Observer triggered loadMore');
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
            <Film className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Movies</h1>
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
        <MediaGrid items={movies} loading={loading && movies.length === 0} />

        {/* Loading Indicator / Observer Target */}
        <div ref={observerTarget} className="py-8 flex justify-center h-20">
          {loading && hasMore && (
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {/* End of list message */}
          {!hasMore && movies.length > 0 && (
            <p className="text-gray-500">No more movies to load</p>
          )}
        </div>
      </div>
    </main>
  );
}
