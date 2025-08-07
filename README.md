# Disaster Management System
A full-stack web application to efficiently manage and communicate during disaster events. This project allows users to send, store, and retrieve real-time messages using a modern MERN (MongoDB, Express.js, React.js, Node.js) stack. Designed to streamline communication and aid coordination during emergency situations.


## Features
- Send and retrieve messages related to ongoing or past disaster events.
- Real-time communication between users or authorities.
- Secure backend with environment variable protection.
- Simple and intuitive React-based UI.
- Modular structure for easy scalability.


## Tech Stack
- **MongoDB** – NoSQL database
- **Express.js** – Web framework for Node.js
- **React.js** – Frontend library
- **Node.js** – Backend runtime


## Project Structure
```
disaster-management/
├── client/                    # Frontend (React)
│   ├── public/                # Static files
│   └── src/                   # React source files
│       ├── App.js
│       ├── index.js
│       ├── App.css
│       └── ...                # Additional components, CSS, etc.       
│   └── package.json              # React dependencies and scripts

├── server/                    # Backend (Node.js + Express)
│   ├── model/                 # Mongoose models
│   │   └── messageModel.js
│   ├── server.js              # Entry point for Express server
│   ├── .env                   # Environment variables
│   └── package.json           # Backend dependencies

├── .gitignore
└── README.md                   # Main project documentation

```


## Setup Instructions
### 1. Clone the repository
#### Prerequisites
```
- Node.js & npm
- MongoDB account (or local MongoDB)
```

#### Clone the Repo
```
git clone https://github.com/sowmyadasar1/disaster-management.git
cd disaster-management
```


### 2. Backend Setup (server/)
```
cd server
npm install
```

#### Create a .env file and add your MongoDB URI:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.bmhlhmu.mongodb.net/?retryWrites=true&w=majority
```

#### Start the server:
```
npm start
(Server will run on http://localhost:5000)
```

### 3. Frontend Setup (client/)
```
cd ../client
npm install
npm start
(Frontend will run on http://localhost:3000)
```


### Future Scope
- Add user authentication and roles (admin, rescue worker, citizen)
- Integrate real-time chat using WebSockets
- Map integration for real-time disaster tracking
- SMS/email alerts for new entries


## Author
**Sowmya Dasari**
[GitHub](https://github.com/sowmyadasar1) | [LinkedIn](https://linkedin.com/in/sowmyadasari1) | [Gmail](sowmyaxdasari@gmail.com)

