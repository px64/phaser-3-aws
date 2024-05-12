//===============================
//
// MAGA vs. Woke Game
//
// Things to do list:
//    1. During 'politics', you can move barriers around, but not during 'insurrection'?
//    2. Alien Invasion: need to add a military Icon that you can drop helperTokens into to boost military strength
//        -- military strength can take on several different aspects.
//            - limited missiles to fire: more missiles
//            - faster missiles
//            - improved accuracy
//            - bigger explosions (would need to add missile detonation at destination and an explosion)
//            - more frequent reload (would need to add a time delay between missile launches)
//                  -- idea that also impacts putieville: perhaps each territory has a launch delay and
//                  -- it automatically round-robins between territories so the delay can catch up when returning to territory #1
//        -- How does user get to add to the military strength (or defense) aspects?
//            -- easiest: round robin: but doesn't make much sense
//            -- another scene that has slider bars for all of the aspects: the best but more work. Yes but need to wait for insurrectionists to finish.
//            -- a popup overlay when military health is boosted?
//    3. Need to come up with some negative impact of Putieville on the aliens attack screen.
//        -- See above on the round-robin reload idea for fewer bases to fire from
//        -- putieville can launch it's own 'decoy puties' that can impact or deflect your missiles but don't harm aliens
//            -- this might be pretty easy to implement
//    6. Need to add general rules for all gauges:
//        - If difference between Maga and Woke is large: health goes down
//        - If sum of Maga AND Woke is large: chance of icon collapse
//        - If difference is small: health goes up

// Problem: when we go to alien attack screen, we never encounter the insurrection screen!
//  you should always go to insurrectionist attack.  Actually go to the military allocation screen, then insurrectionists attack, then aliens attack

// Two player game:
// one player plays MAGA, the other plays Woke.
// During politics, each allocates capital to their own people only.
//  -- MAGA spends capital building better alien attacks and defenses.
//  -- Woke spends capital building better infrastructure against collapse/ insurrection

// NEW IDEA: have social justice only improve by answering difficult questions.
// It would be interesting if you get a mix of maga and woke characters that changes every game.
// or perhaps if you choose maga, the two defensive characters are woke, but if you choose woke,
// the two defensive characters are maga!



// Done:
//    add a 'quit' button to insurrection screen so it can end in case there are only a few threats floating around (maybe a timer?  30 secs?)
//          -- Have a Putie-ville (and China) that grow across the country
//
//            -- If difference between Maga and Woke is large: Need an indicator of this difference on the gauge!
//                 - fix gauge color so it stays the color of the greatest of maga or woke

import BaseScene from './BaseScene.js';
import {Politics} from './politics.js';
import {DilemmaScene} from './dilemma.js';
import {Insurrection} from './insurrection.js';
import {MilitaryAllocation} from './MilitaryAllocation.js';
import {Scene2} from './aliens_attack.js';
import {AliensAttack} from './aliens_attack.js';
import {ChooseYourIdeologyScene} from './ideology.js';

import { territories } from './BaseScene.js'
import { characters } from './BaseScene.js';
import { difficultyList } from './BaseScene.js';

var healthBar;
var healthBox;
var healthGauge;
var thereBeThreats;
let MAGAslider;
let Wokeslider;
var foo;
var MAGAnessText;
var WokenessText;
var polCapText;
var yearText;


class TitleScene extends Phaser.Scene {
    constructor () {
        super({ key: 'titlescene'});
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023,
            misinformation: {},
            helperTokens: {},
            ideology: 'maga',
            thisRoundAlienAttacks: 1,
            thisRoundTerritoriesWithMissiles: 6,
            MAGAnessVelocity: 0,
            WokenessVelocity: 0,
            difficultyLevel: 'A Beginner'
        };
    }

    create() {
        //localStorage.setItem('highScore', 0);

        // The story text
        let storyLines = [
            "MAGA vs. Woke",
            " ",
            "In the year 2023, America stood divided. A philosophical war had taken",
            "hold, a conflict of ideas and ideals that divided the nation into two",
            "distinct factions: MAGA and Woke. These two sides stood in opposition, each",
            "one convinced that its own path was the one true way to guide America towards",
            "prosperity.",
            " ",
            "MAGA supporters, with their rallying cry of 'Make America Great Again',",
            "yearned for a return to traditional values, less government interference, and",
            "a strong sense of national identity. They envisioned an America that was",
            "united under a single flag, with patriotism as the driving force that",
            "propelled the nation forward.",
            " ",
            "On the other side, the Woke faction called for change, inclusivity,",
            "diversity, and a focus on social and environmental responsibility. They",
            "wanted a future where everyone had a place, a voice, and the ability to",
            "contribute to society, regardless of their background.",
            " ",
            "As time went on, these ideological differences began to form a chasm",
            "between the two factions, threatening to tear the nation apart. But in the",
            "shadows, a new threat was looming. A threat that didn't care about political",
            "affiliations or philosophical disagreements. An alien invasion was on the",
            "horizon.",
            " ",
            "The only hope for survival lay in unity. But could these two factions, so",
            "deeply entrenched in their beliefs, set aside their differences and work",
            "together for the greater good of humanity? Only time would tell as the first",
            "signs of the extraterrestrial threat began to emerge."
        ];
        let storyLines_tooLong = [
            "The objective of the game is to keep society stable throughout the attack by the alien invaders.",

            "At the top of the screen are icons representing various aspects of society.  The icons are:",
            "Environment, Economy, Government, Social Justice, Diplomacy, and Alien Defense (military).",

            "Each icon has a ring around it that represents the health or strength of that aspect of society.",
            "If the aspect is strong, the gauge is mostly white.  If the aspect is weak the gauge is mostly dark.",
            "Above each icon is a the name of the icon and a description of the strength of the icon ranging from",
            "'excellent' to 'terrible'.  Next to each icon are tiny hats showing the total number of political",
            "activists from each faction that are engaged with that aspect of society. If the scale gets too far",
            "out of balance, that aspect collapses and Putin moves in and takes over a territory.",

            "The middle of the screen is divided into two halves. The 'MAGA' characters on the left and the 'Woke'",
            "characters on the right.  Each character has a checkbox that can be checked to Endorse that character.",
            "Endorsing a character costs some Political Capital.  Once you've spent your political capital for",
            "that round you cannot endorse any more characters.   There are 3 levels of backing for a character:",
            "none, endorsed, and fully endorsed.  After a character is fully endorsed, a helpful token representation",
            "of the character's abilities is generated which can be dragged into the society icons of that character",
            "to increase the strength of that aspect of society.  However when the character applies its strength to",
            "a society icon, that character will also stir 'interes' in another icon, represented by either MAGA or",
            "Woke hats flying to and accumulating on the icon. For instance, Al Welch, the CEO, is strongly MAGA.",
            "He can help boost the economy, but his strong political leanings will in the process cause MAGA pressure",
            "on the environment to increase too.  ",

            "There are two special characters that do not simply increase the strength of a societal icon.",

            "One type of special character is a negotiator that help reduce the MAGA and Woke pressure on aspects of",
            "society. When this character is fully endorsed, he/she will generate 4 'community outreach' tokens that can be",
            "used to either:",
            "1) Block the MAGA/ Woke hats from accumulating around an icon or:",
            "2) Be dropped into an icon to have up to 5 MAGA and 5 Woke hats peacefully 'return home'",

            "The other type of special character is the 'hacker' which prevents Russian Troll farms from creating instability",
            "at one societal icon.  When this character is fully endorsed, a protection token is generated which can be",
            "dropped into any one of the 6 icons, giving it full immunity to Putin and insurrectionist attacks.",

            "After the political capital has been allocated and the public service tokens have been positioned, the",
            "earth icon in the bottom right corner of the screen can be clicked to move to the next scene.",

            "The next scene is the 'legislative reform' scene.  In this scene, which only comes up a few times during the game,",
            "you are presented with a societal dilemma, and depending on how you act, you cause some amount of unrest, but also",
            "you are given a steady allowance of political capital that accumulates each year that passes in the game.",

            "After that scene is the 'insurrectionist attack' scene.  If 'MAGA' and 'Woke' influences on all aspects",
            "of society are low enough, there will be no insurrectionist unrest.  As influences increase on a",
            "particular level of society, then unrest will increase represented by red 'maga' caps or blue 'woke'",
            "caps attacking that aspect of society.  If 'maga' influence and 'woke' influence are balanced then",
            "the aspect can remain healthy, until a certain threshold where it is too much.  If one is much stronger",
            "than the other, then it is unhealthy too.",

            "If some aspect of society collapses, then Putin moves in and takes over a territory.  Once Putin takes",
            "over a territory you can not get it back.  Putin will influence all aspects of society to create unrest",
            "by sending his own influencers to increase whichever aspect of unrest is greater.",

            "There is also the alien attack scene.  The aliens attack and depending on your military strength you",
            "can either hold them off or they damage some aspect of society.  If you hold them off, you gain political",
            "capital which can be spent back on the first 'politics' screen.",

            "You win if you can get all aspects of society to 'excellent' before Putin and/ or the Aliens take over."
        ];

        let storyLines2 = [
            "How to Play the Game",
            "You are to Maintain societal stability amidst an alien invasion",
            "Icons at the top represent 6 societal aspects",
            "Each icon's status",
            "is shown by a surrounding gauge.",
            "Adjacent scales track the",
            "MAGA/Woke balance for each aspect. If unbalanced, the aspect collapses, and Putin claims a territory.",
            " ",
            "The center of the screen displays MAGA and Woke characters.",
            "Spend Political Capital to endorse characters, enhancing",
            "a societal aspect's strength but also creating MAGA/Woke interest in another.",
            "Al Welch, for example, boosts",
            "Economy but also increases MAGA pressure on Environment.",
            " ",
            "Two unique characters can help:",
            "Negotiators create 'community outreach' tokens to alleviate MAGA/Woke pressure,",
            "Hackers generate protection tokens to shield aspects",
            "from Putin and insurrectionist attacks.",
            " ",
            "After allocating capital and placing tokens,",
            "click the earth icon to proceed to the next scene.",
            "Periodically, you'll face a societal dilemma in the 'legislative reform'",
            "scene, causing some unrest but also providing a steady",
            "Political Capital income.",
            " ",
            "Next, the 'insurrectionist attack' scene occurs.",
            "Balanced MAGA/Woke influences lead to health and low unrest;",
            "unbalance causes problems. If an aspect collapses, Putin claims",
            " a territory, sending influencers to further cause unrest.",
            " ",
            "In the alien attack scene, your military strength determines whether",
            " you fend off the invaders or suffer societal",
            "damage. Successful defense rewards Political Capital.",
            " ",
            "You win by achieving 'excellent' status in all societal aspects",
            "before Putin and/or the Aliens take over."
        ]

        // Create a group to hold your text lines
        let textGroup = this.add.group();
        let text;
        let storyLinesSet = [storyLines];// skip how to play the game for now , storyLines2];
        let currentStoryLineIndex = 0;

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            if (currentStoryLineIndex < storyLinesSet.length - 1) {
                currentStoryLineIndex++;
                this.cameras.main.fadeOut(800, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    displayStoryLine(storyLinesSet[currentStoryLineIndex]);
                    this.cameras.main.fadeIn(800, 0, 0, 0);
                });
            } else {             // Skip to the next scene
                this.cameras.main.fadeOut(800, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.get('ChooseYourIdeologyScene').setup(this.sharedData);
                    this.scene.start('ChooseYourIdeologyScene');
                });
            }
        }, this);

        if (this.sys.game.config.width < 704) {
            this.sharedData.fontSize = '24px';
            this.sharedData.medFont = '18px';

        } else {
          this.sharedData.fontSize = '48px';
          this.sharedData.medFont = '32px';
        }
        if (this.sys.game.config.width < 1200) {
            this.sharedData.charFont = '18px';
        } else {
            this.sharedData.charFont = '28px';
        }

        let textObjects = [];  // Array to store all text objects
        let timerEvents = [];  // Array to store all timer events

        let displayStoryLine = (storyLines) => {
            // Destroy all previous text objects
            textObjects.forEach(text => text.destroy());
            textObjects = [];  // Reset the array

            // Remove all previous timer events
            timerEvents.forEach(event => this.time.removeEvent(event));
            timerEvents = [];  // Reset the array

            for (let i = 0; i < storyLines.length; i++) {
                let timerEvent = this.time.addEvent({
                    delay: i * 1600,
                    callback: () => {
                        text = this.add.text(this.cameras.main.centerX, this.sys.game.config.height, storyLines[i], {
                            font: 'bold ' + this.sharedData.fontSize + ' Arial',
                            fill: '#ffffff',
                            align: 'center'
                        });

                        text.setOrigin(0.5);

                        let startScale = 0.5 + (10 / storyLines.length) / 2;
                        text.setScale(startScale);

                        textObjects.push(text);  // Add the text object to the array

                        let duration = 20000 * (1 + startScale);

                        this.tweens.add({
                            targets: text,
                            y: '-=1050',
                            scaleX: '-=0.7',
                            scaleY: '-=0.7',
                            ease: 'Linear',
                            duration: 33000,
                            repeat: 0,
                            onComplete: function () {
                                // JCS NEW text.destroy();
                                if (i === storyLines.length - 1) {
                                    currentStoryLineIndex++;
                                    if (currentStoryLineIndex < storyLinesSet.length) {
                                        displayStoryLine(storyLinesSet[currentStoryLineIndex]);
                                    } else {
                                        this.scene.get('ChooseYourIdeologyScene').setup(this.sharedData);
                                        this.scene.start('ChooseYourIdeologyScene');
                                    }
                                }
                            },
                            callbackScope: this
                        });
                    },
                    callbackScope: this
                });

                timerEvents.push(timerEvent);  // Add the timer event to the array
            }
        };

        displayStoryLine(storyLinesSet[currentStoryLineIndex]);
    }
}

//====================================================================================
//
//        class VictoryScene extends Phaser.Scene
//
// VictoryScene informative text about a victory of some sort
//
//====================================================================================

class VictoryScene extends BaseScene {
    constructor() {
        super({ key: 'VictoryScene' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023
        };
    }
    setup(data) {
            Object.assign(this.sharedData, data);
            console.log('victory in year ' + this.sharedData.year);
    }
    preload() {
        // Preload an image for the victory scene
        this.load.image('victory', 'assets/aliencrash.png');
    }

    create(data) {
        this.input.setDefaultCursor('default');

        if (data.showScore == true) {
            let scoreText = '\n';
            let yearScore = Math.floor(2200 - this.sharedData.year)/2;
            console.log('Year Score: ' + yearScore);
            scoreText += '\n Year of Victory Score '+ yearScore;
            let legislationScore = Math.floor(this.sharedData.WokenessVelocity*30);
            legislationScore += Math.floor(this.sharedData.MAGAnessVelocity*30);
            console.log('Legislation Bonus Score: ' + legislationScore);
            scoreText += '\n Legislation Bonus: '+ legislationScore;
            let territoriesScore = (territories.length - this.sharedData.alienTerritories - this.sharedData.putieTerritories)*15;
            console.log('Number of Territories Score: ' + territoriesScore);
            scoreText += '\n Territories Bonus: '+ territoriesScore;
            let score = yearScore + legislationScore + territoriesScore;
            scoreText += '\n Score: '+ score;
            scoreText += '\n Difficulty multiplier: '+ this.difficultyLevel().multiplier + 'x';
            score = score * this.difficultyLevel().multiplier;
            console.log('Total Score: ' + score);
            scoreText += '\n Final Score '+ score;

            data.message += scoreText;

            // Retrieve the saved high score, or use 0 if no score is saved
            var highScore = localStorage.getItem('highScore') || 0;
            data.message += '\n Previous High Score: '+highScore;

            if (score > highScore) {
                // Assuming 'score' is a variable containing the player's current score
                localStorage.setItem('highScore', score);
                data.message += '\n You got a new High Score!'
            }

        }

        // Create a text object to display a victory message
        let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, data.message, {
            font: 'bold '+ this.sharedData.fontSize + ' Arial',
            fill: '#ffffff',
            align: 'center'
        });

        victoryText.setOrigin(0.5);  // Center align the text


        // let scoreText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY+40, totalScore, {
        //     font: 'bold '+ this.sharedData.fontSize + ' Arial',
        //     fill: '#ffffff',
        //     align: 'center'
        // });
        // scoreText.setOrigin(0.5);  // Center align the text

        // Optionally, display a victory image
        let victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'victory');
        victoryImage.setScale(1);  // Don't scale down the image
        victoryImage.setAlpha(0.8);  // Make the image semi-transparent

        // Bring the text to the top
        victoryText.setDepth(1);

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            // Switch to the next scene
            this.scene.get('politics').setup(this.sharedData);
            this.scene.start('politics');
        }, this);
    }
}

//====================================================================================
//
//        class TutorialScene extends BaseScene
//
// TutorialScene can be used either for a societal collapse, or for an alien invasion
//
//====================================================================================

class TutorialScene extends BaseScene {
    constructor() {
        super({ key: 'TutorialScene' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023
        };
    }

    setup(data) {
            Object.assign(this.sharedData, data);
    }

    preload() {
        // Preload an image for the tutorial scene
        this.load.image('maga_riot', 'assets/maga_riot.jpg');
        this.load.image('aliens_win', 'assets/aliens_win.jpg');
        this.load.image('aliencrash', 'assets/aliencrash.png');

    }

    create(data) {
        // Use data.message as the message text
        let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, data.message,  {
            font: 'bold ' + this.sharedData.fontSize + ' Arial',
            fill: '#ffffff',
            align: 'center'
        });

        victoryText.setOrigin(0.5);  // Center align the text

        let victoryImage;

        // TutorialScene can be used either for a societal collapse, or for an alien invasion
        if (data.nextScene == 'aliensWin') {
            victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'aliens_win');
            victoryImage.setAlpha(0.7);  // Make the image semi-transparent
        } else if (data.nextScene != 'dilemmaOrInsurrection') {
            victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'maga_riot');
            victoryImage.setAlpha(0.3);  // Make the image semi-transparent
        } else {
            victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'aliencrash')
            victoryImage.setAlpha(0.3);  // Make the image semi-transparent
        }
        // Bring the text to the top
        victoryText.setDepth(1);

        console.log('year is '+ this.sharedData.year);

        //Function to handle dilemma or insurrection
        const handleDilemmaOrInsurrection = () => {
            console.log('before calling dilemmaOdds, WokenessVelocity = ' + this.sharedData.WokenessVelocity);
            if (this.difficultyLevel().dilemmaOdds) {
                this.scene.get('dilemma').setup(this.sharedData);
                this.scene.start('dilemma');
            } else {
                this.scene.get('insurrection').setup(this.sharedData);
                this.scene.start('insurrection');
            }
        };

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            clearTimeout(this.sceneSwitchTimeout);
            if (data.nextScene != 'youLose') {
                // Switch to the next scene
                if (data.nextScene != 'dilemmaOrInsurrection') {
                    console.log('sanity check: not dilemma');
                    this.scene.get('politics').setup(this.sharedData);
                    this.scene.start('politics');
                } else {
                    console.log('sanity check: we hit handle dilemma or insurrection');
                    handleDilemmaOrInsurrection();
                }
            }
        }, this);

        // Setup a timeout to automatically switch scenes if there is no interaction
        this.sceneSwitchTimeout = setTimeout(() => {
            if (data.nextScene !== 'youLose' && data.nextScene !== 'dilemmaOrInsurrection') {
                switchScene.call(this, 'politics');
            } else if (data.nextScene === 'dilemmaOrInsurrection') {
                handleDilemmaOrInsurrection.call(this);
            }
        }, 10000);  // Time in milliseconds, e.g., 10000ms for 10 seconds

    }
}

let config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: Math.min(window.innerWidth,window.innerHeight)
    },
    physics: {
        default: 'arcade',
    },
    scene: [
        TitleScene,
        ChooseYourIdeologyScene,
        Insurrection,
        Politics,
        AliensAttack,
        Scene2,
        VictoryScene,
        TutorialScene,
        MilitaryAllocation,
        DilemmaScene
    ]
};

var game = new Phaser.Game(config);
