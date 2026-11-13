
//     pm2 restart employee-app




cd Promozione-App/ &&
cd Employee-management-system/ &&
git pull origin bijdey &&
npm run build &&
pm2 restart employee-app &&
pm2 save &&
echo "✅ Deployment completed successfully!" &&
exit