import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarTone } from '../../utils/taskFormatters';
import type { TaskUser } from '../../types';

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
} as const;

export type AvatarSize = keyof typeof SIZE_CLASSES;

interface AvatarProps {
  /** User to display. Either `user` or `name` must be provided. */
  user?: Pick<TaskUser, 'name' | 'avatarUrl'> | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

/**
 * Reusable user avatar. Renders an image when available, otherwise initials on a
 * deterministic, dark-mode-safe tone. Replaces the ad-hoc avatar markup that was
 * duplicated across task screens.
 */
export function Avatar({ user, name, size = 'sm', className }: AvatarProps) {
  const displayName = (user?.name ?? name ?? '').trim();
  const imageUrl = user?.avatarUrl;
  const label = displayName || 'Unassigned';

  return (
    <span
      role="img"
      aria-label={label}
      title={displayName || undefined}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium ring-1 ring-border/60 select-none',
        SIZE_CLASSES[size],
        !imageUrl && getAvatarTone(displayName),
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={label}
          fill
          sizes={`${SIZE_CLASSES[size].split(' ')[0].replace('h-', '')}px`}
          className="object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(displayName)}</span>
      )}
    </span>
  );
}
