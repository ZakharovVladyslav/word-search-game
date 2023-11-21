"use client";

import "./page.css";
import React, { useEffect, useState } from "react";

interface Cell {
    letter: string;
    row: number;
    col: number;
}

interface Settings {
    directions: string[];
    gridSize: number;
    words: string[];
    wordsList: string[];
    debug: boolean;
}

interface WordSearchProps {
    wrapEl: HTMLElement;
}

class WordSearch {
    wrapEl: HTMLElement;
    solved: number;
    settings: Settings;
    matrix!: Cell[][];
    selected!: Cell[];
    selectFrom!: Cell | null;

    constructor(props: WordSearchProps) {
        this.wrapEl = props.wrapEl;
        this.wrapEl.classList.add("ws-area");

        this.solved = 0;

        this.settings = {
            directions: ["W", "N", "WN", "EN"],
            gridSize: 7,
            words: ["one", "two", "three", "four", "five"],
            wordsList: [],
            debug: false,
        };

        if (this.parseWords(this.settings.gridSize)) {
            let isWorked = false;

            while (!isWorked) {
                this.initialize();
                isWorked = this.addWords();
            }

            if (!this.settings.debug) {
                this.fillUpFools();
            }

            this.drawMatrix();
        }
    }

    parseWords(maxSize: number) {
        let itWorked = true;

        for (let i = 0; i < this.settings.words.length; i++) {
            this.settings.wordsList[i] = this.settings.words[i].trim();
            this.settings.words[i] = this.settings.wordsList[i]
                .trim()
                .toUpperCase();

            let word = this.settings.words[i];
            if (word.length > maxSize) {
                alert(
                    "The length of word `" +
                        word +
                        "` is overflow the gridSize."
                );
                console.error(
                    "The length of word `" +
                        word +
                        "` is overflow the gridSize."
                );
                itWorked = false;
            }
        }

        return itWorked;
    }

    addWords() {
        console.log("Adding words");
        let keepGoing = true,
            counter = 0,
            isWorked = true;

        while (keepGoing) {
            let dir =
                    this.settings.directions[
                        this.randRange(0, this.settings.directions.length - 1)
                    ],
                result = this.addWord(this.settings.words[counter], dir);

            if (!result) {
                keepGoing = false;
                isWorked = false;
            }

            counter++;
            if (counter >= this.settings.words.length) {
                keepGoing = false;
            }
        }

        return isWorked;
    }

    addWord(word: string, direction: string) {
        let itWorked = true,
            directions: {
                W: number[];
                N: number[];
                WN: number[];
                EN: number[];
            } = {
                W: [0, 1],
                N: [1, 0],
                WN: [1, 1],
                EN: [1, -1],
            },
            row: number = 0,
            col: number = 0;

        switch (direction) {
            case "W":
                (row = this.randRange(0, this.settings.gridSize - 1)),
                    (col = this.randRange(
                        0,
                        this.settings.gridSize - word.length
                    ));
                break;

            case "N":
                (row = this.randRange(0, this.settings.gridSize - word.length)),
                    (col = this.randRange(0, this.settings.gridSize - 1));
                break;

            case "WN":
                (row = this.randRange(0, this.settings.gridSize - word.length)),
                    (col = this.randRange(
                        0,
                        this.settings.gridSize - word.length
                    ));
                break;

            case "EN":
                (row = this.randRange(0, this.settings.gridSize - word.length)),
                    (col = this.randRange(
                        word.length - 1,
                        this.settings.gridSize - 1
                    ));
                break;

            default:
                let error = "UNKNOWN DIRECTION " + direction + "!";
                alert(error);
                console.log(error);
                break;
        }

        for (let i = 0; i < word.length; i++) {
            let newRow =
                    row +
                    i * directions[direction as keyof typeof directions][0],
                newCol =
                    col +
                    i * directions[direction as keyof typeof directions][1];

            let origin = this.matrix[newRow][newCol].letter;

            if (origin === "." || origin === word[i]) {
                this.matrix[newRow][newCol].letter = word[i];
            } else {
                itWorked = false;
            }
        }

        return itWorked;
    }

    initialize() {
        this.matrix = Array.from({ length: this.settings.gridSize }, () =>
            Array(this.settings.gridSize)
        );
        this.selectFrom = null;
        this.selected = [];

        this.initMatrix(this.settings.gridSize);
    }

    initMatrix(size: number) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                let item: Cell = {
                    letter: ".",
                    row,
                    col,
                };

                this.matrix[row][col] = item;
            }
        }
    }

    drawMatrix() {
        for (let row = 0; row < this.settings.gridSize; row++) {
            let divEl = document.createElement("div");
            divEl.setAttribute("class", "ws-row");
            this.wrapEl.appendChild(divEl);

            for (let col = 0; col < this.settings.gridSize; col++) {
                let cvEl = document.createElement("canvas");
                cvEl.setAttribute("class", "ws-col");
                cvEl.setAttribute("width", "40");
                cvEl.setAttribute("height", "40");

                let x = cvEl.width / 2,
                    y = cvEl.height / 2;

                let ctx = cvEl.getContext("2d");
                if (ctx) {
                    ctx.font = "400 28px Calibri";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#333";
                    ctx.fillText(this.matrix[row][col].letter, x, y);

                    cvEl.addEventListener(
                        "mousedown",
                        this.onMouseDown(this.matrix[row][col])
                    );
                    cvEl.addEventListener(
                        "touchmove",
                        this.onMouseDown(this.matrix[row][col])
                    );
                    cvEl.addEventListener(
                        "mouseover",
                        this.onMouseOver(this.matrix[row][col])
                    );
                    cvEl.addEventListener("mouseup", this.onMouseUp());
                }

                divEl.appendChild(cvEl);
            }
        }
    }

    fillUpFools() {
        for (let row = 0; row < this.settings.gridSize; row++) {
            for (let col = 0; col < this.settings.gridSize; col++) {
                if (this.matrix[row][col].letter === ".") {
                    this.matrix[row][col].letter = String.fromCharCode(
                        this.randRange(65, 90)
                    );
                }
            }
        }
    }

    getItems(rowFrom: number, colFrom: number, rowTo: number, colTo: number) {
        let items = [];

        if (
            rowFrom === rowTo ||
            colFrom === colTo ||
            Math.abs(rowTo - rowFrom) === Math.abs(colTo - colFrom)
        ) {
            let shiftY = rowFrom === rowTo ? 0 : rowTo > rowFrom ? 1 : -1,
                shiftX = colFrom === colTo ? 0 : colTo > colFrom ? 1 : -1,
                row = rowFrom,
                col = colFrom;

            items.push(this.getItem(row, col));
            do {
                row += shiftY;
                col += shiftX;
                items.push(this.getItem(row, col));
            } while (row !== rowTo || col !== colTo);
        }

        return items;
    }

    getItem(row: number, col: number) {
        return this.matrix[row] ? this.matrix[row][col] : undefined;
    }

    clearHighlight() {
        let selectedEls = document.querySelectorAll(".ws-selected");
        for (let i = 0; i < selectedEls.length; i++) {
            selectedEls[i].classList.remove("ws-selected");
        }
    }

    // lookup(selected: Cell[]) {
    //     let words = [""];

    //     for (let i = 0; i < selected.length; i++) {
    //         words[0] += selected[i].letter;
    //     }
    //     words.push(words[0].split("").reverse().join(""));

    //     if (
    //         this.settings.words.indexOf(words[0]) > -1 ||
    //         this.settings.words.indexOf(words[1]) > -1
    //     ) {
    //         for (let i = 0; i < selected.length; i++) {
    //             let row = selected[i].row + 1,
    //                 col = selected[i].col + 1,
    //                 el = document.querySelector(
    //                     ".ws-area .ws-row:nth-child(" +
    //                         row +
    //                         ") .ws-col:nth-child(" +
    //                         col +
    //                         ")"
    //                 );

    //             if (el) {
    //                 el.classList.add("ws-found");

    //                 const randomColor = `rgb(${Math.floor(
    //                     Math.random() * 256
    //                 )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
    //                     Math.random() * 256
    //                 )})`;

    //                 // Apply random color to the found word
    //                 // el.style.backgroundColor = randomColor;
    //                 el.setAttribute("style", `background-color: ${randomColor}`);
    //             }
    //         }

    //         let wordList = document.querySelector(".ws-words");
    //         let wordListItems = wordList?.getElementsByTagName("li");

    //         if (wordListItems) {
    //             for (let i = 0; i < wordListItems.length; i++) {
    //                 if (words[0] === wordListItems[i].innerHTML.toUpperCase()) {
    //                     if (
    //                         wordListItems[i].innerHTML !=
    //                         "<del>" + wordListItems[i].innerHTML + "</del>"
    //                     ) {
    //                         wordListItems[i].innerHTML =
    //                             "<del>" + wordListItems[i].innerHTML + "</del>";
    //                         this.solved++;
    //                     }
    //                 }
    //             }
    //         }

    //         if (this.solved === this.settings.words.length) {
    //             this.gameOver();
    //         }
    //     }
    // }

    lookup(selected: Cell[]) {
        let words = [""];

        for (let i = 0; i < selected.length; i++) {
            words[0] += selected[i].letter;
        }
        words.push(words[0].split("").reverse().join(""));

        if (
            this.settings.words.indexOf(words[0]) > -1 ||
            this.settings.words.indexOf(words[1]) > -1
        ) {
            // Generate random RGB values
            const randomColor = `rgb(${
                Math.floor(Math.random() * 128) + 128
            }, ${Math.floor(Math.random() * 128) + 128}, ${
                Math.floor(Math.random() * 128) + 128
            })`;

            for (let i = 0; i < selected.length; i++) {
                let row = selected[i].row + 1,
                    col = selected[i].col + 1,
                    el = document.querySelector(
                        ".ws-area .ws-row:nth-child(" +
                            row +
                            ") .ws-col:nth-child(" +
                            col +
                            ")"
                    );

                if (el) {
                    el.classList.add("ws-found");

                    // Apply the same random color to the entire found word
                    // el.style.backgroundColor = randomColor;
                    el.setAttribute(
                        "style",
                        `background-color: ${randomColor}`
                    );
                }
            }

            let wordList = document.querySelector(".ws-words");
            let wordListItems = wordList?.getElementsByTagName("li");

            if (wordListItems) {
                for (let i = 0; i < wordListItems.length; i++) {
                    if (words[0] === wordListItems[i].innerHTML.toUpperCase()) {
                        if (
                            wordListItems[i].innerHTML !=
                            "<del>" + wordListItems[i].innerHTML + "</del>"
                        ) {
                            wordListItems[i].innerHTML =
                                "<del>" + wordListItems[i].innerHTML + "</del>";
                            this.solved++;
                        }
                    }
                }
            }

            if (this.solved === this.settings.words.length) {
                this.gameOver();
            }
        }
    }

    gameOver() {
        alert("yay");
    }

    onMouseDown(item: Cell) {
        return () => {
            this.selectFrom = item;
        };
    }

    onMouseOver(item: Cell) {
        return () => {
            if (this.selectFrom) {
                this.selected = this.getItems(
                    this.selectFrom.row,
                    this.selectFrom.col,
                    item.row,
                    item.col
                ).filter((cell): cell is Cell => cell !== undefined);

                this.clearHighlight();

                for (let i = 0; i < this.selected.length; i++) {
                    let current = this.selected[i],
                        row = current.row + 1,
                        col = current.col + 1,
                        el = document.querySelector(
                            ".ws-area .ws-row:nth-child(" +
                                row +
                                ") .ws-col:nth-child(" +
                                col +
                                ")"
                        );

                    if (el) {
                        el.className += " ws-selected";
                    }
                }
            }
        };
    }

    onMouseUp() {
        return () => {
            this.selectFrom = null;
            this.clearHighlight();
            this.lookup(this.selected);
            this.selected = [];
        };
    }

    private randRange(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export default function Home(): JSX.Element {
    const [gameAreaEl, setGameAreaEl] = useState<HTMLElement | null>(null);

    const restartGame = () => {
        // Clear the existing game area
        const gameArea = document.getElementById("ws-area");
        if (gameArea) {
            gameArea.innerHTML = "";
        }

        // Clear the existing words list
        const wordsWrap = document.querySelector(".ws-words");
        if (wordsWrap) {
            wordsWrap.innerHTML = "";
        }

        // Set the game area element to null to trigger useEffect and initialize a new game
        setGameAreaEl(null);
    };

    useEffect(() => {
        if (gameAreaEl) {
            const gameobj = new WordSearch({ wrapEl: gameAreaEl });

            const words = gameobj.settings.wordsList;
            const wordsWrap = document.querySelector(".ws-words");

            if (wordsWrap) {
                for (const word of words) {
                    const liEl = document.createElement("li");
                    liEl.setAttribute("class", "ws-word");
                    liEl.innerText = word;
                    wordsWrap.appendChild(liEl);
                }
            }
        }
    }, [gameAreaEl]);

    return (
        <main>
            <div className="container">
                <div id="ws-area" ref={(el) => setGameAreaEl(el)}></div>
                <ul className="ws-words"></ul>
            </div>

            <button className="reset-game-btn" onClick={restartGame}>Restart Game</button>
        </main>
    );
}
