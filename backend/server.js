import express, { json, static as serverStatic } from 'express';
import session from 'express-session';
import { join } from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://ferrin-y.github.io/Color-Match','https://ferrin-y.github.io' ] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'], // Development origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(json());

// Set up session management
app.use(session({
    secret: process.env.SESSION_SECRET,  
    resave: false,
    saveUninitialized: true,
        cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Only serve static files in development
if (process.env.NODE_ENV !== 'production') {
    // Serve static files (CSS, JS, images)
    app.use(serverStatic(join(__dirname, '../frontend')));
}

// Serve static files in production as well
app.use(serverStatic(join(__dirname, './frontend')));

// Only serve index.html in development
if (process.env.NODE_ENV !== 'production') {
    // Serve the index.html from views
    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, './frontend/index.html'));
    });
}

// Serve index.html in production as well
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, './frontend/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
