import { useState, useMemo } from 'react';
import { Play, TrendingUp } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import HeroSection from '@/components/HeroSection';
import ContentRow from '@/components/ContentRow';
import Top10Row from '@/components/Top10Row';
import { type MediaItem } from '@/lib/api';
import { HOME_PAGE_DATA } from '@/lib/home-data';

export default function HomePage() {
  // Categorize content
  const featuredMovie = useMemo(() => {
    // Pick a random movie to feature, or fix it to a specific one like 'Dune' or 'Avengers'
    // Let's pick 'Dune: Part Two' if available, otherwise random
    const specificFeature = HOME_PAGE_DATA.find(m => m.title.includes('Dune'));
    if (specificFeature) return specificFeature;
    return HOME_PAGE_DATA[Math.floor(Math.random() * HOME_PAGE_DATA.length)];
  }, []);

  const trendingContent = HOME_PAGE_DATA;
  const movies = HOME_PAGE_DATA.filter(item => item.type === 'movie');
  const tvSeries = HOME_PAGE_DATA.filter(item => item.type === 'tv');
  const anime = HOME_PAGE_DATA.filter(item => item.type === 'anime');

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <HeroSection item={featuredMovie} />

      {/* Main Content Area - Shifted up to overlap slightly with Hero */}
      <div className="relative z-20 space-y-12 pb-12">

        {/* Top 10 Row - Overlapping Hero */}
        <div className="-mt-32">
          <Top10Row title="Top 10" items={trendingContent} />
        </div>

        {/* Trending Row */}
        <ContentRow title="Trending Today" items={trendingContent} />

        {/* TV Series Row */}
        <ContentRow title="Series on Netflix" items={tvSeries} />

        {/* Top Rated Row */}
        <ContentRow title="Top Rated" items={movies} />

        {/* Anime Row */}
        <ContentRow title="Genres" items={anime} />
      </div>
    </main>
  );
}
