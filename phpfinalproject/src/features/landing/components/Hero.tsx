import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Award } from 'lucide-react';
import heroImage from '@/assets/hero-car.jpg';

export function Hero() {
  const scrollToCars = () => {
    const carsSection = document.getElementById('cars');
    if (carsSection) {
      carsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Luxury car"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Unlock 
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              The Freedome
            </span>
            of The Road
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-xl">
            Elevate your journey with our exclusive collection of vehicles. 
            We deliver unparalleled excellence.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button
              size="lg"
              onClick={scrollToCars}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-premium group"
            >
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Fully Insured', desc: 'Complete coverage' },
              { icon: Clock, title: '24/7 Support', desc: 'Always available' },
              { icon: Award, title: 'Fresh New Car', desc: 'Latest models' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start space-x-3 bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border">
                <feature.icon className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
