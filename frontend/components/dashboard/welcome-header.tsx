export function WelcomeHeader({ firstName }: { firstName: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">
        Welcome back, {firstName}!
      </h1>
      <p className="text-muted-foreground mt-1">
        Validate your niche ideas with AI-powered market research
      </p>
    </div>
  );
}
