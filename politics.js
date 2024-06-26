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
import { CharacterIntroductionScene } from './characterUtils.js';
import { renderCharacters } from './politicsUtils.js';
import { insertLineBreaks } from './politicsUtils.js';
import { startNextScene } from './politicsUtils.js';
import { secondScreenTutorial} from './tutorial.js';
import { displayTutorial } from './tutorial.js';
import { drawArrow } from './tutorial.js';

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

const ICON_MARGIN = 10;
const GAUGE_HEIGHT = 50;
const ICON_SPACING = 10;
const ICON_SCALE = 0.03;

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
            militaryAllocation: false,
            littleHats: {},
            totalPoliticalCapital: 0
        };
        // hack: decrease all character's endorsements by 3
        characters.forEach((character, index) => {
            character.endorsement = 0;
        });
        this.misinformationTokens = []; // Initialize the stack to store tokens
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

            this.totalPoliticalCapital = this.sharedData.totalPoliticalCapital;
            this.recreateIcons();
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
        this.nextButton.on('pointerdown', () => startNextScene(this));

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


        let xOffset = 0;
        let numberOfSteps = 7;
        let defaultValue = 0;
        let characterText;


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

        this.currentTutorialIndex = 0;
        if (this.hasBeenCreatedBefore) {
            this.currentTutorialIndex = 99;
        }

        if (this.difficultyLevel().runTutorial && !this.hasBeenCreatedBefore) {
            this.secondTimeThrough = 1;

            displayTutorial(this); // Start the tutorial display
        }

        /* don't deal with this yet
        // Update alpha of misinformation tokens
        scene.misinformationTokens.forEach(token => {
            token.setAlpha(0.2); // Set alpha to 20% (or any desired value)
        });
        */

        // New Idea: It would be cool that the character associated with the helper token is we render the characters right away but make them invisible.  No, actually that won't work because the checkboxes will still be active.
        // Also the checkboxes might be in front of the discussion tokens, creating a problem.
        // how about some new funky graphic showing how the token eminates from the checkbox?
        //
        // Initialize a flag to track if characters have been rendered

        scene.charactersRendered = false;

        // Function to check and render characters
        function checkAndRenderCharacters() {
            if (Object.keys(scene.sharedData.helperTokens).length === 0
              && !scene.charactersRendered
              && characters.every(character => character.endorsement + character.value <= 1 )) {
                scene.charactersRendered = true;
                checkInterval.remove(false); // Clear the interval after rendering characters
                console.log('RENDER CHARACTERS!');
                console.log('helpertokenlength = ' + Object.keys(scene.sharedData.helperTokens).length);
                console.log('charactersRendered = ' + scene.charactersRendered);
                console.log('endorsements are all 1 or less: ' + characters.every(character => character.endorsement <= 1));

                const timerID = setTimeout(() => {
                    scene.misinformationTokens.forEach(token => {
                        token.setAlpha(0.5); // Set the alpha to lower the visibility
                    });
                    const renderCharactersCallback = () => {
                        renderCharacters(scene); // Render characters only when tokens are fully allocated
                    };

                    if (scene.oldExperienceLevel != Math.floor(scene.sharedData.totalPoliticalCapital / 30) + 1) {
                        // Save the updated sharedData for characterintroduction
                        scene.totalPoliticalCapital = scene.sharedData.totalPoliticalCapital;
                        // Add persistent message text
                        let messageText = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY, 'New Advocates Join your cause', {
                            fontFamily: 'Arial',
                            fontSize: '48px',
                            color: '#ffffff'
                        }).setOrigin(0.5, 0.5); // Center the text

                        // Optionally, make sure it appears on top of other layers
                        messageText.setDepth(100); // A high depth value ensures it is on top
                        // Create a new camera that only shows the messageText
                        let messageCamera = scene.cameras.add(0, 0, scene.sys.canvas.width, scene.sys.canvas.height);
                        scene.children.each(child => {
                            if (child !== messageText) {
                                messageCamera.ignore(child);  // Correctly ignore all children except the messageText
                            }
                        });

                        scene.cameras.main.fadeOut(2400, 0, 0, 0);
                        scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                            messageText.destroy();
                            // Hide all game objects in the current scene
                            scene.children.each(child => child.setVisible(false));
                            scene.cameras.main.fadeIn(400, 0, 0, 0);
                            // Launch CharacterIntroductionScene
                            scene.scene.launch('CharacterIntroductionScene', {
                                sharedData: scene.sharedData,
                                callback: (data) => {
                                    scene.scene.stop('CharacterIntroductionScene');

                                    // Unhide all game objects in the current scene
                                    scene.children.each(child => child.setVisible(true));
                                    scene.cameras.main.fadeIn(800, 0, 0, 0);
                                    scene.setup(data);
                                    renderCharactersCallback(); // Continue to renderCharacters
                                }
                            });
                        });
                    } else {
                        scene.totalPoliticalCapital = scene.sharedData.totalPoliticalCapital;
                        renderCharactersCallback(); // Continue to renderCharacters
                    }
                }, 2000);
            } else {
                console.log('Waiting for helper tokens to be allocated.');
            }
        }

        // Set up an interval or an event to re-check periodically
        let checkInterval = this.time.addEvent({
            delay: 1000, // Check every second
            callback: checkAndRenderCharacters,
            callbackScope: this,
            loop: true
        });

        // Call the check function initially
        checkAndRenderCharacters.call(this);

        // Recreate all previously created helpful tokens that have not been used yet
        if (this.hasBeenCreatedBefore) {
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
                character.endorsement += character.value;
                character.prevValue = 0;
                //character.backing = character.value;
                character.backing = 0;
                character.value = 0;
                // Recreate slider and track here
                if (character.endorsement > 1) {
                    let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
                    console.log('x = ' + character.charText.x);
                    let characterText = scene.add.text(character.charText.x, character.charText.y, character.name + '\nGives Back!', {
                        fontSize: '20px',
                        fontFamily: 'Roboto',
                        color: textColor, // Original text color
                        align: 'left'
                    }).setInteractive();
                    characterText.setVisible(false);

                    // Tween to change color to green
                    setTimeout(() => {
                            characterText.setVisible(true);
                            characterText.setColor('#00ff00'); // Setting color to green
                        }, (helpfulTokenIndex+1) * 400);

                    // Delay the start of the fade out tween
                    setTimeout(() => {
                        scene.tweens.add({
                            targets: characterText,
                            alpha: 0, // Fade to completely transparent
                            ease: 'Sine.easeInOut',
                            duration: 3500, // Duration of the fade in milliseconds
                            onComplete: function () {
                                characterText.destroy(); // Destroy the text object after the fade completes
                            }
                        });
                    }, 3000+(helpfulTokenIndex+1) * 400);

                    /*
                    let characterText = scene.add.text(character.charText.x, character.charText.y, character.name + '\nBacking: ' + healthText,
                                        { fontSize: '16px', fontFamily: 'Roboto', color: textColor, align: 'left' }).setInteractive();
                    const timerID = setTimeout(() => {
                        characterText.destroy();
                    }, 1000+(helpfulTokenIndex+1) * 400);
                    */
                    character.charText = characterText; // back reference to text so we can find the location later
                    // If character has been fully endorsed, Create new helpful token
                    createHelpfulToken(this, character, helpfulTokenIndex);
                    helpfulTokenIndex++;
                    if (character.powerTokenType == 'type_5') {enableTokenTutorial = true;}
                    character.endorsement -= 2;

                    // Recreate text here
                    /* Check if this is being done when characters are rendered: this section makes previously rendered characters green if they are fully endorsed or
                    back to their regular color if they were green before and are no longer fully endorsed */
                    /*
                    let healthTextRange = ['None', 'Endorsed', 'Fully Endorsed'];
                    let healthText = healthTextRange[Phaser.Math.Clamp((character.endorsement + character.value),0,2)];
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
                    */
                }
            });

            // If this is the first time a helpful token has appeared, and it's beginner level, provide a tutorial on what to do with it
            if (this.difficultyLevel().runTutorial && !this.firstPowerTokenEver && enableTokenTutorial == true) {
                this.firstPowerTokenEver = 1;
               // let backdrop;
                let timeoutHandle;
                // Initialize an array to store arrow graphics
                let arrowGraphicsArray = [];
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

                // Assuming scene.sharedData.helperTokens is an object
                let helperTokens = scene.sharedData.helperTokens;

                Object.keys(helperTokens).forEach((element, index) => {
                    const timerID = setTimeout(() => {
                        let arrow = drawArrow(scene, helperTokens[element].x, helperTokens[element].y, backstoryBox.x, backstoryBox.y);
                        arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                    }, (index+1) * 400); // Delay each arrow by index * 400 milliseconds
                    arrowTimerIDs.push(timerID); // Store the timer ID
                });


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
        // after character is fully endorsed it generates a token that can be used to help society
        // type_2 character power type "calms down" insurrectionists and gets them to go home.
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

            // Store new helpful token data indexed by character.name.
            // This is an associative array rather than "pushing" tokens into a stack.
            // Means only 1 helpful token can exist per character at one time.
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
            // Generate the society improving token
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
                    if (!scene.firstHackerEver && scene.difficultyLevel().runTutorial) {
                        scene.firstHackerEver = 1;
                        let timeoutHandle;
                        // Initialize an array to store arrow graphics
                        let arrowGraphicsArray = [];
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

                        let iconKeys = Object.keys(scene.sharedData.icons);

                        iconKeys.forEach((key, index) => {
                            const iconData = scene.sharedData.icons[key].gaugeMaga;

                            if (iconData) {
                                const timerID = setTimeout(() => {
                                    let arrow = drawArrow(scene, iconData.x, iconData.y, helpfulToken.container.x, helpfulToken.container.y); //backstoryBox.x, backstoryBox.y);
                                    arrowGraphicsArray.push(arrow);
                                }, (index + 1) * 80);

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

                        // Variables to track mouse position
                        let lastPointerPosition = null;
                        const movementThreshold = 100; // 100 pixels

                        // Add event listener for mouse movement
                        scene.input.on('pointermove', function(pointer) {
                            if (lastPointerPosition) {
                                const distance = Phaser.Math.Distance.Between(
                                    lastPointerPosition.x, lastPointerPosition.y,
                                    pointer.x, pointer.y
                                );

                                if (distance > movementThreshold) {
                                    clearCurrentTutorial();
                                    // Reset last pointer position after clearing the tutorial
                                    lastPointerPosition = { x: pointer.x, y: pointer.y };
                                }
                            } else {
                                // Initialize last pointer position if not set
                                lastPointerPosition = { x: pointer.x, y: pointer.y };
                            }
                        });

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

                // First tween: Increase alpha to 0.5 over 5 seconds
                scene.tweens.add({
                    targets: helpfulToken.container,
                    alpha: .5,
                    ease: 'Sine.easeInOut',
                    duration: 5000,
                    onComplete: function () {
                        // Second tween: Shrink to 1/10th size over 2 seconds
                        scene.tweens.add({
                            targets: helpfulToken.container,
                            scaleX: 0.1, // Shrink to 1/10th of the width
                            scaleY: 0.1, // Shrink to 1/10th of the height
                            ease: 'Sine.easeInOut',
                            duration: 5000,
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

                if (!scene.firstType2Ever && scene.difficultyLevel().runTutorial) {
                    scene.firstType2Ever = 1;
                    let timeoutHandle;
                    let timeoutHandle2;
                    // Initialize an array to store arrow graphics
                    let arrowGraphicsArray = [];
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
            } // end of token type 2
        } // end of CreateHelpfulToken()

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
                        defense.littleHats.forEach(hat => hat.destroy());
                        defense.container.destroy();
                    },
                    callbackScope: scene
                });
            } else {
                // Initialize defense.littleHats if it doesn't exist yet
                if (!defense.littleHats) {
                    defense.littleHats = [];
                }
                let iconY = defense.container.y + ICON_MARGIN;
                defense.littleHats = drawIcons(this, defense.container.x-20 + ICON_SPACING*3, iconY, 'wokeBase', defense.littleHats.length, defense.littleHats);
            }
        }, null, this);

        // Draw little hats
        function drawIcons(scene, x, y, texture, startIndex, littleHats) {

            let count = startIndex + 1; // Increment the count by 1 for the new hat

            for (let i = startIndex; i < count; i++) {
                let xOffset = (i % 5) * ICON_SPACING;
                let yOffset = Math.floor(i / 5) * ICON_SPACING;
                // Each icon will be positioned slightly to the right of the previous one
                let icon = scene.add.image(x + xOffset, y + yOffset, texture);

                // Adjust the size of the icons if necessary
                icon.setScale(ICON_SCALE);

                const jumpHeight = 20; // Adjust the height of the jump
                const durationUp = 150; // Duration for the upward movement
                const durationDown = 300; // Duration for the downward movement with bounce
                // Store the original position
                const originalY = icon.y;

                // Create an infinite loop of jumping
                const jump = () => {
                    // Add the upward movement tween
                    scene.tweens.add({
                        targets: icon,
                        y: originalY - jumpHeight,
                        ease: 'Power1', // Fast upward movement
                        duration: durationUp,
                        onComplete: () => {
                            // Add the downward movement tween with bounce effect
                            scene.tweens.add({
                                targets: icon,
                                y: originalY,
                                ease: 'Bounce.easeOut', // Bounce effect on downward movement
                                duration: durationDown,
                                onComplete: jump // Chain the jump to repeat
                            });
                        }
                    });
                };

                // Start the jumping animation with a random delay
                scene.time.delayedCall(Math.random() * 500, jump);

                littleHats.push(icon);
            }
            return littleHats;
        }

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
                        defense.littleHats.forEach(hat => hat.destroy());
                        defense.container.destroy();
                    },
                    callbackScope: scene
                });
            } else {
                // Initialize defense.littleHats if it doesn't exist yet
                if (!defense.littleHats) {
                    defense.littleHats = [];
                }
                let iconY = defense.container.y + ICON_MARGIN;
                defense.littleHats = drawIcons(this, defense.container.x-20 - ICON_SPACING*3, iconY, 'magaBase', defense.littleHats.length, defense.littleHats);
            }
        }, null, this);

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
                scene.yMagaOffset = 300;
            }
            if (!scene.yWokeOffset) {
                scene.yWokeOffset = 300;
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

                // Restore all the old misinformation Tokens first
                for (let key in scene.sharedData.misinformation) {
                    // Look up the stored data
                    let storedData = scene.sharedData.misinformation[key];
                    //console.log(storedData);

                    // Add an icon or graphic and scale it
                    let helpfulTokenIcon = scene.add.image(0, 0, 'negotiation');  // Position the icon at the original y position
                    helpfulTokenIcon.setScale(.12);  // scale the icon
                    helpfulTokenIcon.setOrigin(0.5, .66);  // change origin to bottom center
                    helpfulTokenIcon.setVisible(true);
                    //helpfulTokenIcon.setDepth(2);  // set depth below the text and above the bounding box
                    helpfulTokenIcon.setAlpha(.9);

                    // Recreate old 'discussion' tokens
                    // Use the stored data when creating the token
                    //                                    (scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce, tokenIcon)
                    let misinformation = createPowerToken(scene, 'neutral', storedData.text, storedData.x, storedData.y, storedData, 'normal', true, 0, helpfulTokenIcon);
                    scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                    scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group
                    misinformation.container.misinformationIndex = storedData.misinformationIndex; // restore index too!
                    misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again
                    scene.misinformationTokens.push(helpfulTokenIcon); // Push token to stack

                }
            }

            // This block should run regardless of whether the scene has been created before
            // Function to create and place a single misinformation token
            function createMisinformationToken(scene, data, index) {
                let xOffset = data.type === 'maga' ? scene.sys.game.config.width * .39 - (scene.yMagaOffset - 300) : scene.sys.game.config.width * .625 + (scene.yWokeOffset - 300);
                let yOffset = 300;//data.type === 'maga' ? scene.yMagaOffset : scene.yWokeOffset;

                // Store the position data
                let storedData = {
                    x: xOffset,
                    y: yOffset,
                    type: data.type,
                    text: data.text,
                    misinformationIndex: index
                };
                // Add an icon or graphic and scale it
                let helpfulTokenIcon = scene.add.image(0, 0, 'negotiation');  // Position the icon at the original y position
                helpfulTokenIcon.setScale(.12);  // scale the icon
                helpfulTokenIcon.setOrigin(0.5, .66);  // change origin to bottom center
                helpfulTokenIcon.setVisible(true);
                //helpfulTokenIcon.setDepth(1);  // set depth below the text and above the bounding box
                helpfulTokenIcon.setAlpha(.9);

                scene.sharedData.misinformation[index] = storedData;

                // Create a new 'discussion' token
                let misinformation = createPowerToken(scene, 'neutral', data.text, xOffset, yOffset, storedData, 'normal', false, 'drop once', helpfulTokenIcon);
                scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group

                misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again

                misinformation.container.misinformationIndex = index;

                scene.misinformationTokens.push(helpfulTokenIcon); // Push token to stack

                // Increment the corresponding offset for next time
                if (data.type === 'maga') {
                    scene.yMagaOffset += misinformation.sprite.displayWidth/2;
                    console.log('container height = ' + misinformation.sprite.displayWidth);
                    if (scene.yMagaOffset > scene.game.config.height * .9) {
                        scene.yMagaOffset -= scene.game.config.height * .7;
                    }
                    console.log('new yMagaOffset = ' + scene.yMagaOffset + ' .8 height is ' + (scene.game.config.height * .8).toString());
                } else {
                    scene.yWokeOffset += misinformation.sprite.displayWidth/2
                    console.log('container height = ' + misinformation.sprite.displayWidth);
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
        } // end of misinformationmanagement()
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
                    tooltip.text.destroy();
                    tooltip.box.destroy();
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
                        tooltip.text.destroy();
                        tooltip.box.destroy();
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
                        if (icon.iconName == 'military'){//} && !scene.difficultyLevel().militaryAutoSpend) {
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


        // Go through all of the societal aspect Icons and set up interactions with various threats
        for (let key in scene.sharedData.icons) {
            let icon = scene.sharedData.icons[key];


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
                let magaValue = Math.floor(icon.maga / 5);
                let wokeValue = Math.floor(icon.woke / 5);

                if (magaValue > wokeValue) {
                    let numReturns = Math.min(5, Math.max(0, magaValue - wokeValue));
                    scene.returnThreat(validTerritory, 'maga', icon, numReturns);
                } else if (wokeValue > magaValue) {
                    let numReturns = Math.min(5, Math.max(0, wokeValue - magaValue));
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                } else {
                    let numReturns = Math.min(5, wokeValue);
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                    scene.time.delayedCall(300, () => {
                        let numReturns = Math.min(5, magaValue);
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

                let magaValue = Math.floor(icon.maga / 5);
                let wokeValue = Math.floor(icon.woke / 5);

                let numReturns;
                let validTerritory = findValidTerritory('woke', 'woke');

                if (magaValue > wokeValue) {
                    numReturns = Math.min(5, Math.max(0, magaValue - wokeValue));
                    scene.returnThreat(validTerritory, 'maga', icon, numReturns);
                } else if (wokeValue > magaValue) {
                    numReturns = Math.min(5, Math.max(0, wokeValue - magaValue));
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                } else {
                    numReturns = Math.min(5, wokeValue);
                    scene.returnThreat(validTerritory, 'woke', icon, numReturns);
                    scene.time.delayedCall(300, () => {
                        let numReturns = Math.min(5, magaValue);
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
                    : '#ff00ff';
            // Add text to the rectangle
            let text = scene.add.text(0, 0, message, { align: 'center', fill: fillColor }).setOrigin(0.5, 0.5);
            if (size == 'large' ) {text.setFontSize(36);}

            // Create a larger white rectangle for outline
            let outline = scene.add.rectangle(0, 0, text.width+4, text.height+4, 0xffffff);

            // Create a smaller factionColor rectangle
            let rectangle = scene.add.rectangle(0, 0, text.width, text.height, factionColor);

            // Create a sprite for physics and bouncing
            let misinformationSprite = scene.physics.add.sprite(0, 0, 'track');
            misinformationSprite.setVisible(false); // Hide it, so we only see the graphics and text
            misinformationSprite.setDepth(1);

            let misinformation;

            // Group the text, outline, and rectangle into a single container
            if (tokenIcon) { // ... and group tokenIcon too if it exists
                rectangle.setSize(text.width, text.height+tokenIcon.displayHeight);
                outline.setSize(text.width+4, text.height+4+tokenIcon.displayHeight);
                text.y += tokenIcon.displayHeight/2;
                //rectangle.x adjustment??
                if (faction == 'neutral' && size != 'large'){
                    outline.setVisible(false);
                    rectangle.setVisible(false);
                    rectangle.setSize(text.width, text.height+tokenIcon.displayHeight/2);
                    outline.setSize(text.width+4, text.height+4+tokenIcon.displayHeight/2);
                    misinformation = scene.add.container(x, y, [outline, rectangle, text, tokenIcon, misinformationSprite]);}
                else {
                    misinformation = scene.add.container(x, y-tokenIcon.displayHeight/2, [outline, rectangle, text, tokenIcon, misinformationSprite]);
                }
                misinformation.setSize(outline.width, outline.height+tokenIcon.displayHeight);
            } else {
                misinformation = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);
                misinformation.setSize(outline.width, outline.height);
            }

            if (1){//size != 'large'){
                 misinformation.setSize(outline.width, outline.height);
                 // Set the initial size to near zero
                 misinformation.setScale(0.01);

                console.log('what is the size of helperTokens?  It is currently '+Object.keys(scene.sharedData.helperTokens).length);

                const timerID = setTimeout(() => {
                     if (typeof storedData.character !== 'undefined') {
                         console.log('generate helpful token for '+storedData.character.charText.text);

                        // Current position as the target for the tween
                        var targetX = misinformation.x;
                        var targetY = misinformation.y;

                        // Set initial position
                        misinformation.x = storedData.character.charText.x;
                        misinformation.y = storedData.character.charText.y;

                        scene.tweens.add({
                            targets: misinformation,
                             x: targetX, // Move to this X position
                             y: targetY, // Move to this Y position
                             scaleX: 1, // expand to the width
                             scaleY: 1, // expand to the height
                             ease: 'Sine.easeInOut',
                             duration: 1000,
                             onComplete: function () {
                                 misinformation.setSize(outline.width, outline.height);
                                 pulseIt(outline, rectangle, tokenIcon);
                             },
                             callbackScope: scene
                         });
                     } else {
                        // Add a tween to expand the container and its contents
                         scene.tweens.add({
                             targets: misinformation,
                             scaleX: 1, // expand to the width
                             scaleY: 1, // expand to the height
                             ease: 'Sine.easeInOut',
                             duration: 1000,
                             onComplete: function () {
                                 misinformation.setSize(outline.width, outline.height);
                                 pulseIt(outline, rectangle, tokenIcon);
                             },
                             callbackScope: scene
                         });
                     }
                }, Object.keys(scene.sharedData.helperTokens).length *400);
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
            if (0) {//hasBeenCreatedBefore == true && scene.difficultyLevel().multiplier != 1) {
                outlineTween.stop();
                rectangleTween.stop();
                misinformation.disableInteractive();
                misinformationSprite.setImmovable(true);
                //let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                //rectangle.setFillStyle(0x228B22); // Now the rectangle is green
                text.setColor(0x229B22);
            }

            return {
                container: misinformation,
                sprite: misinformationSprite
            };
        }

        function pulseIt(outline, rectangle, tokenIcon) {
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
            }
        }

       function zzzcreatePowerToken(scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce, tokenIcon) {
            let factionColor = faction === 'maga'
                ? '0xff0000'
                : faction === 'woke'
                    ? '0x0000ff'
                    : '0x800080';
            let fillColor = faction === 'maga'
                ? '#ffffff'
                : faction === 'woke'
                    ? '#ffffff'
                    : '#ff00ff';
            // Add text to the rectangle
            let text = scene.add.text(0, 0, message, { align: 'center', fill: fillColor }).setOrigin(0.5, 0.5);
            if (size == 'large' ) {text.setFontSize(36);}

            // Create a larger white rectangle for outline
            let outline = scene.add.rectangle(0, 0, text.width+4, text.height+4, 0xffffff);
           /*
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
            */
            // Create a smaller factionColor rectangle
            let rectangle = scene.add.rectangle(0, 0, text.width, text.height, factionColor);
           /*
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
            */


            // Create a sprite for physics and bouncing
            let misinformationSprite = scene.physics.add.sprite(0, 0, 'track');
            misinformationSprite.setVisible(true); // Hide it, so we only see the graphics and text
            misinformationSprite.setDepth(1);

            let misinformation;

            // Group the text, outline, and rectangle into a single container
            if (tokenIcon) { // ... and group tokenIcon too if it exists
                /*
                let tokenIconTween = scene.tweens.add({
                    targets: tokenIcon, // object that the tween affects
                    scaleX: tokenIcon._scaleX * 1.2, // start scaling to 120% of the original size
                    scaleY: tokenIcon._scaleY * 1.2, // start scaling to 120% of the original size
                    duration: 1000, // duration of scaling to 120% will be 1 second
                    ease: 'Linear', // type of easing
                    yoyo: true, // after scaling to 120%, it will scale back to original size
                    loop: -1, // -1 means it will loop forever
                });
                */
                rectangle.setSize(text.width, text.height+tokenIcon.displayHeight);
                outline.setSize(text.width+4, text.height+4+tokenIcon.displayHeight);
                text.y += tokenIcon.displayHeight/2;
                //rectangle.x adjustment??
                if (faction == 'neutral' && size != 'large'){
                    outline.setVisible(false);
                    rectangle.setVisible(false);
                    rectangle.setSize(text.width, text.height+tokenIcon.displayHeight/2);
                    outline.setSize(text.width+4, text.height+4+tokenIcon.displayHeight/2);
                    misinformation = scene.add.container(x, y, [outline, rectangle, text, tokenIcon, misinformationSprite]);}
                else {
                    misinformation = scene.add.container(x, y-tokenIcon.displayHeight/2, [outline, rectangle, text, tokenIcon, misinformationSprite]);
                }
                misinformation.setSize(outline.width, outline.height+tokenIcon.displayHeight);
            } else {
                misinformation = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);
                misinformation.setSize(outline.width, outline.height);
            }
           if (size != 'large' || faction != 'neutral' ){
                misinformation.setSize(20, 20);

               const timerID = setTimeout(() => {
                    // Add a tween to expand the container and its contents
                    scene.tweens.add({
                        targets: misinformation.container,
                        scaleX: 100, // expand to the width
                        scaleY: 100, // expand to the height
                        ease: 'Sine.easeInOut',
                        duration: 5000,
                        onComplete: function () {
                            misinformation.setSize(outline.width, outline.height);
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
                            }

                        },
                        callbackScope: scene
                    });
               }, Object.keys(scene.sharedData.helperTokens).length *400+2000);
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
            if (0) {//hasBeenCreatedBefore == true && scene.difficultyLevel().multiplier != 1) {
                outlineTween.stop();
                rectangleTween.stop();
                misinformation.disableInteractive();
                misinformationSprite.setImmovable(true);
                //let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                //rectangle.setFillStyle(0x228B22); // Now the rectangle is green
                text.setColor(0x229B22);
            }

            return {
                container: misinformation,
                sprite: misinformationSprite
            };
        }

/*
function createPowerToken(scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce, tokenIcon) {
    let factionColor = faction === 'maga'
        ? 0xff0000
        : faction === 'woke'
            ? 0x0000ff
            : 0x800080;
    let fillColor = faction === 'maga'
        ? '#ffffff'
        : faction === 'woke'
            ? '#ffffff'
            : '#ff00ff';

    // Add text to the rectangle
    let text = scene.add.text(0, 0, message, { align: 'center', fill: fillColor }).setOrigin(0.5, 0.5);
    if (size === 'large') {
        text.setFontSize(36); // By making the font large, the rectangle and container automatically become large
    }

    // Create a larger white rectangle for outline
    let outline = scene.add.rectangle(0, 0, text.width + 4, text.height + 4, 0xffffff);

    // Create a smaller factionColor rectangle
    let rectangle = scene.add.rectangle(0, 0, text.width, text.height, factionColor);

    // Create a sprite for physics and bouncing
    let misinformationSprite = scene.physics.add.sprite(0, 0, 'track');
    misinformationSprite.setVisible(false); // Hide it, so we only see the graphics and text
    misinformationSprite.setDepth(1);

    let misinformation;

    // Group the text, outline, and rectangle into a single container
    if (tokenIcon) {
        rectangle.setSize(text.width, text.height + tokenIcon.displayHeight);
        outline.setSize(text.width + 4, text.height + 4 + tokenIcon.displayHeight);
        text.y += tokenIcon.displayHeight / 2;

        // Make the 'discussion' icons look different from the other power tokens
        if (faction === 'neutral' && size !== 'large') {
            outline.setVisible(false);
            rectangle.setVisible(false);
            rectangle.setSize(text.width, text.height + tokenIcon.displayHeight / 2);
            outline.setSize(text.width + 4, text.height + 4 + tokenIcon.displayHeight / 2);
            misinformation = scene.add.container(x, y, [outline, rectangle, text, tokenIcon, misinformationSprite]);
        } else {
            misinformation = scene.add.container(x, y - tokenIcon.displayHeight / 2, [outline, rectangle, text, tokenIcon, misinformationSprite]);
        }
        misinformation.setSize(outline.width, outline.height + tokenIcon.displayHeight);
    } else {
        misinformation = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);
        misinformation.setSize(outline.width * 0.1, outline.height * 0.1);

        // Add a tween to expand the container and its contents
        scene.tweens.add({
            targets: misinformation,
            scaleX: 10, // expand to 10x the width
            scaleY: 10, // expand to 10x the height
            ease: 'Sine.easeInOut',
            duration: 2000,
            onComplete: function () {
                misinformation.setSize(outline.width, outline.height);
            },
            callbackScope: scene
        });
    }

    misinformationSprite.setScale(0.6);

    // Now that the container has a size, it can be made interactive and draggable
    misinformation.setInteractive({ draggable: true });
    // Attach the container to the sprite
    misinformationSprite.container = misinformation;
    if (size === 'large') {
        misinformation.setDepth(1);
    }

    // Listen to the 'drag' event
    misinformation.on('drag', function (pointer, dragX, dragY) {
        this.x = dragX;
        this.y = dragY;
        storedData.x = dragX;
        storedData.y = dragY;
        misinformationSprite.setImmovable(true);
    });

    // Optional: if you have specific conditions for dropping or stopping the tween
    if (dropOnce) {
        misinformation.on('dragend', function () {
            outlineTween.stop();
            rectangleTween.stop();
            this.disableInteractive();
            misinformationSprite.setImmovable(true);
            let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
            rectangle.setFillStyle(0x228B22); // Now the rectangle is forest green
        });
    }

    if (hasBeenCreatedBefore && scene.difficultyLevel().multiplier !== 1) {
        outlineTween.stop();
        rectangleTween.stop();
        misinformation.disableInteractive();
        misinformationSprite.setImmovable(true);
        text.setColor('#229B22');
    }

    return {
        container: misinformation,
        sprite: misinformationSprite
    };
}
*/
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
        /*
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
        */


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

        // the very end of create()
        this.hasBeenCreatedBefore = true;
    }
}
