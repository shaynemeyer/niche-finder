import { User } from 'lucide-react';

export function ProfileSection() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            Profile Information
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your account details and information
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <>
          <div>
            <label className="text-sm font-medium text-foreground">
              Name
            </label>
            <p className="text-foreground mt-1">name</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <p className="text-foreground mt-1">email</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              Role
            </label>
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200">
                USER
              </span>
            </div>
          </div>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors">
            Edit Profile
          </button>
        </>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              defaultValue="profileName"
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              Email (cannot be changed)
            </label>
            <p className="text-muted-foreground mt-1">email</p>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
