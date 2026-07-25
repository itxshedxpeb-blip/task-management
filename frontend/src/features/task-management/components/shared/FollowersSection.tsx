'use client';

import { Check, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';
import type { TaskUser } from '../../types';

interface FollowersSectionProps {
  followers?: TaskUser[];
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  loading?: boolean;
  /** Maximum avatars to display before showing a "+N" overflow chip. */
  max?: number;
  className?: string;
}

/** Followers display with a follow/unfollow toggle (frontend mock). */
export function FollowersSection({
  followers = [],
  isFollowing = false,
  onToggleFollow,
  loading = false,
  max = 5,
  className,
}: FollowersSectionProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-between gap-3', className)}>
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  const visible = followers.slice(0, max);
  const overflow = followers.length - visible.length;

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex min-w-0 items-center gap-2">
        <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        {followers.length === 0 ? (
          <span className="text-xs text-muted-foreground">No followers yet</span>
        ) : (
          <div className="flex items-center">
            <ul className="flex -space-x-2" aria-label={`${followers.length} followers`}>
              {visible.map((follower) => (
                <li key={follower.id}>
                  <Avatar name={follower.name} size="xs" className="ring-2 ring-background" />
                </li>
              ))}
            </ul>
            {overflow > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">+{overflow}</span>
            )}
          </div>
        )}
      </div>

      {onToggleFollow && (
        <Button
          variant={isFollowing ? 'secondary' : 'outline'}
          size="sm"
          onClick={onToggleFollow}
          aria-pressed={isFollowing}
          className="shrink-0 gap-1.5"
        >
          {isFollowing ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
}
