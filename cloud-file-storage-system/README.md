# CloudVault - Cloud File Storage System

A complete full-stack cloud file storage project built with:

- HTML
- CSS
- JavaScript
- Node.js
- Express
- MongoDB Atlas
- MongoDB GridFS
- Mongoose
- JWT authentication

## Main features

- Register and log in
- Secure password hashing
- JWT-protected API
- Upload files to MongoDB Atlas GridFS
- View files belonging to the logged-in user
- Search files
- Download files
- Rename files
- Delete files
- Drag-and-drop upload
- Responsive dashboard

## Folder structure

```text
cloud-file-storage-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── fileController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── File.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── fileRoutes.js
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## MongoDB Atlas setup

1. Create a free MongoDB Atlas account.
2. Create a cluster.
3. Open **Database Access** and create a database user.
4. Open **Network Access** and add your current IP address.
5. Open **Database > Connect > Drivers**.
6. Copy the Node.js connection string.
7. Replace the username, password and cluster values in your `.env` file.

## Run the project

Open a terminal inside the project folder:

```bash
npm install
```

Copy `.env.example` to a new file named `.env`.

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloud_storage?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret
MAX_FILE_SIZE_MB=25
```

Start development mode:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

Open:

```text
http://localhost:5000
```

## Important

- Do not upload the `.env` file to GitHub.
- URL-encode special characters in your Atlas password.
- The frontend is served by the same Express server, so no separate frontend server is required.
- The default upload limit is 25 MB because Multer uses memory storage before streaming the file to GridFS.
