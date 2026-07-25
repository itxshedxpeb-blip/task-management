'use client';

import Link from 'next/link';
import {
  Users,
  RefreshCw,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePeople } from '@/modules/people/hooks/usePeople';

function PeopleSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="hover-translate-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WorkloadBar({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? 'bg-emerald-400' :
    rate >= 50 ? 'bg-amber-400' :
    'bg-blue-400';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-muted-foreground">Workload</span>
        <span className="text-[10px] text-muted-foreground">{Math.round(rate)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function PeoplePage() {
  const { data: people, isLoading, error, refetch } = usePeople();

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">People</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members and their performance.</p>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load team members</p>
            <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">People</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members and their performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{people?.length || 0} members</span>
        </div>
      </div>

      {isLoading ? (
        <PeopleSkeleton />
      ) : !people || people.length === 0 ? (
        <Card className="hover-translate-none">
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">No team members found</p>
            <p className="text-sm text-muted-foreground">
              Team member data will appear here once people are added.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => {
            const initials = person.employeeName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link key={person.employeeId} href={`/app/people/${person.employeeId}`}>
                <Card className="hover-translate-none cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-semibold text-sm">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{person.employeeName}</p>
                        <Badge variant="outline" className="text-[9px] mt-0.5">Employee</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Task Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-foreground">{person.tasksAssigned}</p>
                          <p className="text-[10px] text-muted-foreground">Assigned</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-emerald-400">{person.tasksCompleted}</p>
                          <p className="text-[10px] text-muted-foreground">Completed</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-amber-400">{person.tasksPending}</p>
                          <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                      </div>

                      {/* Completion Rate */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Completion Rate
                        </span>
                        <span className="text-xs font-medium text-foreground">{Math.round(person.completionRate)}%</span>
                      </div>

                      <WorkloadBar rate={person.completionRate} />

                      {/* On-time Rate */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          On-time Rate
                        </span>
                        <span className="text-xs font-medium text-foreground">{Math.round(person.onTimeCompletionRate)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
