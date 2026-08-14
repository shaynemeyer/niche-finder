import { Star } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/60 border border-yellow-100 dark:border-yellow-900 rounded-full mb-4 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            What Our Users Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Alex R.',
              role: 'Indie Hacker',
              avatar: 'AR',
              color: 'bg-blue-600 dark:bg-blue-500',
              quote:
                "I used to spend 2-3 days researching a new niche. With NicheCopy I get the same depth of research in under a minute. It's the first tool I open when I have a new idea.",
              stars: 5,
            },
            {
              name: 'Sarah K.',
              role: 'Content Creator',
              avatar: 'SK',
              color: 'bg-purple-600 dark:bg-purple-500',
              quote:
                'The Reddit analysis feature is incredible. It surfaces real community conversations and pain points that I would have never found manually. My content now converts 3x better.',
              stars: 5,
            },
            {
              name: 'Marcus T.',
              role: 'E-commerce Founder',
              avatar: 'MT',
              color: 'bg-green-600 dark:bg-green-500',
              quote:
                'Before launching my store I validated 12 product niches in one afternoon. Found 2 with real potential and avoided 10 that looked good on the surface but had major issues.',
              stars: 5,
            },
          ].map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-card-foreground text-sm leading-relaxed mb-6">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
