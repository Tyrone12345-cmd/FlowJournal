# Screenshot-Speicherung in FlowJournal

## Wo werden Trades gespeichert?

### Datenbank
- **System**: PostgreSQL
- **Tabelle**: `trades`
- **Server**: Läuft auf Port 3001 (Backend)
- **Connection**: Konfiguriert in `.env` Datei

### Trade-Daten Struktur

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  symbol VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  quantity DECIMAL(20, 8) NOT NULL,
  entry_date TIMESTAMP NOT NULL,
  exit_date TIMESTAMP,
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  profit_loss DECIMAL(20, 8),
  profit_loss_percent DECIMAL(10, 4),
  fees DECIMAL(20, 8) DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  emotions TEXT,           -- NEU: Emotionen während des Trades
  mistakes TEXT,           -- NEU: Fehler/Learnings
  screenshots TEXT[],      -- URLs zu hochgeladenen Screenshots
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Wie werden Screenshots gespeichert?

### ✅ Neue Implementierung (Empfohlen)

Screenshots werden jetzt **NICHT mehr als Base64** in der Datenbank gespeichert, sondern:

1. **Upload zum Server**
   - Endpoint: `POST /api/upload/screenshot`
   - Datei wird auf Server gespeichert: `backend/uploads/screenshots/`
   - Generiert eindeutigen Dateinamen: `screenshot-{timestamp}-{random}.jpg`

2. **URL-Speicherung in Datenbank**
   - Nur die URL wird gespeichert, z.B.: `http://localhost:3001/uploads/screenshots/screenshot-123456789.jpg`
   - Spalte: `screenshots TEXT[]` (Array von URLs)

3. **Vorteile**
   - ✅ Schnellere Datenbank (keine großen Base64-Strings)
   - ✅ Bessere Performance beim Laden
   - ✅ Einfacher zu skalieren (kann später auf S3, Cloudinary, etc. migriert werden)
   - ✅ Dateigrößen-Limit: 5MB pro Bild
   - ✅ Erlaubte Formate: JPEG, PNG, GIF, WebP

### Technische Details

#### Backend (server.ts)
```typescript
// Statische Dateien werden unter /uploads verfügbar gemacht
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Upload-Route
app.use('/api/upload', uploadRoutes);
```

#### Frontend (TradeFormPage.tsx)
```typescript
const handleImageUpload = async (e) => {
  const files = e.target.files;
  // Upload jedes Bild einzeln zum Server
  const urls = await Promise.all(
    files.map(file => uploadAPI.uploadScreenshot(file))
  );
  // Speichere nur die URLs
  setScreenshots([...screenshots, ...urls]);
};
```

#### API (uploadRoutes.ts)
```typescript
// Single Upload
POST /api/upload/screenshot
Body: FormData with 'screenshot' file
Response: { url: string, filename: string }

// Multiple Upload
POST /api/upload/screenshots  
Body: FormData with 'screenshots' files (max 10)
Response: { files: [{ url: string, filename: string }] }
```

### Migrations ausführen

Um die neuen Spalten `emotions` und `mistakes` hinzuzufügen:

```bash
cd backend
npm run migrate
```

Oder manuell:
```sql
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS emotions TEXT,
ADD COLUMN IF NOT EXISTS mistakes TEXT;
```

## Beispiel-Workflow

1. **User wählt Screenshot aus**
2. **Frontend uploaded Datei** → `POST /api/upload/screenshot`
3. **Backend speichert Datei** → `backend/uploads/screenshots/screenshot-123.jpg`
4. **Backend antwortet mit URL** → `http://localhost:3001/uploads/screenshots/screenshot-123.jpg`
5. **Frontend speichert URL** im Screenshots-Array
6. **Trade wird erstellt** mit URLs im `screenshots` Feld
7. **Screenshots werden angezeigt** durch direkten Zugriff auf die URLs

## Sicherheit

- ✅ Nur authentifizierte User können uploaden
- ✅ Nur Bilder erlaubt (JPEG, PNG, GIF, WebP)
- ✅ Maximale Dateigröße: 5MB
- ✅ Eindeutige Dateinamen verhindern Überschreibungen
- ✅ Uploaded Dateien werden in `/uploads` gespeichert (nicht in git)

## Deployment-Hinweise

Für Production sollten Screenshots auf einem CDN gespeichert werden:
- AWS S3 + CloudFront
- Cloudinary
- DigitalOcean Spaces
- Google Cloud Storage

Dies ermöglicht:
- Unbegrenzte Speicherkapazität
- Automatische Bildoptimierung
- Weltweite CDN-Verteilung
- Bessere Performance
