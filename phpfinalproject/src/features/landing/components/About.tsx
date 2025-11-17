import { Crown, Star, Users, Car } from 'lucide-react';

export function About() {

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Pinnacle of
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Transportational Vehicle Rentals
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            For over a decade, Lord of the Rims has been the premier destination for discerning 
            clients seeking extraordinary automotive experiences. Our meticulously curated fleet 
            represents the finest in automotive excellence.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Exceptional Service',
              description: 'White-glove treatment from booking to return, with personalized concierge support.',
            },
            {
              title: 'Pristine Vehicles',
              description: 'Every vehicle is meticulously maintained and detailed to perfection before delivery.',
            },
            {
              title: 'Flexible Terms',
              description: 'Whether for a day or a month, we offer flexible rental periods to suit your needs.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-card p-8 rounded-xl border border-border hover:shadow-gold transition-all"
            >
              <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
