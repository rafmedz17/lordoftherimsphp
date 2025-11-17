import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { CarList } from './components/CarList';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <CarList />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Lord of the Rims
            </h3>
            <p className="text-muted-foreground mb-4">
              Premium car rentals for the discerning driver
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Lord of the Rims. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
