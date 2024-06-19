import { characters } from './BaseScene.js';
import { territories } from './BaseScene.js';

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

    this.currentTutorialIndex++;
    displayTutorial(); // Display next item
};

function renderCharacters(scene) {
    let Wokeindex = 0;
    let MAGAindex = 0;
    let xOffset = 0;
    let characterText;

    // Check if there are any characters to endorse for MAGA faction
    let hasMagaCharacters = characters.some(character => character.faction === 'maga' && !character.dne);

    // Check if there are any characters to endorse for Woke faction
    let hasWokeCharacters = characters.some(character => character.faction === 'woke' && !character.dne);

    // Display "Endorse?" headline for MAGA faction if there are eligible characters
    if (hasMagaCharacters) {
        let endorseMaga = scene.add.text(0, 220, 'Endorse?',
                            { fontSize: '22px', fontFamily: 'Roboto', color: '#ff4040', align: 'left' });
        let underline = scene.add.graphics();
        underline.lineStyle(2, 0xff4040); // Set the line thickness and color
        underline.beginPath();
        underline.moveTo(endorseMaga.x, endorseMaga.y + endorseMaga.height);
        underline.lineTo(endorseMaga.x + endorseMaga.width, endorseMaga.y + endorseMaga.height);
        underline.closePath();
        underline.strokePath();
    }

    if (hasWokeCharacters) {
        let endorseWoke = scene.add.text(0 + scene.sys.game.config.width * .74, 220, 'Endorse?',
                                                { fontSize: '22px', fontFamily: 'Roboto', color: '#8080ff', align: 'left' });
        let underline = scene.add.graphics();
        underline.lineStyle(2, 0x8080ff); // Set the line thickness and color
        underline.beginPath();
        underline.moveTo(endorseWoke.x, endorseWoke.y + endorseWoke.height);
        underline.lineTo(endorseWoke.x + endorseWoke.width, endorseWoke.y + endorseWoke.height);
        underline.closePath();
        underline.strokePath();
    }

    characters.forEach((character, index) => {
        if (character.dne) { return; }
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
            xOffset = scene.sys.game.config.width * .74;
        }

        if (!scene.hasBeenCreatedBefore) {
            //charVal[character.name] = 250 + xOffset;
        } else {
            character.endorsement += character.value;
            character.prevValue = 0;
            character.backing = character.value;
            //character.value = 0;
        }
        let healthTextRange = ['None', 'Endorsed', 'Fully Endorsed'];
        let healthText = healthTextRange[Phaser.Math.Clamp(character.endorsement, 0, 2)];

        let characterText = scene.add.text(50 + xOffset, 250 + (rowIndex * 60), character.name + '\nBacking: ' + healthText,
                            { fontSize: '16px', fontFamily: 'Roboto', color: textColor, align: 'left' }).setInteractive();

        character.charText = characterText; // back reference to text so we can find the location later

        character.checkbox = createCheckbox(scene, 20 + xOffset, 270 + (rowIndex * 60), character, characterText, function (character, backing) {
            character.backing = backing;
        }, character.backing);

        scene.characterTexts.push(characterText); // Push characterTexts just so we can reference location w pointers later
    });
}

function startNextScene(scene) {
    // pass this scene's this.sharedData to insurrection's setup, (where it is assigned to insurrection's this.sharedData)
    // question: does this scene's sharedData ever even get used?
    scene.sharedData.icons = scene.icons;
    scene.sharedData.MAGAness = scene.MAGAness;
    scene.sharedData.Wokeness = scene.Wokeness;
    scene.sharedData.totalPoliticalCapital = scene.totalPoliticalCapital;
    console.log('start next scene');
    //Function to handle dilemma or insurrection
    const handleDilemmaOrInsurrection = () => {
        console.log('before calling dilemmaOdds, WokenessVelocity = ' + scene.sharedData.WokenessVelocity);
        if (scene.difficultyLevel().dilemmaOdds) {
            scene.scene.get('dilemma').setup(scene.sharedData);
            scene.scene.start('dilemma');
        } else {
            scene.scene.get('insurrection').setup(scene.sharedData);
            scene.scene.start('insurrection');
        }
    };

    if (scene.militaryAllocation == true) {
        scene.militaryAllocation = false;
        if (scene.difficultyLevel().militaryAutoSpend == true) {
            militaryAssets.forEach((asset, index) => {
                asset.techLevel += scene.totalMilitaryAllocThisScene/10;
                console.log(asset.name + ' has a new tech level of ' + asset.techLevel);
            });
            // Need to go to scene to indicate additional military strength
            scene.scene.get('TutorialScene').setup(scene.sharedData);
            scene.scene.start('TutorialScene', { nextScene: 'dilemmaOrInsurrection', message: 'Beginner Level\nMilitary Capital automatically invested.\nYour Alien Defense is now stronger!' });
            //this.scene.pause('politics');

            //handleDilemmaOrInsurrection();
        } else { // if autospend is false
            scene.sharedData.militaryAllocation = scene.totalMilitaryAllocThisScene;
            scene.scene.get('military allocation').setup(scene.sharedData);
            scene.scene.start('military allocation');
        }
    } else {
        handleDilemmaOrInsurrection();
    }
}

function updateCharVal(scene, character, value, characterText) {
    let undoCheck = false;

    let MAGAupdate;
    let WokeUpdate;

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

    // New feature: If you've spent all your political capital, go to the next scene!
    if (scene.MAGAness + scene.Wokeness < 4
        && (Object.keys(scene.sharedData.helperTokens).length == 0)
        && !scene.transitionToNewScene
        && characters.every(character => character.endorsement <= 1)) {
        scene.transitionToNewScene = 1;
        scene.currentTutorialIndex = 99;
        let message = 'Political Capital has been Allocated!';

        // Create a text object to display a victory message
        let nextSceneText = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY, message, {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        nextSceneText.setOrigin(0.5);  // Center align the text
        nextSceneText.setAlpha(0.8);
        nextSceneText.setDepth(10);

        // Create a black overlay
        let overlay = scene.add.rectangle(scene.cameras.main.centerX, scene.cameras.main.centerY, scene.cameras.main.width, scene.cameras.main.height, 0x000000);
        overlay.setOrigin(0.5);
        overlay.setAlpha(0); // Start with the overlay invisible

        // Ensure the message text is above the overlay
        scene.children.bringToTop(nextSceneText);

        // Fade in the black overlay
        scene.tweens.add({
            targets: overlay,
            alpha: 1, // Fade to fully opaque
            duration: 1000, // Duration of the fade
            onComplete: () => {
                scene.time.delayedCall(1, () => {
                    scene.cameras.main.fadeOut(1000, 0, 0, 0);
                    scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                        scene.transitionToNewScene = 0;
                        startNextScene(scene);
                    });
                });
            }
        });
    }
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

        let undoCheck = updateCharVal(scene, character, value, characterText);
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

        let undoCheck = updateCharVal(scene, character, value, characterText);
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
            undoCheck = updateCharVal(scene, character, value, characterText);
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

    return { checkboxUnchecked, checkboxChecked, checkboxUncheckedAction, checkboxCheckedAction };
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

// Export the functions
export { clearCurrentTutorial, renderCharacters, insertLineBreaks, startNextScene };
