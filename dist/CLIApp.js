"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIApp = void 0;
const fs = __importStar(require("fs"));
const rl = __importStar(require("readline-sync"));
const path = __importStar(require("path"));
class Flashcards {
    constructor(question, answer) {
        this.question = question;
        this.answer = answer;
    }
    getQuestion() {
        return this.question;
    }
    getAnswer() {
        return this.answer;
    }
    toString() {
        return `Question: ${this.question} \nAnswer: ${this.answer}.\n`;
    }
}
class CLIApp {
    constructor() {
        this.fileName = "../data";
    }
    launch() {
        console.log("--------WELCOME TO FLASHCARD CLI--------");
        this.apps = [];
        this.apps.push(new PrinterApp(this.fileName));
        this.apps.push(new FlashcardEdit(this.fileName));
        this.apps.push(new PlayApp(this.fileName));
        this.showMenu();
    }
    showMenu() {
        console.log(this.printDescription());
        let scanner = rl.question("Please Select One Option: ");
        let number = parseInt(scanner);
        if (isNaN(number)) {
            console.log("Invalid input.");
            this.showMenu();
        }
        if (number === this.apps.length + 1) {
            return;
        }
        else if (number > this.apps.length + 1 || number < 0) {
            console.log("Invalid input.");
        }
        else {
            this.apps[number - 1].launch();
            this.showMenu();
        }
    }
    printDescription() {
        let menu = "";
        for (let i = 0; i < this.apps.length; i++) {
            menu += `${i + 1}. ${this.apps[i].printDescription()}.\n`;
        }
        menu += `${this.apps.length + 1}. Exit.`;
        return menu;
    }
}
exports.CLIApp = CLIApp;
class FileManager {
    constructor(folderPath) {
        this.folderPath = path.join(__dirname, folderPath);
    }
    write(fileName, data) {
        const filePath = path.join(this.folderPath, fileName);
        fs.writeFileSync(filePath, JSON.stringify(data));
    }
    read(fileName) {
        const filePath = path.join(this.folderPath, fileName);
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    }
}
class FlashcardEdit {
    constructor(folderPath) {
        this.fileManager = new FileManager(folderPath);
    }
    launch() {
        this.showMenu();
    }
    showMenu() {
        console.log("   1. Add New FlashCard");
        console.log("   2. Remove FlashCard");
        console.log("   3. Back");
        let answer = rl.question("Enter option: ");
        const number = parseInt(answer);
        if (isNaN(number)) {
            console.log("Invalid input: not a number");
            this.showMenu();
        }
        else {
            switch (number) {
                case 1:
                    this.add();
                    break;
                case 2:
                    this.remove();
                    break;
                case 3:
                    console.log("Exiting the program...");
                    return;
                default:
                    console.log("Invalid input: Enter number between 1 and 3");
                    this.showMenu();
                    break;
            }
        }
    }
    add() {
        let question = rl.question("Question: ");
        let answer = rl.question("Answer: ");
        let flashcard = new Flashcards(question, answer);
        const fileName = "flashcards.json";
        let flashcards = [];
        try {
            flashcards = this.fileManager.read(fileName);
        }
        catch (error) {
            if (error.code === "ENOENT") {
                console.log(`File ${fileName} does not exist. Creating new file.`);
            }
            else {
                throw error;
            }
        }
        flashcards.push(flashcard);
        this.fileManager.write(fileName, flashcards);
        console.log("\nFlashcard successfully added\n");
    }
    remove() {
        const fileName = "flashcards.json";
        let flashcards = [];
        try {
            flashcards = this.fileManager.read(fileName);
            for (let i = 1; i < flashcards.length; i++) {
                console.log(`\nFlashcard No.${i}`);
                const flashcard = flashcards[i];
                console.log(`Question: ${flashcard.question}\nAnswer: ${flashcard.answer}\n`);
            }
        }
        catch (error) {
            if (error.code === "ENOENT") {
                console.log(`File ${fileName} does not exist.`);
            }
            else {
                throw error;
            }
        }
        if (flashcards.length === 1) {
            console.log(`File ${fileName} is empty. Cannot remove flashcard.`);
            return;
        }
        let id = rl.question("Enter index of Flashcard you want to remove: ");
        let index = parseInt(id);
        if (index < 1 || index >= flashcards.length) {
            console.log(`Invalid index: ${index}.`);
            return;
        }
        flashcards.splice(index, 1);
        this.fileManager.write(fileName, flashcards);
        console.log("Flashcard successfully removed\n");
    }
    printDescription() {
        return "Add/Remove";
    }
}
class PrinterApp {
    constructor(folderName) {
        this.fileManager = new FileManager(folderName);
    }
    launch() {
        const fileName = "flashcards.json";
        let flashcards = [];
        try {
            flashcards = this.fileManager.read(fileName);
        }
        catch (error) {
            if (error.code === "ENOENT") {
                console.log(`File ${fileName} does not exist.`);
            }
            else {
                throw error;
            }
        }
        if (flashcards.length === 1) {
            console.log(`File ${fileName} is empty. There are no flashcards to print.`);
            return;
        }
        for (let i = 1; i < flashcards.length; i++) {
            console.log(`\nFlashcard No.${i}`);
            const flashcard = flashcards[i];
            console.log(`Question: ${flashcard.question}\nAnswer: ${flashcard.answer}\n`);
        }
    }
    printDescription() {
        return "View all flashcards";
    }
}
class PlayApp {
    constructor(folderPath) {
        this.fileManager = new FileManager(folderPath);
    }
    launch() {
        const fileName = "flashcards.json";
        let flashcards = [];
        try {
            flashcards = this.fileManager.read(fileName);
        }
        catch (error) {
            if (error.code === "ENOENT") {
                console.log(`File ${fileName} does not exist.`);
            }
            else {
                throw error;
            }
        }
        if (flashcards.length === 1) {
            console.log(`File ${fileName} is empty. There are no flashcards to print.`);
            return;
        }
        const randomizedArr = [...flashcards];
        for (let i = flashcards.length - 1; i > 1; i--) {
            const j = Math.floor(Math.random() * (i - 1)) + 1;
            [randomizedArr[i], randomizedArr[j]] = [randomizedArr[j], randomizedArr[i]];
        }
        let correctAnswers = 0;
        let totalAnswers = 0;
        for (let index = 1; index < flashcards.length; index++) {
            let question = randomizedArr[index].question;
            let answer = randomizedArr[index].answer;
            console.log(`Question ${totalAnswers + 1}: ${question}?`);
            let userAnswer = rl.question("Answer: ");
            if (userAnswer.trim().toLowerCase() === answer.trim().toLowerCase()) {
                console.log("Correct!\n");
                correctAnswers++;
            }
            else {
                console.log("Incorrect!\n");
            }
            totalAnswers++;
        }
        if (totalAnswers > 0) {
            let percentage = (correctAnswers / totalAnswers) * 100;
            console.log(`You got ${correctAnswers} out of ${totalAnswers} correct(${percentage.toFixed(2)}%).\n`);
            if (percentage < 50) {
                console.log("You should try again!");
            }
            else {
                console.log("Very Good! You should add more Flashcards.");
            }
        }
    }
    printDescription() {
        return "Test your knowledge";
    }
}
//# sourceMappingURL=CLIApp.js.map