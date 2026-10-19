const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const rooms = {};

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
io.on('connection', (socket) => {
    socket.on('createRoom', ({ username, avatar }) => {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[roomCode] = {
            hostId: socket.id,
            players: [{ id: socket.id, username, avatar, isHost: true, score: 0 }],
            gameState: 'lobby',
            submissions: [],
            votes: {},
            currentPair: null,
            imposter: null
        };
        socket.join(roomCode);
        socket.emit('roomJoined', { roomCode, isHost: true });
        io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
    });

    socket.on('joinRoom', ({ roomCode, username, avatar }) => {
        const room = rooms[roomCode];
        if (!room) {
            socket.emit('errorMsg', 'Case not found! Check your room code.');
            return;
        }
        if (room.players.length >= 10) {
            socket.emit('errorMsg', 'This case room is full (max 10 players).');
            return;
        }
        room.players.push({ id: socket.id, username, avatar, isHost: false, score: 0 });
        socket.join(roomCode);
        socket.emit('roomJoined', { roomCode, isHost: false });
        io.to(roomCode).emit('updatePlayers', room.players);
    });

    socket.on('startGame', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.players.length < 3) {
            socket.emit('errorMsg', 'You need at least 3 detectives to start!');
            return;
        }

        const imposterIndex = Math.floor(Math.random() * room.players.length);
        room.imposter = room.players[imposterIndex];
        room.currentPair = promptPairs[Math.floor(Math.random() * promptPairs.length)];
        room.submissions = [];
        room.votes = {};

        room.players.forEach(p => {
            const promptText = (p.id === room.imposter.id) ? room.currentPair.imposter : room.currentPair.innocent;
            io.to(p.id).emit('startWriting', { prompt: promptText });
        });
    });

    socket.on('submitAnswer', ({ roomCode, answer }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        if (!room.submissions.some(s => s.id === socket.id)) {
            room.submissions.push({ id: socket.id, username: player.username, avatar: player.avatar, answer });
        }

        if (room.submissions.length === room.players.length) {
            io.to(roomCode).emit('startDebate', {
                realPrompt: room.currentPair.innocent,
                submissions: room.submissions
            });
        }
    });

    socket.on('triggerDebateTimer', ({ roomCode }) => {
        io.to(roomCode).emit('debateTimerTriggered');
    });

    socket.on('forceProceedToVoting', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;
        io.to(roomCode).emit('startVoting', room.players);
    });

    socket.on('submitVote', ({ roomCode, suspectId }) => {
        const room = rooms[roomCode];
        if (!room) return;
        room.votes[socket.id] = suspectId;

        if (Object.keys(room.votes).length === room.players.length) {
            const voteCounts = {};
            Object.values(room.votes).forEach(suspect => {
                voteCounts[suspect] = (voteCounts[suspect] || 0) + 1;
            });

            let topSuspect = null;
            let maxVotes = -1;
            let tie = false;
            for (const [suspect, count] of Object.entries(voteCounts)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    topSuspect = suspect;
                    tie = false;
                } else if (count === maxVotes) {
                    tie = true;
                }
            }

            const imposterWon = ((voteCounts[room.imposter.id] || 0) / room.players.length) < 0.5;

            room.players.forEach(p => {
                if (p.id === room.imposter.id) {
                    if (imposterWon) p.score += 3;
                } else {
                    if (room.votes[p.id] === room.imposter.id) {
                        p.score += 1;
                    }
                }
            });

            io.to(roomCode).emit('showResults', {
                imposter: room.imposter,
                imposterWon: imposterWon,
                scores: room.players.map(p => ({ username: p.username, avatar: p.avatar, score: p.score }))
            });
        }
    });

    socket.on('nextRound', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const imposterIndex = Math.floor(Math.random() * room.players.length);
        room.imposter = room.players[imposterIndex];
        room.currentPair = promptPairs[Math.floor(Math.random() * promptPairs.length)];
        room.submissions = [];
        room.votes = {};

        room.players.forEach(p => {
            const promptText = (p.id === room.imposter.id) ? room.currentPair.imposter : room.currentPair.innocent;
            io.to(p.id).emit('startWriting', { prompt: promptText });
        });
    });

    socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});