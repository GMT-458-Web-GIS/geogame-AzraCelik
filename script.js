// Game State
let gameState = {
    players: [],
    playersByDifficulty: {
        easy: [],
        medium: [],
        hard: []
    },
    trivia: [],
    currentDifficulty: 'easy',
    currentRound: 0,
    totalRounds: 10,
    currentPlayerIndex: 0,
    selectedPlayers: [],
    selectedTrivia: [],
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timer: null,
    timeLeft: 45,
    map: null,
    clickedCountry: null,
    selectedCountryLayer: null,
    countriesLayer: null,
    triviaRound: 0,
    currentTriviaIndex: 0,
    feedbackTimer: null
};

// Difficulty Settings
const difficultySettings = {
    easy: {
        name: 'EASY',
        time: 45,
        zoomEnabled: true,
        multiplier: 1
    },
    medium: {
        name: 'MEDIUM',
        time: 30,
        zoomEnabled: true,
        multiplier: 1.5
    },
    hard: {
        name: 'HARD',
        time: 15,
        zoomEnabled: false,
        multiplier: 2
    }
};

// Initialize Game
async function initGame() {
    try {
        // Load data
        const [easyResp, mediumResp, hardResp, triviaResponse] = await Promise.all([
            fetch('kolay.json'),
            fetch('orta.json'),
            fetch('zor.json'),
            fetch('trivia.json')
        ]);
        
        gameState.playersByDifficulty.easy = await easyResp.json();
        gameState.playersByDifficulty.medium = await mediumResp.json();
        gameState.playersByDifficulty.hard = await hardResp.json();
        gameState.trivia = await triviaResponse.json();
        
        // Initialize map
        await initMap();
        
        // Start game
    startGame();
    } catch (error) {
        console.error('Error loading game data:', error);
        alert('An error occurred while loading the game data!');
    }
}

// Initialize Leaflet Map
async function initMap() {
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    gameState.map = L.map('map', {
        preferCanvas: false
    }).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(gameState.map);
    
    // Load countries GeoJSON
    await loadCountriesGeoJSON();
    
    // Invalidate size to ensure proper rendering
    setTimeout(() => {
        if (gameState.map) {
            gameState.map.invalidateSize();
        }
    }, 200);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (gameState.map) {
            setTimeout(() => {
                gameState.map.invalidateSize();
            }, 100);
        }
    });
}

// Load Countries GeoJSON
async function loadCountriesGeoJSON() {
    try {
        // Using a public GeoJSON API for world countries
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const countriesData = await response.json();
        
        // Create GeoJSON layer with styling
        gameState.countriesLayer = L.geoJSON(countriesData, {
            style: function(feature) {
                return {
                    fillColor: '#f0f0f0',
                    fillOpacity: 0.3,
                    color: '#666',
                    weight: 1,
                    opacity: 0.5
                };
            },
            onEachFeature: function(feature, layer) {
                // Get country name
                const countryName = feature.properties.name || feature.properties.NAME || feature.properties.NAME_EN || '';
                
                // Hover effect
                layer.on({
                    mouseover: function(e) {
                        const layer = e.target;
                        layer.setStyle({
                            fillColor: '#0066ff',
                            fillOpacity: 0.6,
                            color: '#0033cc',
                            weight: 2,
                            opacity: 1
                        });
                        
                        // Show country name in popup
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }
                    },
                    mouseout: function(e) {
                        // Reset style unless it's the selected country
                        const layer = e.target;
                        if (layer !== gameState.selectedCountryLayer && gameState.countriesLayer) {
                            gameState.countriesLayer.resetStyle(layer);
                        }
                    },
                    click: async function(e) {
                        const layer = e.target;
                        const countryName = feature.properties.name || feature.properties.NAME || feature.properties.NAME_EN || '';
                        
                        // Remove previous selection
                        if (gameState.selectedCountryLayer && gameState.countriesLayer) {
                            gameState.countriesLayer.resetStyle(gameState.selectedCountryLayer);
                        }
                        
                        // Set new selection style
                        layer.setStyle({
                            fillColor: '#0066ff',
                            fillOpacity: 0.8,
                            color: '#0033cc',
                            weight: 3,
                            opacity: 1
                        });
                        
                        gameState.selectedCountryLayer = layer;
                        gameState.clickedCountry = {
                            country: countryName,
                            latlng: e.latlng
                        };
                        
                        // Show popup briefly
                        layer.bindPopup(`Selected Country: ${countryName}`).openPopup();
                        
                        // Automatically submit answer
                        await submitAnswer();
                    }
                });
            }
        }).addTo(gameState.map);
        
    } catch (error) {
        console.error('Error loading countries GeoJSON:', error);
        // Fallback to simple click handler if GeoJSON fails to load
        gameState.map.on('click', async function(e) {
            if (gameState.clickedCountry && gameState.clickedCountry.marker) {
                gameState.map.removeLayer(gameState.clickedCountry.marker);
            }
            
            const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(gameState.map);
            marker.bindPopup('Selected Location').openPopup();
            gameState.clickedCountry = {
                marker: marker,
                latlng: e.latlng
            };
            
            // Automatically submit answer
            await submitAnswer();
        });
    }
}

// Start Game
function startGame() {
    gameState.currentDifficulty = 'easy';
    gameState.currentRound = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.triviaRound = 0;
    gameState.currentTriviaIndex = 0;
    resetAnswerFeedback();
    
    // Select random players and trivia
    selectRandomPlayers();
    selectRandomTrivia();
    
    // Update UI
    updateDifficultyUI();
    nextRound();
}

// Select Random Players (10 per difficulty level from respective JSON files)
function selectRandomPlayers() {
    const difficulties = [
        { key: 'easy', source: gameState.playersByDifficulty.easy },
        { key: 'medium', source: gameState.playersByDifficulty.medium },
        { key: 'hard', source: gameState.playersByDifficulty.hard }
    ];

    const combined = [];

    difficulties.forEach(({ key, source }) => {
        if (!Array.isArray(source) || source.length === 0) {
            console.warn(`No player data found for '${key}' difficulty.`);
            return;
        }

        const shuffled = [...source].sort(() => Math.random() - 0.5);
        let selected = shuffled.slice(0, Math.min(gameState.totalRounds, shuffled.length));

        // If there are fewer than 10 players for this difficulty, repeat existing ones
        if (selected.length < gameState.totalRounds && selected.length > 0) {
            const original = [...selected];
            let index = 0;
            while (selected.length < gameState.totalRounds) {
                selected.push(original[index % original.length]);
                index++;
            }
        }

        combined.push(...selected.slice(0, gameState.totalRounds));
    });

    gameState.selectedPlayers = combined;
}

// Select Random Trivia (2 per difficulty level)
function selectRandomTrivia() {
    const shuffled = [...gameState.trivia].sort(() => Math.random() - 0.5);
    gameState.selectedTrivia = shuffled.slice(0, 6); // 2 per level × 3 levels
}

// Update Difficulty UI
function updateDifficultyUI() {
    const settings = difficultySettings[gameState.currentDifficulty];
    const badge = document.getElementById('difficultyBadge');
    const multiplier = document.getElementById('multiplier');
    const currentLevel = document.getElementById('currentLevel');
    
    badge.textContent = settings.name;
    badge.className = `difficulty-badge ${gameState.currentDifficulty}`;
    multiplier.textContent = `×${settings.multiplier}`;
    currentLevel.textContent = settings.name;
    
    // Enable/disable zoom based on difficulty
    if (settings.zoomEnabled) {
        gameState.map.scrollWheelZoom.enable();
        gameState.map.doubleClickZoom.enable();
    } else {
        gameState.map.scrollWheelZoom.disable();
        gameState.map.doubleClickZoom.disable();
    }
}

// Next Round
function nextRound() {
    // Show trivia after 5 rounds in each difficulty (before moving to next difficulty)
    if (gameState.currentRound === 5) {
        const triviaIndex = (gameState.currentDifficulty === 'easy' ? 0 : 
                            gameState.currentDifficulty === 'medium' ? 2 : 4);
        if (triviaIndex < gameState.selectedTrivia.length) {
            showTrivia();
            return;
        }
    }
    
    // Show second trivia after 10 rounds (end of difficulty level)
    if (gameState.currentRound >= gameState.totalRounds) {
        const triviaIndex = (gameState.currentDifficulty === 'easy' ? 1 : 
                            gameState.currentDifficulty === 'medium' ? 3 : 5);
        if (triviaIndex < gameState.selectedTrivia.length) {
            gameState.triviaRound = (gameState.currentDifficulty === 'easy' ? 1 : 
                                    gameState.currentDifficulty === 'medium' ? 1 : 1);
            showTrivia();
            return;
        }
        
        // Move to next difficulty or finish
        if (gameState.currentDifficulty === 'easy') {
            gameState.currentDifficulty = 'medium';
            gameState.currentRound = 0;
            gameState.triviaRound = 0;
            updateDifficultyUI();
            nextRound();
            return;
        } else if (gameState.currentDifficulty === 'medium') {
            gameState.currentDifficulty = 'hard';
            gameState.currentRound = 0;
            gameState.triviaRound = 0;
            updateDifficultyUI();
            nextRound();
            return;
        } else {
            // Game finished
            showFinishScreen();
            return;
        }
    }
    
    // Get current player
    const player = getCurrentPlayer();
    
    if (!player) {
        showFinishScreen();
        return;
    }
    
    // Update UI
    document.getElementById('playerName').textContent = player.player;
    document.getElementById('currentRound').textContent = gameState.currentRound + 1;
    
    // Update player image
    const playerImage = document.getElementById('playerImage');
    if (player.image && player.image.trim() !== '') {
        playerImage.src = player.image;
        playerImage.style.display = 'block';
        playerImage.onerror = function() {
            this.style.display = 'none';
        };
    } else {
        playerImage.style.display = 'none';
    }
    
    // Reset map selection
    if (gameState.selectedCountryLayer && gameState.countriesLayer) {
        gameState.countriesLayer.resetStyle(gameState.selectedCountryLayer);
        gameState.selectedCountryLayer = null;
    }
    if (gameState.clickedCountry && gameState.clickedCountry.marker) {
        gameState.map.removeLayer(gameState.clickedCountry.marker);
    }
    gameState.clickedCountry = null;
    
    // Start timer
    startTimer();
}

// Start Timer
function startTimer() {
    const settings = difficultySettings[gameState.currentDifficulty];
    gameState.timeLeft = settings.time;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    const timerElement = document.getElementById('timer');
    timerElement.textContent = gameState.timeLeft;
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerElement.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            handleAnswer(getCurrentPlayer(), false);
        }
    }, 1000);
}

// Handle Answer
function handleAnswer(player, isCorrect, timeBonus = false) {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    if (!isCorrect && player) {
        showWrongAnswerFeedback(player);
    } else if (isCorrect) {
        resetAnswerFeedback();
    }

    const settings = difficultySettings[gameState.currentDifficulty];
    let points = 0;
    
    if (isCorrect) {
        points = 10 * settings.multiplier;
        gameState.correctAnswers++;
        if (timeBonus) {
            points += 2;
        }
    } else {
        points = -3;
        gameState.wrongAnswers++;
    }
    
    gameState.score += points;
    updateScoreboard();
    
    // Move to next round after a short delay
    setTimeout(() => {
        gameState.currentRound++;
        nextRound();
    }, 1500);
}

// Update Scoreboard
function updateScoreboard() {
    document.getElementById('totalScore').textContent = Math.max(0, gameState.score);
    document.getElementById('correctCount').textContent = gameState.correctAnswers;
    document.getElementById('wrongCount').textContent = gameState.wrongAnswers;
}

// Show Trivia
function showTrivia() {
    let triviaIndex;
    
    if (gameState.currentRound === 5) {
        // First trivia in each difficulty (after 5 rounds)
        triviaIndex = gameState.currentDifficulty === 'easy' ? 0 : 
                     gameState.currentDifficulty === 'medium' ? 2 : 4;
    } else if (gameState.currentRound >= gameState.totalRounds) {
        // Second trivia in each difficulty (after 10 rounds)
        triviaIndex = gameState.currentDifficulty === 'easy' ? 1 : 
                     gameState.currentDifficulty === 'medium' ? 3 : 5;
    } else {
        triviaIndex = (gameState.currentDifficulty === 'easy' ? 0 : 
                      gameState.currentDifficulty === 'medium' ? 2 : 4) + gameState.triviaRound;
    }
    
    const trivia = gameState.selectedTrivia[triviaIndex];
    
    if (!trivia) {
        if (gameState.currentRound >= gameState.totalRounds) {
            // Move to next difficulty
            if (gameState.currentDifficulty === 'easy') {
                gameState.currentDifficulty = 'medium';
                gameState.currentRound = 0;
                gameState.triviaRound = 0;
                updateDifficultyUI();
                nextRound();
            } else if (gameState.currentDifficulty === 'medium') {
                gameState.currentDifficulty = 'hard';
                gameState.currentRound = 0;
                gameState.triviaRound = 0;
                updateDifficultyUI();
                nextRound();
            } else {
                showFinishScreen();
            }
        } else {
            gameState.triviaRound++;
            nextRound();
        }
        return;
    }
    
    const modal = document.getElementById('triviaModal');
    const question = document.getElementById('triviaQuestion');
    const answersDiv = document.getElementById('triviaAnswers');
    
    question.textContent = trivia.question;
    answersDiv.innerHTML = '';
    
    let selectedAnswer = null;
    
    trivia.answers.forEach((answer, index) => {
        const answerBtn = document.createElement('button');
        answerBtn.className = 'trivia-answer';
        answerBtn.textContent = answer;
        answerBtn.addEventListener('click', () => {
            document.querySelectorAll('.trivia-answer').forEach(btn => {
                btn.classList.remove('selected');
            });
            answerBtn.classList.add('selected');
            selectedAnswer = index;
        });
        answersDiv.appendChild(answerBtn);
    });
    
    document.getElementById('submitTrivia').onclick = () => {
        if (selectedAnswer === null) {
            alert('Please select an answer!');
            return;
        }
        
        const isCorrect = selectedAnswer === trivia.correct;
        if (isCorrect) {
            gameState.score += 5;
            updateScoreboard();
        }
        
        modal.classList.remove('active');
        
        // If we just finished 5 rounds, continue to next round
        if (gameState.currentRound === 5) {
            gameState.currentRound++;
            setTimeout(() => {
                nextRound();
            }, 500);
        } else if (gameState.currentRound >= gameState.totalRounds) {
            // If we finished 10 rounds, move to next difficulty
            if (gameState.currentDifficulty === 'easy') {
                gameState.currentDifficulty = 'medium';
                gameState.currentRound = 0;
                gameState.triviaRound = 0;
                updateDifficultyUI();
                setTimeout(() => {
                    nextRound();
                }, 500);
            } else if (gameState.currentDifficulty === 'medium') {
                gameState.currentDifficulty = 'hard';
                gameState.currentRound = 0;
                gameState.triviaRound = 0;
                updateDifficultyUI();
                setTimeout(() => {
                    nextRound();
                }, 500);
            } else {
                setTimeout(() => {
                    showFinishScreen();
                }, 500);
            }
        } else {
            gameState.triviaRound++;
            setTimeout(() => {
                nextRound();
            }, 500);
        }
    };
    
    modal.classList.add('active');
}

// Show Finish Screen
function showFinishScreen() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    // Normalize score to /100
    const maxPossibleScore = (10 * 1 + 2) * 10 + (10 * 1.5 + 2) * 10 + (10 * 2 + 2) * 10 + (5 * 6);
    const normalizedScore = Math.min(100, Math.max(0, (gameState.score / maxPossibleScore) * 100));
    
    // Determine fan level
    let fanLevel = '';
    if (normalizedScore >= 81) {
        fanLevel = 'UltrAslan Legend';
    } else if (normalizedScore >= 61) {
        fanLevel = 'Die-hard Gala Fan';
    } else if (normalizedScore >= 31) {
        fanLevel = 'Casual Supporter';
    } else {
        fanLevel = 'Getting Started';
    }
    
    document.getElementById('finalScore').textContent = Math.round(normalizedScore);
    document.getElementById('fanLevel').textContent = fanLevel;
    
    const finishModal = document.getElementById('finishModal');
    finishModal.classList.add('active');
    
    document.getElementById('restartGame').onclick = () => {
        finishModal.classList.remove('active');
        startGame();
    };
}

// Get Country from Coordinates using Reverse Geocoding
async function getCountryFromCoordinates(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'GalatasarayGeoGame/1.0'
                }
            }
        );
        const data = await response.json();
        return data.address?.country || null;
    } catch (error) {
        console.error('Error getting country:', error);
        return null;
    }
}

// Normalize Country Name (handle different naming variations)
function normalizeCountryName(countryName) {
    if (!countryName) return '';
    
    // Trim whitespace
    countryName = countryName.trim();
    
    const countryMap = {
        'United States of America': 'United States',
        'United States': 'United States',
        'USA': 'United States',
        'US': 'United States',
        'DR Congo': 'Democratic Republic of the Congo',
        'Democratic Republic of the Congo': 'DR Congo',
        'Congo, Democratic Republic of the': 'DR Congo',
        'Ivory Coast': 'Côte d\'Ivoire',
        'Côte d\'Ivoire': 'Ivory Coast',
        'Cote d\'Ivoire': 'Ivory Coast',
        'Côte d\'Ivoire': 'Ivory Coast',
        'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
        'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
        'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
        'Myanmar': 'Myanmar',
        'Burma': 'Myanmar',
        'Russia': 'Russia',
        'Russian Federation': 'Russia',
        'South Korea': 'South Korea',
        'Korea, South': 'South Korea',
        'Republic of Korea': 'South Korea',
        'North Korea': 'North Korea',
        'Korea, North': 'North Korea',
        'Czech Republic': 'Czech Republic',
        'Czechia': 'Czech Republic',
        'Macedonia': 'North Macedonia',
        'North Macedonia': 'North Macedonia',
        'The Bahamas': 'Bahamas',
        'Bahamas': 'Bahamas',
        'The Gambia': 'Gambia',
        'Gambia': 'Gambia'
    };
    
    // Check exact match first
    if (countryMap[countryName]) {
        return countryMap[countryName];
    }
    
    // Check case-insensitive match
    const lowerName = countryName.toLowerCase();
    for (const [key, value] of Object.entries(countryMap)) {
        if (key.toLowerCase() === lowerName) {
            return value;
        }
    }
    
    return countryName;
}

// Submit Answer Function
async function submitAnswer() {
    if (!gameState.clickedCountry) {
        return;
    }
    
    const difficultyStartIndex = {
        easy: 0,
        medium: 10,
        hard: 20
    };
    
    const player = getCurrentPlayer();
    
    if (!player) {
        return;
    }
    
    // Get country from selection
    let detectedCountry = null;
    if (gameState.clickedCountry.country) {
        // Country selected from GeoJSON layer
        detectedCountry = gameState.clickedCountry.country;
    } else if (gameState.clickedCountry.latlng) {
        // Fallback: Get country from coordinates
        const clickedLat = gameState.clickedCountry.latlng.lat;
        const clickedLng = gameState.clickedCountry.latlng.lng;
        detectedCountry = await getCountryFromCoordinates(clickedLat, clickedLng);
    }
    
    const normalizedDetected = normalizeCountryName(detectedCountry);
    const normalizedPlayer = normalizeCountryName(player.country);
    
    const isCorrect = normalizedDetected.toLowerCase() === normalizedPlayer.toLowerCase();
    const timeBonus = gameState.timeLeft > 0;
    
    handleAnswer(player, isCorrect, timeBonus);
}

function getCurrentPlayer() {
    const difficultyStartIndex = {
        easy: 0,
        medium: 10,
        hard: 20
    };
    const playerIndex = difficultyStartIndex[gameState.currentDifficulty] + gameState.currentRound;
    return gameState.selectedPlayers[playerIndex] || null;
}

function showWrongAnswerFeedback(player) {
    const feedbackEl = document.getElementById('answerFeedback');
    if (!feedbackEl || !player) {
        return;
    }
    feedbackEl.textContent = `Wrong answer! ${player.player} is from ${player.country}.`;
    feedbackEl.classList.add('show');
    if (gameState.feedbackTimer) {
        clearTimeout(gameState.feedbackTimer);
    }
    gameState.feedbackTimer = setTimeout(() => {
        feedbackEl.classList.remove('show');
    }, 4000);
}

function resetAnswerFeedback() {
    const feedbackEl = document.getElementById('answerFeedback');
    if (!feedbackEl) {
        return;
    }
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('show');
    if (gameState.feedbackTimer) {
        clearTimeout(gameState.feedbackTimer);
        gameState.feedbackTimer = null;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initGame);

