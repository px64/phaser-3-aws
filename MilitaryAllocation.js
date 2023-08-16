//=========================================================================================================================
//
//                  Military Allocation
//      When Military health is improved, how to allocate the resources
//
//
//=========================================================================================================================
//    Military strength can take on several different aspects:
//        - limited missiles to fire: more missiles
//        - faster missiles
//        - improved accuracy
//        - bigger explosions (would need to add missile detonation at destination and an explosion)
//        - more frequent reload (would need to add a time delay between missile launches)
//              -- idea that also impacts putieville: perhaps each territory has a launch delay and
//              -- it automatically round-robins between territories so the delay can catch up when returning to territory #1
//=========================================================================================================================

import BaseScene from './BaseScene.js';
import { characters } from './BaseScene.js';
import { territories } from './BaseScene.js';
import { militaryAssets} from './BaseScene.js';

var militaryUpdate = 0;
var militaryAlloc = 10;

var assetVal = {};


export class MilitaryAllocation extends BaseScene {

    constructor() {
        super({ key: 'military allocation' });
        this.sharedData = { icons: {} };
    }
    // politics is the one we didn't have to switch everything to shareddata
    setup(data) {
        console.log(' Military Allocation: setup is loading sharedData with this.icons');
            Object.assign(this.sharedData, data);

    }

    //====================================================================================
    //
    // create()
    //
    //====================================================================================
    create() {
        if (!Object.keys(this.sharedData.icons).length) {
            console.log('new data here in politics');
            // initialize icons...
            this.initializeIcons();

            this.icons = this.sharedData.icons;
            // ...similarly for other icons
        } else {
            //this.icons = this.sharedData.icons;
            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();
            console.log('already have shared data to use.');
            // recreate the icons with the saved state
            //for (let key in this.sharedData.icons)
            let key = 'military';
            {
                let iconData = this.sharedData.icons[key];
                let fontSize = parseInt(iconData.iconText.style.fontSize, 10);
                this.sharedData.icons[key] = this.createIconWithGauges(
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
        }

        militaryAlloc = this.sharedData.militaryAllocation;

        // Create a button using an image
        let nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);

        // When the button is clicked, start the next scene
        nextButton.on('pointerdown', () => {
            // pass this scene's this.sharedData to insurrection's setup, (where it is assigned to insurrection's this.sharedData)
            // question: does this scene's sharedData ever even get used?
            militaryAssets.forEach((asset, index) => {
            console.log(asset);
                asset.techLevel += asset.prevValue;
                asset.value = 0;
                asset.prevValue = 0;
            });
            this.scene.get('insurrection').setup(this.sharedData);
            this.scene.start('insurrection');
        });


        // Call the function to create curved text
        //createCurvedText('Military Spending', 200, this);


        this.cameras.main.fadeIn(2000, 0, 0, 0);

        this.roundThreats = 0;


        //====================================================================================
        //
        // environmentalImpact
        //
        //====================================================================================
        let environmentalImpact = () => {
            let env = this.icons['environment'];

            env.health += 5 - Math.abs(env.maga - env.woke);
            if (env.health < 0) {
                this.scene.start('TutorialScene', { message: 'Environment is Destroyed.  You LOSE!' });
                this.scene.pause();
                return;
            }

            env.iconText.setText(env.textBody + env.health);

            //this.drawHealthBar(1, 100, 100, 'maga', this.envHealthBarMaga);
            //this.drawHealthBar(0.7, 110, 100, 'woke', this.envHealthBarWoke);

            drawGauges(env.icon.x, env.icon.y, env.maga, env.woke, env.health, env.healthScale, env.gaugeMaga, env.gaugeWoke, env.gaugeHealth);

            if (0) {//Math.random() < 0.3) {
                this.scene.start('AliensAttack');
            }
        }
 /*

        function createCurvedText(text, radius, scene) {
            let totalAngle = 2; // Total angle span of the text
            let startAngle = -totalAngle / 2; // Starting angle (so text is centered around 0)

            // Calculate the angle between each letter
            let angleStep = totalAngle / (text.length - 1);

            let chars = text.toUpperCase().split('');
            let charArray = [];

            chars.forEach((char, index) => {
                let charAngle = startAngle + (index * angleStep);

                // Create the character at the correct position along the curve
                let charX = scene.sys.game.config.width / 2 + radius * Math.cos(charAngle);
                let charY = scene.sys.game.config.height / 2 + radius * Math.sin(charAngle);

                let letter = scene.add.text(charX, charY, char, {
                    fontSize: '64px',
                    color: '#ffffff'
                }).setOrigin(0.5, 0.5);

                // Rotate the letter to be tangential to the curve
                letter.setRotation(-charAngle);


                charArray.push(letter);
            });

            return charArray;
        }
 */


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
            drawGauges(gov.icon.x, gov.icon.y, gov.maga, gov.woke, gov.health, gov.healthScale, gov.gaugeMaga, gov.gaugeWoke, gov.gaugeHealth);

            if ((governmentSize < 300) || (Wokeness + MAGAness > 50)) {
                MAGAness = Math.max(0, MAGAness-2);
                MAGAnessText.setText('MAGA Power: ' + MAGAness);
                Wokeness = Math.max(0, Wokeness-2);
                WokenessText.setText('Wokeness: ' + Wokeness);
                this.scene.start('TutorialScene', { message: 'Insurrection!  Government collapses!' });
            }
        }
        //====================================================================================
        //
        // The main body of create()
        //
        //====================================================================================


        // Create MAGAness text
        let MilAllocText = this.add.text(20, 0, 'Military Spending: ' + militaryAlloc, { fontSize: '16px', fill: '#fff' });
 /*
        // Create Wokeness text
        WokenessText = this.add.text(900, 0, 'Wokeness Political\n Capital: ' + Wokeness, { fontSize: '16px', fill: '#fff' });

        // Create Year text
        yearText = this.add.text(500, 0, 'Year: ' + year, { fontSize: '32px', fill: '#fff' });
 */



        //this.envHealthBarMaga = this.add.graphics();
        //this.envHealthBarWoke = this.add.graphics();
        //this.drawHealthBar(1, 100, 100, 'maga', this.envHealthBarMaga);
        //this.drawHealthBar(0.8, 110, 100, 'woke', this.envHealthBarWoke);
/*


        //====================================================================================
        //
        // The following function creates the information/misinformation blockers
        //
        //====================================================================================
        createMisinformationManagement(this);
 */

        //====================================================================================
        //
        // The following code block creates Assets with slider bars
        //
        //====================================================================================

        this.assetSliders = []; // keep track of the sliders
        this.assetTexts = []; // keep track of character text pointers

        let Wokeindex = 0;
        let MAGAindex = 0;
        let xOffset = 0;
        let rowIndex = 0;
        let numberOfSteps = 21; // Define the number of steps
        let defaultValue = 0;
        let textColor = '#ffffff';

        militaryAssets.forEach((asset, index) => {
            xOffset = 200;
            //asset.prevValue = asset.value = 0; // put it back to zero for this setup
            rowIndex++;

            let assetText = this.add.text(xOffset-75, 100 + (rowIndex * 100), asset.name + ' Backing: ' + asset.value + '/ ' + (numberOfSteps-1) + '\nTechnology Level: ' + asset.techLevel,
                            { fontSize: '16px', fontFamily: 'Roboto', color: textColor, align: 'center' }).setInteractive();

            if (!this.hasBeenCreatedBefore) {
                assetVal[asset.name] = 250+xOffset;
            }

            let initialValue = asset.value / (numberOfSteps - 1); // asset.value should be a number from 0 to numberOfSteps - 1
            let assetSlider = createSlider(this, initialValue + xOffset, 85 + (rowIndex * 100), asset, assetText, value => {
                assetVal[asset.name] = assetSlider.slider.x;
                asset.value = value;
            }, initialValue);

            this.assetSliders.push(assetSlider);
            this.assetTexts.push(assetText);
        });


        if (this.hasBeenCreatedBefore) {
            let helpfulTokenIndex = 0;
            militaryAssets.forEach((asset, index) => {
                let assetSlider = this.assetSliders[index];
                let stepSize = (assetSlider.track.width-20) / (numberOfSteps - 1); // Calculate the size of each step
                assetSlider.slider.x = (assetSlider.track.x - assetSlider.track.width / 2) + (asset.value * stepSize)+12;
                this.assetTexts[index].setText(asset.name + ' Backing: ' + asset.value + '/ ' + (numberOfSteps-1) + '\nTechnology Level: ' + asset.techLevel);
/*
                if (0) { // hardcode to true for now character.endorsement > 10) {
                    // new help token is generated, depending on the character endorsed.  added to misinformation data set
                    // after it is generated, it can be moved around or dropped into an icon for a certain effect
                    createHelpfulToken(this, character, helpfulTokenIndex);
                    helpfulTokenIndex++;
                    character.endorsement -= 10;
                }
 */

                asset.prevValue = asset.value;
                militaryUpdate = 0;
            });
        }

        this.hasBeenCreatedBefore = true;


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

            let numberOfSteps = 21; // Define the number of steps
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
                characterText.setText(character.name + ' Backing: ' + closestStep + '/ ' + (numberOfSteps-1)+ '\nTechnology Level: ' + character.techLevel);
                militaryUpdate = (closestStep - character.prevValue);

                // Update MAGAnessText and WokenessText here
                let tmpMil = militaryAlloc - militaryUpdate;
                MilAllocText.setText('Military Spending: ' + tmpMil);
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

                militaryUpdate = (value - character.prevValue);

                // Update MAGAnessText and WokenessText here
                let tmpMil = militaryAlloc - militaryUpdate;
                if (tmpMil < 0) {
                    militaryUpdate = militaryAlloc;
                    tmpMil = 0;
                    value = militaryUpdate + character.prevValue;
                    characterText.setText(character.name + ' Backing: ' + value + '/ ' + (numberOfSteps-1)+ '\nTechnology Level: ' + character.techLevel);
                    this.x = (this.track.x - this.track.width / 2) + (value * stepSize)+12;
                }


                MilAllocText.setText('Military Spending: ' + tmpMil);

                // Save the previous value for next calculation
                character.prevValue = value;

                // Update MAGAness and Wokeness with new values
                militaryAlloc = tmpMil;
            });


            // Set text color based on affiliation
            let textColor = '#808080'; //character.faction === 'maga' ? '#ff8080' : '#8080ff';
            let xOffset = 320; // character.faction === 'maga' ? 320 : -320;

            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(character.shortstory.join(' '), 37);
            let backstoryText = scene.add.text(x+xOffset, y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(false);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 0.2);
            backstoryBox.setStrokeStyle(2, 0x808080, 0.8);
            backstoryBox.isStroked = true;
            backstoryBox.setOrigin(0.5);
            backstoryBox.setVisible(false);

            slider.on('pointerover', () => {
                mouseOver();
            });
            characterText.on('pointerover', () => {
                mouseOver();
            });

            slider.on('pointerout', () => {
                //MAGAness += MAGAupdate;
                //Wokeness += WokeUpdate;
                //MAGAupdate = 0;
                //WokeUpdate = 0;
                mouseOff();
            });
            characterText.on('pointerout', () => {
                //MAGAness += MAGAupdate;
                //Wokeness += WokeUpdate;
                //MAGAupdate = 0;
                //WokeUpdate = 0;
                mouseOff();
            });

            return {track: track, slider: slider};

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
