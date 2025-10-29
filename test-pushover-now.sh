#!/bin/bash

# 🚀 TESTE PUSHOVER - ZYNOX CRM
# Suas credenciais já configuradas!

USER_KEY="ugr82xf7h3fgjxe57x1dm1gm4ti23w"
API_TOKEN="a7kvbu8y9k7dp3odvtep58ykyybxe1"

echo "🔥 TESTANDO PUSHOVER - ZYNOX CRM"
echo "================================"
echo ""

# Teste 1: Notificação simples
echo "📤 Enviando teste 1: Notificação simples..."
curl -s \
  --form-string "token=$API_TOKEN" \
  --form-string "user=$USER_KEY" \
  --form-string "title=🚀 Teste Zynox!" \
  --form-string "message=Pushover funcionando! Sistema de notificações ativo!" \
  https://api.pushover.net/1/messages.json

echo ""
echo "✅ Enviado! Verifique seu celular!"
echo ""
sleep 3

# Teste 2: Novo Lead (com prioridade alta)
echo "📤 Enviando teste 2: Novo Lead..."
curl -s \
  --form-string "token=$API_TOKEN" \
  --form-string "user=$USER_KEY" \
  --form-string "title=🚀 Novo Lead!" \
  --form-string "message=João Silva entrou em contato via Instagram. Temperatura: Quente 🔥" \
  --form-string "priority=1" \
  --form-string "sound=cosmic" \
  --form-string "url=https://zynox-crm-3e828.web.app/comercial" \
  --form-string "url_title=Abrir CRM" \
  https://api.pushover.net/1/messages.json

echo ""
echo "✅ Enviado! Verifique seu celular!"
echo ""
sleep 3

# Teste 3: Reunião Urgente
echo "📤 Enviando teste 3: Reunião Urgente..."
curl -s \
  --form-string "token=$API_TOKEN" \
  --form-string "user=$USER_KEY" \
  --form-string "title=📅 Reunião em 15 minutos!" \
  --form-string "message=Cliente XYZ aguardando na sala virtual. Prepare a apresentação!" \
  --form-string "priority=2" \
  --form-string "sound=siren" \
  --form-string "url=https://zynox-crm-3e828.web.app/comercial" \
  --form-string "url_title=Entrar na Reunião" \
  --form-string "expire=900" \
  --form-string "retry=60" \
  https://api.pushover.net/1/messages.json

echo ""
echo "✅ Enviado! Verifique seu celular!"
echo ""
sleep 3

# Teste 4: Pagamento Recebido
echo "📤 Enviando teste 4: Pagamento Recebido..."
curl -s \
  --form-string "token=$API_TOKEN" \
  --form-string "user=$USER_KEY" \
  --form-string "title=💰 Pagamento Recebido" \
  --form-string "message=R$ 5.000,00 de Cliente ABC creditado na conta. Fatura #123." \
  --form-string "priority=1" \
  --form-string "sound=cashregister" \
  --form-string "url=https://zynox-crm-3e828.web.app/financeiro" \
  --form-string "url_title=Ver Financeiro" \
  https://api.pushover.net/1/messages.json

echo ""
echo "✅ Enviado! Verifique seu celular!"
echo ""

echo "🎉 TODOS OS TESTES CONCLUÍDOS!"
echo "================================"
echo ""
echo "📱 Você deve ter recebido 4 notificações:"
echo "   1. 🚀 Teste Zynox!"
echo "   2. 🚀 Novo Lead!"
echo "   3. 📅 Reunião em 15 minutos! (URGENTE)"
echo "   4. 💰 Pagamento Recebido"
echo ""
echo "✅ Se recebeu todas, Pushover está 100% funcional!"
echo ""



