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
import { territories } from './BaseScene.js'
import { characters } from './BaseScene.js';
import { militaryAssets } from './BaseScene.js';
import { difficultyList } from './BaseScene.js';
//foo
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
        let storyLinesSet = [storyLines, storyLines2];
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
                                text.destroy();
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

//class ChooseYourIdeologyScene extends Phaser.Scene {
export class ChooseYourIdeologyScene extends BaseScene {

    constructor() {
        super({ key: 'ChooseYourIdeologyScene' });
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
            thisRoundTerritoriesWithMissiles: 6
        };
    }
    setup(data) {
            Object.assign(this.sharedData, data);
    }
    preload() {
        // Call BaseScene's preload
        super.preload();

        this.load.image('background', 'assets/aliencrash.png');
    }

    create() {
        // Add a background
        this.backgroundImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        this.backgroundImage.setScale(1);  // Don't scale down the image

        // Create an array of ideologies
        this.ideologies = [
            {
                name: "MAGA",
                color: '#ff0000',
                icon: 'magaBase',
                faction: 'maga'
            },
            {
                name: "Woke",
                color: '#0000ff',
                icon: 'wokeBase',
                faction: 'woke'
            },
    /*
            {
                name: "Libertarian RINO", color: '#ff00ff',
                icon: 'libertarian',
                faction: 'rino'
            },
            {
                name: "Independent", color: '#ff00ff',
                icon: 'independent',
                faction: 'independent'
            },
     */
            {
                name: "Not interested in politics/\n  Hoping to be abducted", color: '#00ff00',
                icon: 'threat',
                faction: 'none'
            }
        ];

        this.radioButtonGroup = []; // store radio buttons for easy removal
        this.ideologyButtonGroup = [];

        let textColor = 1 ? '#ff4040' : '#8080ff';

        // Set the title text
        let titleText = this.add.text(this.sys.game.config.width/2 - 20, 200, 'Choose Game Difficulty', { fontSize: '48px', fontFamily: 'Roboto', color: textColor, fill: '#ff0' }).setOrigin(0.5);

        this.radioButtonGroup.push(titleText);

        let yOffset = 0;
        for(let key in difficultyList) {
            if(difficultyList.hasOwnProperty(key)) {
                let radioButton = this.add.text(this.sys.game.config.width/2 - 20, 300 + (yOffset * 50), key, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive();

                radioButton.on('pointerdown', () => this.selectDifficulty(key)); // Pass the key, not the whole object
                radioButton.on('pointerover', () => this.enterButtonHoverState(radioButton));
                radioButton.on('pointerout', () => this.enterButtonRestState(radioButton, '#fff'));

                this.radioButtonGroup.push(radioButton); // Add radio button to the group
                yOffset += 1;
            }
        }

        let sanity_check = this.difficultyLevel().alienAttackForCapital;
        let putieThreats = this.difficultyLevel().putieThreat;

        this.physics.world.gravity.y = 500;

        // Create the sprite at the center of the screen
        let mySprite = this.physics.add.sprite(this.cameras.main.centerX, this.sys.game.config.height - 100, 'putieBase').setScale(.1);

        // Set the bounce property
        mySprite.setBounce(1.02);

        // Set the sprite to collide with the world bounds
        mySprite.setCollideWorldBounds(true);

        // Give the sprite an initial velocity
        mySprite.setVelocity(100, -20);

    }

    selectDifficulty(difficultyKey) {
        this.sharedData.difficultyLevel = difficultyKey;

        console.log(`You chose ${difficultyKey}`);
        let textColor = '#ff00ff';
        let height = this.sys.game.config.height*.15;
        let ideologyText = this.add.text(this.sys.game.config.width/2 - 20, height, 'You are '+ difficultyKey + '!', { fontSize: '56px', fontFamily: 'Roboto', color: textColor }).setOrigin(0.5);

        // add military tech based on difficulty level
        for (let asset of militaryAssets) {
            let difficultyLevel = this.difficultyLevel();
            asset.techLevel += difficultyLevel.militaryTechBoost;
        }
        // Remove difficulty radio buttons
        this.radioButtonGroup.forEach(button => button.destroy());
        this.radioButtonGroup = []; // reset the radio button group

        // remove choice text
        this.time.delayedCall(3000, () => {
            ideologyText.destroy();
        });

        // Display ideology radio buttons
        this.displayIdeologies();
    }

    displayIdeologies() {
        let textColor = 1 ? '#ff4040' : '#8080ff';

        // Set the title text
        this.ideologyTitleText = this.add.text(this.sys.game.config.width/2 - 20, 200, 'Choose Your Ideology', { fontSize: '32px', fontFamily: 'Roboto', color: textColor, fill: '#fff' }).setOrigin(0.5);

        // Create the radio buttons
        for(let i = 0; i < this.ideologies.length; i++) {
            let radioButton = this.add.text(this.sys.game.config.width/2 - 20, 300 + (i * 50), this.ideologies[i].name, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive();
            let icon = this.add.sprite(this.sys.game.config.width/2 - 20 - radioButton.width/2 - 40, 300 + (i * 50), this.ideologies[i].icon).setScale(.1);

            radioButton.on('pointerdown', () => this.selectIdeology(this.ideologies[i]));
            radioButton.on('pointerover', () => this.enterButtonHoverState(radioButton));
            radioButton.on('pointerout', () => this.enterButtonRestState(radioButton, '#fff'));

            this.ideologyButtonGroup.push(radioButton);
            this.ideologyButtonGroup.push(icon);
        }
    }

    selectIdeology(ideology) {
        // Here you would set the player's ideology and move on to the next scene
        console.log(`You chose ${ideology.name}`);
        let textColor = ideology.color;
        let height = this.sys.game.config.height*.85;
        let ideologyText = this.add.text(this.sys.game.config.width/2 - 20, height, 'You chose '+ ideology.name + '!', { fontSize: '32px', fontFamily: 'Roboto', color: textColor }).setOrigin(0.5);
        let icon = this.add.sprite(this.sys.game.config.width/2 - 20 - ideologyText.width/2 - 120, height, ideology.icon).setScale(.3);
        let icon2 = this.add.sprite(this.sys.game.config.width/2 - 20 + ideologyText.width/2 + 120, height, ideology.icon).setScale(.3);

        this.sharedData.ideology = ideology;
        // Should really create some kind of high level tuning capability.  For instance here I added something
        // where if the character's ideology matches your ideology, then the character starts with an endorsement.
        // Now I just added that it is only for type_5 powerTokenTypes.  In other words hacker and mediator don't
        // get a free endorsement
        console.log('starting endorsement = '+this.difficultyLevel().startingEndorsement);
        characters.forEach((character, index) => {
            if (this.difficultyLevel().startingEndorsement === 'all') {
                character.endorsement += 1;
            } else if (this.difficultyLevel().startingEndorsement === 'ideology') {
                    if (character.faction == ideology.faction) {
                        character.endorsement += 1;
                    }
            } else if (this.difficultyLevel().startingEndorsement === 'nospecial') { // only type_5's get endorsed
                if (character.faction == ideology.faction && character.powerTokenType == 'type_5') {
                    character.endorsement += 1;
                    // if you have no ideology, only hackers and diplomats get endorsed
                } else if (ideology.faction == 'none' && character.powerTokenType != 'type_5') {
                    character.endorsement += 1;
                }
            }
        });
        if (ideology.faction == 'maga') {
            this.sharedData.MAGAness += 10;
        } else if (ideology.faction == 'woke') {
            this.sharedData.Wokeness += 10;
        } else {
            this.sharedData.MAGAness += 10;
            this.sharedData.Wokeness += 10;
        }

        this.backgroundImage.destroy();
        this.ideologyTitleText.destroy();
        ideologyText.destroy();
        icon.destroy();
        icon2.destroy();
        this.ideologyButtonGroup.forEach(button => button.destroy());
        this.ideologyButtonGroup = []; // reset the radio button group

        this.introduceCharacters();

        // Create a button using an image
        let nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);

        // When the button is clicked, start the next scene
        nextButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                let sanity_check = Math.random();
                console.log('aliens attack random value = ' + sanity_check);
                if (sanity_check < this.difficultyLevel().oddsOfAlienAttackFirstRound) {
                    console.log('Aliens Attack');
                }
                if (sanity_check < this.difficultyLevel().oddsOfAlienAttackFirstRound) {
                    this.scene.get('AliensAttack').setup(this.sharedData);
                    this.scene.start('AliensAttack');
                } else {
                    this.scene.get('politics').setup(this.sharedData);
                    this.scene.start('politics');
                }
            });
        });

        this.runTutorial(nextButton);
    }

    enterButtonHoverState(button) {
        button.setStyle({ fill: '#ff0'}); // change color to yellow
    }

    enterButtonRestState(button, fillColor) {
        button.setStyle({ fill: fillColor}); // change color back to white
    }


    introduceCharacters() {
        let Wokeindex = 0;
        let MAGAindex = 0;
        let xOffset = 0;
        let xSpriteOffset = 0;

        this.characterTitleText = this.add.text(this.sys.game.config.width/2 - 20, 180, 'Meet Your Advocates', { fontSize: '52px', fontFamily: 'Roboto', color: '#ffffff', fill: '#fff' }).setOrigin(0.5);

        let endorseMaga = this.add.text(40, 200, 'MAGA',
                            { fontSize: '24px', fontFamily: 'Roboto', color: '#ff4040', align: 'left' });
        let underline = this.add.graphics();
        underline.lineStyle(2, 0xff4040); // Set the line thickness and color
        underline.beginPath();
        underline.moveTo(endorseMaga.x, endorseMaga.y + endorseMaga.height);
        underline.lineTo(endorseMaga.x + endorseMaga.width, endorseMaga.y + endorseMaga.height);
        underline.closePath();
        underline.strokePath();

        let endorseWoke = this.add.text(40 + this.sys.game.config.width * .74, 200, 'WOKE',
                                                { fontSize: '24px', fontFamily: 'Roboto', color: '#8080ff', align: 'left' })
        underline = this.add.graphics();
        underline.lineStyle(2, 0x8080ff); // Set the line thickness and color
        underline.beginPath();
        underline.moveTo(endorseWoke.x, endorseWoke.y + endorseWoke.height);
        underline.lineTo(endorseWoke.x + endorseWoke.width, endorseWoke.y + endorseWoke.height);
        underline.closePath();
        underline.strokePath();

        characters.forEach((character, index) => {
            let characterText;

            let matchHelps = true; // for now just assume all icons are visible
            let matchHurts = true;
            for (let key in this.sharedData.icons) {
                let iconData = this.sharedData.icons[key];
                if (character.helps == iconData.iconName) matchHelps = true;
                if (character.hurts == iconData.iconName) matchHurts = true;
            };

            if (character.powerTokenType == 'type_5' && (matchHurts == false || matchHelps == false)) {character.dne = true; return;}
            if ((character.powerTokenType == 'type_3' || character.powerTokenType == 'type_2') && this.sharedData.ideology.faction == 'maga' && character.faction == 'woke') {character.dne = true; return}
            if ((character.powerTokenType == 'type_3' || character.powerTokenType == 'type_2') && this.sharedData.ideology.faction == 'woke' && character.faction == 'maga') {character.dne = true; return}
            // Keep separate track of the MAGA and Woke character placement row offsets
            let rowIndex = (character.faction === 'maga' ? MAGAindex : Wokeindex);
            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
            let factionIcon;
            if (character.faction == 'maga') {
                MAGAindex++;
                xOffset = 0;
                xSpriteOffset = xOffset;
                factionIcon = 'magaBase';
            }
            else {
                Wokeindex++;
                xOffset = this.sys.game.config.width * .7;
                xSpriteOffset = xOffset;
                factionIcon = 'wokeBase';
             }
             let tmpHelp = character.helps; // don't want to change character.helps permanently
             let scaleTable = {
                "environment": 0.15,
                "economy": 0.1,
                "justice": 0.05,
                "government": 0.05,
                "diplomacy" : 0.16,
                "military" : 0.13
             };
             let scaleFactor = scaleTable[character.helps];

             if (character.powerTokenType == 'type_3') {
                 tmpHelp = 'hacker';
                 scaleFactor = 0.19;
                 //console.log('hacker');
             } else if (character.powerTokenType == 'type_2') {
                 tmpHelp = 'negotiation';
                 scaleFactor = 0.13;
                 //console.log('negotiation');
             }
            characterText = this.add.text(80+xOffset, 250 + (rowIndex * 60), character.name,
                                { fontSize: this.sharedData.charFont, fontFamily: 'Roboto', color: textColor, align: 'left' }).setInteractive();
            if (character.faction == 'maga') {
                xSpriteOffset += characterText.width+70;
            } else {
                xSpriteOffset -= 60;
            }
            let icon = this.add.sprite(50+xOffset, 260 + (rowIndex * 60), tmpHelp).setScale(scaleFactor/2);
            let hatType = this.add.sprite(50+xSpriteOffset, 260 + (rowIndex * 60), factionIcon).setScale(.1);

            //character.charText = characterText; // back reference to text so we can find the location later

            createCharacterTooltip(this, character, 50+xOffset, Math.min(this.sys.game.config.height*.7, 250 + (rowIndex * 60)), icon, characterText, scaleFactor, tmpHelp);

            //characterText.on('pointerdown', () => this.selectIdeology(this.ideologies[i]));
            characterText.on('pointerover', () => this.enterButtonHoverState(characterText));
            characterText.on('pointerout', () => this.enterButtonRestState(characterText, textColor));

        });
        //====================================================================================
        //    function createCharacterTooltip(scene, character, x, y, slider, characterText)
        //====================================================================================

        function createCharacterTooltip(scene, character, x, y, slider, characterText, scaleFactor, tmpHelp) {
            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
            let xOffset = character.faction === 'maga' ? 80+scene.game.config.width * .4 : scene.game.config.width * -.24;
            //let xOffset = character.faction === 'maga' ? 500 : -400;

            // Format the text to be centered and with the color based on the affiliation
            let roughSize = character.backstory.length * character.backstory[0].length;
            console.log(character.name + ' ' + character.backstory.length + 'x' + character.backstory[0].length + '=' + (y+ roughSize/3));
            let lineLength;
            let yOffset;
            if (roughSize > 800 && scene.sys.game.config.width > 1000)
            {
                lineLength = 88;
                yOffset = 140;
            } else {
                if (roughSize > 440)
                {
                    lineLength = 80;
                    yOffset = 0;
                } else {
                    lineLength = 40;
                    yOffset = 0;
                }
            }
            // Emergency override: the screen is not very high so we really need to move the tooltip up a lot!
            if (y + roughSize/3 > scene.sys.game.config.height ) {
                yOffset = roughSize/4;
                console.log('adjust upward '+yOffset);
            }
            let graphicObject = tmpHelp;

            // Add an icon or graphic and scale it
            let backstoryIcon = scene.add.image(x+xOffset, y-yOffset, graphicObject);  // Position the icon at the original y position
            backstoryIcon.setScale(scaleFactor);  // scale the icon
            backstoryIcon.setOrigin(0.5, 1);  // change origin to bottom center
            backstoryIcon.setVisible(false);
            backstoryIcon.setDepth(2);  // set depth below the text and above the bounding box

            let formattedBackstory = insertLinezBreaks(character.backstory.join(' '), lineLength);
            let backstoryText = scene.add.text(x+xOffset, backstoryIcon.y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });  // Position the text below the icon
            backstoryText.setOrigin(0.5,0);
            backstoryText.setVisible(false);
            backstoryText.setDepth(3);  // increase depth to be on top

            // Increase the height of the bounding box to accommodate the icon and the text, and adjust its position
            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y - backstoryIcon.displayHeight/2, backstoryText.width, backstoryText.height + backstoryIcon.displayHeight, 0x000000, 1);  // Add some padding between the icon and the text
            backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff4040 : 0x8080ff, 0.8);
            backstoryBox.isStroked = true;
            backstoryBox.setOrigin(0.5,0);
            backstoryBox.setVisible(false);
            backstoryBox.setDepth(1);

            const mouseOver = () => {
                backstoryText.setVisible(true);
                backstoryBox.setVisible(true);
                backstoryIcon.setVisible(true);
            };

            const mouseOff = () => {
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
                backstoryIcon.setVisible(false);
            };

            slider.on('pointerover', mouseOver);
            characterText.on('pointerover', mouseOver);

            slider.on('pointerout', mouseOff);
            characterText.on('pointerout', mouseOff);

        }
        //====================================================================================
        //    insertLinezBreaks(str, charsPerLine) {
        //====================================================================================
        function insertLinezBreaks(str, charsPerLine) {
            // First split the string into sections based on the special token
            let sections = str.split('||');
            let lines = [];

            // Now process each section independently
            for (let section of sections) {
                // Split the section into words
                let words = section.split(' ');

                // Process the words in this section as before
                let currentLine = words[0];
                for (let i = 1; i < words.length; i++) {
                    if (currentLine.length + words[i].length + 1 > charsPerLine) {
                        lines.push(currentLine);
                        currentLine = words[i];
                    } else {
                        currentLine += ' ' + words[i];
                    }
                }
                // Push the last line of this section
                lines.push(currentLine);

                // Now add an extra line break after each section
                lines.push('');
            }

            return lines.join('\n');
        }
    }

    runTutorial(nextButton) {
        let nextScreenTutorial = [
            {
                story: [
                    "Mouse over each character to learn more about them.  ",
                    "When finished, click on the Earth Icon to move to the next screen"
                ]
            },
            {
                story: [
                    "Click on the Earth Icon to",
                        "move to the next screen"
                ]
            }
        ];
        // add some helpful text
        if (!this.hasBeenCreatedBefore) {
            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(nextScreenTutorial[0].story.join(' '), 35);
            let backstoryText = this.add.text(nextButton.x-150, nextButton.y-75, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: '#fff', align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(true);
            backstoryText.setDepth(2);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = this.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
            backstoryBox.setStrokeStyle(2, 0xffffff, 0.8);
            backstoryBox.isStroked = true;
            backstoryBox.setOrigin(0.5);
            backstoryBox.setVisible(true);
            backstoryBox.setDepth(1);

            setTimeout(() => {
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
            }, 10000);

        }
        //====================================================================================
        //    function insertLineBreaks(str, charsPerLine) {
        //====================================================================================
        function insertLineBreaks(str, charsPerLine) {
            let words = str.split(' ');
            let lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                if (currentLine.length + words[i].length + 1 > charsPerLine) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine += ' ' + words[i];
                }
            }
            lines.push(currentLine);

            return lines.join('\n');
        }
    }
}

//====================================================================================
//
//        class VictoryScene extends Phaser.Scene
//
// VictoryScene informative text about a victory of some sort
//
//====================================================================================

class VictoryScene extends Phaser.Scene {
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
            console.log('Total Score: ' + score);
            scoreText += '\n Final Score '+ score;

            data.message += scoreText;
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
//        class AliensAttack extends BaseScene
//
// AliensAttack informative text about the upcoming Alien Invasion
//
//====================================================================================
class AliensAttack extends BaseScene {
    constructor() {
        super({ key: 'AliensAttack' });
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
            console.log('Aliens Attack cover screen in year ' + this.sharedData.year);
    }

    preload() {
        // Preload an image for the aliens attack scene
        this.load.image('attack', 'assets/aliencrash.png');
    }

    create() {
        this.input.setDefaultCursor('default');

        // Create a text object to display a victory message
        let healthTextRange = ['terrible', 'poor', 'so-so', 'good', 'excellent'];
        let health = 1;
        let healthScale = 1;
        if (this.sharedData.icons['military']) {
          health = this.sharedData.icons['military'].health;
          healthScale = this.sharedData.icons['military'].healthScale;
        }
        let healthText = capitalizeFirstLetter(healthTextRange[Phaser.Math.Clamp(Math.round(health/healthScale/20),0,4)]);

        let diplomacy = 0;

        if (this.sharedData.icons['diplomacy']) {
            diplomacy = this.sharedData.icons['diplomacy'].health;
        }
console.log(this.sharedData.ideology.faction);
console.log(diplomacy);
console.log(this.difficultyLevel().alienDefenseFromSameBase);
        let bonusText = '';
        if (this.sharedData.ideology.faction == 'none'
            || diplomacy > 95
            || this.difficultyLevel().alienDefenseFromSameBase == true) {
            bonusText = "\n\nDue to good diplomacy, both \nfaction's bases will fend off the attacks";
        } else {
            bonusText = "\n\nDue to weak diplomacy, only your\n own faction will fend off the attacks";
        }

        let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
           'Alien Invasion!\n You need to defend America from\n' + this.sharedData.thisRoundAlienAttacks +
           ' alien Attack' + ((this.sharedData.thisRoundAlienAttacks > 1) ? 's': '') +'!\nYour Alien Defense is: ' + healthText + bonusText, {
            font: 'bold ' + this.sharedData.fontSize + ' Arial',
            fill: '#ffffff',
            align: 'center'
        });

        victoryText.setOrigin(0.5);  // Center align the text

        // Optionally, display a victory image
        let victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'attack');
        //victoryImage.setScale(0.5);  // Scale down the image
        victoryImage.setAlpha(0.4);  // Make the image semi-transparent

        // Bring the text to the top
        victoryText.setDepth(1);

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            // Switch to the next scene
            this.scene.get('scene2').setup(this.sharedData);
            console.log('back on cover screen sharedData has been sent.  Now start scene2');
            this.scene.start('scene2');
        }, this);
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
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
            // Switch to the next scene
            if (data.nextScene != 'dilemmaOrInsurrection') {
                console.log('sanity check: not dilemma');
                this.scene.get('politics').setup(this.sharedData);
                this.scene.start('politics');
            } else {
                console.log('sanity check: we hit handle dilemma or insurrection');
                handleDilemmaOrInsurrection();
            }
        }, this);
    }
}


//====================================================================================
//
//        class Scene2 extends Phaser.Scene
//             Alien Invasion
//             Missile Attack
//
//         The idea is that each round, n more aliens attack.  Each territory gets some
//         number of missiles.  A territory shoots all of its missiles before the game
//         moves on to the next territory.  Early in the game, only 1 territory has
//         missiles.  As the game progresses, more territories have missiles.  It is done
//         this way because we want the player to be able to take multiple shots from
//         the same territory in order to improve aim.
//
//         New idea: other kinds of threats are zipping by, not necessarily landing.  If
//         they get destroyed, bonus points are given.  The logic behind this is that a
//         player who invests in military can get more political capital by destroying
//         more aliens.  Sort of like an arcade at an amusement park: you hit the ducks,
//         you win a prize.  If you have super-fast accurate weapons, you get lots of
//         prizes.
//
//         Another thing: Need to somehow differentiate between the ideology chosen at
//         the start of the game.  Some brainstorming:
//         1) you choose Maga, you only fire maga missiles, same for Woke.
//         2) If you broker peace with the other faction, then you can start firing their
//             missiles too.  Maybe if government hits 100% health, you can fire both.
//             -- early on: my faction only.  X missiles per territory, then next territory
//                of the same faction.
//         3) Does it matter which territory the aliens attack? not bad -- in fact it's
//            good to defeat when other territory because you get other's capital
//         4) Make it clear that if the aliens are attacking the other faction, you get
//            their political capital for defeating the alien attack.
//
//         New Features:
//             Could add a protective shield around a territory
//             Should add icons showing how many missiles each territory has left
//             Add in-place explosion/ detonation
//             Need to add an 'aliens reach bottom of screen' scene.  Could have a diff.
//             message if the aliens captured an opposing territory
//
//====================================================================================
// There needs to be some point where Putie just wins when 3 territories or less.  Game goes on forever
// when you are losing.  Maybe if total number of insurrectionists > 50 you automatically lose
export class Scene2 extends BaseScene {

    constructor() {
        super({ key: 'scene2' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023,
            misinformation: {},
            helperTokens: {},
            ideology: 'maga'
        };



    }
    // Alien Invasion
    setup(data) {
        console.log(' scene2: setup is loading sharedData');
            Object.assign(this.sharedData, data);

            console.log('scene2 in year '+ this.sharedData.year);
            this.icons = this.sharedData.icons;
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
    }
    preload() {
        // preload assets
        // Load any images or assets here.
        let mbase = this.load.image('magaBase', 'assets/magaBase.png');
        this.load.image('wokeBase', 'assets/wokeBase.png');
        this.load.image('missile', 'assets/missile.png');
        this.load.image('threat', 'assets/threat.png');
    }
    create() {
        //====================================================================================
        //
        //             findValidTerritory(thisFaction, otherFaction)
        //
        //====================================================================================
        let findValidTerritory = (thisFaction, otherFaction) => {
            let count = 0;
            let base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
            while (base.faction != thisFaction && base.faction != otherFaction) {
                // pick a new territory
                this.roundRobinLaunch++;
                base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
                console.log('base faction = ' + base.faction + ' ideology = ' + this.sharedData.ideology.faction);
                if (count++ > 16) {
                    console.log('something went wrong.  got stuck in looking for a new territory.');
                    break;
                }
            }
            return base;
        }

        //====================================================================================
        //
        //             flashBase()
        //
        //====================================================================================
        let flashBase = (base) => {
            let flashCount = 0;
            let isGreen = true;

            // Update text with number of missiles
            base.nameText.setText(base.name + ' ' + numberToBars(this.missilesPerTerritory));

            // Immediately turn it green
            base.graphics.clear();
            base.graphics.fillStyle(0x00ff00, 1.0);
            base.graphics.fillRect(base.x, base.y - 10, this.territoryWidth, 30);

            let flash = this.time.addEvent({
                delay: 200, // flash every 200ms
                callback: () => {
                    base.graphics.clear();

                    if (isGreen) {
                        base.graphics.fillStyle(base.color, 1.0); // or other color when not flashing
                        isGreen = false;
                    } else {
                        base.graphics.fillStyle(0x00ff00, 1.0);
                        isGreen = true;
                    }

                    base.graphics.fillRect(base.x, base.y - 10, this.territoryWidth, 30);

                    flashCount++;
                    if (flashCount >= 5) { // We stop flashing after 5 changes (2 1/2 full flash cycles)
                        flash.remove();
                    }
                },
                loop: true // it will loop indefinitely if we don't stop it manually
            });
        }

        function numberToBars(number) {
            let bars = '';
            for (let i = 0; i < number; i++) {
                bars += '|';
            }
            return bars;
        }
        //====================================================================================
        //
        //             start of create()
        //
        //====================================================================================
        // set up game objects
        // The 'this' keyword refers to the scene.
        this.input.setDefaultCursor('crosshair');

        this.MAGAness = this.sharedData.MAGAness;
        this.Wokeness = this.sharedData.Wokeness;
        this.putieTerritories = this.sharedData.putieTerritories;
        this.totalAlienAttacks = this.sharedData.thisRoundAlienAttacks;
        this.sharedData.thisRoundAlienAttacks += this.difficultyLevel().alienIncreasePerRound; // each round n more aliens attack
        this.icons = this.sharedData.icons;
        this.aliensWin = false;
        this.attackIndex = 0; // need to start with this pointing to something so missiles can be launched from it
        this.missilesMaga = this.physics.add.group();
        this.missilesWoke = this.physics.add.group();
        this.threats = this.physics.add.group();
        this.roundRobinLaunch = 0;
        let missileNumberAsset = militaryAssets.find(asset => asset.name === 'Number of Missiles');
        this.missilesPerTerritory = 3 + Math.floor(missileNumberAsset.techLevel/10);
        this.territoriesWithMissiles = Math.min(this.sharedData.thisRoundTerritoriesWithMissiles, territories.length - this.sharedData.alienTerritories - this.sharedData.putieTerritories);

        thereBeThreats = 0;
        console.log('MAGA: ' + this.MAGAness + 'Woke: ' + this.Wokeness);
        territories.forEach((territory, index) => {
            territory.y = this.game.config.height - 50;
        });
        this.territoryWidth = this.sys.game.config.width / territories.length;

        this.createTerritories();

        let totalCapital = Math.floor(this.MAGAness + this.Wokeness);

        polCapText = this.add.text(20, 0, 'Political Capital ' + totalCapital, { fontSize: this.sharedData.medFont, fill: '#0f0' });

        // Create Year text
        yearText = this.add.text(this.sys.game.config.width * .8, 0, 'Year: ' + this.sharedData.year, { fontSize: this.sharedData.medFont, fill: '#fff' });

/*
        let offsetIndex = Phaser.Math.Between(0, territories.length - 1) + territories.length / 2;
        this.attackIndex = Phaser.Math.Wrap(offsetIndex, 0, territories.length);
 */

        // New and improved version: aliens never attack putieville and only your own faction attacks the aliens, at least early on.
        // Note that it's random whether they attack maga or woke, and whoever is attacked gets the political capital
        // Maybe in "shooting gallery" mode you just give political capital to both maga and to woke for every hit
        // It doesn't seem right that the aliens attack the other faction.  Why defend?  Maybe don't defend.  New icon: alien base
        let faction = 'putieVille';
        let count = 0;
        while (faction == 'putieVille' || faction == 'alien') {
            this.attackIndex = Phaser.Math.Between(0, territories.length - 1);
            this.attackedTerritory = territories[this.attackIndex];
            faction = this.attackedTerritory.faction;
            if (count++ > 100) {
                console.log('something went wrong.  got stuck in looking for a non putieville.');
                break;
            } // something went wrong: can only find putieVille everywhere
        }

        let base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
        let thisFaction = this.sharedData.ideology.faction;
        let otherFaction = this.sharedData.ideology.faction;
        if (this.sharedData.ideology.faction == 'none') {
            thisFaction = 'maga';
            otherFaction = 'woke';
        }
        let diplomacy = 0;
        if (this.sharedData.icons['diplomacy']) {
            diplomacy = this.sharedData.icons['diplomacy'].health;
        }
        // If diplomacy is good, then both MAGA and Woke work together on defending
        if (this.sharedData.ideology.faction == 'none' || diplomacy > 95) {
            if (diplomacy < 96) {
                this.roundRobinLaunch++;  // if no affiliation and poor diplomacy, random bases fire
            }
            otherFaction = (thisFaction == 'maga' ? 'woke': 'maga');
        }

        base = findValidTerritory(thisFaction, otherFaction);
        flashBase(base);

        let lastClickTime = 0;

        this.input.on('pointerdown', function (pointer) {
            let missileLaunchDelayAsset = militaryAssets.find(asset => asset.name === 'Reload Time');
            let delay = Math.max(1200 - missileLaunchDelayAsset.techLevel*40, 0);
            let currentTime = new Date().getTime();
            if (currentTime - lastClickTime < delay) {
                return;
            }
            lastClickTime = currentTime;
            //let baseOffset = Phaser.Math.Wrap(this.attackIndex + territories.length/2, 0, territories.length-1);
            let base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
            let diplomacy = 0;
            if (this.sharedData.icons['diplomacy']) {
                diplomacy = this.sharedData.icons['diplomacy'].health;
            }
            //console.log('base faction = ' + base.faction + ' ideology = ' + this.sharedData.ideology.faction);
            let thisFaction = this.sharedData.ideology.faction; // start with both factions the same.
            let otherFaction = this.sharedData.ideology.faction;
            if (this.sharedData.ideology.faction == 'none') {
                thisFaction = 'maga';
                otherFaction = 'woke';
                if (diplomacy < 96) {
                    this.roundRobinLaunch++;  // if no affiliation and poor diplomacy, random bases fire
                }
            }

            // If diplomacy is good, then both MAGA and Woke work together on defending
            if (this.sharedData.ideology.faction == 'none'
                || diplomacy > 95
                || this.difficultyLevel().alienDefenseFromSameBase) {
                otherFaction = (thisFaction == 'maga' ? 'woke': 'maga');
            }

            base = findValidTerritory(thisFaction, otherFaction);

            //console.log(((Phaser.Math.Wrap(this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length), 0, territories.length) + ' ' + this.roundRobinLaunch % territories.length)
            if (this.missilesPerTerritory > 0) {
                this.missilesPerTerritory--; // use up one missile
                base.nameText.setText(base.name + ' ' + numberToBars(this.missilesPerTerritory));
                if (base.faction == 'woke') {
                    let oldBase = base; // need to remember old base because it gets changed below on the last missile launched
                    // Calculate the angle to the target
                    let angle = Phaser.Math.Angle.Between(base.x+this.territoryWidth/2, base.y, pointer.x, pointer.y);
                    angle += 90*(Math.PI/180);
                    let missile2 = this.fireMissile(base, angle, pointer, 30, .03, 150, 3, this.missilesWoke);
                    // Timer event to delay missile firing
                    this.time.delayedCall(400, () => {
                        let angle = Phaser.Math.Angle.Between(oldBase.x+this.territoryWidth/2, oldBase.y, pointer.x, pointer.y);
                        angle += 90*(Math.PI/180);
                        // Code to fire missile goes here
                        let missile1 = this.fireMissile(oldBase, angle, pointer, 30, .03, 150, 3, this.missilesWoke)
                    }, [], this);
                    this.time.delayedCall(800, () => {
                        let angle = Phaser.Math.Angle.Between(oldBase.x+this.territoryWidth/2, oldBase.y, pointer.x, pointer.y);
                        angle += 90*(Math.PI/180);
                        // Code to fire missile goes here
                        let missile3 = this.fireMissile(oldBase, angle, pointer, 30, .03, 150, 3, this.missilesWoke)
                    }, [], this);
                } else if (base.faction == 'maga') {
                    let angle = Phaser.Math.Angle.Between(base.x+this.territoryWidth/2, base.y, pointer.x, pointer.y);
                    angle += 90*(Math.PI/180);
                    let missile = this.fireMissile(base, angle, pointer, 30, 0.1, 50, 9, this.missilesMaga);
                }
            }

            if (this.missilesPerTerritory <= 0) {
                if (this.territoriesWithMissiles-- > 0) { // not quite right because a territory that already spent its missiles can be picked again
                    this.roundRobinLaunch++;
                    base = findValidTerritory(thisFaction, otherFaction);
                    this.missilesPerTerritory = 3 + Math.floor(missileNumberAsset.techLevel/10); // update missiles before flashing Base
                    flashBase(base);
                } else {
                    console.log('no more territories have missiles!');
                }
            }

        }, this);

        this.physics.add.overlap(this.missilesMaga, this.threats, function (missile, threat) {
            this.explode(missile, 3);
            missile.destroy();
            threat.hitpoints -= missile.power;
            if (threat.hitpoints <= 0) {
                this.MAGAness += threat.score;
                polCapText.setText('Political Capital ' + Math.floor((this.MAGAness + this.Wokeness)).toString());
                this.explode(threat, threat.score == 1 ? 4: 10);
                threat.destroy();
            }
        }, null, this);
        this.physics.add.overlap(this.missilesWoke, this.threats, function (missile, threat) {
            this.explode(missile, 1);
            missile.destroy();
            threat.hitpoints -= missile.power;
            if (threat.hitpoints <= 0) {
                this.Wokeness += threat.score;
                polCapText.setText('Political Capital: ' + Math.floor((this.MAGAness + this.Wokeness)).toString());
                this.explode(threat, threat.score == 1 ? 4: 10);
                threat.destroy();
            }
        }, null, this);

        function generateNumber(n) {
            return Math.floor((n+1)/2) * (n % 2 === 0 ? 1 : -1);
        }

    } // end of create()

    fireMissile(base, angle, pointer, offset, scale, missileSpeed, missilePower, missileSprite) {
        let missileNum = missileSprite.create(base.x+this.territoryWidth/2, base.y, 'missile');
        missileNum.setRotation(angle);
        let missilePowerAsset = militaryAssets.find(asset => asset.name === 'Explosion Size');
        missileNum.power = missilePower + missilePowerAsset.techLevel/3.3;
        let size = scale + missilePowerAsset.techLevel/600;
        missileNum.setScale(size);
        let missileSpeedAsset = militaryAssets.find(asset => asset.name === 'Missile Speed');
        if (missileSpeedAsset) {
            missileSpeed += missileSpeedAsset.techLevel * 10;
        } else {
            console.log("'Missile Speed' asset not found");
        }
        let missileAccuracyAsset = militaryAssets.find(asset => asset.name === 'Accuracy');
        if (missileAccuracyAsset.techLevel > 9) {
            offset = offset*9/missileAccuracyAsset.techLevel;
        }
        this.physics.moveTo(missileNum, pointer.x+Phaser.Math.Between(-offset,offset), pointer.y+Phaser.Math.Between(-offset, offset), missileSpeed);
        return {missileNum: missileNum};
    }

    explode(object, size) {
      let numExplosions = 8;
      let lifeSpan = 400;
      let volume = 25;
      let delay = 20;
      let angleRange = { min: 0, max: 360};
      let speedRange = { min: 225-size*20, max: 375-size*20 };
      let velocityRange = {min: 0, max: 0 };

      switch(size) {
          case 1:
              numExplosions = 4;
              lifeSpan = 200;
              break;
          case 2:
              numExplosions = 8;
              lifeSpan = 400;
              break;
          case 3:
              numExplosions = 10;
              lifeSpan = 600;
              break;
          case 4:
              numExplosions = 14;
              lifeSpan = 800;
              break;
          case 5:
              numExplosions = 16;
              lifeSpan = 4000;
              volume = 50;
              delay = 50;
              break;
          case 10:
              numExplosions = 40;
              lifeSpan = 6000;
              volume = 100;
              delay = 100;
              break;
          case 20:
              numExplosions = 16;
              lifeSpan = 6000;
              volume = 0;
              delay = 20;
              angleRange = { min: 250, max: 290 };
              speedRange = { min: 300, max: 500 };
              velocityRange = {min: -100, max: 100 };
              break;
      }
      for (let i = 0; i < numExplosions; i++) {
          setTimeout(() => {
              let emitter = this.add.particles(400, 250, 'flares', {
                  frame: [ 'red', 'yellow', 'green' ],
                  lifespan: lifeSpan,
                  speed: speedRange,
                  scale: { start: 0.25, end: 0 }, // Reduced scale values
                  gravityY: 250,
                  blendMode: 'ADD',
                  angle: angleRange,
                  velocityX: velocityRange,
                  velocityY: velocityRange,
                  emitting: false
              });
              emitter.setPosition(object.x + Phaser.Math.Between(-volume, volume),
                                  object.y + Phaser.Math.Between(-volume,volume));
              emitter.explode(16);
          }, i * delay); // Delay in milliseconds
      }
    }

    update() {
        // game loop
        // This is called 60 times per second. Put game logic here.
        if (Math.random() < 0.001 && this.totalAlienAttacks > 0) {
            let threat = this.threats.create(this.sys.game.config.width, 25, 'threat').setScale(0.5);
            threat.hitpoints = 30;
            threat.score = 8;

            this.physics.moveTo(threat, 0, 25, 250); // the speed of the threat.
        }
        if (Math.random() < 0.01 && this.totalAlienAttacks > 0) {
            this.totalAlienAttacks--;
            let threat = this.threats.create(Math.random() * this.sys.game.config.width, 0, 'threat').setScale(0.1);
            threat.hitpoints = 9;
            threat.score = 1;

            console.log(`The aliens are attacking ${this.attackedTerritory.name}!`);

            this.physics.moveTo(threat, this.attackedTerritory.x + this.territoryWidth/2, this.sys.game.config.height, 100); // 100 is the speed of the threat.
        }
        if (this.threats.countActive(true) > 0) {
            thereBeThreats = 1;
        }
        // If aliens have aleady reached the bottom of the screen then you can't have deterred the attack
        if (this.totalAlienAttacks < 1 && thereBeThreats == 1 && this.threats.countActive(true) == 0 && this.aliensWin == false) {
            console.log('All threats have been destroyed!');
            thereBeThreats = 0;
            if (this.attackedTerritory.faction == 'maga') {
                this.MAGAness += 10;
            } else {
                this.Wokeness += 10;
            }
            this.sharedData.Wokeness = this.Wokeness;
            this.sharedData.MAGAness = this.MAGAness;
            this.sharedData.icons = this.icons;
            this.cameras.main.fadeOut(3000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.get('VictoryScene').setup(this.sharedData);
                this.scene.start('VictoryScene', { message: 'Alien attack deterred!\nYou get great publicity.\nPolitical Capital raised by 10 points!'});
            });
        }
        // Check all alien objects
        this.threats.children.each(function(alien) {
            // Mothership does not rotate
            if (alien.score  < 3) {
                alien.angle += 4;
            }
            // If an alien has reached the bottom of the screen
            if (this.aliensWin == false && alien.y > this.sys.game.config.height) {
                console.log('Oh no alien has reached the bottom of the screen!');
                this.explode(alien, 20);
                this.sharedData.alienTerritories++;
                this.aliensWin = true; // aliens can only win once per attack and fadeout allows multiple wins
                console.log(this.sharedData.putieTerritories);
                console.log(this.sharedData.alienTerritories);

                if (this.sharedData.alienTerritories + this.sharedData.putieTerritories >= territories.length) {
                    console.log('you lose!');
                    this.scene.get('TutorialScene').setup(this.sharedData);
                    this.scene.start('TutorialScene', { nextScene: 'aliensWin', message: 'I have some bad news:\n the Aliens have taken over America\n It looks like you lose.' });
                    return;
                }
                // Convert the object keys into an array
                let keys = Object.keys(this.sharedData.icons);

                // Get a random index
                let destroyedIndex = Phaser.Math.Between(0, keys.length - 1); // -1 because indices start at 0

                // Get the corresponding key
                let randomKey = keys[destroyedIndex];

                // Access the icon using the key, then modify its health
                // in the very first round, the icons haven't been created yet
                // some random icon gets clobbered
                if (this.sharedData.icons['environment']) {
                    this.sharedData.icons[randomKey].health = Math.max(0, this.sharedData.icons[randomKey].health - 50);
                    // What happens when an alien reaches the base.  Ignore on first round
                    this.MAGAness = Math.max(0, this.MAGAness-10);
                    this.Wokeness = Math.max(0, this.Wokeness-10);
                }

                let messageString = 'Aliens have taken over The '+ this.attackedTerritory.name;

                this.attackedTerritory.faction = 'alien';
                this.attackedTerritory.name = "Aliens";
                this.attackedTerritory.color = '0x123456';

                thereBeThreats = 0;
                this.sharedData.Wokeness = this.Wokeness;
                this.sharedData.MAGAness = this.MAGAness;
                this.sharedData.icons = this.icons;

                this.cameras.main.fadeOut(3000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.get('VictoryScene').setup(this.sharedData);
                    this.scene.start('VictoryScene', { message: messageString});
                });
            }
            if (alien.x <= 0 || alien.y > this.sys.game.config.height) {
                alien.destroy();
            }
        }, this); // 'this' refers to our scene

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

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
