# How Much of a Galatasaray Fan Are You (GeoGame)

##  Game Description

**“How Much of a Galatasaray Fan Are You”** is an interactive geography-based game where you guess the home countries of Galatasaray football players on a world map. The game is built using the Leaflet.js mapping library and runs entirely in the browser.

##  Game Rules

### General Rules
- The game has **3 difficulty levels**: **EASY**, **MEDIUM**, **HARD**
- Each level contains **10 player questions + 2 trivia questions**
- The full game consists of **30 player questions and 6 trivia questions**
- Players are selected randomly from a pool of **75 players**
- Every game is unique thanks to a randomness mechanism

### Difficulty Levels

| Level | Time | Map Zoom | Score Multiplier |
|--------|------|---------------------|----------------|
| **EASY** | 45 seconds | Enabled | ×1 |
| **MEDIUM** | 30 seconds | Enabled | ×1.5 |
| **HARD** | 15 seconds | Disabled | ×2 |

### Game Flow

1. **EASY Level** (10 players + 2 trivia)  
   - 1st trivia after round 5  
   - 2nd trivia after round 10  

2. **MEDIUM Level** (10 players + 2 trivia)  
   - Same structure as EASY  

3. **HARD Level** (10 players + 2 trivia)  
   - Same structure  
   - Ends after the second trivia  

##  Scoring System

### Score Calculation

- **Correct Country Guess**: 10 points × difficulty multiplier  
- **Fast Answer Bonus**: +2 points (if answered before time runs out)  
- **Correct Trivia Answer**: +5 points  

### Score Normalization

At the end of the game, your score is normalized to a range of **0–100**:

- Maximum possible score is calculated  
- Final score = (Total Score / Maximum Score) × 100  

### Fan Levels

| Score Range | Fan Level |
|-------------|-----------|
| 0–30 | Getting to Know |
| 31–60 | Friendly Supporter |
| 61–80 | Crazy Galatasaray Fan |
| 81–100 | Ultraslan Legend |

##  Random Selection Mechanism

- **Player Selection**: 30 out of 75 players are randomly chosen each game  
- **Trivia Selection**: 6 trivia questions are randomly selected  
- **Shuffling**: Uses a Fisher–Yates–style shuffle  
- **Uniqueness**: Every game presents a different combination  

##  Tech Stack

### Frontend
- **HTML5**: Structural layout  
- **CSS3**: Modern and responsive design  
- **JavaScript (ES6+)**: Game logic and interactions  

### Mapping Library
- **Leaflet.js v1.9.4**: Interactive map visualization  
- **OpenStreetMap**: Map tiles  
- **Nominatim API**: Reverse geocoding (coordinates → country)

### Data Management
- **JSON** format for player and trivia data:
  - `players.json`: 75 Galatasaray players  
  - `trivia.json`: Trivia questions related to Galatasaray  

##  Design Report

### Color Palette
- **Primary Colors**: Yellow (#FFD700) and Red (#FF0000) — Galatasaray’s official colors  
- **Background**: Yellow → Red gradient  
- **Cards**: White background, rounded corners, soft shadows  

### UI Components
- **Header**: Game title, difficulty badge, countdown timer  
- **Map Section**: Full-screen map with player info  
- **Scoreboard**: Live score, correct/wrong counters  
- **Modals**: Trivia questions and end-game screen  

### Responsive Design
- **Desktop**: Two-column layout (map + scoreboard)  
- **Mobile**: Single-column vertical layout  

### Interaction Features
- Click on the map to select a location  
- Marker displays selected point  
- Zoom control depending on difficulty  
- Real-time score updates  
- Smooth animations and hover effects  

## Features

 Automatic difficulty progression  
 Random player and trivia selection  
 Reverse geocoding for country detection  
 Real-time timer  
 Score normalization and fan level calculation  
 Fully responsive UI  
 Modal-based trivia system  
 End-game screen + replay option  

---

**Note**: This game is designed to help Galatasaray fans test their geography knowledge in a fun and engaging way.  
https://gmt-458-web-gis.github.io/geogame-AzraCelik/



[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BhShQpq1)
