#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Install pnpm if missing (check for pnpm command)
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

npm run build
echo "Starting Cipher in API Mode..."
npm start -- --mode api
