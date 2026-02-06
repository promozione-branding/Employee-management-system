# Employee-management-system 👥

[![Version](https://img.shields.io/npm/v/own-crm?label=version)](https://www.npmjs.com/package/own-crm)  
[![License](https://img.shields.io/github/license/Aalekh-coder/Employee-management-system)](https://github.com/Aalekh-coder/Employee-management-system/blob/main/LICENSE)

A comprehensive employee management system built with modern JavaScript technologies to streamline HR processes. It offers features like performance tracking, attendance monitoring, leave management, and detailed analytics dashboards to empower teams and managers.

## ✨ Features

- Interactive employee dashboards with performance and attendance charts  
- Department-wise employee distribution and tenure insights  
- Leave & attendance tracking with monthly reports  
- Team skills assessment and salary distribution visualization  
- Quick action buttons for adding employees, managing leave, and performance reviews  
- Real-time team member status and contact information  
- Secure authentication and role-based access (implied by dependencies)  
- Integration with calendar, reminders, and notifications  

## 🚀 Installation

1. **Clone the repository**  
```bash
git clone https://github.com/Aalekh-coder/Employee-management-system.git
cd Employee-management-system
```

2. **Install dependencies**  
Make sure you have Node.js installed (v16+ recommended). Then run:  
```bash
npm install
```

3. **Configure environment variables**  
Create a `.env` file based on `.env.example` and fill in your credentials.

4. **Run the development server**  
```bash
npm run dev
```

5. **Build for production**  
```bash
npm run build
```

6. **Start production server**  
```bash
npm start
```

## 💻 Usage

- Access the app via your browser at `http://localhost:3000` by default.  
- Use the dashboard to view employee performance trends, department stats, and attendance reports.  
- Add new employees or manage existing ones using the quick action buttons.  
- Navigate through tabs to analyze team skills, salary distribution, and leave reports.  
- Monitor recent employee activities and stay updated with announcements.  
- Use the calendar and reminders integrated within the dashboard to plan and track tasks.

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.  
Ensure code follows existing style and includes proper error handling.  
Run linting before commits:  
```bash
npm run lint
```

## 📄 License

This project is licensed under the [MIT License](https://github.com/Aalekh-coder/Employee-management-system/blob/main/LICENSE).

---

## .env.example

```env
# MongoDB connection string (replace <username>, <password>, <dbname>)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT secret for authentication (keep this secure and private)
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary credentials for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email service credentials for notifications
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Node environment
NODE_ENV=development

# Notes:
# - Replace placeholder values with your actual credentials.
# - Keep this file secure and never commit sensitive data to public repos.
# - For Cloudinary, get API keys at https://cloudinary.com/users/register
# - For email, ensure less secure app access is enabled or use app-specific passwords if required.
```
