# Color Match

A fun and challenging color-matching game where players must replicate randomly generated color patterns within a time limit.

## 🎮 About the Game

Color Match is an interactive web-based game that tests your memory and attention to detail. The game displays a target color pattern on a glimpse board, and you must recreate that pattern on your playing grid by selecting the correct colors. The faster you complete the pattern, the higher your score!

### Features

- **Multiple Difficulty Levels**: Adjust the grid size (6x6 to 8x8) to increase or decrease the challenge
- **Time-Based Gameplay**: Complete patterns within the countdown timer to earn points
- **Score System**: Accumulate points based on your performance
- **Leaderboard**: Track your best scores and compete with yourself over time
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Eye-friendly dark theme interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ferrin-Y/Color-Match.git
   cd Color-Match
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with:
   ```
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your_secret_key_here
   ```

### Running the Application

**Development Mode:**
```bash
cd backend
npm run dev
```

This starts the server with nodemon (auto-reload on changes).

**Production Mode:**
```bash
cd backend
npm start
```

Then open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
Color-Match/
├── backend/
│   ├── controllers/
│   │   └── gameController.js      # Game logic and API endpoints
│   ├── models/
│   │   └── gameModel.js           # Data models and database operations
│   ├── server.js                  # Express server configuration
│   ├── package.json               # Node.js dependencies
│   └── .env                       # Environment variables (not in repo)
│
├── frontend/
│   ├── css/
│   │   └── style.css              # Game styling and layout
│   ├── images/
│   │   └── icon.ico               # Game favicon
│   ├── js/
│   │   ├── config.js              # Configuration settings
│   │   └── script.js              # Game logic and DOM manipulation
│   └── index.html                 # Main HTML file
│
└── README.md                       # This file
```

## 🎯 How to Play

1. **Start the Game**: Click the "Start" button to begin
2. **Observe the Pattern**: The match board shows a color pattern for a few seconds
3. **Recreate the Pattern**: Click color buttons to fill your grid matching the target pattern
4. **Submit Your Answer**: Click "Submit" to check your answer before time runs out
5. **Earn Points**: Correct matches award points based on how quickly you completed them
6. **Keep Playing**: Continue through multiple rounds or quit anytime

### Controls

- **Color Buttons**: Click to select colors for your grid
- **Clear**: Remove all colors from your grid
- **Submit**: Submit your answer for scoring
- **Quit**: End the current game
- **Difficulty Slider**: Adjust grid size for harder/easier gameplay

## 🛠️ Technology Stack

### Backend
- **Express.js** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **Express-Session** - Session management
- **dotenv** - Environment configuration

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (with Bootstrap)
- **Vanilla JavaScript** - Game logic
- **Bootstrap 5** - UI components
- **Bootstrap Icons** - Icon library

## 📊 API Endpoints

The backend provides the following endpoints:

- `GET /api/leaderboard` - Retrieve top scores
- `POST /api/scores` - Submit a new score
- `POST /api/game/submit` - Submit a completed pattern

(See `gameController.js` for complete API documentation)

## 🔐 Environment Variables

Required environment variables for the backend:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment type | `development` or `production` |
| `SESSION_SECRET` | Session encryption key | `your-secret-key` |

## 🌐 Deployment

The application is configured to support deployment to GitHub Pages (frontend) and traditional Node.js hosting (backend).

### Production CORS Origins
- Frontend: `https://ferrin-y.github.io/Color-Match`
- Backend: Configure your deployment URL in `server.js`

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Ferrin Yesudasan**
- GitHub: [@Ferrin-Y](https://github.com/Ferrin-Y)
- LinkedIn: [ferrin-yesudasan](https://linkedin.com/in/ferrin-yesudasan)

## 🐛 Issues & Contributions

Found a bug or have a feature suggestion? Feel free to open an issue or submit a pull request on [GitHub](https://github.com/Ferrin-Y/Color-Match).

## 🎓 Learning Notes

This project demonstrates:
- Full-stack web development with Node.js and Express
- Responsive web design with Bootstrap
- Session management and server-client communication
- CORS configuration for security
- Canvas/SVG manipulation with JavaScript
- Event-driven programming patterns

---

**Enjoy the game and happy matching! 🎨**
