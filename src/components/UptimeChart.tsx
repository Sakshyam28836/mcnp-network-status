import { useState } from 'react';
import { ServerHistory } from '@/types/server';
import { cn } from '@/lib/utils';
import { BarChart3, Clock } from 'lucide-react';

interface UptimeChartProps {
  uptimeHistory: ServerHistory[];
}

type TimeRange = '30min' | '1h' | '6h' | '24h';

export const UptimeChart = ({ uptimeHistory }: UptimeChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');

  const getFilteredData = () => {
    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      '30min': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };

    const cutoff = now - ranges[timeRange];
    return uptimeHistory.filter(entry => entry.timestamp.getTime() > cutoff);
  };

  const filteredData = getFilteredData();

  // Group data into buckets for display
  const getBuckets = () => {
    const bucketCount = 60; // Display 60 bars
    if (filteredData.length === 0) {
      return Array(bucketCount).fill({ status: 'unknown', players: 0 });
    }

    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      '30min': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };
    const rangeMs = ranges[timeRange];
    const bucketSize = rangeMs / bucketCount;

    const buckets = Array(bucketCount).fill(null).map((_, i) => {
      const bucketStart = now - rangeMs + (i * bucketSize);
      const bucketEnd = bucketStart + bucketSize;
      
      const entriesInBucket = filteredData.filter(
        entry => entry.timestamp.getTime() >= bucketStart && entry.timestamp.getTime() < bucketEnd
      );

      if (entriesInBucket.length === 0) {
        return { status: 'unknown' as const, players: 0 };
      }

      const onlineCount = entriesInBucket.filter(e => e.status === 'online').length;
      const avgPlayers = entriesInBucket.reduce((sum, e) => sum + (e.players || 0), 0) / entriesInBucket.length;
      
      return {
        status: (onlineCount >= entriesInBucket.length / 2 ? 'online' : 'offline') as 'online' | 'offline',
        players: Math.round(avgPlayers),
      };
    });

    return buckets;
  };

  const buckets = getBuckets();
  const onlineCount = buckets.filter(b => b.status === 'online').length;
  const knownCount = buckets.filter(b => b.status !== 'unknown').length;
  const uptimePercentage = knownCount > 0 ? ((onlineCount / knownCount) * 100).toFixed(1) : '100.0';

  const timeRangeLabels: Record<TimeRange, { start: string; end: string }> = {
    '30min': { start: '30m ago', end: 'Now' },
    '1h': { start: '1h ago', end: 'Now' },
    '6h': { start: '6h ago', end: 'Now' },
    '24h': { start: '24h ago', end: 'Now' },
  };

  return (
    <div className="minecraft-border rounded-xl bg-card p-6 card-glow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Uptime History</h3>
            <p className="text-xs text-muted-foreground">Server availability over time</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            {(['30min', '1h', '6h', '24h'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  timeRange === range 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <div className={cn(
            "text-right px-3 py-1.5 rounded-lg",
            parseFloat(uptimePercentage) >= 90 ? "bg-success/10 text-success" : 
            parseFloat(uptimePercentage) >= 50 ? "bg-warning/10 text-warning" : 
            "bg-destructive/10 text-destructive"
          )}>
            <span className="text-lg font-bold">{uptimePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-20 mb-2">
        <div className="flex gap-0.5 h-full items-end">
          {buckets.map((bucket, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-all hover:opacity-80",
                bucket.status === 'online' ? "bg-success" : 
                bucket.status === 'offline' ? "bg-destructive" : 
                "bg-muted"
              )}
              style={{ height: bucket.status === 'unknown' ? '20%' : '100%' }}
              title={bucket.status === 'unknown' ? 'No data' : `${bucket.status} - ${bucket.players} players`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{timeRangeLabels[timeRange].start}</span>
        <span>{timeRangeLabels[timeRange].end}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-destructive" />
          <span className="text-xs text-muted-foreground">Offline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">No data</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Data Points</p>
          <p className="text-lg font-bold text-foreground">{filteredData.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Online Checks</p>
          <p className="text-lg font-bold text-success">{onlineCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Offline Checks</p>
          <p className="text-lg font-bold text-destructive">{knownCount - onlineCount}</p>
        </div>
      </div>
    </div>
  );
};
