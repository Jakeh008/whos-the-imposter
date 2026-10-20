const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const promptPairs = [
    { innocent: "What is your least favorite household chore?", imposter: "What is your favorite household chore?" },
    { innocent: "What is your go to drink?", imposter: "What drink is overrated?" },
    { innocent: "What TV show would you recommend to a someone that has never seen TV?", imposter: "What TV show is overrated?" },
    { innocent: "What is one thing in your house you cant live without?", imposter: "What household item do you need to replace the most often?" },
    { innocent: "How long could you survive in the woods living off only what is there?", imposter: "How many days could you survive without the internet?" },
    { innocent: "If you could improve one thing about yourself, what would it be?", imposter: "If you had to choose the best thing about yourself, what would it be?" },
    { innocent: "If you could show 1 modern invention to someone 500 years ago what would it be?", imposter: "If you could show 1 modern invention to someone 500 years in the future what would it be?" },
    { innocent: "Who is the most responsible person in this group?", imposter: "Who is the most irresponsible person in this group?" },
    { innocent: "What is a conspiracy theory that you believe?", imposter: "What is the dumbest conspiracy theory you have heard?" },
    { innocent: "What age should you get your first phone?", imposter: "What school grade did you enjoy the most? (Kindergarten - 12th grade)" },
    { innocent: "How many hours of sleep do you wish you could get every night?", imposter: "What is the perfect number of chicken nuggets in a meal?" },
    { innocent: "What are the 2 worst ingredients to put in a smoothie?", imposter: "What are the 2 most random ingredients to put in a smoothie that might still be okay?" },
    { innocent: "If you could start your own country what would be your first rule?", imposter: "What is a law you don't agree with?" },
    { innocent: "Who here would you call first if you won the lottery?", imposter: "Who is the least trustworthy person here?" },
    { innocent: "What piece of modern technology would you miss most if it disappeared from existence?", imposter: "What piece of modern technology do you wish never existed?" },
    { innocent: "What is your favorite home cooked meal as a kid?", imposter: "What is your least favorite home cooked meal as a kid?" },
    { innocent: "What is your favorite type of fruit?", imposter: "What fruit do you not like?" },
    { innocent: "What superhero would you want to live with?", imposter: "What superhero would be the worst to live with?" },
    { innocent: "How much should you spend on a first date?", imposter: "How much money per day does the average person make?" },
    { innocent: "What is your favorite way to relax?", imposter: "What is an overrated way to relax?" },
    { innocent: "If you could live in a TV show what would it be?", imposter: "What is your favorite TV show?" },
    { innocent: "If someone is showing you a video on their phone what is the max length it should be?", imposter: "How many minutes does it take to shower?" },
    { innocent: "What is the average amount of time it takes to run a mile?", imposter: "How long does it take you to fall asleep?" },
    { innocent: "What is a good amount of IG followers?", imposter: "How many IG followers do you have?" },
    { innocent: "What company would you want to be the CEO of?", imposter: "What is your favorite company?" },
    { innocent: "What is the best poor person meal?", imposter: "What is the worst poor person meal?" },
    { innocent: "Which celebrity would you want to meet most?", imposter: "Which celebrity would you want to meet least?" },
    { innocent: "What animal is the most similar to you?", imposter: "What animal do you not want to be compared to?" },
    { innocent: "If you could talk to animals what animal would you want to talk to first?", imposter: "Name an animal." },
    { innocent: "Who here is the most likely to get arrested?", imposter: "Who here is the nicest?" },
    { innocent: "At what age does the average person say their first I Love You?", imposter: "At what age does the average person get their drivers licence?" },
    { innocent: "What is the best sport?", imposter: "What is the most overrated sport?" },
    { innocent: "How many songs are in your favorite playlist?", imposter: "How many songs does Taylor Swift have about her ex boyfriends?" },
    { innocent: "What was your best Halloween costume?", imposter: "What Halloween costume is played out?" },
    { innocent: "What is the dumbest reason you have gotten in trouble?", imposter: "What was the last thing you got in trouble for?" },
    { innocent: "What Disney character is the most similar to you?", imposter: "What Disney character sucks?" },
    { innocent: "What is your best feature?", imposter: "What is your most average feature?" },
    { innocent: "What is your worst bad habit?", imposter: "What bad habit are you never going to stop?" },
    { innocent: "What advice would you give your 10 year old self?", imposter: "What is the last good advice you heard?" },
    { innocent: "Who is the most beautiful/handsome person in the world?", imposter: "Name your favorite person here." },
    { innocent: "Rate your work ethic 1-10.", imposter: "Pick a number 1-10." },
    { innocent: "What is the worst injury you've had?", imposter: "What is the last injury you've had?" },
    { innocent: "How long does it take you to get out of bed after you wake up?", imposter: "What is the best age to have a kid?" },
    { innocent: "If you could move to another country what would it be?", imposter: "What is the best country to visit but not to live?" },
    { innocent: "What is the best food ever?", imposter: "What is the most overrated food ever?" },
    { innocent: "What word or phrase would you use to describe the class of 2026?", imposter: "What word or phrase would you use to describe the class of 2027?" },
    { innocent: "What word makes you cringe?", imposter: "What is the worst word you can say without getting in trouble?" },
    { innocent: "What sport would you most likely be able to go pro?", imposter: "What pro sport does no one watch?" }
];

let rooms = {};

io.on('connection', (socket) => {
    socket.on('create_room', ({ playerName }) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms[roomCode] = {
            host: socket.id,
            players: [{ id: socket.id, name: playerName, score: 0 }],
            gameState: 'lobby'
        };
        socket.join(roomCode);
        socket.emit('room_joined', { roomCode, players: rooms[roomCode].players, isHost: true });
    });

    socket.on('join_room', ({ roomCode, playerName }) => {
        const room = rooms[roomCode];
        if (room && room.gameState === 'lobby') {
            room.players.push({ id: socket.id, name: playerName, score: 0 });
            socket.join(roomCode);
            io.to(roomCode).emit('update_players', room.players);
            socket.emit('room_joined', { roomCode, players: room.players, isHost: false });
        } else {
            socket.emit('error_message', 'Room not found or game already started.');
        }
    });

    socket.on('start_game', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.host === socket.id) {
            room.gameState = 'playing';
            startNewRound(roomCode);
        }
    });

    socket.on('submit_answer', ({ roomCode, answer }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.answer = answer;
            io.to(roomCode).emit('player_answered', player.id);

            if (room.players.every(p => p.answer)) {
                io.to(roomCode).emit('show_answers', room.players);
            }
        }
    });

    socket.on('award_points', ({ roomCode, winnerId }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;

        const winner = room.players.find(p => p.id === winnerId);
        let gameOver = false;
        let champion = null;

        if (winner) {
            winner.score += 5;
            if (winner.score >= 21) {
                gameOver = true;
                champion = winner;
            }
        }

        io.to(roomCode).emit('round_results', { players: room.players, gameOver, champion });
    });

    socket.on('next_round', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.host === socket.id) {
            startNewRound(roomCode);
        }
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            room.players = room.players.filter(p => p.id !== socket.id);
            if (room.players.length === 0) {
                delete rooms[roomCode];
            } else {
                if (room.host === socket.id) {
                    room.host = room.players[0].id;
                    io.to(room.host).emit('you_are_host');
                }
                io.to(roomCode).emit('update_players', room.players);
            }
        }
    });
});

function startNewRound(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    room.players.forEach(p => p.answer = null);

    const pair = promptPairs[Math.floor(Math.random() * promptPairs.length)];
    const imposterIndex = Math.floor(Math.random() * room.players.length);

    room.players.forEach((player, index) => {
        const role = (index === imposterIndex) ? 'imposter' : 'innocent';
        const promptText = (role === 'imposter') ? pair.imposter : pair.innocent;
        io.to(player.id).emit('game_started', { prompt: promptText, role });
    });
}

server.listen(3000, () => {
    console.log('Server running on port 3000');
});