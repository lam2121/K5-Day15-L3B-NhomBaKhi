# Deploy CramAI to an Oracle Cloud VPS

## Runtime layout

The student SPA, admin SPA and API use the same origin. HTTPS supports either the supplied public IPv4 address or a domain name. The FastAPI container serves the built frontend at / and /admin/, and the API at /api/v1. Caddy keeps `/admin` as the canonical public URL, rewrites it internally to the FastAPI `/admin/` mount, and redirects `/admin/` back to `/admin`. Caddy is the only public-facing container: it terminates HTTPS and proxies to the app over the private Compose network. TCP port 8000 is not published on the VPS.

The cramai_data named volume stores the database and application documents under /data. Caddy's certificate and configuration data use separate named volumes. Uploaded source documents are not mounted into a public static directory.

## 1. Prepare the Oracle instance

1. Create an Ubuntu 22.04 or 24.04 Compute instance in a public subnet and assign a public IPv4 address. Reserve the address if you need it to remain stable after instance changes.
2. In the VCN security list or network security group, allow inbound TCP 80 and 443 from the internet. Allow TCP 22 only from your own trusted IP range. Do not add an inbound rule for port 8000.
3. Apply matching host firewall rules. Docker-published ports can bypass some host firewall rules, so keep the Oracle VCN rules as the outer boundary.
4. You can use the reserved public IPv4 address directly as DOMAIN, or create a DNS A record pointing an FQDN to that address. Reserve the IP so it remains stable.
5. Install Docker Engine and the Docker Compose plugin from Docker's official Ubuntu repository. The deployment account must be able to run docker compose.

## 2. Clone and configure

Clone the public repository into a dedicated deployment directory. The deployment workflow resets this checkout to the tested main commit, so use a dedicated directory without unrelated files.

```sh
sudo mkdir -p /opt/cramai
sudo chown "$USER":"$USER" /opt/cramai
git clone --branch main --single-branch https://github.com/lam2121/K5-Day15-L3B-NhomBaKhi.git /opt/cramai
cd /opt/cramai
cp deploy/oracle/.env.oracle.example deploy/oracle/.env.oracle
chmod 600 deploy/oracle/.env.oracle
nano deploy/oracle/.env.oracle
```

Set DOMAIN to the public IPv4 address or FQDN, replace the admin password, and configure the model provider. Leave MODEL_PROVIDER=fake only when you intend to run the fake provider. Keep the model key in this untracked file; never commit it or paste it into GitHub issues or logs.

Validate the Compose file without printing its expanded environment:

```sh
docker compose --env-file deploy/oracle/.env.oracle -f deploy/oracle/compose.yml config --quiet
```

## 3. Start the site

```sh
docker compose --env-file deploy/oracle/.env.oracle -f deploy/oracle/compose.yml up -d --build
docker compose --env-file deploy/oracle/.env.oracle -f deploy/oracle/compose.yml ps
docker compose --env-file deploy/oracle/.env.oracle -f deploy/oracle/compose.yml logs --tail=100 app caddy
```

Open https://<DOMAIN>/ for the student experience and https://<DOMAIN>/admin for the admin interface. Requests to the old `/admin/` path redirect to the canonical no-trailing-slash URL. Caddy 2.11.7 uses Let's Encrypt's shortlived profile for direct IP certificates; those certificates last 160 hours and Caddy renews them automatically. The default_sni setting lets clients that omit SNI (common when connecting by IP) select the IP certificate. Keep ports 80 and 443 reachable so certificate validation and renewal work.

## 4. Enable CI/CD deployment from main

The deploy job is part of the existing CI workflow. It waits for the Ubuntu/Windows tests and web image/smoke checks, then deploys the exact tested commit from main. It is disabled until the Oracle secrets and variable are configured.

1. Create a GitHub environment named oracle-production.
2. Add these environment secrets:
   - ORACLE_HOST: the instance public IP or DNS name.
   - ORACLE_SSH_USER: the non-root deployment user.
   - ORACLE_SSH_PRIVATE_KEY: that user's private SSH key; add only the public key to the VPS.
   - ORACLE_SSH_KNOWN_HOSTS: the verified host-key line for ORACLE_HOST.
   - ORACLE_SSH_KNOWN_HOSTS must contain the host key verified against the SSH host-key fingerprint from the Oracle instance console; do not trust an unverified ssh-keyscan result.
   - ORACLE_DEPLOY_PATH: the dedicated checkout path, for example /opt/cramai.
3. Add the repository variable ORACLE_VPS_DEPLOY_ENABLED with value true only after the server clone, private .env.oracle, DNS, Docker and Compose are ready.
4. Confirm the VPS already has the repository cloned, deploy/oracle/.env.oracle configured, and Docker Compose working.

After this setup, each successful push to main automatically deploys the tested commit. The existing workflow_dispatch event can also be run manually from main. The workflow fetches and resets only the dedicated checkout, pulls Caddy, rebuilds the app image, and recreates the Compose services. Uncommitted code changes in that checkout will be discarded; the /data named volume is separate from the Git checkout and is retained.

## Data and operations

- Back up the cramai_data volume and store the encrypted backup somewhere other than the VPS. It contains the database and private application data. Test restoring a backup before relying on it.
- Back up the Caddy volumes if you want to preserve the current certificate state; Caddy can also request certificates again when ports and DNS are available.
- Update manually with git pull --ff-only origin main followed by the docker compose up -d --build command above, or use CI/CD.
- docker compose logs -f app caddy shows service logs. Do not publish logs without checking them for prompts, learner data, or credentials.
- Port 8000 is intentionally internal. Public traffic should enter only through Caddy on 80/443, with the admin interface protected by the configured credentials and HTTPS.
