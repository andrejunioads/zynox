#!/bin/bash

# ========================================
# 🧪 TESTE COMPLETO N8N WEBHOOK
# ========================================

echo "🚀 TESTANDO WORKFLOW N8N → PUSHOVER"
echo ""
echo "⚠️  IMPORTANTE: Substitua 'SEU_N8N_URL' pela URL real do webhook!"
echo ""

# CONFIGURAÇÃO
N8N_WEBHOOK_URL="https://seu-n8n.com/webhook/zynox-push"

echo "URL configurada: $N8N_WEBHOOK_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ========================================
# TESTE 1: LEAD
# ========================================
echo "📱 TESTE 1: Novo Lead (Som: Cosmic)"
echo "Enviando..."

curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "lead_created",
    "titulo": "🚀 Novo Lead de Alto Valor!",
    "mensagem": "<b>Lead:</b> João Silva (TESTE)\n<b>Empresa:</b> Tech Solutions\n<b>Valor:</b> R$ 25.000\n<b>Origem:</b> Instagram\n\nNão deixe o lead esfriar!",
    "prioridade": "high",
    "actionUrl": "https://zynox-crm-3e828.web.app/comercial",
    "metadata": {
      "leadId": "lead-123",
      "temperature": "Quente"
    }
  }'

echo ""
echo "✅ Teste 1 enviado!"
echo ""
sleep 3

# ========================================
# TESTE 2: PAGAMENTO
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 TESTE 2: Pagamento Recebido (Som: Cashregister)"
echo "Enviando..."

curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "payment_received",
    "titulo": "💰 Pagamento Recebido",
    "mensagem": "<b>Valor:</b> R$ 5.000,00\n<b>Cliente:</b> ABC Corp\n<b>Fatura:</b> #1234\n<b>Método:</b> PIX\n\nValor já creditado na conta!",
    "prioridade": "high",
    "actionUrl": "https://zynox-crm-3e828.web.app/financeiro",
    "metadata": {
      "amount": 5000,
      "invoiceId": "inv-1234"
    }
  }'

echo ""
echo "✅ Teste 2 enviado!"
echo ""
sleep 3

# ========================================
# TESTE 3: REUNIÃO URGENTE
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 TESTE 3: Reunião URGENTE (Som: Siren, Prioridade 2)"
echo "Enviando..."

curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "meeting_reminder",
    "titulo": "📅 Reunião em 15 minutos!",
    "mensagem": "<b>Cliente:</b> XYZ Corp\n<b>Horário:</b> 14:30\n<b>Assunto:</b> Apresentação Proposta\n<b>Link:</b> meet.google.com/abc-defg-hij\n\nPrepare a apresentação agora!",
    "prioridade": "urgent",
    "actionUrl": "https://zynox-crm-3e828.web.app/comercial",
    "metadata": {
      "meetingId": "meet-456",
      "clientId": "client-789"
    }
  }'

echo ""
echo "✅ Teste 3 enviado!"
echo ""
sleep 3

# ========================================
# TESTE 4: NOTIFICAÇÃO GENÉRICA
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 TESTE 4: Notificação Genérica (Som: Pushover)"
echo "Enviando..."

curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "system_notification",
    "titulo": "🔔 Backup Concluído",
    "mensagem": "<b>Status:</b> Sucesso\n<b>Arquivos:</b> 1.234\n<b>Tamanho:</b> 2.5 GB\n<b>Duração:</b> 5 minutos\n\nBackup salvo na nuvem.",
    "prioridade": "medium",
    "actionUrl": "https://zynox-crm-3e828.web.app",
    "metadata": {
      "backupId": "backup-001",
      "timestamp": "2025-10-26T15:30:00Z"
    }
  }'

echo ""
echo "✅ Teste 4 enviado!"
echo ""

# ========================================
# TESTE 5: ANIVERSÁRIO (da automação)
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 TESTE 5: Aniversário de Cliente (da automação)"
echo "Enviando..."

curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "birthday_reminder",
    "titulo": "🎂 Aniversário Hoje!",
    "mensagem": "<b>Parabéns a fazer! 🎉</b>\n\n<b>Cliente:</b> Maria Costa\n<b>Empresa:</b> Costa Design\n<b>Relacionamento:</b> 2 anos\n\nEnvie uma mensagem especial!",
    "prioridade": "medium",
    "actionUrl": "https://zynox-crm-3e828.web.app/clientes",
    "metadata": {
      "clientId": "client-123",
      "automationId": "auto-birthday"
    }
  }'

echo ""
echo "✅ Teste 5 enviado!"
echo ""

# ========================================
# RESUMO
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 TODOS OS TESTES ENVIADOS!"
echo ""
echo "📱 Verifique seu celular/tablet agora!"
echo ""
echo "Você deve ter recebido 5 notificações:"
echo "  1. 🚀 Novo Lead (Som: Cosmic)"
echo "  2. 💰 Pagamento (Som: Cashregister)"
echo "  3. 📅 Reunião (Som: Siren - URGENTE)"
echo "  4. 🔔 Backup (Som: Pushover)"
echo "  5. 🎂 Aniversário (Som: Pushover)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 DICAS:"
echo "   • Se não recebeu, verifique a URL do webhook"
echo "   • Veja os logs do n8n para debug"
echo "   • Teste um por vez removendo os outros"
echo ""
echo "🔧 EDITAR URL:"
echo "   nano test-n8n-webhook.sh"
echo "   (Mude a linha: N8N_WEBHOOK_URL=...)"
echo ""



