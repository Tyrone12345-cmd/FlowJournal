# Google OAuth Setup Anleitung

## Schritt 1: Google Cloud Console

1. Gehe zu https://console.cloud.google.com/
2. Erstelle ein neues Projekt (oder wähle ein bestehendes)
3. Aktiviere die **Google+ API**

## Schritt 2: OAuth Credentials erstellen

1. Gehe zu **APIs & Services** → **Credentials**
2. Klicke auf **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Wähle **Web application**
4. Konfiguriere:
   - **Name**: FlowJournal
   - **Authorized JavaScript origins**: 
     - `http://localhost:5175`
     - `http://localhost:3001`
   - **Authorized redirect URIs**:
     - `http://localhost:3001/api/auth/google/callback`
5. Klicke auf **CREATE**

## Schritt 3: Credentials in .env eintragen

Du bekommst nun **Client ID** und **Client Secret**.

Öffne `backend/.env` und füge ein:

```env
GOOGLE_CLIENT_ID=deine-client-id-hier
GOOGLE_CLIENT_SECRET=dein-client-secret-hier
```

## Schritt 4: Server neu starten

Stoppe den Server (Ctrl+C) und starte neu:
```bash
npm run dev
```

## Schritt 5: Testen

1. Gehe zu http://localhost:5175/register
2. Klicke auf **"Mit Google fortfahren"**
3. Wähle dein Google-Konto
4. Du wirst automatisch eingeloggt und zum Dashboard weitergeleitet

## Wichtig für Production

Für Production musst du in Google Cloud Console noch hinzufügen:
- Production URL (z.B. `https://flowjournal.com`)
- Production Callback URL (z.B. `https://flowjournal.com/api/auth/google/callback`)

Und in `.env`:
```env
GOOGLE_CALLBACK_URL=https://flowjournal.com/api/auth/google/callback
```
