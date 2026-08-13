export function UsersLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  );
}
