# DevOps Strategy Handbook (Hackathon-to-Production)

This handbook documents the Git branching strategy, CI/CD pipelines, security gates, and server configurations for your team's AWS EC2 deployment.

---

## 1. Deployment Architecture

This diagram visualizes how code travels from a developer's machine to either Staging or Production environments.

```mermaid
graph TD
    %% Roles
    Dev[Developer]
    TL[Team Lead]
    
    %% Branches
    subgraph Git Repository
        FB[feature/*]
        DB[develop]
        MB[main]
    end
    
    %% Triggers & Verification
    subgraph GitHub Actions
        PR_Gate{PR to develop?}
        Val[Validate: Lint & Unit Tests]
        StgDeploy[Deploy Staging]
        ProdDeploy[Deploy Production]
        EnvGate{GitHub Env Approval}
    end

    %% Environments
    subgraph AWS EC2
        EC2_Stg[(Staging Server)]
        EC2_Prod[(Production Server)]
    end

    %% Relationships
    Dev -->|Push| FB
    FB -->|Create PR| PR_Gate
    PR_Gate -->|Yes| Val
    Val -->|Pass & Merge| DB
    DB -->|Auto Trigger| StgDeploy
    StgDeploy -->|SSH & Docker Compose| EC2_Stg
    
    DB -->|Create PR| MB
    TL -->|Review & Merge| MB
    MB -->|Trigger| EnvGate
    EnvGate -->|TL Approved| ProdDeploy
    ProdDeploy -->|SSH & Docker Compose| EC2_Prod
```

---

## 2. Git Branching Strategy

To maintain velocity while ensuring stability:

| Branch Name | Source Branch | Target Branch | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `feature/*` | `develop` | `develop` | Active development for specific tasks, features, or bug fixes. |
| `develop` | `develop` | `main` | Integration branch representing the staging state of the app. |
| `main` | `develop` | None | Production branch. Represents the stable state of the app. |

---

## 3. Branch Protection Rules

To prevent broken code from merging:

### For `develop` Branch
1. Navigate to **Settings** > **Branches** > **Add branch protection rule**.
2. **Branch name pattern**: `develop`.
3. Check: **Require a pull request before merging** (Require 1 approval).
4. Check: **Require status checks to pass before merging**.
   *   Search and select: `Backend Lint & Test`, `Frontend Build Check`, and `Docker Build Validation`.
5. Check: **Do not allow bypassing the above settings** (applies to administrators too).

### For `main` Branch
1. Navigate to **Settings** > **Branches** > **Add branch protection rule**.
2. **Branch name pattern**: `main`.
3. Check: **Require a pull request before merging** (Require 1 approval from a Team Lead).
4. Check: **Require status checks to pass before merging**.
   *   Search and select: `Run Production Pre-checks`.
5. Check: **Do not allow bypassing the above settings**.

---

## 4. Required GitHub Secrets & Environments

Configure these variables inside your GitHub repository settings under **Settings** > **Secrets and variables** > **Actions**:

### A. Environment Configuration
Create a GitHub Environment named **`production`**:
1. Go to **Settings** > **Environments** > **New environment**. Name it `production`.
2. Check **Required reviewers** and add the Team Lead(s).
3. Save.

### B. Repository Secrets (Global)
These secrets are used in both staging and production pipelines:

| Secret Name | Value Example | Description |
| :--- | :--- | :--- |
| `STAGING_EC2_HOST` | `13.206.221.56` | Public IP or DNS of the Staging EC2. |
| `STAGING_EC2_USERNAME`| `ubuntu` | Login SSH user for Staging. |
| `STAGING_EC2_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Private key (`.pem`) for Staging. |
| `PROD_EC2_HOST` | `3.108.12.34` | Public IP or DNS of the Production EC2. |
| `PROD_EC2_USERNAME`   | `ubuntu` | Login SSH user for Production. |
| `PROD_EC2_SSH_KEY`    | `-----BEGIN RSA PRIVATE KEY-----...` | Private key (`.pem`) for Production. |

---

## 5. EC2 Server Setup Commands

Run these setup commands once on both your **Staging** and **Production** Ubuntu EC2 instances to prepare them for deployment:

```bash
# 1. Update OS package cache
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# 3. Add current user (ubuntu) to docker group to run docker commands without sudo
sudo usermod -aG docker $USER
newgrp docker # Activate group changes immediately

# 4. Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# 5. Disable host-installed webservers (e.g. nginx) to free port 80/443 for our containerized Nginx
sudo systemctl stop nginx || true
sudo systemctl disable nginx || true
```

---

## 6. Multi-Environment CI/CD Workflows

The following CI/CD workflows are configured:

1. **Pull Request Validation**: [.github/workflows/validate.yml](file:///.github/workflows/validate.yml) - Runs Python formatting syntax checks, backend unit tests, frontend build checks, and docker compose build validation on PRs.
2. **Staging CD Pipeline**: [.github/workflows/deploy-staging.yml](file:///.github/workflows/deploy-staging.yml) - Triggered automatically on push/merge to `develop`.
3. **Production CD Pipeline**: [.github/workflows/deploy-production.yml](file:///.github/workflows/deploy-production.yml) - Triggered on push/merge to `main`. It runs tests, requests manual approval, and deploys to the Production EC2.

---

## 7. Rollback Strategy

If a deployment fails or contains critical bugs in production, execute one of the following methods:

### Method A: Git Revert (Clean & Preferred)
1. Revert the problematic commit in your local `main` branch:
   ```bash
   git log --oneline # Identify the bad commit ID
   git revert <commit-id>
   ```
2. Push the reverted commit to GitHub:
   ```bash
   git push origin main
   ```
3. This triggers the production pipeline again, deploying the previous stable state.

### Method B: Manual SSH Rollback (Fastest Emergency Fix)
If the CI/CD pipeline is broken and you need to restore the server immediately, SSH into the EC2 instance and run:
```bash
cd ~/hackathon-production # or ~/hackathon-staging

# Checkout the previous git commit
sudo git fetch --all
sudo git reset --hard <last-known-good-commit-id>

# Rebuild and restart the stable container version
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up --build -d
```

---

## 8. Team Best Practices (3–10 Developers)

1. **Short-Lived Feature Branches**: Never let a feature branch live longer than 24 hours. Commit often and merge to `develop` daily to avoid huge merge conflicts.
2. **Keep the Pipeline Green**: If the `validate` pipeline fails on a PR, the author must fix it before asking for code reviews.
3. **Continuous Staging Testing**: Treat the Staging EC2 as your source of truth. Before submitting a PR to merge `develop` into `main`, test all user flows on the staging server.
4. **Use Shared Env Files**: Set up a shared secure channel (like 1Password or shared Discord notes) for backend environment variables, and add keys to the `docker-compose` env files if required.
