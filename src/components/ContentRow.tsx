import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import { MediaItem } from '@/lib/api';

interface ContentRowProps {
    title: string;
    items: MediaItem[];
}

export default function ContentRow({ title, items }: ContentRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = window.innerWidth * 0.75; // Scroll 75% of screen width

            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    if (!items.length) return null;

    return (
        <div className="space-y-4 py-8 relative group/row">
            <div className="flex items-center gap-4 px-4 md:px-12 mb-4">
                {/* Red vertical accent line */}
                <div className="w-1 h-8 bg-red-600 rounded-sm"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                    {title}
                </h2>
            </div>

            <div className="relative group">
                {/* Left Scroll Button */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-lg backdrop-blur-sm"
                >
                    <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                {/* Scroll Container */}
                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto px-4 md:px-12 pb-4 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((item, index) => (
                        <div
                            key={`${item.imdb_id}-${index}`}
                            className="flex-none w-[160px] md:w-[200px] lg:w-[240px] snap-start"
                        >
                            <MediaCard item={item} />
                        </div>
                    ))}
                </div>

                {/* Right Scroll Button */}
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
