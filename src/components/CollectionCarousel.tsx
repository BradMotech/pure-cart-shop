import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Collection {
  id: string;
  title: string;
  description: string;
  image_url: string;
  background_color: string;
  text_color: string;
  button_text: string;
  button_url: string;
  is_active: boolean;
  sort_order: number;
}

const CollectionCarousel = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const carouselElement = carouselRef.current;
      
      if (!carouselElement) return;
      
      const carouselBottom = carouselElement.offsetTop + carouselElement.offsetHeight;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      
      // Show carousel when at top or scrolling up and near the carousel
      if (currentScrollY < 100 || (scrollingUp && currentScrollY < carouselBottom + 200)) {
        setIsVisible(true);
      }
      // Hide carousel when scrolling down and past it
      else if (scrollingDown && currentScrollY > carouselBottom) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (collections.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % collections.length);
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(timer);
    }
  }, [collections.length]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching collections:', error);
        return;
      }

      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % collections.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + collections.length) % collections.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading || collections.length === 0) {
    return (
      <div 
        ref={carouselRef}
        className={`w-full h-[400px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg mb-8 transition-all duration-500 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`} 
      />
    );
  }

  const currentCollection = collections[currentIndex];

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full h-[400px] mb-8 overflow-hidden rounded-lg shadow-lg group transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      {/* Main Carousel Content */}
      <div 
        className="w-full h-full flex items-center justify-between px-8 relative"
        style={{ 
          backgroundColor: currentCollection.background_color,
          color: currentCollection.text_color 
        }}
      >
        {/* Left Content */}
        <div className="flex-1 max-w-md space-y-4 z-10">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in">
            {currentCollection.title}
          </h1>
          <p className="text-sm md:text-base leading-relaxed opacity-90 animate-fade-in">
            {currentCollection.description}
          </p>
          <Button
            onClick={() => window.location.href = currentCollection.button_url}
            variant="outline"
            className="mt-6 px-8 py-3 bg-transparent border-2 border-current text-current hover:bg-current hover:text-white transition-all duration-300 font-medium tracking-wider animate-scale-in"
          >
            {currentCollection.button_text}
          </Button>
          
          {/* Social Media Icons */}
          <div className="flex space-x-4 pt-4 opacity-80">
            <button className="hover:scale-110 transition-transform duration-200">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="hover:scale-110 transition-transform duration-200">
              <Instagram className="w-5 h-5" />
            </button>
            <button className="hover:scale-110 transition-transform duration-200">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="hover:scale-110 transition-transform duration-200">
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Content - Product Image */}
        {currentCollection.image_url && (
          <div className="flex-1 flex justify-center items-center relative">
            <div className="relative">
              <img
                src={currentCollection.image_url}
                alt={currentCollection.title}
                className="w-80 h-80 object-contain drop-shadow-2xl animate-scale-in"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
              />
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-current opacity-20 rounded-full animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-16 h-16 border-2 border-current opacity-30 rotate-45" />
              <div className="absolute top-1/2 -right-12 w-8 h-8 bg-current opacity-10 rounded-full" />
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {collections.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-current rounded-full" />
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-current rotate-45" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-current rounded-full opacity-10" />
        </div>
      </div>

      {/* Dots Indicator */}
      {collections.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {collections.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Website URL */}
      <div className="absolute top-4 right-4 text-xs opacity-60 font-light tracking-wider">
        FOR MORE<br />
        www.yoursite.com
      </div>
    </div>
  );
};

export default CollectionCarousel;