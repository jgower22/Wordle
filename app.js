var id = 0;
const begIDs = [0, 5, 10, 15, 20, 25]
var letterCount = 0;
var isAtEnd = false;
var isGameOver = false;
const validWords = [];
const wordBank = [];
var isInvalid = false;
var hasWonGame = false;
var word = "";
var wordArr = [];
var yellowLetters = [];
var greenLetters = [];
var permGreenLetters = [];
var guessArr = [];
var numGuesses = 0;
var isDoingAnimation = false;
var indexOfWord;

$(document).ready(function() {
    getWordBank();
    indexOfWord = setWord();
    getValidWords();
    formatMobileDevice();
    initLocalStorage();
    //Check to see if current word is equal to the word in the last game the user has played
    //const previousWordPlayed = window.localStorage.getItem("solution");
    const previousWordPlayed = window.localStorage.getItem("lastIdPlayed");
    console.log("PREV: " + previousWordPlayed);
    console.log("INDEX OF WORD: " + indexOfWord);
    if (previousWordPlayed === "-1" || previousWordPlayed != indexOfWord) {
        window.localStorage.setItem("hasPlayedToday", "false");
    } else {
        window.localStorage.setItem("hasPlayedToday", "true");
    }
    updateBoardFromLocalStorage();
    addEventListeners();

    if (mobileCheck()) {
        //Change letter I size
        //document.getElementById("I").style.width = "17vmax";
    }

});

/*window.onload = function () {
    document.onkeydown = function (e) {
        return (e.which || e.keyCode) != 116;
    };
}*/

function initLocalStorage() {
    if (window.localStorage.getItem("numWins") === null)
        window.localStorage.setItem("numWins", 0);
    if (window.localStorage.getItem("numGames") === null)
        window.localStorage.setItem("numGames", 0);
    if (window.localStorage.getItem("currentStreak") === null)
        window.localStorage.setItem("currentStreak", 0);
    if (window.localStorage.getItem("boardState") === null)
        window.localStorage.setItem("boardState", 0);
    if (window.localStorage.getItem("keyboardState") === null)
        window.localStorage.setItem("keyboardState", 0);
    if (window.localStorage.getItem("currentID") === null)
        window.localStorage.setItem("currentID", 0);
    if (window.localStorage.getItem("hasPlayedToday") === null)
        window.localStorage.setItem("hasPlayedToday", "false");
    //if (window.localStorage.getItem("solution") === null)
       //window.localStorage.setItem("solution", 0);
    if (window.localStorage.getItem("lastIdPlayed") === null)
        window.localStorage.setItem("lastIdPlayed", -1);
}

function saveGameState() {
    const boardHTML = document.getElementById("main").innerHTML;
    const keyboardHTML = document.getElementById("alphabet").innerHTML;
    window.localStorage.setItem("hasPlayedToday", "true");
    window.localStorage.setItem("boardState", boardHTML);
    window.localStorage.setItem("keyboardState", keyboardHTML);
    window.localStorage.setItem("currentID", id);
    console.log("IS GAME OVER: " + isGameOver);
    window.localStorage.setItem("isGameOver", isGameOver);
    //window.localStorage.setItem("solution", word);
    window.localStorage.setItem("lastIdPlayed", indexOfWord);
}

function updateBoardFromLocalStorage() {
    let hasPlayedToday = JSON.parse(window.localStorage.getItem("hasPlayedToday"));
    if (hasPlayedToday) {
        //Don't want to update when it is a new day
        //Which would be the first time the user loads the page on a new day
        //Check to see how many times the page has been loaded by the user for that day
        //If it is the first time // nothing exists in the board/keyboard state
        //Then don't change the board/keyboard state
        const boardHTML = window.localStorage.getItem("boardState");
        const keyboardHTML = window.localStorage.getItem("keyboardState");
        id = window.localStorage.getItem("currentID");
        isGameOver = JSON.parse(window.localStorage.getItem("isGameOver"));
        //If board state exists
        if (boardHTML !== "0")
            document.getElementById("main").innerHTML = boardHTML;
        //If keyboard state exists
        if (keyboardHTML !== "0")
            document.getElementById("alphabet").innerHTML = keyboardHTML;
        if (isGameOver)
            showTimer();
    }
}

function addEventListeners() {
    //Make on screen keyboard clickable
    var buttons = document.querySelectorAll('.letters');
    buttons.forEach(button => {
        button.addEventListener('click', function handleClick(event) {
            console.log("CLICK");
            if (isDoingAnimation === true) {
                return;
            }
            handleUserInput(button.innerHTML);
        });
    });
    //Allow for keyboard input
    document.addEventListener('keydown',
        function (event) {
            if (isDoingAnimation === true) {
                return;
            }
            var char = event.key.toUpperCase();
            handleUserInput(char);
        });
}

function handleUserInput(char) {
    if (isGameOver) {
        return;
    }
    //console.log("ID: " + id);
    //Initial check
    if (letterCount === 5) {
        isAtEnd = true;
        guess = getGuess();
        guessArr = guess.split('');
        if (!validWords.includes(guess)) {
            setLettersToRed();
            isInvalid = true;
            if (char === 'ENTER' || char === '✓') {
                //Clear row if enter is pressed on invalid word
                setLettersToBlack();
                let startingID = id - 5;
                let endingID = id;
                id = startingID;
                letterCount = 0;
                for (startingID; startingID < endingID; startingID++) {
                    document.getElementById(startingID).innerHTML = "";
                }
                return;
            }
        } else {
            isInvalid = false;
        }
    } else {
        isAtEnd = false;
    }

    if (char === 'ENTER' || char === '✓') {
        if (isAtEnd) {
            if (!isInvalid) {
                //Change letters to white
                setLettersToWhite();
                numGuesses++;

                //Update row
                updateColorsForRow();

                //Update alphabet
                setTimeout(function() {
                    updateAlphabet(guess);
                }, 1200);

                letterCount = 0;
                //If on last row at end
                if (id === 30) {
                    if (hasWonGame === false) {
                        //Reset current streak to 0
                        window.localStorage.setItem("currentStreak", 0);
                        setTimeout(function () {
                            showMessage(word);
                        }, 1500);
                    }
                    setTimeout(showTimer, 1500);
                    isGameOver = true;
                    //Update num of games
                    let numGames = localStorage.getItem("numGames");
                    numGames++;
                    window.localStorage.setItem("numGames", numGames);
                }
            }
            return;
        }
    }
    if (char === 'BACKSPACE' || char === '❌') {
        if (!begIDs.includes(id) || isAtEnd) {
            if (letterCount === 5) {
                setLettersToBlack();
            }
            id--;
            removeLetter(id);
            letterCount--;
        }
    } else {
        //Check for valid input
        var letters = /[A-Z]/;
        if (!letters.test(char))
            return;
        if (char.length >= 2)
            return
        if (!isAtEnd) {
            setLetter(id, char);
            letterCount++;
            id++;
        }
    }
    //Check again
    if (letterCount === 5) {
        isAtEnd = true;
        guess = getGuess();
        guessArr = guess.split('');
        if (!validWords.includes(guess)) {
            setLettersToRed();
            isInvalid = true;
        } else {
            isInvalid = false;
        }
    } else {
        isAtEnd = false;
    }
}

function setLetter(id, letter) {
    var cell = document.getElementById(id);
    cell.innerHTML = letter;
}

function removeLetter(id) {
    var cell = document.getElementById(id);
    cell.innerHTML = "";
}

function setLettersToWhite() {
    var tempID = id-1;
    for (let i = 0; i < 5; i++) {
        var cell = document.getElementById(tempID);
        cell.style.color = "white";
        tempID--;
    }
}

function setLettersToRed() {
    var tempID = id-1;
    for (let i = 0; i < 5; i++) {
        var cell = document.getElementById(tempID);
        cell.style.color = "red";
        tempID--;
    }
}

function setLettersToBlack() {
    var tempID = id-1;
    for (let i = 0; i < 5; i++) {
        var cell = document.getElementById(tempID);
        cell.style.color = "black";
        tempID--;
    }
}

function updateColorsForRow() {
    var tempID = id - 5;
    var tempID2 = id - 5;
    var tempID3 = id - 5;
    var numLettersCorrect = 0;
    const countLetters = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    yellowLetters = [];
    greenLetters = [];
    //const cells = [];
    const colors = [];
    /*for (let i = 0; i < 5; i++) {
        cells.push(document.getElementById(tempID));
        tempID++;
    }*/
    for (let i = 0; i < 5; i++) {
        let cell = document.getElementById(tempID);
        let letter = cell.innerText;
        //cell.style.backgroundColor = "gray";
        colors.push("gray");
        //var numLettersInGuess = countLetters(guessArr, letter);
        let numLettersInWord = countLetters(wordArr, letter);
        let curNumYellowLetters = countLetters(yellowLetters, letter);
        let curNumGreenLetters = countLetters(greenLetters, letter);
        //Yellow
        if (wordArr.includes(letter)) {
            if (curNumYellowLetters < numLettersInWord && curNumGreenLetters < numLettersInWord) {
                colors.pop();
                colors.push("#8B8000");
            }
            //Green
            if (wordArr[i] === letter) {
                //cell.style.backgroundColor = "green";
                colors.pop();
                colors.push("green");
                //Update green letters array
                greenLetters.push(letter);
                if (!permGreenLetters.includes(letter)) {
                    //alert("ADDED GREEN HERE 1");
                    permGreenLetters.push(letter);
                }
                //Update yellow letters array to remove any yellow letters
                //that have now turned green
                while (yellowLetters.includes(letter)) {
                    var index = yellowLetters.indexOf(letter);
                    yellowLetters.splice(index, 1);
                }
                numLettersCorrect++;
                if (numLettersCorrect === 5) {
                    isGameOver = true;
                    hasWonGame = true;

                    //Update num of wins
                    let numWins = window.localStorage.getItem("numWins");
                    numWins++;
                    window.localStorage.setItem("numWins", numWins);
                    //Update current streak
                    let currentStreak = window.localStorage.getItem("currentStreak");
                    currentStreak++;
                    window.localStorage.setItem("currentStreak", currentStreak);
                    //Generate message
                    let message = "";
                    switch (numGuesses) {
                        case 1:
                            message = "How?!!";
                            break;
                        case 2:
                            message = "Genius!";
                            break;
                        case 3:
                            message = "Incredible!";
                            break;
                        case 4:
                            message = "Nice!";
                            break;
                        case 5:
                            message = "Getting close!";
                            break;
                        case 6:
                            message = "Close one!";
                            break;
                    }
                    //showMessage(message);

                    //alert("Num Wins: " + localStorage.getItem("numWins"));
                    //Update num of games if num guesses < 6
                    if (numGuesses < 6) {
                        let numGames = localStorage.getItem("numGames");
                        numGames++;
                        localStorage.setItem("numGames", numGames);
                        //alert("Num Games: " + localStorage.getItem("numGames"));
                    }
                    setTimeout(showTimer, 1500);
                }
            } else {
                //Update yellow letters array
                if (!greenLetters.includes(letter))
                    yellowLetters.push(letter);
                //if (!permGreenLetters.includes(letter))
                //permGreenLetters.push(letter);
            }
        }
        tempID++;
    }
    //Check for unnecessary yellows (would be in front of green letters)
    for (let i = 0; i < 5; i++) {
        var cell = document.getElementById(tempID2);
        var letter = cell.innerText;
        //var backgroundColor = cell.style.backgroundColor;
        //backgroundColor === "gold"
        if (colors[i] === "gold") {
            var curNumGreenLetters = countLetters(greenLetters, letter);
            var numLettersInWord = countLetters(wordArr, letter);
            if (curNumGreenLetters >= numLettersInWord) {
                //cell.style.backgroundColor = "gray";
                colors.splice(i, 1);
                colors.splice(i, 0, "gray");
            }
        }
        tempID2++;
    }
    const interval = 200;
    colors.forEach((color, index) => {
        setTimeout(() => {
            let cell = document.getElementById(tempID3);
            cell.classList.add("animate__flipInX");
            //let color = colors[i];
            cell.style.backgroundColor = color;
            tempID3++;
            isDoingAnimation = true;
            if (index === 4) {
                setTimeout(setAnimationToFalse, 500);
            }
        }, interval * index);
    });
    //Update colors with animation
    /*for (i = 0; i < 5; i++) {
        let cell = document.getElementById(tempID3);
        cell.classList.add("animate__flipInX");
        let color = colors[i];
        cell.style.backgroundColor = color;
        tempID3++;
    } */
}

function setAnimationToFalse() {
    isDoingAnimation = false;
    console.log("Stopped Animation");
}

function getWordBank() {
    var index = 0;
    $.ajax({
        type: "get",
        url: "word_bank.json",
        timeout: 10000,
        crossDomain: true,
        async: false,
        error: function(xhr, status, error) {
            alert("Error: " + xhr.status + " - " + error);
        },
        dataType: "json",
        success: function(data) {
            //alert("Get Word Bank");
            $.each(data, function() {
                wordBank.push(data[index]);
                index++;
            });
        }
    });
}

function setWord() {
    //Index based on date
    var startingDate = new Date("04/23/2022");
    var todaysDate = new Date();
    //document.getElementById("date").innerHTML = todaysDate;
    var timeDifference = todaysDate.getTime() - startingDate.getTime();
    var dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    word = wordBank[dayDifference];
    //word = "CONES".toUpperCase();
    if (word != null)
        wordArr = word.split('');
    return dayDifference;
}

function getValidWords() {
    var index = 0;
    $.ajax({
        type: "get",
        url: "valid_words.json",
        timeout: 10000,
        crossDomain: true,
        async: false,
        error: function(xhr, status, error) {
            alert("Error: " + xhr.status + " - " + error);
        },
        dataType: "json",
        success: function(data) {
            //alert("Get Valid Words");
            $.each(data, function() {
                validWords.push(data[index]);
                index++;
            });
        }
    });
}

function getGuess() {
    var tempID = id-5;
    var word = "";
    for (let i = 0; i < 5; i++) {
        var cell = document.getElementById(tempID);
        word += cell.innerText;
        tempID++;
    }
    return word;
}

function updateAlphabet(guess) {
    for (let i = 0; i < guess.length; i++) {
        var cell = document.getElementById(guess.charAt(i));
        var letter = cell.innerText;
        if (yellowLetters.includes(letter) && !permGreenLetters.includes(letter)) {
            cell.style.backgroundColor = "#8B8000";
        } else if (permGreenLetters.includes(letter)) {
            cell.style.backgroundColor = "green";
        } else {
            cell.style.backgroundColor = "gray";
        }
    }
    saveGameState();
}

function showTimer() {
    /*var timer = setInterval(function() {
        var todaysDate = new Date();
        var tomorrowsDate = new Date();
        tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);
        tomorrowsDate.setHours(0, 0, 0, 0);
        var milliseconds = tomorrowsDate.getTime() - todaysDate.getTime();
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        seconds--;
        //Make sure there are two digits for each
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        if (hours === "00" && minutes === "00" && seconds === "00") {
            clearInterval(timer);
        }
        //Hours, minutes, seconds
        if (!mobileCheck())
            document.getElementById("alphabet").style.marginTop = "116px";
        document.getElementById("timer").innerHTML = "New Word In: " + hours + ":" + minutes + ":" + seconds;
    }, 500);*/
}

function showMessage(message) {
    alert(word);
    //document.getElementById("message").innerHTML = message;
    //document.getElementById("main").style.marginTop = "0px";
}

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function formatMobileDevice() {
    if (mobileCheck()) {
        var main = document.getElementById("main");
        main.style.marginTop = "0px";
        main.style.padding = "0px";

        var alphabet = document.getElementById("alphabet");
        alphabet.style.marginTop = "5px";
        alphabet.style.padding = "0px";
        alphabet.style.fontSize = "5vw";

        //var letterI = document.getElementById("I");
        //letterI.style.width = "100px";

    }
}
