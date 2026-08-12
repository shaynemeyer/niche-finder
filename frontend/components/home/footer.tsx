export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-muted-foreground">
          <p>&copy; {currentYear} NicheFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
