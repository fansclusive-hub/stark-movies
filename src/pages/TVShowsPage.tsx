import { useState, useEffect, useRef, useCallback } from 'react';
import { Tv } from 'lucide-react';
import MediaGrid from '@/components/MediaGrid';
import { searchMediaRemote, type MediaItem } from '@/lib/api';

const CATEGORIES = [
  { id: 'popular', label: 'Popular Series', query: 'series' },
  { id: 'action', label: 'Action', query: 'action series' },
  { id: 'comedy', label: 'Comedy', query: 'comedy series' },
  { id: 'crime', label: 'Crime', query: 'crime series' },
  { id: 'drama', label: 'Drama', query: 'drama series' },
  { id: 'family', label: 'Family', query: 'family series' },
  { id: 'fantasy', label: 'Fantasy', query: 'fantasy series' },
  { id: 'horror', label: 'Horror', query: 'horror series' },
  { id: 'mystery', label: 'Mystery', query: 'mystery series' },
  { id: 'sci-fi', label: 'Sci-Fi', query: 'sci-fi series' },
  { id: 'thriller', label: 'Thriller', query: 'thriller series' },
  { id: 'documentary', label: 'Documentary', query: 'documentary series' },
];

export default function TVShowsPage() {
  const [shows, setShows] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Helper to generate year-based query for Series
  const getQuery = (baseQuery: string, pageNum: number) => {
    // Page 1 -> 2024 (Current peak), Page 2 -> 2023, etc.
    const year = 2025 - (pageNum - 1);
    const finalQuery = `${baseQuery} ${year}`;
    console.log(`[TVShowsPage] Generated Query: "${finalQuery}" for Page ${pageNum}`);
    return finalQuery;
  };

  // Initial load or category change
  useEffect(() => {
    let isMounted = true;

    async function loadInitialShows() {
      setLoading(true);
      setPage(1);
      setShows([]);
      setHasMore(true);

      const category = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
      try {
        const query = getQuery(category.query, 1);
        const results = await searchMediaRemote(query, 1);

        if (isMounted) {
          const showsWithType = results.map(item => ({
            ...item,
            type: 'series' as const // Using 'series' as usually mapped, or 'tv' if api expects but 'series' is common for UI
          }));

          setShows(showsWithType);
          if (results.length === 0) setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load shows:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialShows();
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
        // Stop if year is too old or just empty
        if (2025 - (nextPage - 1) < 1990) setHasMore(false);
        else setHasMore(false);
      } else {
        const newShows = results.map(item => ({
          ...item,
          type: 'series' as const
        }));

        setShows(prev => {
          const uniqueNewShows = newShows.filter(
            newShow => !prev.some(existing => existing.imdb_id === newShow.imdb_id)
          );
          return [...prev, ...uniqueNewShows];
        });
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more shows:', error);
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
            <Tv className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">TV Series</h1>
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
        <MediaGrid items={shows} loading={loading && shows.length === 0} />

        {/* Loading Indicator / Observer Target */}
        <div ref={observerTarget} className="py-8 flex justify-center h-20">
          {loading && hasMore && (
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {!hasMore && shows.length > 0 && (
            <p className="text-gray-500">No more series to load</p>
          )}
        </div>
      </div>
    </main>
  );
}
