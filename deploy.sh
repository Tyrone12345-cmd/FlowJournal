#!/bin/bash

# FlowJournal Quick Deployment Script für DigitalOcean
# Dieses Script führt alle notwendigen Schritte für das erste Deployment aus

set -e  # Exit bei Fehler

echo "🚀 FlowJournal Deployment Script"
echo "================================="
echo ""

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funktion für Success Messages
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Funktion für Info Messages
info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Funktion für Error Messages
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    error ".env Datei nicht gefunden!"
    echo "Bitte erstelle eine .env Datei basierend auf .env.production.example"
    echo "Befehl: cp .env.production.example .env"
    echo "Danach bearbeite die .env Datei und fülle alle Werte aus."
    exit 1
fi

success ".env Datei gefunden"

# Prüfe ob Docker läuft
if ! docker info > /dev/null 2>&1; then
    error "Docker läuft nicht! Bitte starte Docker."
    exit 1
fi

success "Docker läuft"

# Stoppe alte Container falls vorhanden
info "Stoppe alte Container..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
success "Alte Container gestoppt"

# Baue und starte Container
info "Baue Docker Images (das kann einige Minuten dauern)..."
docker-compose -f docker-compose.prod.yml build --no-cache

success "Docker Images gebaut"

info "Starte Container..."
docker-compose -f docker-compose.prod.yml up -d

success "Container gestartet"

# Warte auf Datenbank
info "Warte auf Datenbank..."
sleep 10

# Prüfe Container Status
info "Prüfe Container Status..."
docker-compose -f docker-compose.prod.yml ps

# Prüfe Health Check
info "Warte auf Backend Health Check..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        success "Backend ist bereit!"
        break
    fi
    attempt=$((attempt + 1))
    echo "Versuch $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    error "Backend antwortet nicht! Prüfe die Logs:"
    echo "docker-compose -f docker-compose.prod.yml logs backend"
    exit 1
fi

echo ""
echo "================================="
success "Deployment erfolgreich! 🎉"
echo "================================="
echo ""
echo "📊 Anwendung ist verfügbar:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "📋 Nützliche Befehle:"
echo "   Logs anzeigen:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Container stoppen: docker-compose -f docker-compose.prod.yml down"
echo "   Neu starten:      docker-compose -f docker-compose.prod.yml restart"
echo ""
info "Wenn du eine Domain hast, konfiguriere Nginx als Reverse Proxy"
info "Siehe DEPLOYMENT.md für Details"
echo ""
