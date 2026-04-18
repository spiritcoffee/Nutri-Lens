#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
#  Nutri-Lens · setup.sh
#  Run once after cloning: bash setup.sh
# ──────────────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "${GREEN}  ✔  $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠  $1${NC}"; }
err()  { echo -e "${RED}  ✖  $1${NC}"; }
info() { echo -e "     $1"; }

echo ""
echo -e "${BOLD}🥗  Nutri-Lens — First-time setup${NC}"
echo "──────────────────────────────────────────"

# ── 1. Node version ───────────────────────────────────────────────────
NODE_MAJOR=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])" 2>/dev/null || echo "0")
if [ "$NODE_MAJOR" -ge 18 ]; then
  ok "Node.js $(node -v)"
else
  err "Node.js 18+ required (found: $(node -v 2>/dev/null || echo 'not installed'))"
  info "Install from https://nodejs.org or use nvm: nvm install 20"
  exit 1
fi

# ── 2. npm install ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Installing dependencies…${NC}"
npm install
ok "Dependencies installed"

# ── 3. .env.local check ───────────────────────────────────────────────
echo ""
echo -e "${BOLD}Checking environment…${NC}"

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  warn ".env.local created from .env.example"
  echo ""
  echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ACTION REQUIRED — IMPORTANT                                 ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  Open ${BOLD}.env.local${NC} and fill in your Google OAuth Client ID:"
  echo ""
  echo -e "    ${GREEN}VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com${NC}"
  echo ""
  echo -e "  Get one at: ${BOLD}https://console.cloud.google.com/apis/credentials${NC}"
  echo ""
  echo -e "  Steps:"
  echo -e "    1. Create a ${BOLD}Web application${NC} OAuth 2.0 Client ID"
  echo -e "    2. Add ${GREEN}http://localhost:5173${NC} as an Authorised JavaScript Origin"
  echo -e "    3. Copy the Client ID into ${BOLD}.env.local${NC}"
  echo ""
else
  # Check if the placeholder is still there or the key is empty
  CURRENT_ID=$(grep 'VITE_GOOGLE_CLIENT_ID' .env.local | cut -d'=' -f2 | tr -d ' ')
  if [ -z "$CURRENT_ID" ] || [ "$CURRENT_ID" = "your-client-id.apps.googleusercontent.com" ]; then
    warn ".env.local exists but VITE_GOOGLE_CLIENT_ID is not set"
    echo ""
    echo -e "  Edit ${BOLD}.env.local${NC} and add:"
    echo -e "    ${GREEN}VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com${NC}"
    echo ""
    echo -e "  Get one at: ${BOLD}https://console.cloud.google.com/apis/credentials${NC}"
    echo ""
  else
    ok "VITE_GOOGLE_CLIENT_ID is configured"
  fi
fi

# ── 4. Done ───────────────────────────────────────────────────────────
echo "──────────────────────────────────────────"
echo -e "${GREEN}${BOLD}  Setup complete!${NC}"
echo ""
echo -e "  Start the dev server:"
echo -e "    ${BOLD}npm run dev${NC}   →   http://localhost:5173"
echo ""

# If env is not set, don't auto-start — let them configure first
if [ ! -f ".env.local" ] || [ -z "$(grep 'VITE_GOOGLE_CLIENT_ID' .env.local | cut -d'=' -f2 | tr -d ' ')" ]; then
  warn "Configure .env.local before starting the server (app will show a setup screen otherwise)"
fi
