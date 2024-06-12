//=========================================================================================================================
//
//                  Politics
//      The scene is to make things better.  Right now it is easy to make things worse (maga, woke),
//      but we need to add game elements to make things better now
//
//=========================================================================================================================
//    Ideas on things that can improve the situation:
//
//    1. When a character is endorsed enough, builds up backing and this allows a new token to appear.
//          -- tokens appear quickly and need to be moved into place?
//          -- maybe time does elapse during politics?
//          -- need a list of characters and helps/ hurts
//          -- perhaps have 6 icons, (2 invisible?): add 'military' as invisible gauge?
//    2. Character "creates" a new power token (called misinformation for now).
//        - When power token is dropped into an icon, the maga and wokeness go down
//        - Most tokens are specific to a particular icon: better to have it automatically moved to an icon and dropped in
//    3. Character "creates" a shield around an icon.  Same thing: power token boosts shield
//    4. These tokens can also be used to boost the strength of an icon, but increases maga or wokeness of another icon when it's done.
//    5. When you pointer-down, highlight the good and bad icons
//
//    Need to create a 'tuning' structure.
//    Right now 'tuning' is when a threat hits an icon, the maganess or wokeness increase by 5
//    when putie hits an icon, the maganess or wokeness increase by 2
//
//    When the activists attack, need a message.  Need a message when they are deflected
//
//=========================================================================================================================

import BaseScene from './BaseScene.js';
import { characters } from './BaseScene.js';
import { territories } from './BaseScene.js';
import { militaryAssets } from './BaseScene.js';
import { CharacterIntroductionScene } from './characterUtils.js';

//var MAGAness = 0;
var MAGAupdate = 0;
var MAGAnessText;
//var Wokeness = 0;
var WokeUpdate = 0;
var WokenessText;
//var polCapText;
var year = 2023; // the starting year
var yearText;
var enviromentalHealth = 11; // the starting health of the environment
var enviromentText;
var governmentSize = 1200; // the starting size of the government
var governmentText;
var economyMaga = 20;
var economyWoke = 20;
var economyStrength = 32000;
var justiceMaga = 20;
var justiceWoke = 20;
var justiceStrength = 5;
var charVal = {};


export class Politics extends BaseScene {

    constructor() {
        super({ key: 'politics' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023,
            misinformation: {},
            helperTokens: {},
            militaryAllocation: 0,
            littleHats: {},
            totalPoliticalCapital: 0
        };
        // hack: decrease all character's endorsements by 3
        characters.forEach((character, index) => {
            character.endorsement = 0;
        });
    }
    // politics
    setup(data) {

/* // debug: to find out who called politics!
        var stack = new Error().stack;
        console.log("Called by: ", stack);
*/

        console.log(' politics: setup is loading sharedData');

        Object.assign(this.sharedData, data);


        console.log('MAGA: ' + this.sharedData.MAGAness + ' Woke: ' + this.sharedData.Wokeness);
    }

    //====================================================================================
    //
    // create()
    //
    //====================================================================================

    create() {
        this.input.setDefaultCursor('default');

        if (!Object.keys(this.sharedData.icons).length) {
            // Initialize icons
            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();
            this.initializeIcons();

            this.icons = this.sharedData.icons;
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
            this.extraMisinformationTokens = 0;
            this.totalPoliticalCapital = this.sharedData.totalPoliticalCapital;
            this.oldExperienceLevel = this.sharedData.oldExperienceLevel;

            // Proceed with the rest of the create method logic
            this.continueCreate();
        } else {
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
            this.oldExperienceLevel = this.sharedData.oldExperienceLevel;
            console.log('in create, MAGA: ' + this.MAGAness + ' Woke: ' + this.Wokeness);
            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();

            console.log ('this capital = ' + this.totalPoliticalCapital + ' shared capital = '+ this.sharedData.totalPoliticalCapital + ' this.oldExperienceLevel = ' + this.oldExperienceLevel );

            //this.totalPoliticalCapital += this.MAGAness + this.Wokeness;
            if (this.oldExperienceLevel != Math.floor(this.sharedData.totalPoliticalCapital/30)+1)
            {
                // Save the updated sharedData for characterintroduction
                this.totalPoliticalCapital = this.sharedData.totalPoliticalCapital;
                // Launch CharacterIntroductionScene
                this.scene.launch('CharacterIntroductionScene', {
                    sharedData: this.sharedData,
                    callback: (data) => {
                        this.scene.stop('CharacterIntroductionScene');
                        this.setup(data);
                        this.recreateIcons();
                    }
                });
            }
            else {
                this.totalPoliticalCapital = this.sharedData.totalPoliticalCapital;
                this.recreateIcons();
            }
        }
    }

    recreateIcons() {

        // Save the updated sharedData for next time
        this.sharedData.totalPoliticalCapital = this.totalPoliticalCapital;

        // Recreate the icons with the saved state
        for (let key in this.sharedData.icons) {
            let iconData = this.sharedData.icons[key];
            console.log(key + ' shieldStrength = ', iconData.shieldStrength);
            let fontSize = parseInt(iconData.iconText.style.fontSize, 10);
            this.icons[key] = this.createIconWithGauges(
                iconData.icon.x,
                iconData.icon.y,
                iconData.icon.scaleX,
                key,
                iconData.maga,
                iconData.woke,
                iconData.health,
                iconData.textBody,
                iconData.healthScale,
                fontSize,
                iconData.shieldStrength,
                iconData.iconTitle
            );
        }

        // Proceed with the rest of the create method logic
        this.continueCreate();
    }

    continueCreate() {

        let scene = this;

        this.totalMilitaryAllocThisScene = 0;

        // Check if you won as soon as you enter politics because we don't check during insurrection or dilemma
        let win = true;
        for (let key in this.sharedData.icons) {
            let iconData = this.sharedData.icons[key];
            if (iconData.health/iconData.healthScale < 90) {
                win = false;
            }
        }
        if (win == true) {
            console.log('You Win!');
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.get('VictoryScene').setup(this.sharedData);
                this.scene.start('VictoryScene', { showScore: true, message: 'You Win!\nIn the year ' + this.sharedData.year + '\nAll Aspects of society are Excellent\nand at 100%!'});
            });
            return;
        }
        // Create a button using an image
        this.nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);

        // When the button is clicked, start the next scene
        this.nextButton.on('pointerdown', () => {
            // pass this scene's this.sharedData to insurrection's setup, (where it is assigned to insurrection's this.sharedData)
            // question: does this scene's sharedData ever even get used?
            this.sharedData.icons = this.icons;
            this.sharedData.MAGAness = this.MAGAness;
            this.sharedData.Wokeness = this.Wokeness;
            this.sharedData.totalPoliticalCapital = this.totalPoliticalCapital;

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

            if (this.militaryAllocation == true) {
                this.militaryAllocation = false;
                if (this.difficultyLevel().militaryAutoSpend == true) {
                    militaryAssets.forEach((asset, index) => {
                        asset.techLevel += this.totalMilitaryAllocThisScene/10;
                        console.log(asset.name + ' has a new tech level of ' + asset.techLevel);
                    });
                    // Need to go to scene to indicate additional military strength
                    this.scene.get('TutorialScene').setup(this.sharedData);
                    this.scene.start('TutorialScene', { nextScene: 'dilemmaOrInsurrection', message: 'Beginner Level\nMilitary Capital automatically invested.\nYour Alien Defense is now stronger!' });
                    //this.scene.pause('politics');

                    //handleDilemmaOrInsurrection();
                } else { // if autospend is false
                    this.sharedData.militaryAllocation = this.totalMilitaryAllocThisScene;
                    this.scene.get('military allocation').setup(this.sharedData);
                    this.scene.start('military allocation');
                }
            } else {
                handleDilemmaOrInsurrection();
            }
        });

        this.cameras.main.fadeIn(2000, 0, 0, 0);

        this.roundThreats = 0;

        //====================================================================================
        //
        // environmentalImpact
        //
        //====================================================================================
        let environmentalImpact = () => {
            let env = this.icons['environment'];

            env.health = Phaser.Math.Clamp(env.health + 5 - Math.abs(env.maga - env.woke), 0, 100*env.healthScale);

            if (env.health < 1) {
                this.sharedData.putieTerritories++;
                this.putieTerritories = this.sharedData.putieTerritories;
                env.maga = 0;
                env.woke = 0;
                env.health = 5;
                this.scene.get('TutorialScene').setup(this.sharedData);
                this.scene.start('TutorialScene', { message: 'Environment Collapses!  Going to have to rebuild...' });
            }

            env.iconText.setText(env.textBody + env.health);

            //this.drawHealthBar(1, 100, 100, 'maga', this.envHealthBarMaga);
            //this.drawHealthBar(0.7, 110, 100, 'woke', this.envHealthBarWoke);

            drawGauges(this, env.icon.x, env.icon.y, env.maga, env.woke, env.health, env.healthScale, env.gaugeMaga, env.gaugeWoke, env.gaugeHealth, env.scaleSprite, env.littleHats);

            if (0) {//Math.random() < 0.3) {
                this.scene.get('AliensAttack').setup(this.sharedData);
                this.scene.start('AliensAttack');
            }
        }

        //====================================================================================
        //
        // function governmentGrowth()
        //
        //====================================================================================
        function governmentGrowth() {
            this.icons['government'].health += this.icons['government'].woke - this.icons['government'].maga +3;
            let gov = this.icons['government'];
            let governmentSize = gov.health;

            if (1) {//governmentSize < 1200) {
                this.icons['government'].textBody = 'Government\nStrength ';
                this.icons['government'].iconText.setText(this.icons['government'].textBody + governmentSize);
            }
/*
            else {
                this.icons['government'].textBody = 'Living on the Dole: ' + (governmentSize-1000)/50 + '%\nCrony Capitalism: ' + ((governmentSize-800)/66).toFixed(2) +'%\nGovernment Stability: ';

                this.icons['government'].iconText.setText(this.icons['government'].textBody + governmentSize);
            }
 */
            drawGauges(this, gov.icon.x, gov.icon.y, gov.maga, gov.woke, gov.health, gov.healthScale, gov.gaugeMaga, gov.gaugeWoke, gov.gaugeHealth, gov.scaleSprite, gov.littleHats);
        }
        //====================================================================================
        //
        // The main body of create()
        //
        //====================================================================================
        this.createTerritories();

        let totalCapital = Math.floor(this.MAGAness + this.Wokeness);

        this.polCapText = this.add.text(20, 0, 'Political Capital ' + totalCapital, { fontSize: this.sharedData.medFont, fill: '#0f0' });

        // Create Year text
        this.yearText = this.add.text(this.sys.game.config.width * .8, 0, 'Year: ' + this.sharedData.year, { fontSize: this.sharedData.medFont, fill: '#fff' });


        //this.envHealthBarMaga = this.add.graphics();
        //this.envHealthBarWoke = this.add.graphics();
        //this.drawHealthBar(1, 100, 100, 'maga', this.envHealthBarMaga);
        //this.drawHealthBar(0.8, 110, 100, 'woke', this.envHealthBarWoke);

        this.magaThreats = this.physics.add.group();
        this.magaDefenses = this.physics.add.group();
        this.wokeThreats = this.physics.add.group();
        this.wokeDefenses = this.physics.add.group();
        this.helperIcons = this.physics.add.group();

        this.magaReturns = this.physics.add.group();
        this.wokeReturns = this.physics.add.group();

//=====
        this.characterSliders = []; // keep track of the sliders
        this.characterTexts = []; // keep track of character text pointers

        let Wokeindex = 0;
        let MAGAindex = 0;
        let xOffset = 0;
        let numberOfSteps = 7;
        let defaultValue = 0;
        let characterText;

        // Initialize an array to store arrow graphics
        let arrowGraphicsArray = [];
        this.territoryReference = territories;
        this.gaugeMagaArray = [];
        this.iconArray = [];
        let arrowTimerIDs = [];

        // Iterate over each category in the icons object
        Object.keys(this.icons).forEach(category => {
            if (this.icons[category].gaugeMaga) {
                this.gaugeMagaArray.push(this.icons[category].gaugeMaga);
            }
            if (this.icons[category].icon) {
                this.iconArray.push(this.icons[category].icon);
            }
        });

        let nextScreenTutorial = [
            {
                story: [
                    "Political Capital is the currency you use",
                    "to accomplish tasks! Earn capital by making",
                    "effective policy decisions."
                ],
                reference: 'polCapText',
                offset: { x: 280, y: 70 } // Offset from polCapText
            },
            {
                story: [
                    "Spend Political Capital",
                    "to endorse your liaisons. They will provide",
                    "you with valuable resources to improve society and prevent collapse."
                ],
                reference: 'polCapText',
                offset: { x: 240, y: 380 } // Offset from characterTexts
            },
            {
                story: [
                    "There are MAGA liaisons and Woke liaisons. Both types provide",
                    "valuable resources. However MAGA liaisons promote MAGA activism,",
                    "while Woke liaisons promote Woke activism."
                ],
                reference: 'characterTexts',
                offset: { x: 240, y: 380 } // Offset from characterTexts
            },
            {
                story: [
                    "These are the six societal aspects you",
                    "aim to improve. When all six are",
                    "in excellent health, you win!"
                ],
                reference: "iconArray",
                offset: { x: 140, y: 120 } // Offset from characterTexts
            },
            {
                story: [
                    "The circle around the outside indicates its health.  It also",
                    "flashes red when very unhealthy.  If an aspect collapses, Putie moves",
                    "in and takes over a territory."
                ],
                reference: "gaugeMagaArray",
                offset: { x: 120, y: 120 } // Offset from characterTexts
            },
            {
                story: [
                    "The scale indicates the balance of MAGA vs. Woke activists.  It is best if",
                    "MAGA and Woke are equal.  When the scale is out of balance, more activists",
                    "will protest, causing bigger concerns since too many activists can cause a revolt!"
                ],
                reference: "gaugeMagaArray",
                offset: { x: 140, y: 120 } // Offset from characterTexts
            },
            {
                story: [
                    "This is a community forum token.  It can",
                    "dispell agression and create mutual",
                    "understanding. You can drag the",
                    "token to block attacking Insurrectionists, or you can drop the",
                    "token into an aspect to cause insurrectionists to go home!"
                ],
                reference: "sharedData.misinformation[0]",
                offset: { x: 430, y: 300 } // Offset from characterTexts
            },
            {
                story: [
                    "These territories are either MAGA or Woke.  The hats indicate",
                    "the alignment of the territory.  The hat pulses to indicate",
                    "if activists in a territory are expressing frustration.  Mouse",
                    "over a liason and see activists getting ready to protest"
                ],
                reference: "territoryReference",
                offset: { x: -280, y: -175 }
            },
            {
                story: [
                    "The person you choose to endorse will give benefits to improve",
                    "society or defend against agressive activists (including Putin!)",
                    "In addition, liasons encourage activists to attack",
                    "a societal aspect that they are opposed to."
                ],
                reference: 'characterTexts', // this has been pushed into a this.characterTexts array elsewhere just for this purpose
                offset: { x: 640, y: 380 }
            },
            {
                story: [
                    "The societal aspect the liason opposes will be highlighted",
                    "with a ring the color of the MAGA or Woke activists that will attack it."
                ],
                reference: 'gaugeMagaArray', // this has been pushed into a this.characterTexts array elsewhere just for this purpose
                offset: { x: 640, y: 380 }
            },
            {
                story: [
                    "Once a character has been fully endorsed, it will turn green and on",
                    "the next round that character will issue a benefit that you can then deploy.",
                    "Some Liasons help society.  The hacker can create a cyber-shield around a",
                    "societal aspect to defend against attacks",
                    "and the social peacemaker creates new information session tokens"
                ],
                reference: 'characterTexts',
                offset: { x: 640, y: 580 } // Offset from characterTexts
            },
            {
                story: [
                    "When you mouse over a character, some background is given on the character, and",
                    "you will see an activist hat pulse at the bottom, ready to protest!"
                ],
                reference: 'characterTexts',
                offset: { x: 340, y: 580 } // Offset from characterTexts
            },
            {
                story: [
                    "The goal is to improve the societal aspect while not causing too much political",
                    "unrest.  In some situations the political unrest needs to be defused before the aspect can",
                    "be improved."
                ],
                reference: "gaugeMagaArray",
                offset: { x: 640, y: 580 }
            },
            {
                story: [
                    "If the societal aspect is very weak, it's a bad idea to cause activists to attack it.",
                    "Best to wait for that aspect of society to be strong before causing unrest against it!"
                ],
                reference: "gaugeMagaArray",
                offset: { x: 660, y: 280 }
            },
            {
                story: [
                    "As the years tick by, you may gain or lose political capital, or the aliens might attack.",
                    "every few years the time with pause to allow you to make new political decisions."
                ],
                reference: "yearText",
                offset: { x: 660, y: 280 }
            },
            {
                story: [
                    "Now spend all of your current Political capital endorsing characters and then Click",
                    "on the Earth Icon to move to the next screen"
                ],
                reference: 'nextButton',
                offset: { x: -280, y: -75 }
            }
        ];

        let secondScreenTutorial = [
            {
                story: [
                    "After you have endorsed a liaison, a token appears that can be dragged",
                    "into the indicated societal aspect to improve it.  Be careful there isn't too much unrest though, because",
                    "when the token is dropped in, protestors are released that will attack the protested aspect,",
                    "indicated by the glow around it."
                ],
                reference: 'polCapText',
                offset: { x: 200, y: 70 } // Offset from polCapText
            },
            {
                story: [
                    "The Hacker Token can be dropped into ANY ONE Societal Aspect",
                    "to protect it from all future protests and Putin cyber-attacks."
                ],
                reference: 'polCapText',
                offset: { x: 240, y: 380 } // Offset from characterTexts
            },
            {
                story: [
                    "Don't forget to position the community forum blockers strategically",
                    "to protect societal aspects from future protests and Putin cyber-attacks."
                ],
                reference: "sharedData.misinformation[0]",
                offset: { x: 430, y: 300 } // Offset from characterTexts
            }
            ];

        function getValueByPath(obj, path) {
            let result = path.split(/[\[\]'.]+/).filter(Boolean).reduce((o, key) => (o && o[key] !== undefined) ? o[key] : undefined, obj);
            if (result === undefined) {
                result = {path}; // Return the path directly if not found in obj
            }
            return result;
        }

        let currentIndex = 0;
        if (this.hasBeenCreatedBefore) {
            currentIndex = 99;
        }
        if (this.difficultyLevel().multiplier == 1 && !this.hasBeenCreatedBefore) {
            let backdrop;  // Optional: A background to capture clicks on the entire game area
            let timeoutHandle;
            let arrowGraphics; // Store the reference to the arrow graphics
            this.secondTimeThrough = 1;

            const displayTutorial = () => {
                if (currentIndex < nextScreenTutorial.length) {
                    let snog;
                    let tutorial = nextScreenTutorial[currentIndex];
                    let formattedBackstory = insertLineBreaks(tutorial.story.join(' '), 55);
                    let referenceObject = getValueByPath(this, tutorial.reference);
                    if (tutorial.reference == "polCapText")
                    {
                        // make a copy of referenceObject so we can pretend to move the x, y coordinates over
                        snog = Object.assign({}, referenceObject);
                        snog.x = snog.x + 100;
                        snog.y = snog.y + 20;
                    }
                    else {
                        snog = referenceObject;
                    }
                    if (tutorial.reference == "characterTexts")
                    {
                        // Assuming characters is an array of objects and startBlinkingCheckbox is defined
                        const character = characters.find(character => character.dne === false);

                        console.log(character);
                        if (character) {
                          startBlinkingCheckbox(
                            this,
                            character.checkbox.checkboxUnchecked,
                            character.checkbox.checkboxChecked,
                            character.checkbox.checkboxUncheckedAction,
                            character.checkbox.checkboxCheckedAction
                          );
                        } else {
                          console.log('No character with dne == false found.');
                        }
                    }

                    //console.log(referenceObject.length);
                    //console.log(typeof(referenceObject));
                    //console.log(referenceObject);
                    //let referenceObject = this[tutorial.reference];

                    let backstoryText = this.add.text(window.innerWidth/5*2, window.innerHeight/5*2+currentIndex*20, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: '#fff', align: 'center' });

                    backstoryText.setOrigin(0.5);
                    backstoryText.setVisible(true);
                    backstoryText.setDepth(4);

                    let backstoryBox = this.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
                    backstoryBox.setStrokeStyle(2, 0xffffff, 0.8);
                    backstoryBox.isStroked = true;
                    backstoryBox.setOrigin(0.5);
                    backstoryBox.setVisible(true);
                    backstoryBox.setDepth(3);
                    //console.log(backstoryBox.x + backstoryBox.width/2);

                    // Check if snog is an array or a single object
                    if (Array.isArray(snog)) {
                        snog.forEach((element, index) => {
                            const timerID = setTimeout(() => {
                                let arrow = drawArrow(this, element.x, element.y, backstoryBox.x, backstoryBox.y);
                                arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                            }, (index+1) * 400 ); // Delay each arrow by index * 400 milliseconds
                            arrowTimerIDs.push(timerID); // Store the timer ID
                        });

                    } else {
                        let arrow = drawArrow(this, snog.x, snog.y, backstoryBox.x, backstoryBox.y);
                        arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                    }

                    this.tweens.add({
                        targets: [backstoryText, backstoryBox],
                        alpha: { from: 1, to: .5 },
                        ease: 'Linear',
                        duration: 1000,
                        repeat: -1,
                        yoyo: true
                    });

                    // Optional: Add a full-screen invisible sprite to capture clicks anywhere
                    if (!backdrop) {
                        backdrop = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height-100, 0x000000, 0).setOrigin(0, 0).setInteractive();
                    }

                    // Cleanup function to clear current tutorial item
                    const clearCurrentTutorial = () => {
                        clearTimeout(timeoutHandle);  // Clear the timeout to avoid it firing after manual advance
                        backstoryText.setVisible(false);
                        backstoryBox.setVisible(false);
                        this.tweens.killTweensOf([backstoryText, backstoryBox]);
                        backdrop.off('pointerdown');
                        this.input.keyboard.off('keydown-ENTER');

                        // Clear all pending timers for drawing arrows
                        arrowTimerIDs.forEach(timerID => clearTimeout(timerID));
                        arrowTimerIDs = []; // Clear the timer IDs array after cancellation

                        // Destroy all arrow graphics
                        arrowGraphicsArray.forEach(arrow => arrow.destroy());
                        arrowGraphicsArray = []; // Clear the array after destruction

                        currentIndex++;
                        displayTutorial(); // Display next item
                    };

                    // Set up listeners for pointer down and ENTER key
                    backdrop.on('pointerdown', clearCurrentTutorial);
                    this.input.keyboard.on('keydown-ENTER', clearCurrentTutorial);
                    this.nextButton.on('pointerdown', () => {
                        currentIndex = 99;
                        clearCurrentTutorial();
                    });

                    // Set a timeout to automatically advance
                    timeoutHandle = setTimeout(clearCurrentTutorial, 10000);
                }
            };

            displayTutorial(); // Start the tutorial display
        }

        // Function to draw an arrow with the head on the starting point
        function drawArrow(scene, startX, startY, endX, endY) {
            let graphics = scene.add.graphics();
            graphics.lineStyle(5, 0xa000a0, 1);

            // Draw the main line
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();
            graphics.closePath();

            let angle = Phaser.Math.Angle.Between(startX, startY, endX, endY);
            let arrowHeadLength = 20;
            let arrowHeadAngle = Math.PI / 6;

            // Calculate points for the arrowhead at the starting point
            let arrowPoint1X = startX + arrowHeadLength * Math.cos(angle + arrowHeadAngle);
            let arrowPoint1Y = startY + arrowHeadLength * Math.sin(angle + arrowHeadAngle);
            let arrowPoint2X = startX + arrowHeadLength * Math.cos(angle - arrowHeadAngle);
            let arrowPoint2Y = startY + arrowHeadLength * Math.sin(angle - arrowHeadAngle);

            // Draw the arrowhead
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(arrowPoint1X, arrowPoint1Y);
            graphics.lineTo(arrowPoint2X, arrowPoint2Y);
            graphics.lineTo(startX, startY);
            graphics.fillStyle(0xa000a0, 1);
            graphics.fillPath();
            graphics.strokePath();
            graphics.setDepth(2);

            return graphics; // Ensure the graphics object is returned

        }

        // Check if there are any characters to endorse for MAGA faction
        let hasMagaCharacters = characters.some(character => character.faction === 'maga' && !character.dne);

        // Check if there are any characters to endorse for Woke faction
        let hasWokeCharacters = characters.some(character => character.faction === 'woke' && !character.dne);

        // Display "Endorse?" headline for MAGA faction if there are eligible characters
        if (hasMagaCharacters) {
            let endorseMaga = this.add.text(0, 220, 'Endorse?',
                                { fontSize: '22px', fontFamily: 'Roboto', color: '#ff4040', align: 'left' });
            let underline = this.add.graphics();
            underline.lineStyle(2, 0xff4040); // Set the line thickness and color
            underline.beginPath();
            underline.moveTo(endorseMaga.x, endorseMaga.y + endorseMaga.height);
            underline.lineTo(endorseMaga.x + endorseMaga.width, endorseMaga.y + endorseMaga.height);
            underline.closePath();
            underline.strokePath();
        }

        if (hasWokeCharacters) {
            let endorseWoke = this.add.text(0 + this.sys.game.config.width * .74, 220, 'Endorse?',
                                                    { fontSize: '22px', fontFamily: 'Roboto', color: '#8080ff', align: 'left' })
            let underline = this.add.graphics();
            underline.lineStyle(2, 0x8080ff); // Set the line thickness and color
            underline.beginPath();
            underline.moveTo(endorseWoke.x, endorseWoke.y + endorseWoke.height);
            underline.lineTo(endorseWoke.x + endorseWoke.width, endorseWoke.y + endorseWoke.height);
            underline.closePath();
            underline.strokePath();
        }

        // ====
        // New idea: each round we go through all the available characters and potentially add new characters to the pool
        // For now we have the simplest rule in place.
        // The plan: Each character is assigned a maga, woke, and independent level.  Level 1 characters appear at the beginning.
        // As you advance to the next level, new characters are added to your arsenal
        // to go up a level you get political experience points -- total political capital earned so far!
        console.log('this.totalPoliticalCapital = ' + this.totalPoliticalCapital);
        let experienceLevel = Math.floor(this.totalPoliticalCapital/30);
        console.log('experienceLevel = ' + experienceLevel);

        // We have a problem where we are creating the characters and the checkboxes here, but that also includes
        // recreating the characters and keeping the checkbox settings from the previous round.
        // There is a catch-22 where we think the endorsement is 2, so we color it green, but then it gets set to zero.

        characters.forEach((character, index) => {
            if (character.dne == true) {return;}
            // Keep separate track of the MAGA and Woke character placement row offsets
            let rowIndex = (character.faction === 'maga' ? MAGAindex : Wokeindex);
            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
            if (character.faction == 'maga') {
                MAGAindex++;
                xOffset = 0;
            }
            else {
                Wokeindex++;
                xOffset = this.sys.game.config.width * .74;
             }

             if (!this.hasBeenCreatedBefore) {
                 charVal[character.name] = 250+xOffset;
             } else {
                 character.endorsement += character.value;
                 character.prevValue = 0;
                 character.backing = character.value;
                 //character.value = 0;
             }
             let healthTextRange = ['None', 'Endorsed', 'Fully Endorsed'];
             let healthText = healthTextRange[Phaser.Math.Clamp(character.endorsement,0,2)];

            characterText = this.add.text(50+xOffset, 250 + (rowIndex * 60), character.name +'\nBacking: ' + healthText,
                                { fontSize: '16px', fontFamily: 'Roboto', color: textColor, align: 'left' }).setInteractive();

            character.charText = characterText; // back reference to text so we can find the location later

            //console.log(character.name +' has backing of '+character.backing);
            character.checkbox = createCheckbox(this, 20+xOffset, 270 + (rowIndex * 60), character, characterText, function(character, backing) {
                character.backing = backing;
            }, character.backing);
            //
            // let initialValue = character.value / (numberOfSteps - 1); // character.value should be a number from 0 to numberOfSteps - 1
            // let characterSlider = createSlider(this, 150+xOffset, 250 + (rowIndex * 85), character, characterText, value => {
            //     charVal[character.name] = characterSlider.slider.x;
            //     character.value = value;
            // }, initialValue);
            //
            // this.characterSliders.push(characterSlider);
            this.characterTexts.push(characterText); // Push characterTexts just so we can reference location w pointers later
        });


        if (this.hasBeenCreatedBefore) {
            // Recreate all previously created helpful tokens that have not been used yet
            for (let key in scene.sharedData.helperTokens) {
                // Lookup stored data
                let storedData = scene.sharedData.helperTokens[key];
                console.log('helperToken ' + storedData.text + ' has been recreated and the saved index is ' + storedData.helperTokenIndex);
                let helpfulToken = createPowerToken(scene, storedData.type, storedData.text, storedData.x, storedData.y, storedData, storedData.helperTokenIcon);
                // debug helpfulToken.sprite.setVisible(true);
                scene.helperIcons.add(helpfulToken.sprite); // This line is supposed to make interactions possible
                helpfulToken.container.setInteractive({ draggable: true }); // make each defense item draggable
                helpfulToken.container.character = storedData.character;
            }

            let enableTokenTutorial = false;
            let helpfulTokenIndex = Object.keys(scene.sharedData.helperTokens).length; // Starting index for new tokens
            console.log('starting index helpfulTokenIndex is equal to ' + helpfulTokenIndex);

            // Go through each character, recreate the slider and track, and check if any new helpful tokens need to be generated
            characters.forEach((character, index) => {
                if (character.dne == true) {return;}
                // Recreate slider and track here
                if (character.endorsement > 1) {
                    // Create new helpful token
                    createHelpfulToken(this, character, helpfulTokenIndex);
                    helpfulTokenIndex++;
                    if (character.powerTokenType == 'type_5') {enableTokenTutorial = true;}
                    character.endorsement -= 2;

                    let healthTextRange = ['None', 'Endorsed', 'Fully Endorsed'];
                    let healthText = healthTextRange[Phaser.Math.Clamp((character.endorsement + character.value),0,2)];
                    // Recreate text here
                    character.charText.setText(character.name + ',\nBacking: ' + healthText);
                    // Make sure color of text is normal
                    if (character.faction == 'maga') {
                        character.charText.setColor('#ff4040');
                    } else {
                        character.charText.setColor('#8080ff');
                    }
                    if ((character.endorsement + character.value) > 1){
                        character.charText.setColor('#0f0');
                    }
                }
            });

            // If this is the first time a helpful token has appeared, and it's beginner level, provide a tutorial on what to do with it
            if (this.difficultyLevel().multiplier == 1 && !this.firstPowerTokenEver && enableTokenTutorial == true) {
                this.firstPowerTokenEver = 1;
               // let backdrop;
                let timeoutHandle;

                let tutorial = secondScreenTutorial[0];
                let formattedBackstory = insertLineBreaks(tutorial.story.join(' '), 55);

                let backstoryText = this.add.text(this.cameras.main.width/2, this.cameras.main.height/5*3+helpfulTokenIndex*20, formattedBackstory, { fontSize: '18px', fontFamily: 'Roboto', color: '#fff', align: 'center' });
                backstoryText.setOrigin(0.5);
                backstoryText.setVisible(true);
                backstoryText.setDepth(4);  //JCS try changing this from 2 to 1 in hopes that the arrows are behind it

                let backstoryBox = this.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
                backstoryBox.setStrokeStyle(2, 0xffffff, 0.8);
                backstoryBox.isStroked = true;
                backstoryBox.setOrigin(0.5);
                backstoryBox.setVisible(true);
                backstoryBox.setDepth(3);
                console.log(backstoryBox.x + backstoryBox.width/2);

                if (1){
                    // Assuming scene.sharedData.helperTokens is an object
                    let helperTokens = scene.sharedData.helperTokens;

                    Object.keys(helperTokens).forEach((element, index) => {
                        const timerID = setTimeout(() => {
                            let arrow = drawArrow(scene, helperTokens[element].x, helperTokens[element].y, backstoryBox.x, backstoryBox.y);
                            arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                        }, (index+1) * 400); // Delay each arrow by index * 400 milliseconds
                        arrowTimerIDs.push(timerID); // Store the timer ID
                    });
                    /*
                    Object.keys(helperTokens).forEach(key => {
                        let storedData = helperTokens[key];

                        // Check if helperToken exists
                        if (storedData) {
                            let snog = { x: storedData.x, y: storedData.y };

                            // Draw the arrow from backstoryBox to snog
                            let arrow = drawArrow(this, snog.x, snog.y, backstoryBox.x, backstoryBox.y);

                            // Store the arrow graphic in the array
                            arrowGraphicsArray.push(arrow);
                        }
                    });
                    */
                }

                this.tweens.add({
                    targets: [backstoryText, backstoryBox],
                    alpha: { from: 1, to: .5 },
                    ease: 'Linear',
                    duration: 1000,
                    repeat: -1,
                    yoyo: true
                });

                // Optional: Add a full-screen invisible sprite to capture clicks anywhere
                if (0){//}!backdrop) {
                    backdrop = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height-100, 0x000000, 0).setOrigin(0, 0).setInteractive();
                }

                // Cleanup function to clear current tutorial item
                const clearCurrentTutorial = () => {
                    clearTimeout(timeoutHandle);  // Clear the timeout to avoid it firing after manual advance
                    backstoryText.setVisible(false);
                    backstoryBox.setVisible(false);
                    this.tweens.killTweensOf([backstoryText, backstoryBox]);
                    //backdrop.off('pointerdown');
                    this.input.keyboard.off('keydown-ENTER');

                    // Clear all pending timers for drawing arrows
                    arrowTimerIDs.forEach(timerID => clearTimeout(timerID));
                    arrowTimerIDs = []; // Clear the timer IDs array after cancellation

                    // Destroy all arrow graphics
                    arrowGraphicsArray.forEach(arrow => arrow.destroy());
                    arrowGraphicsArray = []; // Clear the array after destruction

                    //displayTutorial(); // Display next item
                };

                // Set up listeners for pointer down and ENTER key
                //backdrop.on('pointerdown', clearCurrentTutorial);
                this.input.keyboard.on('keydown-ENTER', clearCurrentTutorial);

                // Set a timeout to automatically advance
                timeoutHandle = setTimeout(clearCurrentTutorial, 10000);
            }
        }
        // // TODO: Add a character power type that "calms down" insurrectionists and gets them to go home.
        // Should there be a Maga type and a Woke type?  Or should there just be a "calm downer" type?  maybe
        // just reduce whichever is largest
        function createHelpfulToken(scene, character, helpfulTokenIndex) {
            let text = character.power;
            let charText = character.charText;
            let xOffset, yOffset;
            if (character.faction === 'maga') {
                xOffset = charText.x + 250;
            } else {
                xOffset = charText.x - 140;
            }
            yOffset = charText.y + 25;

            //===========
            // Add an icon or graphic
            let helpedIcon;
            let characterHelps = character.helps; // don't want to change character.helps permanently
            if (character.helps){
                helpedIcon = scene.sharedData.icons[character.helps];
            } else {
                helpedIcon = scene.sharedData.icons['environment']; // placeholder for now for undefined helps
                if (character.powerTokenType == 'type_3') {
                    characterHelps = 'hacker';
                    helpedIcon.scaleFactor = 0.19;
                    //console.log('hacker');
                } else {
                    characterHelps = 'negotiation';
                    helpedIcon.scaleFactor = 0.13;
                    //console.log('negotiation');
                }
            }

            // Add an icon or graphic and scale it
            let helpfulTokenIcon = scene.add.image(0, 0, characterHelps);  // Position the icon at the original y position
            helpfulTokenIcon.setScale(helpedIcon.scaleFactor*.6);  // scale the icon
            helpfulTokenIcon.setOrigin(0.5, 0.82);  // change origin to bottom center
            helpfulTokenIcon.setVisible(true);
            //helpfulTokenIcon.setDepth(2);  // set depth below the text and above the bounding box
            helpfulTokenIcon.setAlpha(1);
            //=====

            // Store position data
            let storedData = {
                x: xOffset,
                y: yOffset,
                type: character.faction,
                text: text,
                character: character,
                helperTokenIndex: helpfulTokenIndex,
                helperTokenIcon: helpfulTokenIcon
            };

            // Store new helpful token data indexed by character.name
            scene.sharedData.helperTokens[character.name] = storedData;

            // Create new helpful token
            let size = 'normal';
            if (character.powerTokenType == 'type_2') {
                size = 'large';
            }
            let containerColor;
            if (character.powerTokenType == 'type_2')
            {
                containerColor = 'neutral';
            } else {
                containerColor = character.faction;
            }
            let helpfulToken = createPowerToken(scene, containerColor, text, xOffset, yOffset, storedData, size, 'normal', false, helpfulTokenIcon);

            scene.helperIcons.add(helpfulToken.sprite);
            helpfulToken.container.setInteractive({ draggable: true }); // make defense item draggable
            // link the helpfultoken sprite to with the character
            helpfulToken.container.character = character;
            helpfulToken.container.on('pointerdown', function (pointer, dragX, dragY) {
                //let helpedIcon = scene.sharedData.icons.find(asset => asset.iconName === character.helps);
                let helpedColor;
                let hurtColor;
                if (character.powerTokenType == 'type_5') {
                    let helpedIcon = scene.sharedData.icons[character.helps];
                    //console.log(helpedIcon);
                    if (character.faction == 'maga') {
                        helpedColor = 0xffffff;
                        hurtColor = 0xff0000;
                    } else {
                        helpedColor = 0xffffff;
                        hurtColor = 0x0000ff;
                    }
                    // Provide a hint by changing the tint of the shield of the helped and hurt Icons
                    helpedIcon.icon.shieldWoke.setAlpha(1).setTint(helpedColor);
                    let hurtIcon = scene.sharedData.icons[character.hurts];
                    hurtIcon.icon.shieldMaga.setAlpha(1).setTint(hurtColor);
                    //console.log(hurtIcon);
                } else if (character.powerTokenType == 'type_3') { // TODO: It would be cool if an informational dialog popped up for HACKER explaining exactly how it works here
                    // Light up all the nonprotected shields to provide hint that hacker can be used everywhere
                    for (let key in scene.sharedData.icons) {
                        let iconData = scene.sharedData.icons[key];

                        //console.log(helpedIcon);
                        if (iconData.shieldStrength < .1) {
                            if (character.faction == 'maga') {
                                helpedColor = 0xff4040;
                            } else {
                                helpedColor = 0x8080ff;
                            }
                            // Provide a hint by changing the tint of the shield of the helped and hurt Icons
                            iconData.icon.shieldWoke.setAlpha(1).setTint(helpedColor);
                        }
                    }
                    if (!scene.firstHackerEver && scene.difficultyLevel().multiplier == 1) {
                        scene.firstHackerEver = 1;
                        let timeoutHandle;

                        let tutorial = secondScreenTutorial[1];
                        let formattedBackstory = insertLineBreaks(tutorial.story.join(' '), 55);

                        let backstoryText = scene.add.text(scene.cameras.main.width/2, scene.cameras.main.height/5*3+helpfulTokenIndex*20, formattedBackstory, { fontSize: '18px', fontFamily: 'Roboto', color: '#fff', align: 'center' });
                        backstoryText.setOrigin(0.5);
                        backstoryText.setVisible(true);
                        backstoryText.setDepth(4);

                        let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
                        backstoryBox.setStrokeStyle(2, 0xffffff, 0.8);
                        backstoryBox.isStroked = true;
                        backstoryBox.setOrigin(0.5);
                        backstoryBox.setVisible(true);
                        backstoryBox.setDepth(3);
                        console.log(backstoryBox.x + backstoryBox.width/2);

                        // Assuming scene.sharedData.helperTokens is an object
                        let helperTokens = scene.sharedData.helperTokens;
                        /*
                        for (let key in scene.sharedData.icons) {
                            let iconData = scene.sharedData.icons[key].gaugeMaga;
                            Object.keys(iconData).forEach((element, index) => {
                                const timerID = setTimeout(() => {
                                    let arrow = drawArrow(scene, iconData[element].x, iconData[element].y, backstoryBox.x, backstoryBox.y);
                                    arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                                }, (index+1) * 400); // Delay each arrow by index * 400 milliseconds
                                arrowTimerIDs.push(timerID); // Store the timer ID
                            });

                            // Check if helperToken exists
                            if (iconData) {
                                let snog = { x: iconData.x, y: iconData.y };

                                // Draw the arrow from backstoryBox to snog
                                let arrow = drawArrow(scene, snog.x, snog.y, backstoryBox.x, backstoryBox.y);

                                // Store the arrow graphic in the array
                                arrowGraphicsArray.push(arrow);
                            }
                            */
                            
                        let iconKeys = Object.keys(scene.sharedData.icons);

                        iconKeys.forEach((key, index) => {
                            const iconData = scene.sharedData.icons[key].gaugeMaga;
                        
                            if (iconData) {
                                const timerID = setTimeout(() => {
                                    let arrow = drawArrow(scene, iconData.x, iconData.y, helpfulToken.x, helpfulToken.y); //backstoryBox.x, backstoryBox.y);
                                    arrowGraphicsArray.push(arrow);
                                }, (index + 1) * 400);
                        
                                arrowTimerIDs.push(timerID);
                            }
                        });

                        scene.tweens.add({
                            targets: [backstoryText, backstoryBox],
                            alpha: { from: 1, to: .5 },
                            ease: 'Linear',
                            duration: 1000,
                            repeat: -1,
                            yoyo: true
                        });


                        // Cleanup function to clear current tutorial item
                        const clearCurrentTutorial = () => {
                            clearTimeout(timeoutHandle);  // Clear the timeout to avoid it firing after manual advance
                            backstoryText.setVisible(false);
                            backstoryBox.setVisible(false);
                            scene.tweens.killTweensOf([backstoryText, backstoryBox]);
                            //backdrop.off('pointerdown');
                            scene.input.keyboard.off('keydown-ENTER');

                            // Clear all pending timers for drawing arrows
                            arrowTimerIDs.forEach(timerID => clearTimeout(timerID));
                            arrowTimerIDs = []; // Clear the timer IDs array after cancellation

                            // Destroy all arrow graphics
                            arrowGraphicsArray.forEach(arrow => arrow.destroy());
                            arrowGraphicsArray = []; // Clear the array after destruction

                            //displayTutorial(); // Display next item
                        };

                        // Set up listeners for pointer down and ENTER key
                        //backdrop.on('pointerdown', clearCurrentTutorial);
                        scene.input.keyboard.on('keydown-ENTER', clearCurrentTutorial);

                        // Set a timeout to automatically advance
                        timeoutHandle = setTimeout(clearCurrentTutorial, 10000);
                    }
                    //console.log(hurtIcon);
                }
            });
            helpfulToken.container.on('pointerup', function (pointer, dragX, dragY) {
                //let helpedIcon = scene.sharedData.icons.find(asset => asset.iconName === character.helps);
                if (character.powerTokenType == 'type_5') {
                    let helpedIcon = scene.sharedData.icons[character.helps];
                    if (helpedIcon) {
                        helpedIcon.icon.shieldWoke.setAlpha(helpedIcon.icon.shieldStrength > 0 ? 0.6:0);
                    }
                    let hurtIcon = scene.sharedData.icons[character.hurts];
                    if (hurtIcon) {
                        hurtIcon.icon.shieldMaga.setAlpha(hurtIcon.icon.shieldStrength > 0 ? 0.6:0);
                    }
                } else if (character.powerTokenType == 'type_3') {
                    for (let key in scene.sharedData.icons) {
                        let iconData = scene.sharedData.icons[key];
                        // Provide a hint by changing the tint of the shield of the helped and hurt Icons
                        iconData.icon.shieldWoke.setAlpha(iconData.icon.shieldStrength > 0 ? 0.8:0);
                    }
                }
            });
            if (character.powerTokenType === 'type_2') {
                scene.extraMisinformationTokens += 4;
                helpfulToken.container.x = 720;
                if (character.faction == 'maga') helpfulToken.container.x -= scene.cameras.main.width/4;
                helpfulToken.container.y = 290;
                helpfulToken.container.setAlpha(.25);

                // First tween: Increase alpha to 0.5 over 2 seconds
                scene.tweens.add({
                    targets: helpfulToken.container,
                    alpha: .5,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                    onComplete: function () {
                        // Second tween: Shrink to 1/10th size over 2 seconds
                        scene.tweens.add({
                            targets: helpfulToken.container,
                            scaleX: 0.1, // Shrink to 1/10th of the width
                            scaleY: 0.1, // Shrink to 1/10th of the height
                            ease: 'Sine.easeInOut',
                            duration: 2000,
                            onComplete: function () {
                                helpfulToken.container.destroy();
                                delete scene.sharedData.helperTokens[helpfulToken.container.character.name];
                                //tooltip.text.setVisible(false);
                                //tooltip.box.setVisible(false);
                            },
                            callbackScope: scene
                        });
                    },
                    callbackScope: scene
                });

                if (!scene.firstType2Ever && scene.difficultyLevel().multiplier == 1) {
                    scene.firstType2Ever = 1;
                    let timeoutHandle;
                    let timeoutHandle2;

                    let tutorial = secondScreenTutorial[2];
                    let formattedBackstory = insertLineBreaks(tutorial.story.join(' '), 55);
                    timeoutHandle2 = setTimeout(() => {
                        let backstoryText = scene.add.text(scene.cameras.main.width/2, scene.cameras.main.height/2, formattedBackstory, { fontSize: '18px', fontFamily: 'Roboto', color: '#fff', align: 'center' });
                        backstoryText.setOrigin(0.5);
                        backstoryText.setVisible(true);
                        backstoryText.setDepth(4);

                        let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
                        backstoryBox.setStrokeStyle(2, 0xffffff, 0.8);
                        backstoryBox.isStroked = true;
                        backstoryBox.setOrigin(0.5);
                        backstoryBox.setVisible(true);
                        backstoryBox.setDepth(3);
                        console.log(backstoryBox.x + backstoryBox.width/2);

                        // Assuming scene.sharedData.helperTokens is an object
                        let helperTokens = scene.sharedData.misinformation;
                        Object.keys(helperTokens).forEach((element, index) => {
                            const timerID = setTimeout(() => {
                                let arrow = drawArrow(scene, helperTokens[element].x, helperTokens[element].y, backstoryBox.x, backstoryBox.y);
                                arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                            }, (index+1) * 400); // Delay each arrow by index * 400 milliseconds
                            arrowTimerIDs.push(timerID); // Store the timer ID
                        });
                        
                        /*
                        Object.keys(helperTokens).forEach(key => {
                            let storedData = helperTokens[key];

                            // Check if helperToken exists
                            if (storedData) {
                                let snog = { x: storedData.x, y: storedData.y };

                                // Draw the arrow from backstoryBox to snog
                                let arrow = drawArrow(scene, snog.x, snog.y, backstoryBox.x, backstoryBox.y);

                                // Store the arrow graphic in the array
                                arrowGraphicsArray.push(arrow);
                            }
                        });
                        */

                        scene.tweens.add({
                            targets: [backstoryText, backstoryBox],
                            alpha: { from: 1, to: .5 },
                            ease: 'Linear',
                            duration: 1000,
                            repeat: -1,
                            yoyo: true
                        });
                        // Cleanup function to clear current tutorial item
                        const clearCurrentTutorial = () => {
                            clearTimeout(timeoutHandle);  // Clear the timeout to avoid it firing after manual advance
                            backstoryText.setVisible(false);
                            backstoryBox.setVisible(false);
                            scene.tweens.killTweensOf([backstoryText, backstoryBox]);
                            scene.input.keyboard.off('keydown-ENTER');

                            // Clear all pending timers for drawing arrows
                            arrowTimerIDs.forEach(timerID => clearTimeout(timerID));
                            arrowTimerIDs = []; // Clear the timer IDs array after cancellation

                            // Destroy all arrow graphics
                            arrowGraphicsArray.forEach(arrow => arrow.destroy());
                            arrowGraphicsArray = []; // Clear the array after destruction
                        };

                        // Set up listeners for pointer down and ENTER key
                        scene.input.keyboard.on('keydown-ENTER', clearCurrentTutorial);

                        // Set a timeout to automatically advance
                        timeoutHandle = setTimeout(clearCurrentTutorial, 10000);
                    }, 5000);
                }
            }

/*
            // Add action for specific character's power
            if (character.powerTokenType == 'type_3') {
                console.log('set environment shield strength to .7');
                scene.icons['environment'].shieldStrength = .7;
            }
 */
        }
        //====================================================================================
        //
        // The following function creates the information/misinformation blockers
        //
        //====================================================================================
        createMisinformationManagement(this);

        //====================================================================================
        //
        // Add overlaps for bouncing or slowdowns between threats and defences
        //
        //====================================================================================
        this.physics.add.overlap(this.magaDefenses, this.wokeThreats, function(defense, threat) {
            if (threat.icon.maga > threat.icon.woke) {
                console.log("don't destroy threat: it's going to help!");
                return;
            }
            threat.destroy();
            this.roundThreats--;
            //console.log('defense destroyed threat.  Down to ' + this.roundThreats);

            if (Math.random() < .1) {
                this.tweens.add({
                    targets: defense,
                    alpha: 0,
                    duration: 500,
                    onComplete: function () {
                        console.log('delete index ' + defense.container.misinformationIndex);
                        delete scene.sharedData.misinformation[defense.container.misinformationIndex];
                        defense.container.destroy();
                    },
                    callbackScope: scene
                });
            }
        }, null, this);

        this.physics.add.overlap(this.wokeDefenses, this.magaThreats, function(defense, threat) {
            if (threat.icon.woke > threat.icon.maga) {
                console.log("don't destroy threat: it's going to help!");
                return;
            }
            threat.destroy();
            this.roundThreats--;
            if (Math.random() < .1) {
                this.tweens.add({
                    targets: defense,
                    alpha: 0,
                    duration: 500,
                    onComplete: function () {
                        console.log('delete index ' + defense.container.misinformationIndex);
                        delete scene.sharedData.misinformation[defense.container.misinformationIndex];
                        defense.container.destroy();
                    },
                    callbackScope: scene
                });
            }
        }, null, this);
/*
        // Timer event to increment the year every second
        this.yearTime = this.time.addEvent({
            delay: 1000,
            callback: incrementYear,
            callbackScope: this,
            loop: true
        });

        // Timer event to adjust Environmental impact every 10 seconds
        this.envTime = this.time.addEvent({
            delay: 10000,
            callback: environmentalImpact,
            callbackScope: this,
            loop: true
        });
        // Timer event to adjust Government Size every 7 seconds
        this.govTime = this.time.addEvent({
            delay: 7000,
            callback: governmentGrowth,
            callbackScope: this,
            loop: true
        });
 */


        //====================================================================================
        // function createMisinformationManagement(scene)
        // function that creates the information/misinformation blockers
        //
        //====================================================================================
        function createMisinformationManagement(scene) {
            let misinformationData = [
                {type: 'maga', text: 'Public Forums'},
                {type: 'woke', text: 'Constructive\nConversations'},
                {type: 'maga', text: 'Collaborative\nProjects'},
                {type: 'woke', text: 'Joint Initiatives'},
                {type: 'maga', text: 'Shared Goals'},
                {type: 'woke', text: 'Common Ground'},
                {type: 'maga', text: 'Mutual Understanding'},
                {type: 'woke', text: 'Bipartisan Efforts'},
                {type: 'maga', text: 'Civic Engagement'},
                {type: 'woke', text: 'Cooperative Programs'},
                {type: 'maga', text: 'Community Outreach'},
                {type: 'woke', text: 'Inclusive Policies'},
                {type: 'maga', text: 'Reconciliation\nEfforts'},
                {type: 'woke', text: 'Bipartisan Efforts'},
                {type: 'maga', text: 'Civic Engagement'},
                {type: 'woke', text: 'Cooperative Programs'},
                {type: 'maga', text: 'Community Outreach'},
                {type: 'woke', text: 'Inclusive Policies'},
                {type: 'maga', text: 'Reconciliation\nEfforts'},
            ];

            // Initialize the offset if it's not yet set
            if (!scene.yMagaOffset) {
                scene.yMagaOffset = 250;
            }
            if (!scene.yWokeOffset) {
                scene.yWokeOffset = 250;
            }


            if (!scene.currentMisinformationIndex) {
                scene.currentMisinformationIndex = 0;
            }

            let numEntries = 0;
            // If ideology is 'maga', start with 2 community outreach tokens.  It would make more sense
            // from ideology if it were 'woke', but the game doesn't play well that way.

            if (scene.sharedData.ideology.faction == 'maga') { // no outreach tokens is too hard lol!
                numEntries = 1;
            }
            numEntries = 2; // JCS too hard to start with 0 or 1.  Give both players 2 (or 3)
            if (scene.difficultyLevel().multiplier == 1) { // Beginner level gets an extra community outreach token
                numEntries++;
            }

            if (scene.hasBeenCreatedBefore) {
                numEntries = scene.extraMisinformationTokens;
                console.log('extraTokens = ' + scene.extraMisinformationTokens);
                scene.extraMisinformationTokens = 0;
// comment out for now because it's too confusing                if (Math.random < .2) numEntries += 1;
                /*
                    for (let tmpHelper in scene.helperIcons) {
                        if (tmpHelper.powerTokenType == 'type_2') {
                            tmpHelper.container.destroy();
                        }
                    };
                */
                // Restore all the old misinformation Tokens first
                for (let key in scene.sharedData.misinformation) {
                    // Look up the stored data
                    let storedData = scene.sharedData.misinformation[key];
                    //console.log(storedData);

                    // Use the stored data when creating the token
                    let misinformation = createPowerToken(scene, 'neutral', storedData.text, storedData.x, storedData.y, storedData, 'normal', true);
                    scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                    scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group
                    misinformation.container.misinformationIndex = storedData.misinformationIndex; // restore index too!
                    misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again
                }
            }

            // This block should run regardless of whether the scene has been created before
            // Function to create and place a single misinformation token
            function createMisinformationToken(scene, data, index) {
                let xOffset = data.type === 'maga' ? scene.sys.game.config.width * .39 : scene.sys.game.config.width * .625;
                let yOffset = data.type === 'maga' ? scene.yMagaOffset : scene.yWokeOffset;

                // Store the position data
                let storedData = {
                    x: xOffset,
                    y: yOffset,
                    type: data.type,
                    text: data.text,
                    misinformationIndex: index
                };

                scene.sharedData.misinformation[index] = storedData;

                let misinformation = createPowerToken(scene, 'neutral', data.text, xOffset, yOffset, storedData, 'normal', false, 'drop once');
                scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group

                misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again

                misinformation.container.misinformationIndex = index;

                // Increment the corresponding offset for next time
                if (data.type === 'maga') {
                    scene.yMagaOffset += misinformation.container.displayHeight;
                    if (scene.yMagaOffset > scene.game.config.height * .9) {
                        scene.yMagaOffset -= scene.game.config.height * .7;
                    }
                    console.log('new yMagaOffset = ' + scene.yMagaOffset + ' .8 height is ' + (scene.game.config.height * .8).toString());
                } else {
                    scene.yWokeOffset += misinformation.container.displayHeight;
                    if (scene.yWokeOffset > scene.game.config.height * .9) {
                        scene.yWokeOffset -= scene.game.config.height * .7;
                    }
                    console.log('new yWokeOffset = ' + scene.yWokeOffset + ' .8 height is ' + (scene.game.config.height * .8).toString());
                }
            }

            let delay = 500; // 0.5 seconds

            for (let i = 0; i < numEntries; i++) {
                if (scene.currentMisinformationIndex < misinformationData.length) { // if we haven't reached the end of the array
                    let currentIndex = scene.currentMisinformationIndex;
                    let data = misinformationData[currentIndex]; // Capture the correct data

                    scene.time.addEvent({
                        delay: i * delay + numEntries*500,
                        callback: function() {
                            createMisinformationToken(scene, data, currentIndex);
                        },
                        callbackScope: scene
                    });

                    scene.currentMisinformationIndex++; // Increment the index after capturing the correct data
                }
            }
        }
        //====================================================================================
        //
        // Helper function to handle common overlap logic between Helpful Token and icon
        //
        //====================================================================================

        function handleHelperOverlap(icon, base, helper, incrementAmount, faction, gauge, message) {
            let iconColor = faction === 'maga' ? 'red' : 'blue';
            // This where we apply the various actions based on attributes contributed by the represented character's power
            // Do the appropriate thing depending on the helper type
            if (helper.container.character.powerTokenType == 'type_3') {
                let helpedIcon = icon;
                let tmpChar = helper.container.character;
                tmpChar.shortstory = [('Russian Troll Farm Firewall is enabled: ' + helpedIcon.iconTitle + ' '),
                    "is temporarily immune to all political attacks"];
                //tmpChar.shortstory = helpedIcon.iconText + ','+helpedIcon.iconTitle+ ' is immune to all attacks!';
                let tooltip = createTooltip(scene, tmpChar, helpedIcon.icon.x, helpedIcon.icon.y+150, helpedIcon.icon);
                scene.icons[icon.iconName].shieldStrength = scene.difficultyLevel().hackerShieldStrength // Hacker changes shield strength
                helpedIcon.icon.shieldWoke.setAlpha(0.5);
                scene.time.delayedCall(5000, () => {
                    tooltip.text.setVisible(false);
                    tooltip.box.setVisible(false);
                });
                scene.tweens.add({
                    targets: helper.container,
                    alpha: 0,
                    scaleX: 0, // start scaling to 0% of the original size
                    scaleY: 0, // start scaling to 0% of the original size
                    duration: 800,
                    onComplete: function () {
                        helper.container.destroy();
                    },

                    callbackScope: scene
                });

                scene.tweens.add({
                    targets: helpedIcon.shieldWoke,
                    alpha: 1,
                    ease: 'Sine.easeInOut',
                    duration: 500,
                    delay: 0,
                    yoyo: true,  // after going up, go back down
                    repeat: 2,
                    //onComplete: function () {
                        //helpedIcon.shieldMaga.setAlpha(0.1);
                    //    helper.container.destroy();
                    //},
                    callbackScope: scene
                });

                if (!helper.isDestroyed) {
                    console.log(helper.container.character.powerTokenType);
                    delete scene.sharedData.helperTokens[helper.container.character.name];

                    let hurtIcon = scene.icons[helper.container.character.hurts];
                    let territory = territories[3]; // random territory
                    scene.createThreat(territory, helper.container.character.faction, hurtIcon, 5);
                    scene.drawGauges(scene, hurtIcon.icon.x, hurtIcon.icon.y, hurtIcon.maga, hurtIcon.woke, hurtIcon.health, hurtIcon.healthScale, hurtIcon.gaugeMaga, hurtIcon.gaugeWoke, hurtIcon.gaugeHealth, hurtIcon.scaleSprite, hurtIcon.littleHats);

                    tooltip.text.setVisible(true);
                    tooltip.box.setVisible(true);
                    helper.isDestroyed = true;
                }

                //console.log(helpedIcon.shieldMaga);
                //console.log(icon.iconName + ' ' + scene.icons[icon.iconName]);
            }
            if (helper.container.character.powerTokenType == 'type_5') {
                //console.log(scene.icons[helper.container.character.hurts][helper.container.character.faction]);
                // The helper token's representative character's help icon matches the icon into which it's been dropped.
                if (helper.container.character.helps == icon.iconName) {
                    let helpedIcon = scene.icons[helper.container.character.helps];
                    let tooltip = createTooltip(scene, helper.container.character, 500, 500, helpedIcon.icon, helpedIcon.iconText);
                    scene.time.delayedCall(5000, () => {
                        tooltip.text.setVisible(false);
                        tooltip.box.setVisible(false);
                    });

                    scene.tweens.add({
                        targets: helper.container,
                        alpha: 0,
                        scaleX: 0, // start scaling to 0% of the original size
                        scaleY: 0, // start scaling to 0% of the original size
                        duration: 800,
                        onComplete: function () {
                            helper.container.destroy();
                        },
                        callbackScope: scene
                    });

                    if (!helper.isDestroyed) {
                        // The health of the 'helps' icon is improved
                        icon.health += incrementAmount;
                        console.log(helper.container.character.powerTokenType);
                        // Check to see if we win
                        let win = true;
                        for (let key in scene.sharedData.icons) {
                            let iconData = scene.sharedData.icons[key];
                            if (iconData.health/iconData.healthScale < 90) {
                                win = false;
                            }
                        }
                        if (win == true) {
                            console.log('You Win!');
                            scene.cameras.main.fadeOut(1000, 0, 0, 0);
                            scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                                scene.scene.get('VictoryScene').setup(scene.sharedData);
                                scene.scene.start('VictoryScene', { showScore: true, message: 'You Win!\nIn the year ' + scene.sharedData.year + '\nAll Aspects of society are Excellent\nand at 100%!'});
                            });
                            helper.isDestroyed = true;
                            return;
                        }
                        // Bonus: Someone of your own faction can reduce the MAGAness or Wokeness of your own faction.
                        // Imagine the scenario of a bunch of angry MAGA protesters storming around the environment icon and some
                        // super MAGA supporter shows up and provides an environmental solution they like.  That would reduce MAGAness.
                        // This feature might be too confusing and should just be removed from the game?
                        let otherFaction = helper.container.character.faction == 'maga' ? 'woke' : 'maga';
                        if (icon[helper.container.character.faction]> icon[otherFaction]) {
                            let numReturns = Math.min(5,(icon[helper.container.character.faction] -  icon[otherFaction])/5);
                            let territory = territories[4]; // arbitrarily picked this territory to return to
                            console.log('return '+numReturns+' threats');
                            scene.returnThreat(territory, helper.container.character.faction, helpedIcon, numReturns);
                            //icon[helper.container.character.faction] = icon[otherFaction];
                        }
                        scene.drawGauges(scene, helpedIcon.icon.x, helpedIcon.icon.y, helpedIcon.maga, helpedIcon.woke, helpedIcon.health, helpedIcon.healthScale, helpedIcon.gaugeMaga, helpedIcon.gaugeWoke, helpedIcon.gaugeHealth, helpedIcon.scaleSprite, helpedIcon.littleHats);
                        // Delete data from sharedData.helperTokens
                        console.log('delete name ' + helper.container.character.name);
                        delete scene.sharedData.helperTokens[helper.container.character.name];
                        let hurtIcon = scene.icons[helper.container.character.hurts];
                        let territory = territories[3]; // arbitrarily picked this territory to launch from
                        // But we also launch 5 faction threats at the 'hurts' icon
                        console.log('character ' + helper.container.character.name + ' launches 5 threats');
                        scene.createThreat(territory, helper.container.character.faction, hurtIcon, 5);
                        scene.drawGauges(scene, hurtIcon.icon.x, hurtIcon.icon.y, hurtIcon.maga, hurtIcon.woke, hurtIcon.health, hurtIcon.healthScale, hurtIcon.gaugeMaga, hurtIcon.gaugeWoke, hurtIcon.gaugeHealth, hurtIcon.scaleSprite, hurtIcon.littleHats);
                        tooltip.text.setVisible(true);
                        tooltip.box.setVisible(true);
                        if (icon.iconName == 'military' && !scene.difficultyLevel().militaryAutoSpend) {
                            scene.militaryAllocation = true;
                            scene.totalMilitaryAllocThisScene += scene.difficultyLevel().militaryAllocationAmount;
                        }
                        helper.isDestroyed = true;
                    }
                }
            }
        }

        //
        // Helper function to handle common overlap logic between insurrectionist and icon
        //
        function handleOverlap(icon, defense, threat, incrementAmount, type, gauge, message) {
            let iconColor = type === 'maga' ? 'red' : 'blue';

            // threat should slowly fade away
            scene.tweens.add({
                targets: threat,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 200,
                onComplete: function () {
                    threat.setAlpha(0);
                    threat.destroy();
                },
                callbackScope: scene
            });

            if (!threat.isDestroyed) {
                icon[type] += incrementAmount;
                if (icon.maga > icon.woke) {iconColor = 'red'; message = '\nToo much MAGA!';}
                else if (icon.maga < icon.woke) {iconColor = 'blue'; message = '\nToo much Wokeness!';}
                else if (icon.maga == icon.woke) {
                    icon.health += 1 * icon.healthScale;
                    iconColor = 'purple';
                }
                icon.littleHats = scene.drawHealthGauge(scene, icon[type]/ 100,defense.x,defense.y, type, gauge, icon['maga'], icon['woke'], icon.scaleSprite, icon.littleHats);
                scene.drawHealthGauge(scene, icon.health/ icon.healthScale/ 100, defense.x, defense.y, 'Health', icon.gaugeHealth);
                icon.iconText.setText(icon.textBody + message);
                hitIcon(icon.iconText, iconColor);
                threat.isDestroyed = true;
                scene.roundThreats--;
            }
        }

        //let scene = this;
/*
        scene.helperIcons.getChildren().forEach(function(helper) {
            helper.setInteractive();

            helper.on('pointerup', function(pointer) {
                let icon = scene.icons.find(icon => Phaser.Geom.Intersects.RectangleToRectangle(icon.icon.getBounds(), helper.getBounds()));
                if (icon) {
                    handleHelperOverlap(icon, icon.icon, helper, 10, '', icon.gaugeWoke, '');
                }
            });
        });

 */
        // Go through all of the societal aspect Icons and set up interactions with various threats
        for (let key in scene.sharedData.icons) {
            let icon = scene.sharedData.icons[key];

/*
            icon.icon.setInteractive();

            icon.icon.on('pointerup', function(pointer) {
            console.log('here');
                let helper = scene.helperIcons.getChildren().find(child => child.body.hitTest(pointer.x, pointer.y));
                if (helper) {
                console.log(helper);
                    handleHelperOverlap(icon, icon.icon, helper, 10, '', icon.gaugeWoke, '');
                }
            });
 */
             //====================================================================================
             //
             //             findValidTerritory(thisFaction, otherFaction)
             //
             //====================================================================================
             let findValidTerritory = (thisFaction, otherFaction) => {
                 let generateNumber = (n) => Math.floor((n + 1) / 2) * (n % 2 === 0 ? 1 : -1);
                 let count = 0;
                 let attackIndex = 3;
                 let roundRobinLaunch = 0;
                 let base = territories[Phaser.Math.Wrap((attackIndex + generateNumber(roundRobinLaunch)) % territories.length, 0, territories.length)];
                 while (base.faction != thisFaction && base.faction != otherFaction) {
                     // pick a new territory
                     roundRobinLaunch++;
                     base = territories[Phaser.Math.Wrap((attackIndex + generateNumber(roundRobinLaunch)) % territories.length, 0, territories.length)];
                     if (count++ > 16) {
                         console.log('something went wrong.  got stuck in looking for a new territory.');
                         break;
                     }
                 }
                 return base;
             }
            // New concept: if you drop a Defense into an icon, it will remove some hats
            scene.physics.add.overlap(icon.icon, scene.magaDefenses, function(base, helper) {
                console.log('delete index ' + helper.container.misinformationIndex);
                let infoToken = scene.sharedData.misinformation[helper.container.misinformationIndex];
                //let otherFaction = infoToken.type == 'maga' ? 'woke' : 'maga';

                delete scene.sharedData.misinformation[helper.container.misinformationIndex];
                helper.container.destroy();

                //console.log('icon faction = '+icon[infoToken.type]+' other faction = '+icon[otherFaction]);
                //let numReturns = Math.min(5,icon.maga/5);
                let validTerritory = findValidTerritory('maga', 'maga');
                if (icon.maga > icon.woke) {
                    let numReturns = Math.min(5,Math.max(0, icon.maga/5 -  icon.woke/5));
                    scene.returnThreat(validTerritory, 'maga', icon, numReturns);
                } else if (icon.woke > icon.maga){
                    let numReturns = Math.min(5,Math.max(0, icon.woke/5 -  icon.maga/5));
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                } else {
                    let numReturns = Math.min(5,icon.woke/5);
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                    scene.time.delayedCall(300, () => {
                        let numReturns = Math.min(5,icon.maga/5);
                        scene.returnThreat(validTerritory, 'maga', icon, numReturns);
                    });
                }
            });

            scene.physics.add.overlap(icon.icon, scene.wokeDefenses, function(base, helper) {
                console.log('delete index ' + helper.container.misinformationIndex);
                let infoToken = scene.sharedData.misinformation[helper.container.misinformationIndex];
                //let otherFaction = infoToken.type == 'maga' ? 'woke' : 'maga';

                delete scene.sharedData.misinformation[helper.container.misinformationIndex];
                helper.container.destroy();

                let numReturns = Math.min(5,Math.max(0, icon.woke/5 -  icon.maga/5));
                let validTerritory = findValidTerritory('woke', 'woke');
                if (icon.maga > icon.woke) {
                    let numReturns = Math.min(5,Math.max(0, icon.maga/5 -  icon.woke/5));
                    scene.returnThreat(validTerritory, 'maga', icon, numReturns);
                } else if (icon.woke > icon.maga){
                    let numReturns = Math.min(5,Math.max(0, icon.woke/5 -  icon.maga/5));
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                } else {
                    let numReturns = Math.min(5,icon.woke/5);
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                    scene.time.delayedCall(300, () => {
                        let numReturns = Math.min(5,icon.maga/5);
                        scene.returnThreat(validTerritory, 'maga', icon, numReturns);
                    });
                }

            });

            scene.physics.add.overlap(icon.icon, scene.helperIcons, function(base, helper) {
                handleHelperOverlap(icon, base, helper, 70, '', icon.gaugeWoke, '');
            });

            // Handle all wokeThreats interactions with this icon.  Beginner level has less impact
            scene.physics.add.overlap(icon.icon, scene.wokeThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 3 + scene.difficultyLevel().multiplier, 'woke', icon.gaugeWoke, '\nToo much Wokeness!');
            });

            // Handle all magaThreats interactions with this icon. Beginner level has less impact
            scene.physics.add.overlap(icon.icon, scene.magaThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 3 + scene.difficultyLevel().multiplier, 'maga', icon.gaugeMaga, '\nMake America Great Again!');
            });

            // Handle all PutieThreats interaction with this icon.
            scene.physics.add.overlap(icon.icon, scene.putieThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 1 + scene.difficultyLevel().multiplier/2, 'maga', icon.gaugeMaga, '\nToo Much Putin!');
                if (!threat.isPutieDestroyed) {
                    threat.isPutieDestroyed = true;
                    icon['woke'] += 1 + scene.difficultyLevel().multiplier/2;
                    icon.littleHats = scene.drawHealthGauge(scene, icon['woke']/ 100,defense.x,defense.y, 'woke', icon.gaugeWoke, icon['maga'],icon['woke'], icon.scaleSprite, icon.littleHats);
                }
            });
        }
        //====================================================================================
        // function createPowerToken(scene)
        // function that createPowerToken text, rectangle, and dragability
        //
        // This function can be called to either create a 'misinformation token' or a 'helpful token'
        // When creating a helpful token, dropOnce is false because it can be moved around as much as you want
        //
        // size: 'normal' or 'large'.  Large creates a big box that tweens away slowly
        // hasBeenCreatedBefore: true means that it is static and cannot be dragged around
        // dropOnce: true means that it can be dragged into one position and then can becomes static, no longer can be moved
        //
        //====================================================================================

        function createPowerToken(scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce, tokenIcon) {
            let factionColor = faction === 'maga'
                ? '0xff0000'
                : faction === 'woke'
                    ? '0x0000ff'
                    : '0x800080';
            let fillColor = faction === 'maga'
                ? '#ffffff'
                : faction === 'woke'
                    ? '#ffffff'
                    : '#80ff80';
            // Add text to the rectangle
            let text = scene.add.text(0, 0, message, { align: 'center', fill: fillColor }).setOrigin(0.5, 0.5);
            if (size == 'large' ) {text.setFontSize(36);}

            // Create a larger white rectangle for outline
            let outline = scene.add.rectangle(0, 0, text.width+4, text.height+4, 0xffffff);
            // Create a tween that scales the rectangle up and down
            let outlineTween = scene.tweens.add({
                targets: outline, // object that the tween affects
                scaleX: 1.2, // start scaling to 120% of the original size
                scaleY: 1.2, // start scaling to 120% of the original size
                duration: 1000, // duration of scaling to 120% will be 1 second
                ease: 'Linear', // type of easing
                yoyo: true, // after scaling to 120%, it will scale back to original size
                loop: -1, // -1 means it will loop forever
            });
            // Create a smaller factionColor rectangle
            let rectangle = scene.add.rectangle(0, 0, text.width, text.height, factionColor);
            // Create a tween that scales the rectangle up and down
            let rectangleTween = scene.tweens.add({
                targets: rectangle, // object that the tween affects
                scaleX: 1.2, // start scaling to 120% of the original size
                scaleY: 1.2, // start scaling to 120% of the original size
                duration: 1000, // duration of scaling to 120% will be 1 second
                ease: 'Linear', // type of easing
                yoyo: true, // after scaling to 120%, it will scale back to original size
                loop: -1, // -1 means it will loop forever
            });


            // Create a sprite for physics and bouncing
            let misinformationSprite = scene.physics.add.sprite(0, 0, 'track');
            misinformationSprite.setVisible(false); // Hide it, so we only see the graphics and text
            misinformationSprite.setDepth(1);

            let misinformation;

            // Group the text, outline, and rectangle into a single container
            if (tokenIcon) { // ... and group tokenIcon too if it exists
                let tokenIconTween = scene.tweens.add({
                    targets: tokenIcon, // object that the tween affects
                    scaleX: tokenIcon._scaleX * 1.2, // start scaling to 120% of the original size
                    scaleY: tokenIcon._scaleY * 1.2, // start scaling to 120% of the original size
                    duration: 1000, // duration of scaling to 120% will be 1 second
                    ease: 'Linear', // type of easing
                    yoyo: true, // after scaling to 120%, it will scale back to original size
                    loop: -1, // -1 means it will loop forever
                });
                rectangle.setSize(text.width, text.height+tokenIcon.displayHeight);
                outline.setSize(text.width+4, text.height+4+tokenIcon.displayHeight);
                text.y += tokenIcon.displayHeight/2;
                //rectangle.x adjustment??
                misinformation = scene.add.container(x, y-tokenIcon.displayHeight/2, [outline, rectangle, text, tokenIcon, misinformationSprite]);
                misinformation.setSize(outline.width, outline.height+tokenIcon.displayHeight);
            } else {
                misinformation = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);
                misinformation.setSize(outline.width, outline.height);
            }
            // Set the size of the container to match the size of the outline rectangle
            //misinformation.setSize(outline.width, outline.height);
            misinformationSprite.setScale(.6);
            //misinformationSprite.setSize(outline.width*.1, 1);

            // Now that the container has a size, it can be made interactive and draggable
            misinformation.setInteractive({ draggable: true });
            // Attach the container to the sprite
            misinformationSprite.container = misinformation;
            if (size == 'large' ) {misinformation.setDepth(1);}
            // Listen to the 'drag' event
            misinformation.on('drag', function(pointer, dragX, dragY) {
                this.x = dragX;
                this.y = dragY;
                storedData.x = dragX;
                storedData.y = dragY;
                misinformationSprite.setImmovable(true);
            });
            if (0) { // skip the dropOnce concept dropOnce == 'drop once') {
                misinformation.on('dragend', function(pointer, dragX, dragY) {
                    outlineTween.stop();
                    rectangleTween.stop();
                    this.disableInteractive();
                    misinformationSprite.setImmovable(true);
                    let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                    rectangle.setFillStyle(0x228B22); // Now the rectangle is forest green
                });
            }
            if (hasBeenCreatedBefore == true && scene.difficultyLevel().multiplier != 1) {
                outlineTween.stop();
                rectangleTween.stop();
                misinformation.disableInteractive();
                misinformationSprite.setImmovable(true);
                let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                rectangle.setFillStyle(0x228B22); // Now the rectangle is green
            }

            return {
                container: misinformation,
                sprite: misinformationSprite
            };
        }

        //====================================================================================
        // Function:
        //      hitIcon()
        //      Change the text to iconColor for a little while when the icon is hit
        //
        //====================================================================================
        let hitIcon = (iconText, iconColor) => {
            // Change text color to other color
            iconText.setColor(iconColor);

            // Set a timed event to change the color back to white after 500ms
            this.time.delayedCall(50000, function() {
                iconText.setColor('white');
            });
        };

        function updateCharVal(character, value, characterText) {
            let undoCheck = false;

            MAGAupdate = WokeUpdate = 0;

            // Calculate MAGAupdate/WokeUpdate here
            if (character.faction == 'maga') {
                MAGAupdate = (value - character.prevValue)*4;
                WokeUpdate = 0;
            } else {
                WokeUpdate = (value - character.prevValue)*4;
                MAGAupdate = 0;
            }
            //characterText.setText(character.name + '\nEndorsed: ' + (value ? 'yes': 'no') + ',\nBacking: ' + (character.endorsement + value).toString());
            let healthTextRange = ['None', 'Endorsed', 'Fully Endorsed'];
            let healthText = healthTextRange[Phaser.Math.Clamp((character.endorsement + value),0,2)];
            characterText.setText(character.name + ',\nBacking: ' + healthText);

            // Update MAGAnessText and WokenessText here
            let tmpMAG = scene.MAGAness - MAGAupdate;
            let tmpWok = scene.Wokeness - WokeUpdate;

            if (character.faction == 'maga' && tmpMAG < 0) {
                if (tmpWok >= -tmpMAG) {
                    tmpWok -= -tmpMAG;
                    tmpMAG = 0;
                    console.log('new tmpWok is '+ tmpWok);
                } else {
                    tmpMAG = scene.MAGAness;
                    MAGAupdate = 0;
                    undoCheck = true;

                    if (MAGAupdate/4 >= 1) {
                        value = MAGAupdate/4 + character.prevValue;
                    } else {
                        value = character.prevValue;
                    }
                    console.log('MAGAupdate = ' + MAGAupdate + ' character value = ' + value);
                    let healthTextRange = ['None', 'Endorsed', 'Fully Endorsed'];
                    let healthText = healthTextRange[Phaser.Math.Clamp((character.endorsement + value),0,2)];
                    characterText.setText(character.name + ',\nBacking: ' + healthText);
                    //this.x = (this.track.x - this.track.width / 2) + (value * stepSize)+12;
                }
            }

            if (character.faction == 'woke' && tmpWok < 0) {
                if (tmpMAG >= -tmpWok) {
                    tmpMAG -= -tmpWok;
                    tmpWok = 0;
                    console.log('new tmpMag is ' + tmpMAG);
                } else {
                    tmpWok = scene.Wokeness;
                    WokeUpdate = 0;
                    undoCheck = true;

                    if (WokeUpdate/4 >= 1){
                        value = WokeUpdate/4 + character.prevValue;
                    } else {
                        value = character.prevValue;
                    }
                    let healthTextRange = ['None', 'Endorsed', 'Fully Endorsed'];
                    let healthText = healthTextRange[Phaser.Math.Clamp((character.endorsement + value),0,2)];
                    characterText.setText(character.name + '\nBacking: ' + healthText);
                    //this.x = (this.track.x - this.track.width / 2) + (value * stepSize)+12;
                }
            }
            if (character.endorsement + value > 1) {
                characterText.setColor('#00ff00');
                //checkboxBackground.setColor(0x00ff00); // figure this out later
            } else {
                let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
                characterText.setColor(textColor);
                //checkboxBackground.setColor(0xffffff); // figure this out later
            }

            scene.polCapText.setText('Political Capital ' + Math.floor((tmpMAG+tmpWok)).toString());
            scene.polCapText.setColor('#00ff00'); // Change text color back to green
            scene.polCapText.setBackgroundColor('#000000'); // Change background color back to black

            // Save the previous value for next calculation
            character.prevValue = value;

            // Update MAGAness and Wokeness with new values.  Make sure they are integers
            scene.MAGAness = Math.floor(tmpMAG);
            scene.Wokeness = Math.floor(tmpWok);

            return undoCheck;
        }

        function createCheckbox(scene, x, y, character, characterText, callback, initialValue) {
            let textColor = character.faction === 'maga' ? 0xff4040 : 0x8080ff;

            let checkboxBackground = scene.add.graphics({ fillStyle: { color: textColor } });
            let checkboxSize = 32;  // Specify the size of your checkbox here
            checkboxBackground.fillRect(x-checkboxSize/2, y-checkboxSize/2, checkboxSize, checkboxSize-4);  // Replace x and y with the coordinates where you want to draw the square

            // Add ability to check the box by clicking on the character text too
            characterText.setInteractive();
            characterText.on('pointerdown', chooseAction);

            let checkboxUnchecked = scene.add.sprite(x, y, 'checkboxUnchecked').setInteractive().setScale(.15);
            let checkboxChecked = scene.add.sprite(x, y, 'checkboxChecked').setVisible(false).setInteractive().setScale(.15);

            checkboxUnchecked.on('pointerdown', checkboxUncheckedAction);
            checkboxChecked.on('pointerdown', checkboxCheckedAction);

            function chooseAction() {
                if (character.value == 1) {
                    checkboxCheckedAction();
                } else {
                    checkboxUncheckedAction();
                }
            }
            function checkboxUncheckedAction() {
                checkboxUnchecked.setVisible(false);
                checkboxChecked.setVisible(true);
                // Calculate and return the value
                let value = 1;

                // Update the underlying character's value
                character.value = value;

                let undoCheck = updateCharVal(character, value, characterText);
                if (undoCheck === true) {
                    checkboxUnchecked.setVisible(true);
                    checkboxChecked.setVisible(false);
                    character.value = 0;
                } else { // a roundabout way of setting character.backing to parameter value which is 1.
                    callback(character, 1);
                }
            }
            function checkboxCheckedAction() {
                checkboxChecked.setVisible(false);
                checkboxUnchecked.setVisible(true);
                // Calculate and return the value
                let value = 0;

                // Update the underlying character's value
                character.value = value;

                let undoCheck = updateCharVal(character, value, characterText);
                if (undoCheck == true) {
                    checkboxChecked.setVisible(true);
                    checkboxUnchecked.setVisible(false);
                    character.value = 1;
                } else { // a roundabout way of setting character.backing to parameter value which is 0.
                    callback(character, 0);
                }
            }

            // Initial checkbox state
            if(initialValue) {
                let undoCheck;

                checkboxUnchecked.setVisible(false);
                checkboxChecked.setVisible(true);
                let value = 1;

                // Update the underlying character's value
                character.value = value;
                if (character.endorsement + value > 2){
                    undoCheck = true;
                } else {
                    // If we are out of political capital, undo the check
                    undoCheck = updateCharVal(character, value, characterText);
                }
                if (undoCheck == true) {
                    checkboxUnchecked.setVisible(true);
                    checkboxChecked.setVisible(false);
                    character.value = 0;
                    character.backing = 0; // not sure this is necessary but can't hurt
                } else { // a roundabout way of setting character.backing to parameter value of 1.
                    callback(character, 1);
                }
            }

            createCharacterTooltip(scene, character, x, y, checkboxUnchecked, characterText);
/*
            // Blink only this checkbox on and off 3 times
            let toggleCount = 0;
            const maxToggles = 3; // Blink 3 times (each blink consists of two toggles)

            const toggleCheckbox = () => {
                if (toggleCount < maxToggles) {
                    if (checkboxUnchecked.visible) {
                        checkboxUncheckedAction();
                    } else {
                        checkboxCheckedAction();
                    }
                    toggleCount++;
                }
                else {
                    checkboxCheckedAction();
                    toggleEvent.remove(); // Remove the event after the desired number of toggles
                }
            };

            const toggleEvent = scene.time.addEvent({
                delay: 1000, // Delay in milliseconds
                callback: toggleCheckbox,
                loop: true
            });
*/
            return { checkboxUnchecked, checkboxChecked, checkboxUncheckedAction, checkboxCheckedAction };
        }

        function startBlinkingCheckbox(scene, checkboxUnchecked, checkboxChecked, checkboxUncheckedAction, checkboxCheckedAction) {
            let toggleCount = 0;
            const maxToggles = 6; // Blink 3 times (each blink consists of two toggles)

            const toggleCheckbox = () => {
                if (toggleCount < maxToggles) {
                    if (checkboxUnchecked.visible) {
                        checkboxUncheckedAction();
                    } else {
                        checkboxCheckedAction();
                    }
                    toggleCount++;
                } else {
                    checkboxCheckedAction();
                    toggleEvent.remove(); // Remove the event after the desired number of toggles
                }
            };

            const toggleEvent = scene.time.addEvent({
                delay: 1000, // Delay in milliseconds
                callback: toggleCheckbox,
                loop: true
            });
        }



        //====================================================================================
        // Function:
        //      createSlider
        //
        //====================================================================================
        function createSlider(scene, x, y, character, characterText, callback, initialValue) {
            let track = scene.add.sprite(x, y, 'track');
            let slider = scene.add.sprite(x, y, 'handle').setInteractive();
            scene.input.setDraggable(slider);
            // Attach track to slider
            slider.track = track;

            let numberOfSteps = 7; // Define the number of steps
            let stepSize = (track.width-20) / (numberOfSteps - 1); // Calculate the size of each step

            // Calculate the initial slider position based on the initial value
            let initialStep = Math.round(initialValue * (numberOfSteps - 1));
            slider.x = (track.x - track.width / 2) + (initialStep * stepSize) + 12;

            slider.on('drag', function(pointer, dragX, dragY) {
                // Calculate the closest step
                let closestStep = Math.round((dragX - (this.track.x - this.track.width / 2)-12) / stepSize);

                // Clamp the value to make sure it stays within the track
                closestStep = Phaser.Math.Clamp(closestStep, 0, numberOfSteps - 1);

                // Calculate the new X position of the slider
                let newSliderX = (this.track.x - this.track.width / 2) + (closestStep * stepSize)+12;

                // Update the slider's position
                this.x = newSliderX;

                // Update the text dynamically as the slider is being dragged
                characterText.setText(character.name + '\nBacking: ' + closestStep + '/ 6,\nEndorsement: ' + character.endorsement);
                if (character.endorsement + closestStep > 10) {
                    characterText.setColor('#00ff00');
                    this.track.setTint(0x00ff00);
                } else {
                    let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
                    characterText.setColor(textColor);
                    this.track.setTint(0xffffff);
                }

                // Calculate MAGAupdate/WokeUpdate here
                if (character.faction == 'maga') {
                    MAGAupdate = (closestStep - character.prevValue);
                    WokeUpdate = 0;
                } else {
                    WokeUpdate = (closestStep - character.prevValue);
                    MAGAupdate = 0;
                }
                // Update MAGAnessText and WokenessText here
                let tmpMAG = scene.MAGAness - MAGAupdate;
                let tmpWok = scene.Wokeness - WokeUpdate;
                this.polCapText.setText('Political Capital ' + Math.floor((tmpMAG+tmpWok)).toString());
                this.polCapText.setColor('#ff0000'); // Change text color to red
                this.polCapText.setBackgroundColor('#ffff00'); // Change background color to yellow
            });

            slider.on('dragend', function(pointer, dragX, dragY) {
                // Calculate the closest step
                let closestStep = Math.round((this.x - (this.track.x - this.track.width / 2)-12) / stepSize);

                // Clamp the value to make sure it stays within the track
                closestStep = Phaser.Math.Clamp(closestStep, 0, numberOfSteps - 1);

                // Calculate and return the value
                let value = closestStep;

                // Update the underlying character's value
                character.value = value;

                MAGAupdate = WokeUpdate = 0;

                // Calculate MAGAupdate/WokeUpdate here
                if (character.faction == 'maga') {
                    MAGAupdate = (value - character.prevValue);
                    WokeUpdate = 0;
                } else {
                    WokeUpdate = (value - character.prevValue);
                    MAGAupdate = 0;
                }

                // Update MAGAnessText and WokenessText here
                let tmpMAG = scene.MAGAness - MAGAupdate;
                let tmpWok = scene.Wokeness - WokeUpdate;

                if (character.faction == 'maga' && tmpMAG < 0) {
                    if (tmpWok >= -tmpMAG) {
                        tmpWok -= -tmpMAG;
                        tmpMAG = 0;
                        console.log('new tmpWok is '+ tmpWok);
                    } else {
                        if (0){//tmpWok > 0) { // can't get this to work
                            tmpMAG = tmpWok;
                            tmpWok = 0;
                            MAGAupdate = scene.MAGAness - tmpMAG;
                        } else {
                            MAGAupdate = scene.MAGAness;
                            tmpMAG = 0;
                        }

                        value = MAGAupdate + character.prevValue;
                        characterText.setText(character.name + '\nBacking: ' + value + '/ 6,\nEndorsement: ' + character.endorsement);
                        this.x = (this.track.x - this.track.width / 2) + (value * stepSize)+12;
                    }
                }

                if (character.faction == 'woke' && tmpWok < 0) {
                    if (tmpMAG >= -tmpWok) {
                        tmpMAG -= -tmpWok;
                        tmpWok = 0;
                        console.log('new tmpMag is ' + tmpMAG);
                    } else {
/*
                        if (tmpMAG > 0) {
                            tmpWok += tmpMAG;   // transfer as much of tmpMAG as possible to tmpWok
                            tmpMAG = 0;
                            if (tmpWok < 0) {  // if tmpWok is still negative, we can't update the Wokeness yet
                                Wokeupdate = scene.Wokeness;
                            } else {
                                Wokeupdate = scene.Wokeness - tmpWok;
                            }
                        } else {
                            Wokeupdate = scene.Wokeness;
                        }
 */
                        if (0){//tmpMAG > 0) { // can't get this to work
                            tmpWok = tmpMAG;
                            tmpMAG = 0;
                            WokeUpdate = scene.Wokeness - tmpWok;
                        } else {
                            WokeUpdate = scene.Wokeness;
                            tmpWok = 0;
                        }

                        value = WokeUpdate + character.prevValue;
                        characterText.setText(character.name + '\nBacking: ' + value + '/ 6,\nEndorsement: ' + character.endorsement);
                        this.x = (this.track.x - this.track.width / 2) + (value * stepSize)+12;
                    }
                }

                if (character.endorsement + value > 10) {
                    characterText.setColor('#00ff00');
                    this.track.setTint(0x00ff00);
                } else {
                    let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
                    characterText.setColor(textColor);
                    this.track.setTint(0xffffff);
                }

                this.polCapText.setText('Political Capital ' + Math.floor((tmpMAG+tmpWok)).toString());
                this.polCapText.setColor('#00ff00'); // Change text color back to green
                this.polCapText.setBackgroundColor('#000000'); // Change background color back to black

                // Save the previous value for next calculation
                character.prevValue = value;

                // Update MAGAness and Wokeness with new values.  Make sure they are integers
                scene.MAGAness = Math.floor(tmpMAG);
                scene.Wokeness = Math.floor(tmpWok);
            });

            createCharacterTooltip(scene, character, x, y, slider, characterText);

            return {track: track, slider: slider};

            //====================================================================================
            //  function mouseOver()
            //====================================================================================

            function mouseOver() {
                backstoryBox.setVisible(true);
                backstoryText.setVisible(true);
                //scene.yearTime.paused = true;
                //scene.envTime.paused = true;
                //scene.govTime.paused = true;
            }
            //====================================================================================
            //  function mouseOver()
            //====================================================================================

            function mouseOff() {
                backstoryBox.setVisible(false);
                backstoryText.setVisible(false);
                //scene.yearTime.paused = false;
                //scene.envTime.paused = false;
                //scene.govTime.paused = false;
            }
        }

        //====================================================================================
        //    function createTooltip(scene, character, x, y, slider, characterText)
        //====================================================================================
        function createTooltip(scene, character, x, y, slider, characterText) {
            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
            let xOffset = 0;//character.faction === 'maga' ? 320 : -320;

            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(character.shortstory.join(' '), 37);
            let backstoryText = scene.add.text(x+xOffset, y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(false);
            backstoryText.setDepth(2);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
            backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff4040 : 0x8080ff, 0.3);
            backstoryBox.isStroked = true;
            backstoryBox.setOrigin(0.5);
            backstoryBox.setVisible(false);
            //backstoryBox.setDepth(1);

            return {
                text: backstoryText,
                box: backstoryBox
            };
        }

        //====================================================================================
        //    function createCharacterTooltip(scene, character, x, y, slider, characterText)
        //====================================================================================

        function createCharacterTooltip(scene, character, x, y, slider, characterText) {

            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
            //let xOffset = character.faction === 'maga' ? scene.game.config.width * .4 : scene.game.config.width * -.24;
            let xOffset = character.faction === 'maga' ? 400 : -300;

            // Add an icon or graphic
            let helpedIcon;
            let tmpHelp = character.helps; // don't want to change character.helps permanently
            if (character.helps){
                helpedIcon = scene.sharedData.icons[character.helps];
                //console.log(character);
            } else {
                helpedIcon = scene.sharedData.icons['environment']; // placeholder for now for undefined helps
                if (character.powerTokenType == 'type_3') {
                    tmpHelp = 'hacker';
                    helpedIcon.scaleFactor = 0.19;
                    //console.log('hacker');
                } else {
                    tmpHelp = 'negotiation';
                    helpedIcon.scaleFactor = 0.13;
                    //console.log('negotiation');
                }
            }
            //console.log(helpedIcon);
            let graphicObject = tmpHelp;
            //console.log(graphicObject);

            // Add an icon or graphic and scale it
            let backstoryIcon = scene.add.image(x+xOffset, Math.min(scene.sys.game.config.height*.7,y), graphicObject);  // Position the icon at the original y position
            backstoryIcon.setScale(helpedIcon.scaleFactor);  // scale the icon
            backstoryIcon.setOrigin(0.5, 1);  // change origin to bottom center
            backstoryIcon.setVisible(false);
            backstoryIcon.setDepth(2);  // set depth below the text and above the bounding box

            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(character.shortstory.join(' '), 50);
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

            scene.isTweening = false;

            const mouseOver = () => {
                backstoryText.setVisible(true);
                backstoryBox.setVisible(true);
                backstoryIcon.setVisible(true);
                threatBounce(character);
            };

            const mouseOff = () => {
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
                backstoryIcon.setVisible(false);
                let helpedIcon = scene.icons[character.helps];
                if (helpedIcon) {
                    helpedIcon.icon.shieldWoke.setAlpha(helpedIcon.icon.shieldStrength > 0 ? 0.25:0);
                    helpedIcon.icon.shieldMaga.setAlpha(helpedIcon.icon.shieldStrength > 0 ? 0.25:0);
                }
                let hurtIcon = scene.icons[character.hurts];
                if (hurtIcon){
                    hurtIcon.icon.shieldMaga.setAlpha(hurtIcon.icon.shieldStrength*0.1).setTint(0xffffff);
                    hurtIcon.icon.shieldWoke.setAlpha(hurtIcon.icon.shieldStrength*0.1).setTint(0xffffff);
                }
                if (scene.isTweening && scene.myTween) {
                    scene.myTween.complete();
                }
                if (scene.isTweening && scene.myTween2) {
                    scene.myTween2.complete();
                }
            };

            slider.on('pointerover', mouseOver);
            characterText.on('pointerover', mouseOver);

            slider.on('pointerout', mouseOff);
            characterText.on('pointerout', mouseOff);

            function threatBounce(character) {
                //let helpedIcon = scene.icons[character.helps];
                let hurtIcon = scene.icons[character.hurts];

                //let helpedIcon = scene.sharedData.icons.find(asset => asset.iconName === character.helps);
                let helpedColor = 0xffffff;
                let hurtColor = 0xffffff;
                let originalScale = 0.1;
                if (character.faction == 'maga') {
                    helpedColor = 0x0000ff;
                    hurtColor = 0xff0000;
                    if (!scene.isTweening) {
                        let sprite = territories[2].sprite;
                        let originalY = sprite.y;
                        let originalScale = sprite.scale;
                        scene.isTweening = true;
                        scene.myTween = scene.tweens.add({
                            targets: sprite,
                            y: sprite.y - 20,
                            scale: originalScale * 2, // Double the scale. Adjust this value for a bigger or smaller bounce.
                            duration: 200,
                            yoyo: true,
                            repeat: 2,
                            ease: 'Bounce',
                            onComplete: () => {
                                scene.isTweening = false;
                                sprite.y = originalY;
                                sprite.scale = originalScale;
                            }
                        });
                    }
                } else if (character.faction == 'woke') {
                    helpedColor = 0xff0000;
                    hurtColor = 0x0000ff;
                    if (!scene.isTweening) {
                        let sprite = territories[3].sprite;
                        let originalY = sprite.y;
                        let originalScale = sprite.scale;
                        scene.isTweening = true;
                        scene.myTween = scene.tweens.add({
                            targets: sprite,
                            y: sprite.y - 20,
                            scale: originalScale * 2, // Double the scale. Adjust this value for a bigger or smaller bounce.
                            duration: 200,
                            yoyo: true,
                            repeat: 2,
                            ease: 'Bounce',
                            onComplete: () => {
                                scene.isTweening = false;
                                sprite.y = originalY;
                                sprite.scale = originalScale;

                            }
                        });
                    }
                }
                // Provide a hint by changing the tint of the shield of the helped and hurt Icons
                // doesn't matter at this point which shield it is since they are on top of each other
                if (hurtIcon) {
                    hurtIcon.icon.shieldMaga.setAlpha(1).setTint(hurtColor);
                }
            }
        }

        // the very end of create()
        this.hasBeenCreatedBefore = true;
    }

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
