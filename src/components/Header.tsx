import { RefreshCw, Bell, BellOff } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { StatusType } from '@/types/server';
import { cn } from '@/lib/utils';
import mcnpLogo from '@/assets/mcnp-logo.png';

interface HeaderProps {
  status: StatusType;
  lastChecked: Date;
  onRefresh: () => void;
  isLoading: boolean;
  notificationsEnabled: boolean;
  onEnableNotifications: () => void;
}

export const Header = ({ 
  status, 
  lastChecked, 
  onRefresh, 
  isLoading, 
  notificationsEnabled,
  onEnableNotifications 
}: HeaderProps) => {
  return (
    <header className="relative py-8 px-4 overflow-hidden">
      {/* Background glow effect */}
      <div 
        className={cn(
          "absolute inset-0 opacity-30 transition-all duration-500",
          status === 'online' ? 'bg-[radial-gradient(ellipse_at_top,hsl(var(--success)/0.3)_0%,transparent_50%)]' : 
          status === 'offline' ? 'bg-[radial-gradient(ellipse_at_top,hsl(var(--destructive)/0.3)_0%,transparent_50%)]' :
          'bg-[radial-gradient(ellipse_at_top,hsl(var(--warning)/0.3)_0%,transparent_50%)]'
        )}
      />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src={mcnpLogo} 
            alt="MCNP Network" 
            className="h-24 md:h-32 object-contain animate-float"
          />
        </div>
        
        <p className="text-muted-foreground text-lg mb-6">
          Real-time Minecraft Server Status
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <StatusBadge status={status} />
          
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full text-foreground text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>

          <button
            onClick={onEnableNotifications}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              notificationsEnabled 
                ? "bg-success/20 text-success border border-success/30" 
                : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-4 h-4" />
                Alerts On
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4" />
                Enable Alerts
              </>
            )}
          </button>
        </div>

        <p className="text-muted-foreground text-xs mt-4">
          Last checked: {lastChecked.toLocaleTimeString()} • Auto-updates every 10s
        </p>
      </div>
    </header>
  );
};
