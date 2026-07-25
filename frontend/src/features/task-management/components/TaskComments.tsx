'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Comment } from '../types';

interface TaskCommentsProps {
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
  disabled?: boolean;
  currentUserId?: string;
  currentUserName?: string;
  isAdmin?: boolean;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({
  comments,
  onChange,
  disabled = false,
  currentUserId = 'current-user',
  currentUserName = 'Current User',
  isAdmin = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim() || disabled) return;

    const newCommentObj: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId: '', // Will be set by parent
      text: newComment.trim(),
      userId: currentUserId,
      userName: currentUserName,
      createdAt: new Date(),
      isInternal: isInternal && isAdmin,
    };

    onChange([...comments, newCommentObj]);
    setNewComment('');
    setIsInternal(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (disabled) return;
    const updatedComments = comments.filter(c => c.id !== commentId);
    onChange(updatedComments);
  };

  const canDeleteComment = (comment: Comment) => {
    return isAdmin || comment.userId === currentUserId;
  };

  const canViewInternal = () => {
    return isAdmin;
  };

  const filteredComments = isAdmin 
    ? comments 
    : comments.filter(c => !c.isInternal);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Comments</h3>
        <Badge variant="outline" className="text-xs">
          {filteredComments.length}
        </Badge>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredComments.length === 0 ? (
          <Card className="p-6">
            <div className="text-center text-sm text-muted-foreground">
              No comments yet
            </div>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {comment.userName}
                    </span>
                    {comment.isInternal && (
                      <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Internal
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {comment.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">
                    {comment.text}
                  </p>
                </div>

                {canDeleteComment(comment) && !disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    ×
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Comment */}
      {!disabled && (
        <Card className="p-4">
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment... (Ctrl+Enter to send)"
              disabled={disabled}
              rows={3}
              className="text-sm resize-none"
            />

            <div className="flex items-center justify-between">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsInternal(!isInternal)}
                  className={cn(
                    'text-xs',
                    isInternal && 'bg-muted'
                  )}
                >
                  {isInternal ? (
                    <>
                      <Lock className="h-3.5 w-3.5 mr-1.5" />
                      Internal Comment
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5 mr-1.5" />
                      Make Internal
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || disabled}
                size="sm"
                className="ml-auto"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send
              </Button>
            </div>

            {isInternal && isAdmin && (
              <p className="text-[10px] text-muted-foreground">
                Internal comments are only visible to admins
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
