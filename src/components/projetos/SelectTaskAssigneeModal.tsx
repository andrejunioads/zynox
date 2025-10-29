import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, CheckCircle, User } from "lucide-react";
import { Member } from "@/types/member";
import { TeamMember } from "@/pages/Projetos";

interface SelectTaskAssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (member: TeamMember | null) => void;
  availableMembers: Member[];
  currentAssignee?: string;
}

export const SelectTaskAssigneeModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  availableMembers,
  currentAssignee
}: SelectTaskAssigneeModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(currentAssignee || null);

  // Filtrar membros baseado na busca
  const filteredMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert Member to TeamMember format
  const convertToTeamMember = (member: Member): TeamMember => {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role === 'admin' ? 'project_manager' : 'developer', // Map roles
      avatar: member.avatar,
      isOnline: member.status === 'online',
      isAdmin: member.role === 'admin',
      workload: 1, // Default workload
      phone: member.phone
    };
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
  };

  const handleSubmit = () => {
    if (selectedMember) {
      const member = availableMembers.find(m => m.id === selectedMember);
      if (member) {
        onSelect(convertToTeamMember(member));
        onClose();
      }
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Administrador', icon: '👑', color: 'text-yellow-400' };
      case 'manager': return { label: 'Gerente', icon: '👔', color: 'text-blue-400' };
      case 'operator': return { label: 'Operador', icon: '⚙️', color: 'text-green-400' };
      case 'viewer': return { label: 'Visualizador', icon: '👁️', color: 'text-gray-400' };
      default: return { label: 'Membro', icon: '👤', color: 'text-gray-400' };
    }
  };

  const getDepartmentInfo = (department: string) => {
    switch (department) {
      case 'comercial': return { label: 'Comercial', icon: '💼', color: 'text-purple-400' };
      case 'design': return { label: 'Design', icon: '🎨', color: 'text-pink-400' };
      case 'dev': return { label: 'Desenvolvimento', icon: '💻', color: 'text-blue-400' };
      case 'financeiro': return { label: 'Financeiro', icon: '💰', color: 'text-green-400' };
      case 'suporte': return { label: 'Suporte', icon: '🛠️', color: 'text-orange-400' };
      case 'ia': return { label: 'IA', icon: '🤖', color: 'text-cyan-400' };
      default: return { label: 'Geral', icon: '🏢', color: 'text-gray-400' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] glass-card border-primary/20">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-white flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            Selecionar Responsável
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-2">
            Escolha quem será responsável por esta tarefa
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou departamento..."
              className="pl-12 pr-4 py-3 bg-slate-800/50 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Selected member preview */}
          {selectedMember && (
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 font-medium">
                  {availableMembers.find(m => m.id === selectedMember)?.name} selecionado
                </p>
                <p className="text-green-400/70 text-xs">Pronto para atribuir à tarefa</p>
              </div>
            </div>
          )}

          {/* Members list */}
          <div className="max-h-96 overflow-y-auto space-y-3">

            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhum membro encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = selectedMember === member.id;
                const roleInfo = getRoleInfo(member.role);
                const deptInfo = getDepartmentInfo(member.department);
                
                return (
                  <div
                    key={member.id}
                    className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 shadow-lg shadow-primary/20' 
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 hover:shadow-lg'
                    }`}
                    onClick={() => handleMemberSelect(member.id)}
                  >
                    {/* Selection indicator */}
                    <div className="flex-shrink-0">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleMemberSelect(member.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>

                    {/* Avatar with status */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10 ring-2 ring-slate-700 group-hover:ring-slate-600 transition-all">
                        <AvatarImage src={member.photoUrl} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200 text-sm font-bold">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        member.status === 'online' ? 'bg-green-400' :
                        member.status === 'away' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`} />
                    </div>

                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium text-sm truncate">{member.name}</h3>
                        {member.type === 'ai' && (
                          <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            IA
                          </span>
                        )}
                      </div>
                      
                      {/* Role and Department */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`${roleInfo.color}`}>
                          {roleInfo.icon} {roleInfo.label}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className={`${deptInfo.color}`}>
                          {deptInfo.icon} {deptInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={!selectedMember}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed py-3 font-medium shadow-lg shadow-primary/25 transition-all"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {selectedMember ? 'Atribuir Responsável' : 'Selecione um responsável'}
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
