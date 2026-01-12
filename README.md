# FlowJournal - Trading Journal mit Backend

Professionelles Trading Journal mit Multi-User Support und vollständigem Backend.

## 🚀 Features

- ✅ **Multi-User System** mit Rollenverwaltung (Admin, Manager, Trader, Viewer)
- ✅ **JWT Authentication** - Sicheres Login-System
- ✅ **Trade Management** - Komplette CRUD-Operationen für Trades
- ✅ **Performance Analytics** - Win-Rate, P&L, Best/Worst Trades
- ✅ **Strategies & Tags** - Organisiere deine Trades
- ✅ **Team Support** - Verwaltung von Trader-Teams
- ✅ **RESTful API** - Vollständig dokumentierte API

## 📋 Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- Zod (Validation)
- Winston (Logging)

### Frontend (coming soon)
- React + TypeScript
- Vite
- TanStack Query
- Zustand (State Management)
- TailwindCSS

## 🛠️ Setup

### 1. PostgreSQL installieren

Lade PostgreSQL herunter: https://www.postgresql.org/download/

Erstelle eine Datenbank:
```bash
createdb flowjournal
```

### 2. Environment Variables

Kopiere `.env.example` zu `.env` im backend Ordner:
```bash
cd backend
cp .env.example .env
```

Bearbeite `.env` mit deinen Daten:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/flowjournal
JWT_SECRET=dein-super-geheimer-key
```

### 3. Dependencies installieren

```bash
npm install
```

### 4. Datenbank Schema erstellen

```bash
psql -d flowjournal -f backend/src/database/schema.sql
```

### 5. Server starten

```bash
npm run dev:backend
```

Server läuft auf: http://localhost:3001

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Neuen User registrieren
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Aktueller User (Auth required)

### Trades
- `GET /api/trades` - Alle Trades (Auth required)
- `GET /api/trades/:id` - Einzelner Trade
- `POST /api/trades` - Trade erstellen
- `PUT /api/trades/:id` - Trade updaten
- `DELETE /api/trades/:id` - Trade löschen
- `GET /api/trades/stats` - Performance Statistics

## 👥 User Rollen

- **Admin**: Vollzugriff auf alle Trades und User
- **Manager**: Kann Team-Trades sehen und verwalten
- **Trader**: Kann nur eigene Trades sehen/bearbeiten
- **Viewer**: Nur Lesezugriff

## 📊 Trade Daten

Jeder Trade enthält:
- Symbol, Type (Stock/Forex/Crypto/Options/Futures)
- Entry/Exit Preise & Dates
- Quantity, Stop Loss, Take Profit
- Automatische P&L Berechnung
- Strategy-Zuordnung
- Tags & Notizen
- Screenshot-Upload Support

## 🔐 Sicherheit

- Passwörter mit bcrypt gehashed (12 Rounds)
- JWT Tokens mit Expiration
- Rate Limiting (100 req/15min)
- Helmet Security Headers
- Input Validation mit Zod
- SQL Injection Schutz durch Prepared Statements

## 📝 Nächste Schritte

1. ✅ Backend API komplett
2. 🔄 Frontend React App erstellen
3. 📈 Chart Visualisierung für P&L
4. 📸 Screenshot Upload implementieren
5. 📊 Advanced Analytics Dashboard
6. 🔔 Trade-Benachrichtigungen
7. 📱 Mobile App (React Native)

## 🚀 Deployment

Empfohlene Plattformen:
- **Backend**: Railway, Render, Fly.io
- **Database**: Railway PostgreSQL, Supabase
- **Frontend**: Vercel, Netlify
- **File Storage**: Cloudinary, AWS S3

## 💡 Entwicklung

```bash
# Backend Development
npm run dev:backend

# Frontend Development (wenn fertig)
npm run dev:frontend

# Beide gleichzeitig
npm run dev
```

## 📄 Lizenz

MIT
