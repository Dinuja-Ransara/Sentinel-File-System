# Host Sentinel v1.0 (simple steps)

**Where do uploaded files live?** On your server, in the `data/` folder next to the app:
`data/files/` holds every upload, already encrypted (AES-256, one key per file) and named by a random ID, and
`data/sentinel.db` holds accounts, links and the (wrapped) file keys. Nothing is stored on GitHub or any third party.
That is why the server needs a disk that **survives restarts**, and why backups matter (see OPERATIONS.md).

## What you need
- A server that keeps its disk: the **Oracle Cloud Always Free VM** (Ubuntu) is the free option. Render/Heroku-style free tiers wipe the disk.
- A **domain name** (about $10/year). Needed for HTTPS and for Google sign-in to work for the public.
  Free subdomains (DuckDNS etc.) can work for testing, but Google may refuse to approve them for public use.
- Your code on GitHub (the `.gitignore` already keeps `.env` and `data/` out).

## Step 1: create the server
Oracle Cloud -> Compute -> Create instance -> Ubuntu, "Always Free" shape. Download the SSH key. Note the public IP.

## Step 2: open the web ports (both places)
1. Oracle console: your VCN -> Security List -> add ingress rules for TCP **80** and **443** from `0.0.0.0/0`.
2. On the server (SSH in: `ssh -i key ubuntu@YOUR_IP`):
```
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## Step 3: install the tools
```
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs git
```
Install Caddy (automatic HTTPS): follow https://caddyserver.com/docs/install#debian-ubuntu-raspbian

## Step 4: point your domain at the server
At your domain provider add an **A record**: `yourdomain.com` -> your server's public IP.

## Step 5: put the app on the server
```
sudo useradd -r -m -s /usr/sbin/nologin sentinel
sudo git clone https://github.com/YOUR-USER/Sentinel-File-System.git /opt/sentinel
cd /opt/sentinel && sudo npm ci --omit=dev
sudo cp .env.example .env
sudo nano .env
```
In `.env` set `NODE_ENV=production`, `APP_URL=https://yourdomain.com`, and generate `JWT_SECRET` and `MASTER_KEY`
(the command is inside the file). **Copy MASTER_KEY somewhere safe and offline right now.** Then:
```
sudo chmod 600 .env && sudo chown -R sentinel:sentinel /opt/sentinel
```

## Step 6: start it (and keep it running)
```
sudo cp deploy/sentinel.service /etc/systemd/system/
sudo systemctl enable --now sentinel
curl localhost:3000/api/health        # should print {"ok":1,...}
```

## Step 7: turn on HTTPS
Edit `deploy/Caddyfile` (replace `yourdomain.com`), then:
```
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy
```
Open `https://yourdomain.com`, create an account with email, upload a file, share it.

## Step 8: Google sign-in (so "Continue with Google" works)
1. https://console.cloud.google.com -> new project -> **APIs & Services -> OAuth consent screen**: app name Sentinel, your support email, add your domain under Authorized domains. Publish the app ("In production") when ready.
2. **Credentials -> Create credentials -> OAuth client ID -> Web application**.
   Authorized redirect URI: `https://yourdomain.com/api/auth/google/callback` (exactly).
3. Put the Client ID and Secret in `/opt/sentinel/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then `sudo systemctl restart sentinel`.
4. Test both: sign out and use Continue with Google, then also create a separate account with email.

## Step 9: backups and monitoring (do not skip)
```
sudo crontab -u sentinel -e
0 3 * * * cd /opt/sentinel && /usr/bin/node scripts/backup.js >> backup.log 2>&1
```
Then follow OPERATIONS.md to copy backups off the server and add the uptime monitor.

## Updating later
`bash /opt/sentinel/deploy/update.sh`
