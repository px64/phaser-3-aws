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
import { drawIcons, aspectPercent, aspectComplete } from './BaseScene.js';
import { createPowerToken } from './BaseScene.js';
import { characters } from './BaseScene.js';
import { territories } from './BaseScene.js';
import { hasNewAdvocates, experienceLevel } from './characterUtils.js';
import { renderCharacters } from './politicsUtils.js';
import { insertLineBreaks } from './politicsUtils.js';
import { startNextScene } from './politicsUtils.js';
import { secondScreenTutorial} from './tutorial.js';
import { displayTutorial } from './tutorial.js';
import { drawArrow } from './tutorial.js';

//var MAGAness = 0;
//var Wokeness = 0;
//var polCapText;
var year = 2023; // the starting year
var yearText;


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
        // all character's endorsement starts at 0
        characters.forEach((character, index) => {
            character.endorsement = 0;
        });
        this.misinformationTokens = []; // Initialize the stack to store tokens
        this.politicalCapitalIcons = []; // Array to keep track of icons

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
            this.expireHackerShields();
            this.recreateIcons();
        }
    }

    //====================================================================================
    //
    // checkForWin(): if every aspect of society is complete, go to the final victory screen
    //
    //====================================================================================
    checkForWin() {
        if (this.gameWon) {
            return true;
        }
        // Win when every aspect of society is complete (gold ring)
        for (let key in this.sharedData.icons) {
            if (!aspectComplete(this.sharedData.icons[key])) {
                return false;
            }
        }
        console.log('You Win!');
        this.gameWon = true;
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.get('VictoryScene').setup(this.sharedData);
            this.scene.start('VictoryScene', { showScore: true, gameOver: true, message: 'You Win!\nIn the year ' + this.sharedData.year + '\nAll six aspects of society are complete!'});
        });
        return true;
    }

    //====================================================================================
    //
    // Political capital display: the diamonds pulse while there is capital left to spend,
    // and a hint at the bottom of the screen says what to do next.
    //
    //====================================================================================
    updatePoliticalCapitalIcons(totalCapital) {
        super.updatePoliticalCapitalIcons(totalCapital);
        this.politicalCapitalIcons.forEach((diamond, index) => {
            this.tweens.add({
                targets: diamond,
                scale: diamond.scale * 1.3,
                alpha: 0.6,
                duration: 600,
                delay: index * 80,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
        this.updateSpendHint(this.politicalCapitalIcons.length);
    }

    updateSpendHint(diamonds) {
        if (!this.spendHint || !this.spendHint.scene) {
            this.spendHint = this.add.text(this.cameras.main.centerX, this.sys.game.config.height - 100, '', {
                font: 'bold 18px Arial',
                align: 'center'
            }).setOrigin(0.5).setDepth(3);
        }
        if (diamonds > 0) {
            this.spendHint.setText('Spend all ' + diamonds + ' diamond' + (diamonds == 1 ? '' : 's') + ' of political capital, then click the Earth');
            this.spendHint.setColor('#ffff80');
        } else {
            this.spendHint.setText('All political capital spent: click the Earth to continue');
            this.spendHint.setColor('#80ff80');
        }
    }

    // The Earth button moves on to the next screen.  If there is still capital to spend on
    // advocates, remind the player once; a second click continues anyway.
    onEarthClicked() {
        let diamonds = this.politicalCapitalIcons.length;
        let canEndorse = this.characterTexts.length > 0
            && characters.some(character => !character.dne && !(character.helpingRounds > 0) && character.value == 0);
        if (diamonds > 0 && canEndorse && !this.unspentWarningShown) {
            this.unspentWarningShown = true;
            let reminder = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
                'You still have ' + diamonds + ' diamond' + (diamonds == 1 ? '' : 's') + ' of political capital.\n' +
                'Endorse more advocates, or click the Earth again to continue anyway.', {
                font: 'bold 28px Arial',
                fill: '#ffff80',
                backgroundColor: '#000000',
                align: 'center',
                padding: { x: 16, y: 12 }
            }).setOrigin(0.5).setDepth(20);
            this.tweens.add({
                targets: reminder,
                alpha: 0,
                delay: 3500,
                duration: 800,
                onComplete: () => reminder.destroy()
            });
            return;
        }
        startNextScene(this);
    }

    //====================================================================================
    //
    // expireHackerShields(): hacker shields last one round.  Called before the icons are recreated.
    //
    //====================================================================================
    expireHackerShields() {
        let shieldRounds = this.sharedData.shieldRounds || {};
        for (let key in shieldRounds) {
            shieldRounds[key]--;
            if (shieldRounds[key] <= 0) {
                delete shieldRounds[key];
                if (this.sharedData.icons[key]) {
                    this.sharedData.icons[key].shieldStrength = 0;
                }
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
        this.leavingScene = false;

        // Check if you won as soon as you enter politics because we don't check during insurrection or dilemma
        this.gameWon = false;
        this.unspentWarningShown = false;
        this.isFirstPoliticsRound = !this.hasBeenCreatedBefore;
        if (this.checkForWin()) {
            return;
        }
        // Create a button using an image
        this.nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);


        // When the button is clicked, start the next scene
        this.nextButton.on('pointerdown', () => this.onEarthClicked());
        // Rules reference in the top-right corner
        this.addHelpButton(this.sys.game.config.width - 24, 22);

        this.cameras.main.fadeIn(2000, 0, 0, 0);

        this.roundThreats = 0;

        //====================================================================================
        //
        // The main body of create()
        //
        //====================================================================================
        this.createTerritories();

        let totalCapital = Math.floor(this.MAGAness + this.Wokeness);

        //this.polCapText = this.add.text(20, 200, 'Political Capital ' + totalCapital, { fontSize: this.sharedData.medFont, fill: '#0f0' });
        this.polCapText = this.add.text(20, 5, 'Political Capital', { fontSize: this.sharedData.medFont, fill: '#0f0' });

        this.updatePoliticalCapitalIcons(totalCapital); // Initial draw of icons

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
        // Define the fragment shader source code
        class ColorBlendPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
            constructor(game) {
                super({
                    game: game,
                    renderer: game.renderer,
                    fragShader: `
                    precision mediump float;
        
                    uniform sampler2D uMainSampler;
                    uniform vec3 color1;
                    uniform vec3 color2;
                    uniform float mixFactor;
        
                    varying vec2 outTexCoord;
        
                    void main() {
                        vec4 texColor = texture2D(uMainSampler, outTexCoord);
                        vec3 color = mix(texColor.rgb, color1, mixFactor);
                        gl_FragColor = vec4(color, min(texColor.a, 1.0));
                    }
                    `,
                    uniforms: [
                        'uProjectionMatrix',
                        'uViewMatrix',
                        'uModelMatrix',
                        'uMainSampler',
                        'color1',
                        'color2',
                        'mixFactor'
                    ]
                });
        
                // Default values for colors
                this.color1 = [1, 0, 0]; // red
                this.color2 = [0, 0, 1]; // blue
                this.mixFactor = 0.5; // initial mixFactor
            }
        
            onBind() {
                super.onBind();
                this.set1f('mixFactor', this.mixFactor);
                return this;
            }
        }        

        if (!this.hasBeenCreatedBefore) {
            // Initialize shaders
            this.colorBlendPipelineMaga = this.game.renderer.pipelines.add('ColorBlendMaga', new ColorBlendPipeline(this.game));
            this.colorBlendPipelineWoke = this.game.renderer.pipelines.add('ColorBlendWoke', new ColorBlendPipeline(this.game));
        }
        
        // Setup tweens for both pipelines
        const setupTween = (pipeline) => {
            scene.tweens.add({
                targets: pipeline,
                mixFactor: { from: 0, to: 1 },
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                duration: 2000
            });
        };

        this.colorBlendPipelineMaga.set3f('color1', 1, 0, 0);
        setupTween(this.colorBlendPipelineMaga);
        this.colorBlendPipelineWoke.set3f('color1', 0, 0, 1);
        setupTween(this.colorBlendPipelineWoke);

        // Set initial values for shader uniforms using the new pipeline instance
        //let customPipeline = this.renderer.pipelines.get('ColorBlend');
        // Set initial values for shader uniforms
        //customPipeline.set3f('color1', 1, 0, 0); // Red
        //customPipeline.set3f('color2', 0, 0, 1); // Blue
        //customPipeline.set1f('mixFactor', 0.5);

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

                const timerID = scene.time.delayedCall(2000, () => {
                    scene.misinformationTokens.forEach(token => {
                        token.container.setAlpha(0.5); // Set the alpha to lower the visibility
                    });
                    for (let key in scene.sharedData.misinformation) {
                        // Look up the stored data
                        let misinformation = scene.sharedData.misinformation[key];
                        console.log(misinformation);
                        if (misinformation.littleHats) {
                            misinformation.littleHats.forEach(hat => {
                                //scene.tweens.killTweensOf(hat); // Stop any active tweens on the hat
                                hat.setAlpha(0.5); // Set the alpha after stopping the tween
                            });
                        }
                    }
                    const renderCharactersCallback = () => {
                        renderCharacters(scene); // Render characters only when tokens are fully allocated
                    };

                    if (hasNewAdvocates(scene)) {
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
                        // Create a temporary camera that only shows the messageText while the main camera fades out
                        let messageCamera = scene.cameras.add(0, 0, scene.sys.canvas.width, scene.sys.canvas.height);
                        scene.children.each(child => {
                            if (child !== messageText) {
                                messageCamera.ignore(child);
                            }
                        });

                        scene.cameras.main.fadeOut(2400, 0, 0, 0);
                        scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                            messageText.destroy();
                            scene.cameras.remove(messageCamera);
                            // Hide the game objects that are currently visible, and remember them so only those are shown again
                            let hiddenChildren = scene.children.list.filter(child => child.visible);
                            hiddenChildren.forEach(child => child.setVisible(false));
                            scene.cameras.main.fadeIn(400, 0, 0, 0);
                            // Launch CharacterIntroductionScene
                            scene.scene.launch('CharacterIntroductionScene', {
                                sharedData: scene.sharedData,
                                callback: (data) => {
                                    scene.scene.stop('CharacterIntroductionScene');

                                    // Unhide the game objects that were hidden above
                                    hiddenChildren.forEach(child => {
                                        if (child.scene) {
                                            child.setVisible(true);
                                        }
                                    });
                                    scene.cameras.main.fadeIn(800, 0, 0, 0);
                                    scene.setup(data);
                                    scene.oldExperienceLevel = scene.sharedData.oldExperienceLevel;
                                    renderCharactersCallback(); // Continue to renderCharacters
                                }
                            });
                        });
                    } else {
                        scene.totalPoliticalCapital = scene.sharedData.totalPoliticalCapital;
                        // Nobody new to introduce, but remember the highest level reached
                        let newLevel = experienceLevel(scene.sharedData);
                        if (newLevel > (scene.oldExperienceLevel || 0)) {
                            scene.oldExperienceLevel = newLevel;
                            scene.sharedData.oldExperienceLevel = newLevel;
                        }
                        renderCharactersCallback(); // Continue to renderCharacters
                    }
                });
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
            // The game objects from the previous visit were destroyed when the scene shut down,
            // so rebuild each unused token from its character at its saved position.
            let restoredTokens = Object.values(scene.sharedData.helperTokens);
            scene.sharedData.helperTokens = {};
            restoredTokens.forEach((storedData, index) => {
                if (storedData.character.powerTokenType == 'type_2') {
                    return; // type_2 tokens already granted their outreach tokens and just fade away
                }
                console.log('helperToken ' + storedData.text + ' has been recreated');
                createHelpfulToken(scene, storedData.character, index, { x: storedData.x, y: storedData.y });
            });

            let enableTokenTutorial = false;
            let helpfulTokenIndex = Object.keys(scene.sharedData.helperTokens).length; // Starting index for new tokens
            console.log('starting index helpfulTokenIndex is equal to ' + helpfulTokenIndex);

            // Go through each character, recreate the slider and track, and check if any new helpful tokens need to be generated
            characters.forEach((character, index) => {
                if (character.dne == true) {return;}
                // Advocates who are helping come back to the list after a couple of rounds
                if (character.helpingRounds > 0) {
                    character.helpingRounds--;
                }
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
                    characterText.setVisible(false).setDepth(7);

                    let iconOffset = character.faction === 'maga' ? characterText.width+60: -60;
                    let characterIcon = scene.add.sprite(character.charText.x + iconOffset, character.charText.y, character.characterIcon).setScale(.09);
                    characterIcon.setVisible(false).setDepth(6);

                    // Tween to change color to green
                    scene.time.delayedCall((helpfulTokenIndex+1) * 400, () => {
                            characterText.setVisible(true);
                            characterText.setColor('#00ff00'); // Setting color to green
                            characterIcon.setVisible(true);
                        });

                    // Delay the start of the fade out tween
                    scene.time.delayedCall(3000+(helpfulTokenIndex+1) * 400, () => {
                        scene.tweens.add({
                            targets: [characterText, characterIcon],
                            alpha: 0, // Fade to completely transparent
                            ease: 'Sine.easeInOut',
                            duration: 3500, // Duration of the fade in milliseconds
                            onComplete: function () {
                                characterText.destroy(); // Destroy the text object after the fade completes
                                characterIcon.destroy();
                            }
                        });
                    });

                    character.charText = characterText; // back reference to text so we can find the location later
                    // If character has been fully endorsed, Create new helpful token
                    createHelpfulToken(this, character, helpfulTokenIndex);
                    helpfulTokenIndex++;
                    if (character.powerTokenType == 'type_5') {enableTokenTutorial = true;}
                    character.endorsement -= 2;
                    character.helpingRounds = 2; // off the endorsement list while they help

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
                    const timerID = scene.time.delayedCall((index+1) * 400, () => {
                        let arrow = drawArrow(scene, helperTokens[element].x, helperTokens[element].y, backstoryBox.x, backstoryBox.y);
                        arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                    }); // Delay each arrow by index * 400 milliseconds
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
                    if (timeoutHandle) { timeoutHandle.remove(false); }  // Clear the timeout to avoid it firing after manual advance
                    //backstoryText.setVisible(false);
                    //backstoryBox.setVisible(false);
                    backstoryText.destroy();
                    backstoryBox.destroy();
                    this.tweens.killTweensOf([backstoryText, backstoryBox]);
                    //backdrop.off('pointerdown');
                    this.input.keyboard.off('keydown-ENTER', clearCurrentTutorial);

                    // Clear all pending timers for drawing arrows
                    arrowTimerIDs.forEach(timerID => timerID.remove(false));
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
                timeoutHandle = scene.time.delayedCall(10000, clearCurrentTutorial);
            }
        }
        // after character is fully endorsed it generates a token that can be used to help society
        // type_2 character power type "calms down" insurrectionists and gets them to go home.
        // Should there be a Maga type and a Woke type?  Or should there just be a "calm downer" type?  maybe
        // just reduce whichever is largest
        function createHelpfulToken(scene, character, helpfulTokenIndex, savedPosition) {
            let text = character.power;
            let charText = character.charText;
            let xOffset, yOffset;
            if (savedPosition) {
                xOffset = savedPosition.x;
                yOffset = savedPosition.y;
            } else {
                if (character.faction === 'maga') {
                    xOffset = charText.x + 250;
                } else {
                    xOffset = charText.x - 140;
                }
                yOffset = charText.y + 25;
            }

            //===========
            // Add an icon or graphic.  Negotiator (type_2) tokens have no icon.
            let helpfulTokenIcon = null;
            let iconKey;
            let iconScale;
            if (character.helps) {
                iconKey = character.helps;
                iconScale = scene.sharedData.icons[character.helps].scaleFactor;
            } else if (character.powerTokenType == 'type_3') {
                iconKey = 'hacker';
                iconScale = 0.19;
            }
            if (iconKey) {
                helpfulTokenIcon = scene.add.image(0, 0, iconKey);
                helpfulTokenIcon.setScale(iconScale*.6);  // scale the icon
                helpfulTokenIcon.setOrigin(0.5, 0.82);  // change origin to bottom center
                helpfulTokenIcon.setVisible(true);
                helpfulTokenIcon.setAlpha(1);
            }
            //=====

            // Store position data
            let storedData = {
                x: xOffset,
                y: yOffset,
                type: character.faction,
                text: text,
                character: character,
                helperTokenIndex: helpfulTokenIndex
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

            helpfulToken.container.setDepth(5); // needs to be in front of misinformation tokens
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
                                const timerID = scene.time.delayedCall((index + 1) * 80, () => {
                                    let arrow = drawArrow(scene, iconData.x, iconData.y, helpfulToken.container.x, helpfulToken.container.y); //backstoryBox.x, backstoryBox.y);
                                    arrowGraphicsArray.push(arrow);
                                });

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
                            if (timeoutHandle) { timeoutHandle.remove(false); }  // Clear the timeout to avoid it firing after manual advance
                            backstoryText.destroy();
                            backstoryBox.destroy();
                            //backstoryText.setVisible(false);
                            //backstoryBox.setVisible(false);
                            scene.tweens.killTweensOf([backstoryText, backstoryBox]);
                            //backdrop.off('pointerdown');
                            scene.input.keyboard.off('keydown-ENTER', clearCurrentTutorial);
                            scene.input.off('pointermove', onPointerMove);

                            // Clear all pending timers for drawing arrows
                            arrowTimerIDs.forEach(timerID => timerID.remove(false));
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
                        const onPointerMove = function(pointer) {
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
                        };
                        scene.input.on('pointermove', onPointerMove);

                        // Set a timeout to automatically advance
                        timeoutHandle = scene.time.delayedCall(10000, clearCurrentTutorial);
                    }
                    //console.log(hurtIcon);
                }
            });
            helpfulToken.container.on('pointerup', function (pointer, dragX, dragY) {
                //let helpedIcon = scene.sharedData.icons.find(asset => asset.iconName === character.helps);
                if (character.powerTokenType == 'type_5') {
                    let helpedIcon = scene.sharedData.icons[character.helps];
                    if (helpedIcon) {
                        helpedIcon.icon.shieldWoke.setAlpha(helpedIcon.shieldStrength > 0 ? 0.6:0);
                    }
                    let hurtIcon = scene.sharedData.icons[character.hurts];
                    if (hurtIcon) {
                        hurtIcon.icon.shieldMaga.setAlpha(hurtIcon.shieldStrength > 0 ? 0.6:0);
                    }
                } else if (character.powerTokenType == 'type_3') {
                    for (let key in scene.sharedData.icons) {
                        let iconData = scene.sharedData.icons[key];
                        // Provide a hint by changing the tint of the shield of the helped and hurt Icons
                        iconData.icon.shieldWoke.setAlpha(iconData.shieldStrength > 0 ? 0.8:0);
                    }
                }
            });
            if (character.powerTokenType === 'type_2') {
                scene.extraMisinformationTokens += 4;
                helpfulToken.container.x = 720;
                if (character.faction == 'maga') helpfulToken.container.x -= scene.cameras.main.width/4;
                helpfulToken.container.y = 380;
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
                    timeoutHandle2 = scene.time.delayedCall(5000, () => {
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
                            const timerID = scene.time.delayedCall((index+1) * 400, () => {
                                let arrow = drawArrow(scene, helperTokens[element].x, helperTokens[element].y, backstoryBox.x, backstoryBox.y);
                                arrowGraphicsArray.push(arrow); // Store the arrow graphic in the array
                            }); // Delay each arrow by index * 400 milliseconds
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
                            if (timeoutHandle) { timeoutHandle.remove(false); }  // Clear the timeout to avoid it firing after manual advance
                            backstoryText.destroy();
                            backstoryBox.destroy();
                            //backstoryText.setVisible(false);
                            //backstoryBox.setVisible(false);
                            scene.tweens.killTweensOf([backstoryText, backstoryBox]);
                            scene.input.keyboard.off('keydown-ENTER', clearCurrentTutorial);

                            // Clear all pending timers for drawing arrows
                            arrowTimerIDs.forEach(timerID => timerID.remove(false));
                            arrowTimerIDs = []; // Clear the timer IDs array after cancellation

                            // Destroy all arrow graphics
                            arrowGraphicsArray.forEach(arrow => arrow.destroy());
                            arrowGraphicsArray = []; // Clear the array after destruction
                        };

                        // Set up listeners for pointer down and ENTER key
                        scene.input.keyboard.on('keydown-ENTER', clearCurrentTutorial);

                        // Set a timeout to automatically advance
                        timeoutHandle = scene.time.delayedCall(10000, clearCurrentTutorial);
                    });
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
        this.addDiscussionTokenOverlaps();


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

                //this.restoreMisinformationTokens(this);

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
                    let dropOnce;
                    if ((storedData.wokeHats + storedData.magaHats) > 0) {
                        dropOnce = 'drop once';
                    }
                    // Recreate old 'discussion' tokens
                    // Use the stored data when creating the token
                    //                                    (scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce, tokenIcon)
                    let misinformation = createPowerToken(scene, 'neutral', storedData.text, storedData.x, storedData.y, storedData, 'normal', true, dropOnce, helpfulTokenIcon);
                    scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                    scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group
                    // Initialize littleHats
                    misinformation.littleHats = [];
                    let wokeHats = storedData.wokeHats;
                    if (wokeHats) {
                        misinformation.littleHats = drawIcons(scene, misinformation.container.x, misinformation.container.y, 'wokeBase',0 , wokeHats, misinformation.littleHats,1);
                        misinformation.container.setInteractive({ draggable: false });
                    }
                    let magaHats = storedData.magaHats;
                    if (magaHats) {
                        misinformation.littleHats = drawIcons(scene, misinformation.container.x, misinformation.container.y, 'magaBase', misinformation.littleHats.length, magaHats, misinformation.littleHats,1);
                        misinformation.container.setInteractive({ draggable: false });
                    }
                    misinformation.container.misinformationIndex = storedData.misinformationIndex; // restore index too!
                    misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again
                    scene.misinformationTokens.push(misinformation); // Push token to stack
                    storedData.littleHats = misinformation.littleHats;
                }

                console.log('on startup, misinformation tokens map:');
                console.log(scene.misinformationTokens);
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
                    misinformationIndex: index,
                    magaHats: 0,
                    wokeHats: 0
                };
                // Add an icon or graphic and scale it
                let helpfulTokenIcon = scene.add.image(0, 0, 'negotiation');  // Position the icon at the original y position
                helpfulTokenIcon.setScale(.12);  // scale the icon
                helpfulTokenIcon.setOrigin(0.5, .66);  // change origin to bottom center
                helpfulTokenIcon.setVisible(true);
                //helpfulTokenIcon.setDepth(1);  // set depth below the text and above the bounding box
                helpfulTokenIcon.setAlpha(.9);

                // Save misinformation token's storedData into sharedData so other scenes can use it.
                scene.sharedData.misinformation[index] = storedData;

                // Create a new 'discussion' token
                let misinformation = createPowerToken(scene, 'neutral', data.text, xOffset, yOffset, storedData, 'normal', false, '', helpfulTokenIcon);
                scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group

                misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again

                misinformation.container.misinformationIndex = index;

                scene.misinformationTokens.push(misinformation); // Push token to stack

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
            // Overlap fires every frame while the token sits on the icon, so only act on the first contact
            if (helper.isDestroyed) {
                return;
            }
            let character = helper.container.character;

            // Shrink the token away and remove it once it has been used
            let consumeToken = () => {
                helper.isDestroyed = true;
                delete scene.sharedData.helperTokens[character.name];
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
            };
            let showTooltip = (tooltipCharacter, x, y) => {
                let tooltip = createTooltip(scene, tooltipCharacter, x, y);
                tooltip.text.setVisible(true);
                tooltip.box.setVisible(true);
                scene.time.delayedCall(5000, () => {
                    tooltip.text.destroy();
                    tooltip.box.destroy();
                });
            };
            let launchHurtThreats = () => {
                // The character also stirs up 5 activists of their own faction at the 'hurts' icon
                let hurtIcon = scene.icons[character.hurts];
                let territory = territories[3]; // arbitrarily picked this territory to launch from
                console.log('character ' + character.name + ' launches 5 threats');
                scene.createThreat(territory, character.faction, hurtIcon, 5);
                scene.drawGauges(scene, hurtIcon.icon.x, hurtIcon.icon.y, hurtIcon.maga, hurtIcon.woke, hurtIcon.health, hurtIcon.healthScale, hurtIcon.gaugeMaga, hurtIcon.gaugeWoke, hurtIcon.gaugeHealth, hurtIcon.scaleSprite, hurtIcon.littleHats);
            };

            // This where we apply the various actions based on attributes contributed by the represented character's power
            // Do the appropriate thing depending on the helper type
            if (character.powerTokenType == 'type_3') {
                let helpedIcon = icon;
                consumeToken();
                // Use a temporary description so the character's own shortstory is left unchanged
                showTooltip({
                    faction: character.faction,
                    shortstory: [('Russian Troll Farm Firewall is enabled: ' + helpedIcon.iconTitle + ' '),
                        "is temporarily immune to all political attacks"]
                }, helpedIcon.icon.x, helpedIcon.icon.y+150);

                // Hacker shield lasts through the next insurrection and is removed when politics comes around again
                helpedIcon.shieldStrength = scene.difficultyLevel().hackerShieldStrength;
                helpedIcon.icon.shieldMaga.shieldStrength = helpedIcon.shieldStrength;
                helpedIcon.icon.shieldWoke.shieldStrength = helpedIcon.shieldStrength;
                if (!scene.sharedData.shieldRounds) {
                    scene.sharedData.shieldRounds = {};
                }
                scene.sharedData.shieldRounds[helpedIcon.iconName] = 1;

                helpedIcon.icon.shieldWoke.setAlpha(0.5);
                scene.tweens.add({
                    targets: helpedIcon.icon.shieldWoke,
                    alpha: 1,
                    ease: 'Sine.easeInOut',
                    duration: 500,
                    yoyo: true,  // after going up, go back down
                    repeat: 2
                });

                launchHurtThreats();
            }
            // The helper token's representative character's help icon matches the icon into which it's been dropped.
            if (character.powerTokenType == 'type_5' && character.helps == icon.iconName) {
                let helpedIcon = icon;
                consumeToken();
                showTooltip(character, 500, 500);

                // The health of the 'helps' icon is improved
                icon.health += incrementAmount;
                // Check to see if we win
                if (scene.checkForWin()) {
                    return;
                }
                // Bonus: Someone of your own faction can reduce the MAGAness or Wokeness of your own faction.
                // Imagine the scenario of a bunch of angry MAGA protesters storming around the environment icon and some
                // super MAGA supporter shows up and provides an environmental solution they like.  That would reduce MAGAness.
                let otherFaction = character.faction == 'maga' ? 'woke' : 'maga';
                if (icon[character.faction] > icon[otherFaction]) {
                    let numReturns = Math.min(5, (icon[character.faction] - icon[otherFaction])/5);
                    let territory = territories[4]; // arbitrarily picked this territory to return to
                    console.log('return '+numReturns+' threats');
                    scene.returnThreat(territory, character.faction, helpedIcon, numReturns);
                }
                scene.drawGauges(scene, helpedIcon.icon.x, helpedIcon.icon.y, helpedIcon.maga, helpedIcon.woke, helpedIcon.health, helpedIcon.healthScale, helpedIcon.gaugeMaga, helpedIcon.gaugeWoke, helpedIcon.gaugeHealth, helpedIcon.scaleSprite, helpedIcon.littleHats);

                launchHurtThreats();
                if (icon.iconName == 'military') {
                    scene.militaryAllocation = true;
                    scene.totalMilitaryAllocThisScene += scene.difficultyLevel().militaryAllocationAmount;
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
                scene.drawHealthGauge(scene, aspectPercent(icon.maga, icon.woke, icon.health, icon.healthScale)/ 100, defense.x, defense.y, 'Health', icon.gaugeHealth);
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
