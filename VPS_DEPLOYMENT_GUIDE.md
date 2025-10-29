# 🚀 Guia de Deploy: VPS com MongoDB

## 🎯 Cenário: Você tem VPS + MongoDB

### **Opções Ranqueadas (Melhor → Pior):**

---

## 1️⃣ **Backend Node.js + MongoDB** ⭐⭐⭐⭐⭐ (RECOMENDADO)

### Por quê?
```
✅ Usa MongoDB que você já tem
✅ Custo: $0 (só VPS)
✅ Controle total
✅ Stack familiar (Node.js)
✅ Fácil integração com React
✅ Storage local (sem custos)
✅ Escalável
```

### Stack Completa:
```
Frontend:  React + Vite
Backend:   Node.js + Express
Database:  MongoDB (já instalado)
Storage:   Filesystem (VPS)
Auth:      JWT + bcrypt
Proxy:     Nginx
SSL:       Let's Encrypt (grátis)
```

### Estrutura do Projeto:
```
nebula-stats-hub/
├── frontend/          # React (já existe)
│   ├── src/
│   └── dist/         # Build para produção
│
├── backend/          # 🆕 Novo!
│   ├── src/
│   │   ├── models/
│   │   │   ├── Member.js
│   │   │   ├── Team.js
│   │   │   └── Lead.js
│   │   ├── routes/
│   │   │   ├── members.js
│   │   │   ├── teams.js
│   │   │   └── auth.js
│   │   ├── controllers/
│   │   │   ├── memberController.js
│   │   │   └── uploadController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── config/
│   │   │   └── database.js
│   │   └── server.js
│   ├── uploads/
│   │   └── avatars/
│   ├── package.json
│   └── .env
│
└── docker-compose.yml  # Opcional
```

---

## 📋 Implementação Completa

### **Passo 1: Criar Backend**

#### `backend/package.json`
```json
{
  "name": "nebula-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

#### `backend/.env`
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/nebula-stats

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=sua-chave-secreta-super-forte-aqui
JWT_EXPIRES_IN=7d

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=https://seu-dominio.com
```

#### `backend/src/config/database.js`
```javascript
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
};
```

#### `backend/src/models/Member.js`
```javascript
import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: String,
  avatar: {
    type: String,
    required: true,
  },
  photoUrl: String, // URL da foto no servidor
  instagram: String,
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator', 'viewer'],
    required: true,
  },
  department: {
    type: String,
    enum: ['comercial', 'design', 'dev', 'ia', 'suporte', 'financeiro'],
    required: true,
  },
  status: {
    type: String,
    enum: ['online', 'away', 'offline'],
    default: 'offline',
  },
  type: {
    type: String,
    enum: ['human', 'ai'],
    default: 'human',
  },
  
  // Stats
  stats: {
    totalLeads: { type: Number, default: 0 },
    convertedLeads: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    totalInteractions: { type: Number, default: 0 },
    followUpsCreated: { type: Number, default: 0 },
    periodStart: Date,
    periodEnd: Date,
  },
  
  // Metrics
  assignedLeads: { type: Number, default: 0 },
  activeProjects: { type: Number, default: 0 },
  activeTasks: { type: Number, default: 0 },
  
  // Timestamps
  joinedAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  
  // Status
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  
  // IA (opcional)
  aiModel: String,
  aiCapabilities: [String],
  
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
});

// Índices
memberSchema.index({ email: 1 });
memberSchema.index({ department: 1 });
memberSchema.index({ type: 1 });

export default mongoose.model('Member', memberSchema);
```

#### `backend/src/routes/members.js`
```javascript
import express from 'express';
import Member from '../models/Member.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// GET /api/members - Listar todos
router.get('/', async (req, res) => {
  try {
    const members = await Member.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members/:id - Buscar um
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members - Criar novo
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const memberData = JSON.parse(req.body.data);
    
    // Se tem foto, adicionar URL
    if (req.file) {
      memberData.photoUrl = `/uploads/avatars/${req.file.filename}`;
    }
    
    const member = new Member(memberData);
    await member.save();
    
    res.status(201).json(member);
  } catch (error) {
    // Se deu erro e tinha foto, deletar
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/members/:id - Atualizar
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const memberData = JSON.parse(req.body.data);
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }
    
    // Se tem nova foto
    if (req.file) {
      // Deletar foto antiga
      if (member.photoUrl) {
        const oldPath = path.join(process.cwd(), member.photoUrl);
        await fs.unlink(oldPath).catch(() => {});
      }
      memberData.photoUrl = `/uploads/avatars/${req.file.filename}`;
    }
    
    memberData.lastActivity = new Date();
    Object.assign(member, memberData);
    await member.save();
    
    res.json(member);
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/members/:id - Deletar (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }
    
    member.isActive = false;
    await member.save();
    
    res.json({ message: 'Membro removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### `backend/src/middleware/upload.js`
```javascript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Configurar storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${hash}${ext}`);
  },
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
```

#### `backend/src/server.js`
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database.js';
import membersRouter from './routes/members.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Conectar MongoDB
await connectDB();

// Middleware de segurança
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/api/members', membersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
});
```

---

## 🔧 Deploy na VPS

### **Passo 1: Preparar VPS**

```bash
# Conectar na VPS
ssh user@seu-servidor.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Configurar firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### **Passo 2: Subir Backend**

```bash
# Criar diretório
mkdir -p /var/www/nebula-backend
cd /var/www/nebula-backend

# Clonar/copiar código do backend
# git clone ... ou scp ...

# Instalar dependências
npm install

# Criar diretório de uploads
mkdir -p uploads/avatars

# Configurar .env
nano .env
# (colar as variáveis de ambiente)

# Iniciar com PM2
pm2 start src/server.js --name nebula-backend
pm2 save
pm2 startup

# Ver logs
pm2 logs nebula-backend
```

### **Passo 3: Configurar Nginx**

```nginx
# /etc/nginx/sites-available/nebula

server {
    listen 80;
    server_name seu-dominio.com;
    
    # Frontend (React build)
    location / {
        root /var/www/nebula-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Uploads (avatares)
    location /uploads {
        proxy_pass http://localhost:3001/uploads;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/nebula /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Passo 4: SSL (Let's Encrypt)**

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática já configurada!
```

### **Passo 5: Build Frontend**

```bash
# No seu computador (local)
cd frontend
npm run build

# Upload para VPS
scp -r dist/* user@servidor:/var/www/nebula-frontend/dist/
```

---

## 2️⃣ **PocketBase** ⭐⭐⭐⭐ (Alternativa Rápida)

Se quiser algo MUITO mais rápido (10 minutos de setup):

```bash
# Na VPS
wget https://github.com/pocketbase/pocketbase/releases/download/v0.20.0/pocketbase_0.20.0_linux_amd64.zip
unzip pocketbase_0.20.0_linux_amd64.zip
chmod +x pocketbase

# Rodar
./pocketbase serve --http="0.0.0.0:8090"

# Admin UI: http://seu-servidor.com:8090/_/
```

**Pros:**
- ✅ Setup em 10 minutos
- ✅ Admin UI built-in
- ✅ Auth pronto
- ✅ Storage integrado
- ✅ Real-time subscriptions

**Cons:**
- ❌ Não usa MongoDB (usa SQLite)
- ❌ Menos flexível que backend próprio

---

## 3️⃣ **Appwrite** ⭐⭐⭐ (Se quiser Docker)

```bash
# Na VPS
docker run -d \
  --name appwrite \
  --restart unless-stopped \
  --publish 80:80 \
  --publish 443:443 \
  appwrite/appwrite:latest
```

**Pros:**
- ✅ Suporta MongoDB
- ✅ Auth + Storage + Functions
- ✅ Docker (fácil deploy)

**Cons:**
- ❌ Mais pesado (Docker)
- ❌ Mais complexo

---

## 📊 Comparação Final

| Opção | Custo | Setup | Flexibilidade | Usa MongoDB |
|-------|-------|-------|---------------|-------------|
| **Node + MongoDB** ⭐ | $0 | 2-3h | ⭐⭐⭐⭐⭐ | ✅ |
| **PocketBase** | $0 | 10min | ⭐⭐⭐ | ❌ (SQLite) |
| **Appwrite** | $0 | 1h | ⭐⭐⭐⭐ | ✅ |
| **Supabase** | $25/mês | 30min | ⭐⭐⭐⭐ | ❌ (PostgreSQL) |

---

## 🎯 Recomendação Final

**Para você:** 

### **Backend Node.js + Express + MongoDB**

**Por quê:**
1. ✅ Usa MongoDB que você já tem
2. ✅ $0 de custo extra
3. ✅ Controle total
4. ✅ Aprende backend moderno
5. ✅ Portfólio completo (Full Stack!)

---

## 🆘 Precisa de Ajuda?

Quando for fazer o deploy, me avise que eu:
1. ✅ Crio todo o backend completo
2. ✅ Integro com o frontend React
3. ✅ Configuro Nginx + SSL
4. ✅ Script de deploy automatizado
5. ✅ Migração de dados LocalStorage → MongoDB

**Você está no caminho certo! 🚀**


