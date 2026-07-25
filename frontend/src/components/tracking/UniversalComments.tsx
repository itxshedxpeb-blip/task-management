'use client';

import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from '@/features/tracking/hooks/useTracking';
import { Loader2, Send, Trash2, MessageSquare } from 'lucide-react';
import type { Comment } from '@/features/tracking/types';

interface UniversalCommentsProps {
  entityType: string;
  entityId: string;
  className?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function CommentItem({ comment, onDelete }: { comment: Comment; onDelete: (id: string) => void }) {
  const displayName = comment.authorName || 'Team Member';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'TM';

  return (
    <div className="flex gap-2 group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{displayName}</span>
          {comment.authorRole && (
            <span className="text-[11px] text-muted-foreground">{comment.authorRole}</span>
          )}
          <span className="text-xs text-muted-foreground/60">{timeAgo(comment.createdAt)}</span>
          <button
            onClick={() => onDelete(comment.id)}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
        <p className="text-sm mt-0.5 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

function UniversalCommentsComponent({ entityType, entityId, className }: UniversalCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const { data, isLoading } = useComments(entityType, entityId);
  const addComment = useAddComment(entityType, entityId);
  const deleteComment = useDeleteComment(entityType, entityId);
  const comments = data?.data ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment.mutate(
      { content: newComment.trim() },
      { onSuccess: () => setNewComment('') }
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[36px] h-9 text-sm resize-none flex-1"
          rows={1}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newComment.trim() || addComment.isPending}
          className="h-9"
        >
          {addComment.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <MessageSquare className="w-4 h-4 mx-auto mb-1 opacity-50" />
          No comments yet
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={(id) => deleteComment.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const UniversalComments = memo(UniversalCommentsComponent);
