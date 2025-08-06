# 🌐 Disaster Management System

A full-stack web application to efficiently manage and communicate during disaster events. This project allows users to send, store, and retrieve real-time messages using a modern MERN (MongoDB, Express.js, React.js, Node.js) stack. Designed to streamline communication and aid coordination during emergency situations.

---

## 📁 Project Structure
Disaster-Management/
│
├── client/ # Frontend - React Application
│ ├── public/ # Static files
│ ├── src/ # React components and logic
│ │ ├── App.js
│ │ ├── App.css
│ │ ├── index.js
│ │ ├── index.css
│ │ ├── ...
│ ├── .gitignore
│ ├── package.json
│ └── README.md
│
├── server/ # Backend - Express Server with MongoDB
│ ├── model/
│ │ └── messageModel.js # Mongoose schema for messages
│ ├── server.js # Entry point for backend
│ ├── .env # Environment variables (not tracked)
│ ├── .gitignore
│ ├── package.json
│ └── package-lock.json
│
└── README.md # Project documentation

---

## 🚀 Features

- 📩 Send and retrieve messages related to ongoing or past disaster events.
- 🌍 Real-time communication between users or authorities.
- 🛡️ Secure backend with environment variable protection.
- 💡 Simple and intuitive React-based UI.
- 🧩 Modular structure for easy scalability.

---

## 🧪 Technologies Used

### Frontend
- **React.js**
- CSS Modules

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**

---

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/yourusername/disaster-management.git
cd disaster-management


### 2. Backend Setup (server/)
cd server
npm install
#### Create a .env file and add your MongoDB URI:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.bmhlhmu.mongodb.net/?retryWrites=true&w=majority

#### Start the server:
npm start
(Server will run on http://localhost:5000)

### 3. Frontend Setup (client/)
cd ../client
npm install
npm start
(Frontend will run on http://localhost:3000)


### 🗃️ API Endpoints
POST /api/messages : Saves a new message to the database.

GET /api/messages : Retrieves all messages from the database.


### 🛠️ Environment Variables
Make sure the following environment variables are defined in server/.env:
MONGODB_URI=<your_mongodb_connection_string>


### 🧾 Example .gitignore
Ensure your .gitignore files in both client/ and server/ folders exclude sensitive and node-specific files:

server/.gitignore
node_modules/
.env

client/.gitignore
node_modules/
build/


### 📷 Screenshots


### 🧠 Future Scope
Add user authentication and roles (admin, rescue worker, citizen)
Integrate real-time chat using WebSockets
Map integration for real-time disaster tracking
SMS/email alerts for new entries

👩‍💻 Author
Sowmya Dasari – @sowmyadasar1

📝 License
This project is licensed under the MIT License.

MIT License

Copyright (c) 2025 Sowmya Dasari

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in  
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN  
THE SOFTWARE.
