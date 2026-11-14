// zz-uselsss-file.js


//     pm2 restart employee-app



cd Promozione-App/ && \
cd Employee-management-system/ && \
git pull origin bijdey && \
npm run build && \
pm2 restart employee-app && \
pm2 restart workflow-renewal && \
pm2 save && \
echo "✅ Deployment completed successfully!" && \
exit



pm2 logs workflow-renewal --lines 30