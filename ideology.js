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
import {Insurrection} from './insurrection.js';
import { territories } from './BaseScene.js'
import { characters } from './BaseScene.js';
import { militaryAssets } from './BaseScene.js';
import { difficultyList } from './BaseScene.js';
import {AliensAttack} from './aliens_attack.js';
import { introduceCharacters } from './characterUtils.js';

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
            thisRoundTerritoriesWithMissiles: 6,
            totalPoliticalCapital: 0
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
            if (this.difficultyLevel().startingEndorsement === 'all' || ideology.faction == 'none') {
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
        // If aliens never attack first round then it must be beginner level: give out some more Political Capital
        if (this.difficultyLevel().oddsOfAlienAttackFirstRound == 0) {
            this.sharedData.MAGAness += 5;
            this.sharedData.Wokeness += 5;
        }

        this.backgroundImage.destroy();
        this.ideologyTitleText.destroy();
        ideologyText.destroy();
        icon.destroy();
        icon2.destroy();
        this.ideologyButtonGroup.forEach(button => button.destroy());
        this.ideologyButtonGroup = []; // reset the radio button group

        introduceCharacters(this, characters, this.sharedData);

        // Create a button using an image
        //let nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);
        let nextButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height - 50, 'Proceed', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive();

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

    runTutorial(nextButton) {
        let nextScreenTutorial = [
            {
                story: [
                    "Mouse over each character to learn more about them.  ",
                    "Characters help an aspect of society (shown by the icon) while causing protests",
                    "in another aspect.  Two characters have special defensive powers: The Hacker creates",
                    " a cyber-shield around a societal aspect to defend against attacks",
                    "and the Negotiator creates information sessions.",
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
            let formattedBackstory = insertLineBreaks(nextScreenTutorial[0].story.join(' '), 80);
            let backstoryText = this.add.text(nextButton.x-360, nextButton.y-75, formattedBackstory, { fontSize: '20px', fontFamily: 'Roboto', color: '#fff', align: 'center' });
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

            let initialMousePosition = { x: this.input.activePointer.x, y: this.input.activePointer.y };

            const hideElements = () => {
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
                this.input.off('pointermove', onPointerMove); // Remove the event listener once the elements are hidden
            };

            const onPointerMove = (pointer) => {
                let distance = Phaser.Math.Distance.Between(initialMousePosition.x, initialMousePosition.y, pointer.x, pointer.y);
                if (distance > 100) {
                    hideElements();
                }
            };

            this.input.on('pointermove', onPointerMove);

            setTimeout(hideElements, 20000); // Hide elements after 20 seconds if not already hidden
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
