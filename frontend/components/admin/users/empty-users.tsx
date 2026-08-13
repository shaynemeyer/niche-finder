import { Users } from 'lucide-react';

export function EmptyUsers() {
  return (
    <div className="text-center py-12">
      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">No users found</p>
    </div>
  );
}
