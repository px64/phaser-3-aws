// characterUtils.js
import BaseScene from './BaseScene.js';
import { characters } from './BaseScene.js';
import { territories } from './BaseScene.js';

export class CharacterIntroductionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterIntroductionScene' });
        this.sharedData = {};
        this.callback = null;
    }

    init(data) {
        this.sharedData = data.sharedData;
        this.callback = data.callback;
    }

    create() {
        // Call the introduceCharacters method
        this.charactersIntroduced = introduceCharacters(this, characters, this.sharedData);

        // Create a button to proceed back to the previous scene
        if (this.charactersIntroduced) {
            let proceedButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height - 50, 'Proceed', { fontSize: '32px', fill: '#fff' })
                .setOrigin(0.5)
                .setInteractive();

            proceedButton.on('pointerdown', () => {
                if (this.callback) {
                    this.callback(this.sharedData);
                }
            });
        } else {
            // If no characters are introduced, proceed back to the previous scene immediately
            if (this.callback) {
                this.callback(this.sharedData);
            }
        }
    }
}

export function introduceCharacters(scene, characters, sharedData) {
  let Wokeindex = 0;
  let MAGAindex = 0;
  let xOffset = 0;
  let xSpriteOffset = 0;

  let experienceLevel = Math.floor(sharedData.totalPoliticalCapital/30);

  const newExperienceLevel = Math.floor(experienceLevel+1);
  console.log('New experience level = ' + newExperienceLevel);
  // Initialize oldExperienceLevel if not defined
  if (typeof scene.oldExperienceLevel === 'undefined' || isNaN(scene.oldExperienceLevel)) {
     scene.oldExperienceLevel = 1;
  }
  let oldExperienceLevelUponEntry = scene.oldExperienceLevel;
  scene.oldExperienceLevel = newExperienceLevel;
  scene.sharedData.oldExperienceLevel = scene.oldExperienceLevel;
  console.log('oldExperienceLevel = ' + oldExperienceLevelUponEntry);

  // Once every advocate has joined the cause, exit early if
  // all characters' experience levels are less than oldExperienceLevel for the relevant faction
  const allCharactersBelowNewExperience = characters.every(character => {
        if (sharedData.ideology.faction == 'maga') {
            return character.magaLevel <= oldExperienceLevelUponEntry;
        } else if (sharedData.ideology.faction == 'woke') {
            return character.wokeLevel <= oldExperienceLevelUponEntry;
        } else if (sharedData.ideology.faction == 'none') {
            return character.fogLevel <= oldExperienceLevelUponEntry;
        }
        return true; // Default case
  });
    
  if (allCharactersBelowNewExperience) {
      return false;
  }

  scene.characterTitleText = scene.add.text(scene.sys.game.config.width/2 - 20, 180, 'These Advocates Join Your Cause', { fontSize: '52px', fontFamily: 'Roboto', color: '#ffffff', fill: '#fff' }).setOrigin(0.5);

  let endorseMaga = scene.add.text(40, 200, 'MAGA',
                      { fontSize: '24px', fontFamily: 'Roboto', color: '#ff4040', align: 'left' });
  let underline = scene.add.graphics();
  underline.lineStyle(2, 0xff4040); // Set the line thickness and color
  underline.beginPath();
  underline.moveTo(endorseMaga.x, endorseMaga.y + endorseMaga.height);
  underline.lineTo(endorseMaga.x + endorseMaga.width, endorseMaga.y + endorseMaga.height);
  underline.closePath();
  underline.strokePath();

  let endorseWoke = scene.add.text(40 + scene.sys.game.config.width * .74, 200, 'WOKE',
                                          { fontSize: '24px', fontFamily: 'Roboto', color: '#8080ff', align: 'left' })
  underline = scene.add.graphics();
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
        // Go through all the icons and confirm that the character has any kind of interaction with the icon.  If not, leave it out
        for (let key in scene.sharedData.icons) {
            let iconData = scene.sharedData.icons[key];
            if (character.helps == iconData.iconName) matchHelps = true;
            if (character.hurts == iconData.iconName) matchHurts = true;
        };
        // Idea is to have levels of advocates for Maga, Woke, and Don't care
        character.dne = false;
        if (character.powerTokenType == 'type_5' && (matchHurts == false || matchHelps == false)) {character.dne = true;return;}
        if (character.magaLevel > experienceLevel+1 && scene.sharedData.ideology.faction == 'maga') {character.dne = true;return;}
        if (character.wokeLevel > experienceLevel+1 && scene.sharedData.ideology.faction == 'woke') {character.dne = true;return;}
        if (character.fogLevel > experienceLevel+1 && scene.sharedData.ideology.faction == 'none') {character.dne = true;return;}

        // Only introduce new characters that were not introduced before
        if (character.magaLevel < oldExperienceLevelUponEntry && scene.sharedData.ideology.faction == 'maga') { return };
        if (character.wokeLevel < oldExperienceLevelUponEntry && scene.sharedData.ideology.faction == 'woke') { return };
        if (character.fogLevel < oldExperienceLevelUponEntry && scene.sharedData.ideology.faction == 'none') { return }; 

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
            xOffset = scene.sys.game.config.width * .7;
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

        // Create the scaleFactor object with substructures
        let scaleFactor = {
            helps: scaleTable[character.helps],
            hurts: scaleTable[character.hurts]
        };

         if (character.powerTokenType == 'type_3') {
             tmpHelp = 'hacker';
             scaleFactor.helps = 0.19;
             //scaleFactor.hurts = 0.19;
             //console.log('hacker');
         } else if (character.powerTokenType == 'type_2') {
             tmpHelp = 'negotiation';
             scaleFactor.helps = 0.13;
             //scaleFactor.hurts = 0.13;
             //console.log('negotiation');
         }
        characterText = scene.add.text(80+xOffset, 250 + (rowIndex * 60), character.name,
                            { fontSize: scene.sharedData.charFont, fontFamily: 'Roboto', color: textColor, align: 'left' }).setInteractive();
        if (character.faction == 'maga') {
            xSpriteOffset += characterText.width+70;
        } else {
            xSpriteOffset -= 60;
        }
        let icon = scene.add.sprite(50+xOffset, 260 + (rowIndex * 60), tmpHelp).setScale(scaleFactor.helps/2);
        let hatType = scene.add.sprite(50+xSpriteOffset, 260 + (rowIndex * 60), factionIcon).setScale(.1);

        //character.charText = characterText; // back reference to text so we can find the location later

        createCharacterTooltip(scene, character, 50+xOffset, Math.min(scene.sys.game.config.height*.7, 250 + (rowIndex * 60)), icon, characterText, scaleFactor, tmpHelp);

        characterText.on('pointerover', () => enterButtonHoverState(characterText));
        characterText.on('pointerout', () => enterButtonRestState(characterText, textColor));
    });
    
    return true; // Indicate that characters were introduced
    
    //====================================================================================
    //    function createCharacterTooltip(scene, character, x, y, slider, characterText)
    //====================================================================================
    function createCharacterTooltip(scene, character, x, y, slider, characterText, scaleFactor, tmpHelp) {
        // Set text color based on affiliation
        let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';
        let xOffset = character.faction === 'maga' ? 80 + scene.game.config.width * .4 : scene.game.config.width * -.24;

        // Format the text to be centered and with the color based on the affiliation
        let roughSize = character.backstory.length * character.backstory[0].length;
        //console.log(character.name + ' ' + character.backstory.length + 'x' + character.backstory[0].length + '=' + (y + roughSize / 3));
        let lineLength;
        let yOffset;
        if (roughSize > 800 && scene.sys.game.config.width > 1000) {
            lineLength = 88;
            yOffset = 140;
        } else {
            if (roughSize > 440) {
                lineLength = 80;
                yOffset = 0;
            } else {
                lineLength = 40;
                yOffset = 0;
            }
        }
        // Emergency override: the screen is not very high so we really need to move the tooltip up a lot!
        if (y + roughSize / 3 > scene.sys.game.config.height) {
            yOffset = roughSize / 4;
            console.log('adjust upward ' + yOffset);
        }
        let graphicObject = tmpHelp;

        // Add an icon or graphic and scale it
        let backstoryIcon = scene.add.image(x + xOffset, y - yOffset, graphicObject);  // Position the icon at the original y position
        backstoryIcon.setScale(scaleFactor.helps);  // scale the icon
        backstoryIcon.setOrigin(0.5, 1);  // change origin to bottom center
        backstoryIcon.setVisible(false);
        backstoryIcon.setDepth(2);  // set depth below the text and above the bounding box

        // Add a label for "helps"
        let helpsLabel = scene.add.text(backstoryIcon.x - backstoryIcon.displayWidth / 2, backstoryIcon.y - backstoryIcon.displayHeight/2, 'Helps: '+ tmpHelp, {
            fontSize: '28px',
            fontFamily: 'Roboto',
            color: textColor,
            align: 'center'
        });
        helpsLabel.setOrigin(0.9, 1);
        helpsLabel.setVisible(false);
        helpsLabel.setDepth(2);

        let formattedBackstory = insertLinezBreaks(character.backstory.join(' '), lineLength);
        let backstoryText = scene.add.text(x + xOffset, backstoryIcon.y, formattedBackstory, {
            fontSize: '24px',
            fontFamily: 'Roboto',
            color: textColor,
            align: 'center'
        });  // Position the text below the icon
        backstoryText.setOrigin(0.5, 0);
        backstoryText.setVisible(false);
        backstoryText.setDepth(3);  // increase depth to be on top

        // Increase the height of the bounding box to accommodate the icon and the text, and adjust its position
        let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y - backstoryIcon.displayHeight / 2, backstoryText.width, backstoryText.height + backstoryIcon.displayHeight, 0x000000, 1);  // Add some padding between the icon and the text
        backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff4040 : 0x8080ff, 0.8);
        backstoryBox.isStroked = true;
        backstoryBox.setOrigin(0.5, 0);
        backstoryBox.setVisible(false);
        backstoryBox.setDepth(1);

        let backstoryHurtIcon = scene.add.image(x + xOffset, backstoryBox.y + backstoryBox.displayHeight, character.hurts);  // Position the icon at the original y position
        backstoryHurtIcon.setScale(scaleFactor.hurts);  // scale the icon
        backstoryHurtIcon.setOrigin(0.5, 1);  // change origin to bottom center
        backstoryHurtIcon.setVisible(false);
        backstoryHurtIcon.setDepth(2);  // set depth below the text and above the bounding box

        // Add a label for "hurts"
        let hurtsLabel = scene.add.text(backstoryHurtIcon.x - backstoryHurtIcon.displayWidth -10, backstoryHurtIcon.y, 'Causes Activists To Protest: ' + character.hurts, {
            fontSize: '20px',
            fontFamily: 'Roboto',
            color: textColor,
            align: 'center'
        });
        hurtsLabel.setOrigin(0, 1);
        hurtsLabel.setVisible(false);
        hurtsLabel.setDepth(2);

        const mouseOver = () => {
            backstoryText.setVisible(true);
            backstoryBox.setVisible(true);
            backstoryIcon.setVisible(true);
            backstoryHurtIcon.setVisible(true);
            helpsLabel.setVisible(true);
            hurtsLabel.setVisible(true);
        };

        const mouseOff = () => {
            backstoryText.setVisible(false);
            backstoryBox.setVisible(false);
            backstoryIcon.setVisible(false);
            backstoryHurtIcon.setVisible(false);
            helpsLabel.setVisible(false);
            hurtsLabel.setVisible(false);
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

function enterButtonHoverState(button) {
    button.setStyle({ fill: '#ff0'}); // change color to yellow
}

function enterButtonRestState(button, fillColor) {
    button.setStyle({ fill: fillColor}); // change color back to white
}
