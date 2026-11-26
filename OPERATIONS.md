# Running the Sentinel backend

The "backend" is one Node.js process (`server.js`) managed by systemd, with all data in `/opt/sentinel/data`. There is no separate database server to run.

## Routine (about 10 minutes a week)
- **Is it up?** Add `https://yourdomain.com/api/health` to UptimeRobot (free), checked every 5 minutes, with an email alert.
- **Logs:** `sudo journalctl -u sentinel -n 100 --no-pager` (add `-f` to follow live).
- **Abuse reports:** `cd /opt/sentinel && sudo -u sentinel node scripts/admin.js reports`
  - disable a link: `node scripts/admin.js revoke <linkId>`
  - erase an abusive user and their files: `node scripts/admin.js delete-user <email>`
- **Disk space:** `df -h /` and `du -sh /opt/sentinel/data`. Each user can store up to 5 GB, so plan for users x 5 GB at worst.

## Backups
- The nightly cron runs `scripts/backup.js`, which writes `/opt/sentinel/backups/*.tar.gz` (keeps the last 14). A backup holds the encrypted files plus the database.
- **A backup is useless without `MASTER_KEY`.** It lives only in `.env` and in your own offline copy. Never store it next to the backups.
- Copy backups off the server, because a server failure would take both. Example with rclone to Cloudflare R2 or Backblaze B2 (both have free tiers):
  `0 4 * * * rclone copy /opt/sentinel/backups remote:sentinel-backups`
- **Do a restore test once:** extract a backup into a spare folder, start a second copy on another port, and log in.
- Real restore: `sudo systemctl stop sentinel`, then `tar -xzf backups/FILE.tar.gz -C data/`. Rename the extracted `snapshot-*.db` to `sentinel.db` and delete `sentinel.db-wal` and `sentinel.db-shm`. Then `sudo systemctl start sentinel`.

## Updates and security upkeep
- Deploy new code: `bash /opt/sentinel/deploy/update.sh` (it takes a backup first).
- Monthly: `cd /opt/sentinel && npm audit --omit=dev`, and `sudo apt update && sudo apt upgrade -y` (reboot if asked).
- Stay on a Node LTS version. Turn on GitHub **Dependabot alerts** and **secret scanning** for the repo.
- If you suspect `JWT_SECRET` leaked, change it and restart: everyone is signed out. **Never change `MASTER_KEY`** without a re-encryption script, or existing files become unreadable.
- Never commit `.env` or `data/`. If a secret ever lands on GitHub, treat it as leaked and replace it.

## When something breaks
- Site down: `sudo systemctl status sentinel`, read the logs, then `sudo systemctl restart sentinel`.
- Disk full: delete old `backups/`, ask users to empty trash, or enlarge the disk.
- Google sign-in fails: check that `APP_URL` and the Google redirect URI match exactly, and that the Google app is set to "In production".
