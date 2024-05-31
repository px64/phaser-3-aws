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
//=========================================================================================================================

import BaseScene from './BaseScene.js';
import { characters } from './BaseScene.js';
import { territories } from './BaseScene.js'

//var MAGAness = 0;
var MAGAupdate = 0;
var MAGAnessText;
//var Wokeness = 0;
var WokeUpdate = 0;
var WokenessText;
var polCapText;
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
            militaryAllocation: 0
        };
        // hack: decrease all character's endorsements by 3
        characters.forEach((character, index) => {
            character.endorsement -= 3;
        });
    }
    // politics
    setup(data) {
/*
        var stack = new Error().stack;
        console.log("Called by: ", stack);
 */

        console.log(' politics: setup is loading sharedData');

        Object.assign(this.sharedData, data);


        console.log('MAGA: ' + this.sharedData.MAGAness + ' Woke: ' + this.sharedData.Wokeness);
        console.log(this.sharedData.icons);
    }

    //====================================================================================
    //
    // create()
    //
    //====================================================================================
    create() {
        this.input.setDefaultCursor('default');

        console.log(this.sharedData.icons);
        if (!Object.keys(this.sharedData.icons).length) {
            console.log('new data here in politics');
            // initialize icons...
            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();
            this.initializeIcons();

            this.icons = this.sharedData.icons;
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
            this.extraMisinformationTokens = 0;

            // ...similarly for other icons
        } else {
            //this.icons = this.sharedData.icons;
            console.log('already have shared data to use.');
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
            console.log('in create, MAGA: ' + this.MAGAness + ' Woke: ' + this.Wokeness);
            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();

            // recreate the icons with the saved state
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
                    iconData.shieldStrength
                );
            }
        }

        this.totalMilitaryAllocThisScene = 0;

        // Create a button using an image
        let nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);

        // When the button is clicked, start the next scene
        nextButton.on('pointerdown', () => {
            // pass this scene's this.sharedData to insurrection's setup, (where it is assigned to insurrection's this.sharedData)
            // question: does this scene's sharedData ever even get used?
            this.sharedData.icons = this.icons;
            this.sharedData.MAGAness = this.MAGAness;
            this.sharedData.Wokeness = this.Wokeness;

            if (this.militaryAllocation == true) {
                this.militaryAllocation = false;
                this.sharedData.militaryAllocation = this.totalMilitaryAllocThisScene;
                this.scene.get('military allocation').setup(this.sharedData);
                this.scene.start('military allocation');
            } else {
                this.scene.get('dilemma').setup(this.sharedData);
                this.scene.start('dilemma');
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

            drawGauges(env.icon.x, env.icon.y, env.maga, env.woke, env.health, env.healthScale, env.gaugeMaga, env.gaugeWoke, env.gaugeHealth), env.scaleSprite;

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
                this.icons['government'].textBody = 'Government\nStrength: ';
                this.icons['government'].iconText.setText(this.icons['government'].textBody + governmentSize);
            }
/*
            else {
                this.icons['government'].textBody = 'Living on the Dole: ' + (governmentSize-1000)/50 + '%\nCrony Capitalism: ' + ((governmentSize-800)/66).toFixed(2) +'%\nGovernment Stability: ';

                this.icons['government'].iconText.setText(this.icons['government'].textBody + governmentSize);
            }
 */
            drawGauges(gov.icon.x, gov.icon.y, gov.maga, gov.woke, gov.health, gov.healthScale, gov.gaugeMaga, gov.gaugeWoke, gov.gaugeHealth, gov.scaleSprite);
        }
        //====================================================================================
        //
        // The main body of create()
        //
        //====================================================================================
        this.createTerritories();

        let totalCapital = this.MAGAness + this.Wokeness;

        polCapText = this.add.text(20, 0, 'Political Capital ' + totalCapital, { fontSize: this.sharedData.medFont, fill: '#0f0' });

        // Create Year text
        yearText = this.add.text(this.sys.game.config.width * .8, 0, 'Year: ' + this.sharedData.year, { fontSize: this.sharedData.medFont, fill: '#fff' });


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


        //====================================================================================
        //
        // The following code block creates characters with slider bars .
        // It also creates (or recreates) helpful tokens if the character is endorsed enough
        //
        //====================================================================================
        this.characterSliders = []; // keep track of the sliders
        this.characterTexts = []; // keep track of character text pointers

        let Wokeindex = 0;
        let MAGAindex = 0;
        let xOffset = 0;
        let numberOfSteps = 7;
        let defaultValue = 0;
        let characterText;
        let nextScreenTutorial = [
            {
                story: [
                    "Click on the Earth Icon to",
                        "move to the next screen"
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
            let backstoryText = this.add.text(nextButton.x-130, nextButton.y-75, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: '#fff', align: 'center' });
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


        characters.forEach((character, index) => {
            let matchHelps = false;
            let matchHurts = false;
            for (let key in this.sharedData.icons) {
                let iconData = this.sharedData.icons[key];
                if (character.helps == iconData.iconName) matchHelps = true;
                if (character.hurts == iconData.iconName) matchHurts = true;
            };
            if (character.powerTokenType == 'type_5' && (matchHurts == false || matchHelps == false)) {character.dne = true; return;}
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

            characterText = this.add.text(50+xOffset, 265 + (rowIndex * 85), character.name + '\nBacking: ' + character.value + '/ 6,\nEndorsement: ' + character.endorsement,
                                { fontSize: '16px', fontFamily: 'Roboto', color: textColor, align: 'center' }).setInteractive();

            character.charText = characterText; // back reference to text so we can find the location later

            if (!this.hasBeenCreatedBefore) {
                charVal[character.name] = 250+xOffset;
            } else {
                character.endorsement += character.value;
                character.prevValue = 0;
                character.value = 0;
            }

            let initialValue = character.value / (numberOfSteps - 1); // character.value should be a number from 0 to numberOfSteps - 1
            let characterSlider = createSlider(this, 150+xOffset, 250 + (rowIndex * 85), character, characterText, value => {
                charVal[character.name] = characterSlider.slider.x;
                character.value = value;
            }, initialValue);

            this.characterSliders.push(characterSlider);
            this.characterTexts.push(characterText);
        });

        let scene = this;

        if (this.hasBeenCreatedBefore) {
            // Recreate all previously created helpful tokens that have not been used yet
            for (let key in scene.sharedData.helperTokens) {
                // Lookup stored data
                let storedData = scene.sharedData.helperTokens[key];
                console.log('helperToken ' + storedData.text + ' has been recreated and the saved index is ' + storedData.helperTokenIndex);
                let helpfulToken = createPowerToken(scene, storedData.type, storedData.text, storedData.x, storedData.y, storedData);
                // debug helpfulToken.sprite.setVisible(true);
                scene.helperIcons.add(helpfulToken.sprite); // This line is supposed to make interactions possible
                helpfulToken.container.setInteractive({ draggable: true }); // make each defense item draggable
                helpfulToken.container.character = storedData.character;
            }

            let helpfulTokenIndex = Object.keys(scene.sharedData.helperTokens).length; // Starting index for new tokens
            console.log('starting index helpfulTokenIndex is equal to ' + helpfulTokenIndex);

            // Go through each character, recreate the slider and track, and check if any new helpful tokens need to be generated
            characters.forEach((character, index) => {
                if (character.dne == true) {return;}
                // Recreate slider and track here
                if (character.endorsement > 10) {
                    // Create new helpful token
                    createHelpfulToken(this, character, helpfulTokenIndex);
                    helpfulTokenIndex++;
                    character.endorsement -= 10;
                }
                // Recreate text here
                character.charText.setText(character.name + '\nBacking: ' + character.value + '/ 6,\nEndorsement: ' + character.endorsement);
            });
        }

        function createHelpfulToken(scene, character, helpfulTokenIndex) {
            let text = character.power;
            let charText = character.charText;

            let xOffset = charText.x + 50;
            let yOffset = charText.y + 10;

            // Store position data
            let storedData = {
                x: xOffset,
                y: yOffset,
                type: character.faction,
                text: text,
                character: character,
                helperTokenIndex: helpfulTokenIndex
            };

            // Store new helpful token data indexed by character.name
            scene.sharedData.helperTokens[character.name] = storedData;

            // Create new helpful token
            let size = 'normal';
            if (character.powerTokenType === 'type_2') {
                size = 'large';
            }
            let helpfulToken = createPowerToken(scene, character.faction, text, xOffset, yOffset, storedData, size, 'normal', false);

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
                    console.log(helpedIcon);
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
                    console.log(hurtIcon);
                }
            });
            helpfulToken.container.on('pointerup', function (pointer, dragX, dragY) {
                //let helpedIcon = scene.sharedData.icons.find(asset => asset.iconName === character.helps);
                let helpedIcon = scene.sharedData.icons[character.helps];
                console.log(helpedIcon);
                if (helpedIcon) {
                    helpedIcon.icon.shieldWoke.setAlpha(0);
                }
                let hurtIcon = scene.sharedData.icons[character.hurts];
                if (hurtIcon) {
                    hurtIcon.icon.shieldMaga.setAlpha(0);
                    console.log(hurtIcon);
                }
            });
            if (character.powerTokenType === 'type_2') {
                scene.extraMisinformationTokens = 4;
                helpfulToken.container.x = 680;
                helpfulToken.container.y = 290;
                helpfulToken.container.setAlpha(.25);
                scene.tweens.add({
                    targets: helpfulToken.container,
                    alpha: .8,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    duration: 4000,
                    onComplete: function () {
                        helpfulToken.container.destroy();
                        delete scene.sharedData.helperTokens[helpfulToken.container.character.name];
                        //tooltip.text.setVisible(false);
                        //tooltip.box.setVisible(false);
                    },
                    callbackScope: scene
                });
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
            threat.destroy();
            this.roundThreats--;
            console.log('defense destroyed threat.  Down to ' + this.roundThreats);
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
            if (scene.sharedData.ideology.faction == 'maga') {
                numEntries = 2;
            }
            if (scene.hasBeenCreatedBefore) {

                numEntries = scene.extraMisinformationTokens;
                console.log('extraTokens = ' + scene.extraMisinformationTokens);
                scene.extraMisinformationTokens = 0;
                if (Math.random < .2) numEntries += 1;
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
                    //misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                    misinformation.container.misinformationIndex = storedData.misinformationIndex; // restore index too!
                    console.log('restore misinformation index '+ misinformation.container.misinformationIndex);
                    misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again
                    // just keep track of offsets in case the tokens are still in their original positions for below
                    if (storedData.type === 'maga') {
                        scene.yMagaOffset += misinformation.container.displayHeight;
                    } else {
                        scene.yWokeOffset += misinformation.container.displayHeight;
                    }
                }
            }

            // This block should run regardless of whether the scene has been created before
            for (let i = 0; i < numEntries; i++) { // create 2 entries the first time, then some number depending on politics
                if (scene.currentMisinformationIndex < misinformationData.length) { // if we haven't reached the end of the array
                    let data = misinformationData[scene.currentMisinformationIndex];

                    let xOffset = data.type === 'maga' ? scene.sys.game.config.width * .39 : scene.sys.game.config.width * .625;
                    let yOffset = data.type === 'maga' ? scene.yMagaOffset: scene.yWokeOffset;

                    // Store the position data
                    let storedData = {
                        x: xOffset,
                        y: yOffset,
                        type: data.type,
                        text: data.text,
                        misinformationIndex: scene.currentMisinformationIndex
                    };

                    scene.sharedData.misinformation[scene.currentMisinformationIndex] = storedData;

                    let misinformation = createPowerToken(scene, 'neutral', data.text, xOffset, yOffset, storedData, 'normal', false, 'drop once');
                    scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                    scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group

                    misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                    misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again

                    misinformation.container.misinformationIndex = scene.currentMisinformationIndex;
                    // Increment the corresponding offset for next time
                    if (data.type === 'maga') {
                        scene.yMagaOffset += misinformation.container.displayHeight;
                        scene.yMagaOffset = Phaser.Math.Wrap(scene.yMagaOffset, scene.game.config.height *.2 ,scene.game.config.height * .9);
                    } else {
                        scene.yWokeOffset += misinformation.container.displayHeight;
                        scene.yWokeOffset = Phaser.Math.Wrap(scene.yWokeOffset, scene.game.config.height *.2 ,scene.game.config.height * .9);
                    }
                    scene.currentMisinformationIndex++; // increment the index for the next call
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
            // Do the appropriate thing depending on the helper type
            if (helper.container.character.powerTokenType == 'type_3') {
                let helpedIcon = icon.icon;
                let tooltip = createTooltip(scene, helper.container.character, 500, 500, helpedIcon.icon, helpedIcon.iconText);
                scene.icons[icon.iconName].shieldStrength = 1;
                helpedIcon.shieldWoke.setAlpha(0.1);

                scene.tweens.add({
                    targets: helper.container,
                    alpha: 0,
                    duration: 50,
                    onComplete: function () {
                        helper.container.destroy();
                        //tooltip.text.setVisible(false);
                        //tooltip.box.setVisible(false);
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
                    //tooltip.text.setVisible(true);
                    //tooltip.box.setVisible(true);
                    helper.isDestroyed = true;
                }

                //console.log(helpedIcon.shieldMaga);
                //console.log(icon.iconName + ' ' + scene.icons[icon.iconName]);
            }
            if (helper.container.character.powerTokenType == 'type_5') {
                // Automatically directed to a predetermined icon.  If this is the wrong one, nothing happens.
                //console.log(helper.container.character.faction + ' ' + helper.container.character.helps + '  ' + icon.iconName + ' ' + helper.container.character.hurts);
                //console.log(scene.icons[helper.container.character.hurts][helper.container.character.faction]);
                // The helper token's representative character's help icon matches the icon into which it's been dropped.
                // This where we apply the various actions based on attributes contributed by the represented character's power
                if (helper.container.character.helps == icon.iconName) {
                    let helpedIcon = scene.icons[helper.container.character.helps];
                    let tooltip = createTooltip(scene, helper.container.character, 500, 500, helpedIcon.icon, helpedIcon.iconText);
                    scene.tweens.add({
                        targets: helper.container,
                        alpha: 0,
                        duration: 5000,
                        onComplete: function () {
                            helper.container.destroy();
                            tooltip.text.setVisible(false);
                            tooltip.box.setVisible(false);

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
                                scene.scene.start('VictoryScene', { message: 'You Win!\nIn the year ' + scene.sharedData.year + '\nAll Aspects of society are Excellent\nand at 100%!'});
                            });
                            helper.isDestroyed = true;
                            return;
                        }
                        // Bonus: Someone of your own faction can reduce the MAGAness or Wokeness of your own faction.
                        // Imagine the scenario of a bunch of angry MAGA protesters storming around the environment icon and some
                        // super MAGA supporter shows up and provides an environmental solution they like.  That would reduce MAGAness.
                        let otherFaction = helper.container.character.faction == 'maga' ? 'woke' : 'maga';
                        if (icon[helper.container.character.faction]> icon[otherFaction]) {
                            let numReturns = Math.min(5,(icon[helper.container.character.faction] -  icon[otherFaction])/10);
                            let territory = territories[4]; // arbitrarily picked this territory to return to
                            scene.returnThreat(territory, helper.container.character.faction, helpedIcon, numReturns);
                            //icon[helper.container.character.faction] = icon[otherFaction];
                        }
                        scene.drawGauges(helpedIcon.icon.x, helpedIcon.icon.y, helpedIcon.maga, helpedIcon.woke, helpedIcon.health, helpedIcon.healthScale, helpedIcon.gaugeMaga, helpedIcon.gaugeWoke, helpedIcon.gaugeHealth, helpedIcon.scaleSprite);
                        // Delete data from sharedData.helperTokens
                        console.log('delete name ' + helper.container.character.name);
                        delete scene.sharedData.helperTokens[helper.container.character.name];
                        let hurtIcon = scene.icons[helper.container.character.hurts];
                        let territory = territories[3]; // arbitrarily picked this territory to launch from
                        // But we also launch 5 faction threats at the 'hurts' icon
                        console.log('character ' + helper.container.character.name + 'launches 5 threats');
                        scene.createThreat(territory, helper.container.character.faction, hurtIcon, 5);
                        scene.drawGauges(hurtIcon.icon.x, hurtIcon.icon.y, hurtIcon.maga, hurtIcon.woke, hurtIcon.health, hurtIcon.healthScale, hurtIcon.gaugeMaga, hurtIcon.gaugeWoke, hurtIcon.gaugeHealth, hurtIcon.scaleSprite);
                        tooltip.text.setVisible(true);
                        tooltip.box.setVisible(true);
                        if (icon.iconName == 'military') {
                            scene.militaryAllocation = true;
                            scene.totalMilitaryAllocThisScene += 80;
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

            scene.tweens.add({
                targets: threat,
                alpha: 0,
                duration: 500,
                onComplete: function () {
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
                scene.drawHealthGauge(icon[type]/ 100,defense.x,defense.y, type, gauge, icon['maga'], icon['woke'], icon.scaleSprite);
                scene.drawHealthGauge(icon.health/ icon.healthScale/ 100, defense.x, defense.y, 'Health', icon.gaugeHealth);
                icon.iconText.setText(icon.textBody + Math.floor(icon.health) + message);
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


            scene.physics.add.overlap(icon.icon, scene.helperIcons, function(base, helper) {
                handleHelperOverlap(icon, base, helper, 70, '', icon.gaugeWoke, '');
            });


            scene.physics.add.overlap(icon.icon, scene.wokeThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 5, 'woke', icon.gaugeWoke, '\nToo much Wokeness!');
            });

            scene.physics.add.overlap(icon.icon, scene.magaThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 5, 'maga', icon.gaugeMaga, '\nMake America Great Again!');
            });

            scene.physics.add.overlap(icon.icon, scene.putieThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 2, 'maga', icon.gaugeMaga, '\nToo Much Putin!');
                if (!threat.isPutieDestroyed) {
                    threat.isPutieDestroyed = true;
                    icon['woke'] += 5;
                    scene.drawHealthGauge(icon['woke']/ 100,defense.x,defense.y, 'woke', icon.gaugeWoke, icon['maga'],icon['woke'], icon.scaleSprite);
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

        function createPowerToken(scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce) {
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

            // Group the text, outline, and rectangle into a single container
            let misinformation = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);

            // Set the size of the container to match the size of the outline rectangle
            //misinformation.setSize(outline.width, outline.height);
            misinformation.setSize(outline.width, outline.height);
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
            if (dropOnce == 'drop once') {
                misinformation.on('dragend', function(pointer, dragX, dragY) {
                    outlineTween.stop();
                    rectangleTween.stop();
                    this.disableInteractive();
                    misinformationSprite.setImmovable(true);
                    let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                    rectangle.setFillStyle(0x228B22); // Now the rectangle is forest green
                });
            }
            if (hasBeenCreatedBefore == true) {
                console.log('hasBeenCreatedBefore, so stop everything');
                outlineTween.stop();
                rectangleTween.stop();
                misinformation.disableInteractive();
                misinformationSprite.setImmovable(true);
                let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                rectangle.setFillStyle(0x228B22); // Now the rectangle is red
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
                    let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
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
                polCapText.setText('Political Capital ' + (tmpMAG+tmpWok).toString());
                polCapText.setColor('#ff0000'); // Change text color to red
                polCapText.setBackgroundColor('#ffff00'); // Change background color to yellow
/*
                MAGAnessText.setText('MAGA political\ncapital: ' + tmpMAG);
                MAGAnessText.setColor('#ff0000'); // Change text color to red
                MAGAnessText.setBackgroundColor('#ffff00'); // Change background color to yellow

                WokenessText.setText('Woke political\ncapital: ' + tmpWok);
                WokenessText.setColor('#0000ff'); // Change text color to blue
                WokenessText.setBackgroundColor('#ffff00'); // Change background color to yellow
 */

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
                    // For some reason the concept of partial credit transfer isn't working.  Went back to
                    // either you can transfer all (see the code above) or none.
                    /*
                        if (tmpWok > 0) {
                            tmpMAG += tmpWok;   // transfer as much of tmpWok as possible to tmpMAG
                            tmpWok = 0;
                            if (tmpMAG < 0) {  // if tmpMAG is still negative, we can't update the MAGAness yet
                                MAGAupdate = scene.MAGAness;
                            } else {
                                MAGAupdate = scene.MAGAness - tmpMAG;
                            }
                        } else {
                            MAGAupdate = scene.MAGAness;
                        }
 */
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
                    let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
                    characterText.setColor(textColor);
                    this.track.setTint(0xffffff);
                }

                polCapText.setText('Political Capital ' + (tmpMAG+tmpWok).toString());
                polCapText.setColor('#00ff00'); // Change text color back to green
                polCapText.setBackgroundColor('#000000'); // Change background color back to black

 /*
                MAGAnessText.setText('MAGA political\ncapital: ' + tmpMAG);
                MAGAnessText.setColor('#ffffff'); // Change text color back to white
                MAGAnessText.setBackgroundColor('#000000'); // Change background color back to black

                WokenessText.setText('Woke political\ncapital: ' + tmpWok);
                WokenessText.setColor('#ffffff'); // Change text color to back to white
                WokenessText.setBackgroundColor('#000000'); // Change background color back to black
 */

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
        //====================================================================================
        //    function createTooltip(scene, character, x, y, slider, characterText)
        //====================================================================================
        function createTooltip(scene, character, x, y, slider, characterText) {
            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
            let xOffset = 0;//character.faction === 'maga' ? 320 : -320;

            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(character.shortstory.join(' '), 37);
            let backstoryText = scene.add.text(x+xOffset, y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(false);
            backstoryText.setDepth(2);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
            backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff8080 : 0x8080ff, 0.3);
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
            let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
            let xOffset = character.faction === 'maga' ? 320 : -320;

            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(character.shortstory.join(' '), 37);
            let backstoryText = scene.add.text(x+xOffset, y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(false);
            backstoryText.setDepth(2);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
            backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff8080 : 0x8080ff, 0.8);
            backstoryBox.isStroked = true;
            backstoryBox.setOrigin(0.5);
            backstoryBox.setVisible(false);
            backstoryBox.setDepth(1);

            const mouseOver = () => {
                backstoryText.setVisible(true);
                backstoryBox.setVisible(true);
            };

            const mouseOff = () => {
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
            };

            slider.on('pointerover', mouseOver);
            characterText.on('pointerover', mouseOver);

            slider.on('pointerout', mouseOff);
            characterText.on('pointerout', mouseOff);
        }

        // the very end of create()
        this.hasBeenCreatedBefore = true;
    }


    //====================================================================================
    //
    //        update()
    //
    //====================================================================================
    update() {
        // game loop
        // This is called 60 times per second. Put game logic here.
/*
        if (this.roundThreats == 20) {this.scene.start('AliensAttack'); }
        if (Math.random() < 0.01) {
            let attackerIndex = Phaser.Math.Between(0, territories.length - 1);
            let attackerTerritory = territories[attackerIndex];
            let territoryWidth = this.sys.game.config.width / territories.length;

            let threatIcon = attackerTerritory.faction === 'maga'? 'magaBase': 'wokeBase';
            let threat;

            if (attackerTerritory.faction == 'maga'){
                threat = this.magaThreats.create(attackerTerritory.x + territoryWidth/2, this.game.config.height-25, threatIcon).setScale(0.1);
            } else {
                threat = this.wokeThreats.create(attackerTerritory.x + territoryWidth/2, this.game.config.height-25, threatIcon).setScale(0.1);
            }
            threat.setBounce(1);

            let keys = Object.keys(this.icons);
            let attackedIconKey = keys[Phaser.Math.Between(0, keys.length - 1)];
            let attackedIcon = this.icons[attackedIconKey].icon;

            this.physics.moveTo(threat, attackedIcon.x, attackedIcon.y, 100); // 100 is the speed of the threat.
            this.roundThreats++;
        }
 */
    }
}
