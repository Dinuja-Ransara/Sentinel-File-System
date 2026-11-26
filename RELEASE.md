# Releasing v1.0.0
1. Confirm `git status` shows no `.env` or `data/` files, then:
   `git add . && git commit -m "release: v1.0.0 (free Starter plan)"`
2. `git tag -a v1.0.0 -m "Sentinel v1.0.0" && git push origin main --tags`
3. GitHub → Releases → Draft a new release → choose tag v1.0.0 → paste the 1.0.0 section of CHANGELOG.md → Publish.
4. Deploy with deploy/DEPLOY.md.
