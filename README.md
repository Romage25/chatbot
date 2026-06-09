# 🤖 RomageBot

An AI-powered chatbot web application that allows users to interact with an AI assistant through natural conversation.

---

## 🌐 Live Demo

https://romagebot.vercel.app/

---

## 📌 Overview

RomageBot is a lightweight AI chatbot web application built for real-time conversational interaction.  
Users can send messages and receive AI-generated responses instantly through a clean and minimal chat interface.

The project focuses on:
- Simple UI/UX
- AI-driven responses
- Easy deployment and scalability

---

## ✨ Features

- 💬 Real-time AI chat interface  
- 🧠 AI-driven responses using Google AI API
- 📱 Responsive design (desktop & mobile)  
- 🌐 Deployed on Vercel  

---

## 🛠️ Tech Stack

- Frontend: React / Next.js, Typescript
- Styling: CSS / Tailwind CSS 
- AI Integration: Google Generative AI API (Gemini)  
- Hosting: Vercel  

---

## 🧩 Architecture

User → Chat UI → API Route → AI Model → Response → UI Display  

Flow:
1. User sends a message via chat interface  
2. Request is sent to backend API route  
3. API communicates with AI model  
4. AI returns a generated response  
5. Response is displayed in the chat UI  

---

## ⚠️ Limitations

- The chatbot relies on a **free-tier AI API**, which may have:
  - Request limits (rate limiting)
  - Slower response times during peak usage
  - Limited token/context capacity
- Responses may occasionally be inaccurate or incomplete due to model limitations
- No persistent memory or long-term conversation storage
- No user authentication or personalized profiles

---

## 🚀 Running Locally

Clone the repository:

git clone https://github.com/your-username/romagebot.git
cd romagebot

Install dependencies:

npm install

Start development server:

npm run dev

Open in browser:

http://localhost:3000

---

## 🚀 Deployment

Deploy easily using Vercel:

1. Push project to GitHub  
2. Import repository in Vercel  
3. Add environment variables  
4. Deploy  

---

## 📌 Future Improvements

- Chat history persistence  
- Streaming responses for smoother UX  
- Improved prompt engineering  
- User authentication (optional)  
- UI/UX enhancements  

---

## 👨‍💻 Author

Built by a developer exploring AI chatbot applications and modern web development.
