import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Image as ImageIcon } from "lucide-react";
import { TeamMember } from "@/pages/Projetos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: Omit<TeamMember, 'id' | 'workload'>) => void;
}

export const AddTeamMemberModal = ({ isOpen, onClose, onAdd }: AddTeamMemberModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamMember['role']>('developer');
  const [avatar, setAvatar] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('developer');
    setAvatar('');
    setPhotoUrl('');
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('O nome é obrigatório.');
      return;
    }

    // Gerar avatar automaticamente se não fornecido
    const finalAvatar = avatar || name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    onAdd({
      name,
      email: email || undefined,
      role,
      avatar: finalAvatar,
      isOnline: true,
    });
    resetForm();
    onClose();
  };

  // Gerar preview do avatar
  const previewAvatar = avatar || (name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onClose();
    }}>
      <DialogContent className="sm:max-w-[425px] glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" /> Adicionar Membro
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Preview do Avatar */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20 border-2 border-primary/30">
                {photoUrl ? (
                  <AvatarImage src={photoUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-slate-700 text-slate-200 text-2xl font-bold">
                  {previewAvatar}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-slate-400">Preview do Avatar</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Ex: João Silva"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white">Email (Opcional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="joao@example.com"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-white">Papel</Label>
            <Select value={role} onValueChange={(value: TeamMember['role']) => setRole(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="tech_lead">Tech Lead</SelectItem>
                <SelectItem value="developer">Desenvolvedor</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="qa">QA/Tester</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="photoUrl" className="text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              URL da Foto (Opcional)
            </Label>
            <Input
              id="photoUrl"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="https://exemplo.com/foto.jpg"
            />
            <p className="text-xs text-slate-500">Cole a URL de uma imagem da internet</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="avatar" className="text-white">Iniciais (Opcional)</Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value.toUpperCase().slice(0, 2))}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Ex: JS (gerado automaticamente)"
              maxLength={2}
            />
            <p className="text-xs text-slate-500">Aparece quando não há foto</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="glass-card border-slate-700">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white">
            <Users className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


