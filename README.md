# 🎬 SceneSync

<div align="center">

**A collaborative film pre-production platform for modern filmmakers**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_SceneSync-success?style=for-the-badge)](https://scene-sync-tau.vercel.app)
[![Backend API](https://img.shields.io/badge/🔗_API-Backend_Server-informational?style=for-the-badge)](https://scenesync-backend.onrender.com)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat&logo=socket.io)](https://socket.io/)

</div>

---

## 📖 About

SceneSync is a cloud-based film pre-production platform that streamlines the creative process from script to screen. Collaborate in real-time with your team on scripts, storyboards, scene breakdowns, and shot sequences—all in one place.

---

## ✨ Key Features

- **📝 Script Editor** - Industry-standard screenplay formatting with real-time collaboration
- **🎨 Storyboard Canvas** - Interactive drawing tools with live collaboration
- **🤖 AI Scene Breakdown** - Automatic analysis powered by Google Gemini AI
- **🎬 Shot Sequencing** - Timeline-based shot planning with audio support
- **👥 Team Collaboration** - Email invitations, real-time sync, and comments
- **☁️ Cloud Storage** - Cloudinary integration for persistent file storage

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Socket.IO, Fabric.js  
**Backend:** Node.js, Express, MongoDB, Socket.IO  
**Cloud:** Cloudinary (storage), Vercel (frontend), Render (backend)  
**AI:** Google Gemini API  
**Email:** Brevo SMTP

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x+
- MongoDB Atlas account
- Cloudinary account
- Brevo SMTP credentials

### Installation

```bash
# Clone repository
git clone https://github.com/Shweta-Tech-creator/SceneSync.git
cd SceneSync

# Backend setup
cd backend
npm install
# Create .env file (see .env.example)
npm run dev

# Frontend setup
cd ../frontend
npm install
# Create .env file (VITE_API_URL=http://localhost:3000)
npm run dev
```

### Environment Variables

**Backend (.env):**
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5174
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_USER=your_brevo_login
SMTP_PASS=your_brevo_key
EMAIL_USER=your_email@gmail.com
GEMINI_API_KEY=your_gemini_key
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

---

## 📦 Deployment

**Frontend (Vercel):**  
Connect GitHub repo → Set `VITE_API_URL` → Deploy

**Backend (Render):**  
Create Web Service → Add environment variables → Deploy

**Cloudinary:**  
Sign up at [cloudinary.com](https://cloudinary.com/) → Get credentials → Add to backend env

---

## 🎯 Usage

1. **Create Project** - Click "+ New Project" on dashboard
2. **Invite Team** - Add collaborators via email
3. **Write Script** - Use industry-standard formatting
4. **Draw Storyboards** - Create visual frames on canvas
5. **AI Analysis** - Get automatic scene breakdown
6. **Plan Shots** - Build shot sequences with audio
7. **Export** - Download scripts, storyboards, or videos

---

## 👨‍💻 Author

**Shweta Kadam**  
📧 kadamsweta92@gmail.com  
🔗 [GitHub](https://github.com/Shweta-Tech-creator)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/Shweta-Tech-creator/SceneSync?style=social)](https://github.com/Shweta-Tech-creator/SceneSync/stargazers)

</div>
