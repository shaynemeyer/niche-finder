export function StatsBar() {
  return (
    <section className="border-y border-border bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '10,000+', label: 'Niches Validated' },
            { value: '500+', label: 'Active Users' },
            { value: '98%', label: 'Accuracy Rate' },
            { value: '< 60s', label: 'Avg. Report Time' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
