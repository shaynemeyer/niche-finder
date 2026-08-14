export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-linear-to-b from-muted to-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-full mb-4 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How accurate is the niche data?',
              a: 'Our data is pulled in real-time from Reddit and Google Trends, then analyzed by Claude AI. The data reflects current market conditions. We recommend re-validating niches every 3–6 months as markets evolve.',
            },
            {
              q: 'Can I cancel my Pro subscription anytime?',
              a: 'Yes, absolutely. There are no long-term contracts. You can cancel your Pro subscription at any time from your account settings, effective at the end of your current billing period.',
            },
            {
              q: 'How long does a validation report take?',
              a: 'Most reports are generated in under 60 seconds. Complex niches with large Reddit communities may occasionally take up to 2–3 minutes.',
            },
            {
              q: "What's the difference between Free and Pro?",
              a: 'The Free plan gives you 3 validations per month with basic analysis (~500 word reports). Pro gives you unlimited validations, deeper Reddit data (500+ posts), full reports (2000+ words), competition analysis, monetization strategies, export features, and priority processing.',
            },
            {
              q: 'Is my niche data kept private?',
              a: 'Yes. Your reports and searches are private by default. Only you can view them in your dashboard. We never share your niche ideas or report data with other users.',
            },
            {
              q: 'Can I use NicheCopy for client work?',
              a: 'Absolutely. Many agencies and consultants use NicheCopy to deliver fast, data-driven market research to clients. Pro plan reports can be exported to PDF and shared directly.',
            },
          ].map((item) => (
            <div
              key={item.q}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h4 className="font-bold text-card-foreground mb-2">{item.q}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
