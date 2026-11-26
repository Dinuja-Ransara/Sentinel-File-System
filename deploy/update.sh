#!/usr/bin/env bash
# Update Sentinel to the latest code on GitHub. Run on the server: bash /opt/sentinel/deploy/update.sh
set -euo pipefail
cd /opt/sentinel
sudo -u sentinel node scripts/backup.js        # safety backup first
sudo git pull --ff-only
sudo npm ci --omit=dev
sudo chown -R sentinel:sentinel /opt/sentinel
sudo systemctl restart sentinel
sleep 2 && curl -fsS localhost:3000/api/health && echo " <- healthy"
