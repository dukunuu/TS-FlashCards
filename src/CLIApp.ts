import * as fs from "fs";
import * as rl from "readline-sync";
import * as path from "path";
export interface AppInterface {
  launch(): void;
  printDescription(): string;
}
class Flashcards {
  private question: string;
  private answer: string;
  constructor(question: string, answer: string) {
    this.question = question;
    this.answer = answer;
  }
  public getQuestion(): string {
    return this.question;
  }
  public getAnswer(): string {
    return this.answer;
  }
  public toString(): string {
    return `Question: ${this.question} \nAnswer: ${this.answer}.\n`;
  }
}

export class CLIApp implements AppInterface {
  private apps: AppInterface[];
  private fileName: string = "../data";
  public launch(): void {
    console.log("--------WELCOME TO FLASHCARD CLI--------");
    this.apps = [];
    this.apps.push(new PrinterApp(this.fileName));
    this.apps.push(new FlashcardEdit(this.fileName));
    this.apps.push(new PlayApp(this.fileName));
    this.showMenu();
  }
  private showMenu(): void {
    console.log(this.printDescription());
    let scanner = rl.question("Please Select One Option: ");
    let number = parseInt(scanner);
    if (isNaN(number)) {
      console.log("Invalid input.");
      this.showMenu();
    }
    if (number === this.apps.length + 1) {
      return;
    } else if (number > this.apps.length + 1 || number < 0) {
      console.log("Invalid input.");
    } else {
      this.apps[number - 1].launch();
      this.showMenu();
    }
  }
  public printDescription(): string {
    let menu: string = "";
    for (let i = 0; i < this.apps.length; i++) {
      menu += `${i + 1}. ${this.apps[i].printDescription()}.\n`;
    }
    menu += `${this.apps.length + 1}. Exit.`;
    return menu;
  }
}
class FileManager {
  private folderPath: string;
  constructor(folderPath: string) {
    this.folderPath = path.join(__dirname, folderPath);
  }
  public write(fileName: string, data: Flashcards[]): void {
    const filePath = path.join(this.folderPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  public read(fileName: string): any {
    const filePath = path.join(this.folderPath, fileName);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
}
class FlashcardEdit implements AppInterface {
  private folderPath: string;
  private fileManager: FileManager;
  constructor(folderPath: string) {
    this.fileManager = new FileManager(folderPath);
  }
  public launch(): void {
    this.showMenu();
  }

  private showMenu(): void {
    console.log("   1. Add New FlashCard");
    console.log("   2. Remove FlashCard");
    console.log("   3. Back");
    let answer = rl.question("Enter option: ");
    const number = parseInt(answer);
    if (isNaN(number)) {
      console.log("Invalid input: not a number");
      this.showMenu();
    } else {
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
  private add(): void {
    let question = rl.question("Question: ");
    let answer = rl.question("Answer: ");
    let flashcard = new Flashcards(question, answer);
    const fileName = "flashcards.json";
    let flashcards: Flashcards[] = [];

    try {
      flashcards = this.fileManager.read(fileName);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`File ${fileName} does not exist. Creating new file.`);
      } else {
        throw error;
      }
    }
    flashcards.push(flashcard);
    this.fileManager.write(fileName, flashcards);
    console.log("\nFlashcard successfully added\n");
  }

  private remove(): void {
    const fileName = "flashcards.json";
    let flashcards: any = [];

    try {
      flashcards = this.fileManager.read(fileName);
      for (let i = 1; i < flashcards.length; i++) {
        console.log(`\nFlashcard No.${i}`);
        const flashcard = flashcards[i];
        console.log(
          `Question: ${flashcard.question}\nAnswer: ${flashcard.answer}\n`
        );
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`File ${fileName} does not exist.`);
      } else {
        throw error;
      }
    }
    if (flashcards.length === 1) {
      console.log(`File ${fileName} is empty. Cannot remove flashcard.`);
      return;
    }
    let id = rl.question("Enter index of Flashcard you want to remove: ");
    let index: number = parseInt(id);
    if (index < 1 || index >= flashcards.length) {
      console.log(`Invalid index: ${index}.`);
      return;
    }
    flashcards.splice(index, 1);
    this.fileManager.write(fileName, flashcards);
    console.log("Flashcard successfully removed\n");
  }
  public printDescription(): string {
    return "Add/Remove";
  }
}
class PrinterApp implements AppInterface {
  private folderName: string;
  private fileManager: FileManager;
  constructor(folderName: string) {
    this.fileManager = new FileManager(folderName);
  }
  public launch(): void {
    const fileName = "flashcards.json";
    let flashcards: any = [];

    try {
      flashcards = this.fileManager.read(fileName);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`File ${fileName} does not exist.`);
      } else {
        throw error;
      }
    }
    if (flashcards.length === 1) {
      console.log(
        `File ${fileName} is empty. There are no flashcards to print.`
      );
      return;
    }
    for (let i = 1; i < flashcards.length; i++) {
      console.log(`\nFlashcard No.${i}`);
      const flashcard = flashcards[i];
      console.log(
        `Question: ${flashcard.question}\nAnswer: ${flashcard.answer}\n`
      );
    }
  }
  public printDescription(): string {
    return "View all flashcards";
  }
}
class PlayApp implements AppInterface {
  private folderPath: string;
  private fileManager: FileManager;
  constructor(folderPath: string) {
    this.fileManager = new FileManager(folderPath);
  }
  public launch(): void {
    const fileName = "flashcards.json";
    let flashcards: any = [];

    try {
      flashcards = this.fileManager.read(fileName);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`File ${fileName} does not exist.`);
      } else {
        throw error;
      }
    }
    if (flashcards.length === 1) {
      console.log(
        `File ${fileName} is empty. There are no flashcards to print.`
      );
      return;
    }
    
    const randomizedArr=[...flashcards];
    for (let i = flashcards.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * (i - 1)) + 1;
        [randomizedArr[i], randomizedArr[j]] = [randomizedArr[j], randomizedArr[i]];
    }
    let correctAnswers = 0;
    let totalAnswers = 0;
    for (let index = 1; index < flashcards.length; index++) {
      let question = randomizedArr[index].question;
      let answer = randomizedArr[index].answer;
      console.log(`Question ${totalAnswers+1}: ${question}?`);
      let userAnswer = rl.question("Answer: ");
      if (userAnswer.trim().toLowerCase() === answer.trim().toLowerCase()) {
        console.log("Correct!\n");
        correctAnswers++;
      } else {
        console.log("Incorrect!\n");
      }
      totalAnswers++;
    }
    if (totalAnswers > 0) {
      let percentage = (correctAnswers / totalAnswers) * 100;
      console.log(
        `You got ${correctAnswers} out of ${totalAnswers} correct(${percentage.toFixed(2)}%).\n`
      );
      if (percentage < 50) {
        console.log("You should try again!");
      } else {
        console.log("Very Good! You should add more Flashcards.");
      }
    }
  }
  public printDescription(): string {
    return "Test your knowledge";
  }
}
