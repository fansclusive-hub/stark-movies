import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MediaItem } from '@/lib/api';

interface Top10RowProps {
    title: string;
    items: MediaItem[];
}

function getWatchUrl(item: MediaItem): string {
    const id = item.imdb_id || item.tmdb_id;
    const titleParam = `?title=${encodeURIComponent(item.title)}`;
    switch (item.type) {
        case 'movie':
            return `/movie/${id}${titleParam}`;
        case 'tv':
            return `/tv/${id}/1/1${titleParam}`;
        case 'anime':
            return `/anime/${id}/1/sub${titleParam}`;
        default:
            return `/movie/${id}${titleParam}`;
    }
}

export default function Top10Row({ title, items }: Top10RowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = window.innerWidth * 0.75;

            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="space-y-4 py-8 relative group/row">
            <div className="flex items-center gap-4 px-4 md:px-12 mb-4">
                {/* Red vertical accent line */}
                <div className="w-1.5 h-8 bg-red-600 rounded-sm"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {title}
                </h2>
                <div className="text-muted-foreground text-sm uppercase tracking-widest ml-2">Content Today</div>
            </div>

            <div className="relative group">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-lg backdrop-blur-sm"
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto px-4 md:px-12 pb-8 scrollbar-hide snap-x snap-mandatory items-end"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.slice(0, 10).map((item, index) => (
                        <Link
                            key={item.imdb_id}
                            to={getWatchUrl(item)}
                            className="flex-none relative group/card snap-start"
                        >
                            {/* Number with stroke effect - positioned behind/left */}
                            <div className="relative flex items-end">
                                <span
                                    className="text-[180px] leading-[0.8] font-bold text-black stroke-text select-none relative z-0 translate-y-4"
                                    style={{ WebkitTextStroke: '4px #444' }}
                                >
                                    {index + 1}
                                </span>

                                {/* Poster Card */}
                                <div className="w-[140px] md:w-[160px] aspect-[2/3] rounded-lg overflow-hidden relative z-10 -ml-8 shadow-2xl transition-transform duration-300 group-hover/card:scale-105 group-hover/card:-translate-y-2 border border-white/10">
                                    {(item.image || item.thumbnail_url) ? (
                                        <img
                                            src={item.image || item.thumbnail_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <span className="text-xs text-center p-2">{item.title}</span>
                                        </div>
                                    )}
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-lg backdrop-blur-sm"
                >
                    <ChevronRight className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    );
}
