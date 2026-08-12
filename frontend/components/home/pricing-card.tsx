import Link from 'next/link';

export function PricingCard({
  title,
  price,
  period,
  features,
  buttonText,
  buttonHref,
  featured = false,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`p-8 bg-card rounded-xl shadow-sm hover:shadow-md transition border ${
        featured ? 'border-primary ring-2 ring-primary' : 'border-border'
      }`}
    >
      {featured && (
        <div className="text-primary text-sm font-semibold mb-2">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold text-card-foreground mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-5xl font-bold text-card-foreground">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={buttonHref}
        className={`block w-full py-3 px-6 rounded-lg text-center font-semibold transition ${
          featured
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
