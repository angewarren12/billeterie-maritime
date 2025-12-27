import { useState, useEffect } from 'react';

const slides = [
    {
        id: 1,
        title: 'Voyagez en Toute Sérénité',
        subtitle: 'Découvrez le Sénégal par la mer',
        description: 'Des traversées confortables et sécurisées vers toutes les destinations maritimes',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop',
        cta: 'Réserver maintenant'
    },
    {
        id: 2,
        title: 'Tarifs Compétitifs',
        subtitle: 'Le meilleur rapport qualité-prix',
        description: 'Profitez de nos offres spéciales et abonnements avantageux',
        image: 'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=1920&h=800&fit=crop',
        cta: 'Voir les tarifs'
    },
    {
        id: 3,
        title: 'Flotte Moderne',
        subtitle: 'Confort et sécurité garantis',
        description: 'Navires récents équipés des dernières technologies maritimes',
        image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1920&h=800&fit=crop',
        cta: 'Notre flotte'
    }
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="relative h-[600px] overflow-hidden">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide
                            ? 'opacity-100 translate-x-0'
                            : index < currentSlide
                                ? 'opacity-0 -translate-x-full'
                                : 'opacity-0 translate-x-full'
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative h-full container mx-auto px-4 flex items-center">
                        <div className="max-w-2xl text-white">
                            <div className="animate-fade-in">
                                <p className="text-ocean-400 font-semibold text-lg mb-2 animate-slide-up">
                                    {slide.subtitle}
                                </p>
                                <h1 className="text-6xl font-display font-bold mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    {slide.title}
                                </h1>
                                <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    {slide.description}
                                </p>
                                <button className="btn-primary text-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                    {slide.cta}
                                    <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${index === currentSlide
                                ? 'w-12 h-3 bg-ocean-500'
                                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Arrow Navigation */}
            <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10"
                aria-label="Previous slide"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10"
                aria-label="Next slide"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
