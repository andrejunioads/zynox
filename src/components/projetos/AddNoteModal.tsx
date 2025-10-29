import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StickyNote, X } from "lucide-react";
import { QuickNote } from "@/pages/Projetos";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (note: Omit<QuickNote, 'id' | 'createdAt' | 'author'>) => void;
}

export const AddNoteModal = ({ isOpen, onClose, onAdd }: AddNoteModalProps) => {
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const resetForm = () => {
    setContent('');
    setIsPinned(false);
    setTagInput('');
    setTags([]);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('Digite o conteúdo da nota.');
      return;
    }

    onAdd({
      content,
      tags,
      isPinned,
    });
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onClose();
    }}>
      <DialogContent className="sm:max-w-[425px] glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <StickyNote className="w-5 h-5" /> Nova Nota
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="content" className="text-white">Conteúdo *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              placeholder="Digite sua nota aqui..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags" className="text-white">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Ex: decisão, importante"
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                +
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                  #{tag}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-400"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
            <Label htmlFor="pinned" className="text-white cursor-pointer">
              Fixar nota
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="glass-card border-slate-700">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white">
            <StickyNote className="w-4 h-4 mr-2" /> Adicionar Nota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



