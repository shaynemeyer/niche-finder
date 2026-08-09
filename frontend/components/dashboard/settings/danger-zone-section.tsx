export function DangerZoneSection() {
  return (
    <div className="bg-card rounded-lg border border-destructive/40 shadow-sm">
      <div className="px-6 py-4 border-b border-destructive/40">
        <h2 className="text-lg font-semibold text-destructive">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Irreversible actions
        </p>
      </div>
      <div className="px-6 py-4">
        <button
          disabled
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-destructive rounded-lg cursor-not-allowed opacity-50"
        >
          Delete Account (Coming Soon)
        </button>
      </div>
    </div>
  );
}
