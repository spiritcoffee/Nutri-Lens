#!/usr/bin/env bash
# =============================================================
#  Nutri-Lens — one-shot setup script
#  Usage:  bash setup.sh
# =============================================================

set -e  # exit immediately on any error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

echo ""
echo -e "${GREEN}🥗  Nutri-Lens Setup${NC}"
echo "============================================="

# ── 1. Check Node.js ─────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗  Node.js is not installed.${NC}"
  echo "   Please install Node.js 18+ from https://nodejs.org and re-run this script."
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗  Node.js 18+ is required (you have $(node -v)).${NC}"
  exit 1
fi
echo -e "${GREEN}✓  Node.js $(node -v) detected${NC}"

# ── 2. Install dependencies ───────────────────────────────────
echo ""
echo "📦  Installing dependencies..."
npm install
echo -e "${GREEN}✓  Dependencies installed${NC}"

# ── 3. Check for .env.local ──────────────────────────────────
echo ""
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠   .env.local not found — creating from template...${NC}"
  cp .env.example .env.local
  echo -e "${YELLOW}    ➜  Open .env.local and paste your Google OAuth Client ID.${NC}"
else
  if grep -q "YOUR_GOOGLE_CLIENT_ID_HERE" .env.local 2>/dev/null; then
    echo -e "${YELLOW}⚠   .env.local exists but still has the placeholder Client ID.${NC}"
    echo -e "${YELLOW}    ➜  Open .env.local and replace YOUR_GOOGLE_CLIENT_ID_HERE with your real Client ID.${NC}"
  else
    echo -e "${GREEN}✓  .env.local is configured${NC}"
  fi
fi

# ── 4. Done ───────────────────────────────────────────────────
echo ""
echo "============================================="
echo -e "${GREEN}✅  Setup complete!${NC}"
echo ""
echo "   Start the dev server with:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "   Then open: http://localhost:5173"
echo ""
