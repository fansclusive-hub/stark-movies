import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MediaItem } from '@/lib/api';

interface HeroSectionProps {
    item: MediaItem;
}

export default function HeroSection({ item }: HeroSectionProps) {
    if (!item) return null;

    const id = item.imdb_id || item.tmdb_id;
    const watchUrl = item.type === 'movie'
        ? `/movie/${id}`
        : `/tv/${id}/1/1`;

    // Use high-res image if available, fallback to thumbnail
    const heroImage = item.image || item.thumbnail_url;

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={heroImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                {/* Cinematic Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 md:px-12 h-full flex flex-col justify-center pb-20">
                <div className="max-w-3xl space-y-6 pt-20 animate-slide-up">
                    {/* Logo/Title */}
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-wide uppercase leading-none drop-shadow-2xl">
                        {item.title}
                    </h1>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-3 text-gray-200 text-sm md:text-base font-medium">
                        {item.rating && (
                            <div className="flex items-center gap-1 text-yellow-500">
                                <span className="text-current">★</span>
                                <span>{item.rating}</span>
                            </div>
                        )}
                        {item.year && <span className="bg-white/10 px-2 py-0.5 rounded border border-white/20">{item.year}</span>}
                        {item.type && (
                            <span className="bg-white/10 px-2 py-0.5 rounded border border-white/20 capitalize">
                                {item.type === 'tv' ? 'TV Series' : 'Movie'}
                            </span>
                        )}
                        <span className="text-gray-400">• Action • Adventure • Drama</span>
                    </div>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-300 line-clamp-3 max-w-2xl font-light leading-relaxed">
                        {item.description || `Starring: ${item.cast || item.actors}`}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-6">
                        <Link to={watchUrl}>
                            <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold px-8 h-12 text-base uppercase tracking-wider gap-2 rounded-full">
                                <Play className="w-5 h-5 fill-black" />
                                Watch Now
                            </Button>
                        </Link>

                        <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 backdrop-blur-md uppercase tracking-wider px-8 h-12 text-base rounded-full gap-2 font-semibold">
                            <Info className="w-5 h-5" />
                            More Info
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
