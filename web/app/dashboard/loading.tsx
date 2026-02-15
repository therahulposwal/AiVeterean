import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex items-center gap-3 text-sm font-medium">
        <Loader2 size={18} className="animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    </div>
  );
}
