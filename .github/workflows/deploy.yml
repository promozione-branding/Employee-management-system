name: Deploy CRM to VPS

# Trigger on every push to main branch
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # Step 1: Checkout the repository
      - name: Checkout code
        uses: actions/checkout@v3

      # Step 2: Setup SSH key for VPS
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

      # Step 3: Deploy to VPS
      - name: Deploy to VPS
        run: |
          ssh -i ~/.ssh/id_ed25519 ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} "
            cd ${{ secrets.VPS_PATH }} &&
            git pull origin main &&
            npm install &&
            npm run build &&
            pm2 restart next-crm
          "