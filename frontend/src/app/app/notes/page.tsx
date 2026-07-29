'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Pin,
  PinOff,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  Note,
} from '@/modules/notes/hooks/useNotes';

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: notesData, isLoading, error, refetch } = useNotes({ search: search || undefined });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const notes = notesData?.rows || [];
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    await updateNote.mutateAsync({
      id: selectedNote.id,
      data: { title: editTitle, content: editContent },
    });
  };

  const handleTogglePin = async (note: Note) => {
    await updateNote.mutateAsync({
      id: note.id,
      data: { isPinned: !note.isPinned },
    });
    if (selectedNote?.id === note.id) {
      setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await deleteNote.mutateAsync(id);
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createNote.mutateAsync({ title: newTitle.trim(), content: newContent.trim() || undefined });
    setNewTitle(''); setNewContent('');
    setCreateOpen(false);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Notes</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load notes</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
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
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">Obsidian-style notes for your thoughts.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Note
          </Button>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Note title" required />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your note in markdown..." rows={8} className="font-mono text-sm" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createNote.isPending || !newTitle.trim()}>
                  {createNote.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 min-h-[calc(100vh-220px)]">
        {/* Note List */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 text-sm" />
          </div>

          <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))
            ) : notes.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notes yet</p>
              </div>
            ) : (
              <>
                {pinnedNotes.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">Pinned</p>
                    {pinnedNotes.map((note) => (
                      <NoteItem key={note.id} note={note} isSelected={selectedNote?.id === note.id} onSelect={handleSelectNote} onTogglePin={handleTogglePin} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
                {unpinnedNotes.length > 0 && (
                  <div>
                    {pinnedNotes.length > 0 && <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">Notes</p>}
                    {unpinnedNotes.map((note) => (
                      <NoteItem key={note.id} note={note} isSelected={selectedNote?.id === note.id} onSelect={handleSelectNote} onTogglePin={handleTogglePin} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 hidden md:block">
          {selectedNote ? (
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-bold border-0 bg-transparent focus-visible:ring-0 px-0 h-auto"
                    placeholder="Note title"
                  />
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTogglePin(selectedNote)}>
                      {selectedNote.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(selectedNote.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 font-mono text-sm border-0 bg-transparent focus-visible:ring-0 resize-none min-h-[400px]"
                  placeholder="Write your note in markdown..."
                />
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={handleSave} disabled={updateNote.isPending}>
                    {updateNote.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a note to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteItem({
  note,
  isSelected,
  onSelect,
  onTogglePin,
  onDelete,
}: {
  note: Note;
  isSelected: boolean;
  onSelect: (n: Note) => void;
  onTogglePin: (n: Note) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(note)}
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors group',
        isSelected ? 'bg-blue-500/10 text-blue-500' : 'hover:bg-muted/50 text-foreground'
      )}
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{note.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {note.content?.slice(0, 40) || 'Empty note'}
        </p>
      </div>
      {note.isPinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
    </div>
  );
}
