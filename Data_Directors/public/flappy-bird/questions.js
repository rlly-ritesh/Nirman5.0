// Question Bank for Flappy Bird Game
const questions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correct: 1
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct: 1
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3
    },
    {
        question: "Who wrote Romeo and Juliet?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1
    },
    {
        question: "What is the chemical symbol for Gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2
    },
    {
        question: "Which country has the most population?",
        options: ["India", "USA", "Indonesia", "Pakistan"],
        correct: 0
    },
    {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2
    },
    {
        question: "Which element has the atomic number 1?",
        options: ["Helium", "Hydrogen", "Carbon", "Oxygen"],
        correct: 1
    },
    {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correct: 2
    },
    {
        question: "What is the fastest land animal?",
        options: ["Lion", "Cheetah", "Gazelle", "Antelope"],
        correct: 1
    },
    {
        question: "What year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2
    },
    {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
        correct: 2
    },
    {
        question: "What is the tallest mountain?",
        options: ["K2", "Kilimanjaro", "Mount Everest", "Denali"],
        correct: 2
    },
    {
        question: "How many strings does a guitar have?",
        options: ["4", "5", "6", "7"],
        correct: 2
    }
];

// Function to get a random question
function getRandomQuestion() {
    return questions[Math.floor(Math.random() * questions.length)];
}
