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
                    this.cameras.main.fadeOut(400, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                        this.callback(this.sharedData);
                    });
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
     scene.oldExperienceLevel = 0;
  }
  let oldExperienceLevelUponEntry = scene.sharedData.oldExperienceLevel;
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
        if (character.magaLevel <= oldExperienceLevelUponEntry && scene.sharedData.ideology.faction == 'maga') { return };
        if (character.wokeLevel <= oldExperienceLevelUponEntry && scene.sharedData.ideology.faction == 'woke') { return };
        if (character.fogLevel <= oldExperienceLevelUponEntry && scene.sharedData.ideology.faction == 'none') { return };

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
        //let hatType = scene.add.sprite(50+xSpriteOffset, 260 + (rowIndex * 60), factionIcon).setScale(.1);
        let charIcon = scene.add.sprite(50+xSpriteOffset, 260 + (rowIndex * 60), character.characterIcon).setScale(.03);

        //character.charText = characterText; // back reference to text so we can find the location later

        createCharacterTooltip(scene, character, 50+xOffset,  250 + (rowIndex * 60), icon, characterText, scaleFactor, tmpHelp);

        characterText.on('pointerover', () => enterButtonHoverState(characterText));
        characterText.on('pointerout', () => enterButtonRestState(characterText, textColor));
    });

    return true; // Indicate that characters were introduced

    //====================================================================================
    //    function createCharacterTooltip(scene, character, x, y, slider, characterText)
    //====================================================================================
    function createCharacterTooltip2(scene, character, x, y, slider, characterText, scaleFactor, tmpHelp) {
        // Set text color based on affiliation
        let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';

        // Determine the positions based on the faction
        let iconX = character.faction === 'maga' ? scene.game.config.width * 0.75 : scene.game.config.width * 0.25;
        let textX = character.faction === 'maga' ? scene.game.config.width * 0.25 : scene.game.config.width * 0.75;

        // Format the text to be centered and with the color based on the affiliation
        let roughSize = character.backstory.length * character.backstory[0].length;
        let lineLength;
        let yOffset;
        if (roughSize > 800 && scene.sys.game.config.width > 1000) {
            lineLength = 108;
            yOffset = 140;
        } else {
            if (roughSize > 440) {
                lineLength = 100;
                yOffset = 0;
            } else {
                lineLength = 50;
                yOffset = 0;
            }
        }

        if (y + roughSize / 3 > scene.sys.game.config.height) {
            yOffset = roughSize / 4;
        }
        // Add an icon or graphic and scale it
        let backstoryIcon = scene.add.image(iconX, scene.game.config.height / 2, tmpHelp);
        backstoryIcon.setScale(scaleFactor.helps);
        backstoryIcon.setOrigin(0.5, 0.5);
        backstoryIcon.setVisible(false);
        backstoryIcon.setDepth(2);

        // Add a character icon separately based on the faction
        let characterIcon = scene.add.image(iconX, scene.game.config.height / 2 + 100, character.characterIcon);
        characterIcon.setScale(0.5);
        characterIcon.setOrigin(0.5, 0.5);
        characterIcon.setVisible(false);
        characterIcon.setDepth(2);

        let formattedBackstory = insertLinezBreaks(character.backstory.join(' '), lineLength);
        let backstoryText = scene.add.text(textX, scene.game.config.height / 2 - yOffset, formattedBackstory, {
            fontSize: '24px',
            fontFamily: 'Roboto',
            color: textColor,
            align: 'center',
            wordWrap: { width: scene.game.config.width * 0.4 }
        });
        backstoryText.setOrigin(0.5, 0.5);
        backstoryText.setVisible(false);
        backstoryText.setDepth(3);

        // Create a table format on the side opposite the character icon
        let tableX = character.faction === 'maga' ? scene.game.config.width * 0.25 : scene.game.config.width * 0.75;
        let tableBackground = scene.add.rectangle(tableX, scene.game.config.height / 2, scene.game.config.width * 0.5, scene.game.config.height, 0x000000, 1);
        tableBackground.setOrigin(0.5, 0.5);
        tableBackground.setVisible(false);
        tableBackground.setDepth(0);

        // Define items to be displayed in the table
        const items = [
            { label: 'Helps: ' + tmpHelp, icon: tmpHelp },
            { label: 'Backstory: ' + formattedBackstory, icon: tmpHelp },
            { label: 'Hurts: ' + character.hurts, icon: character.hurts }
        ];

        let startY = 50;

        // Iterate over the items to create the table rows
        items.forEach((item, index) => {
            const yPos = startY + index * 100; // Adjust the spacing as needed

            // Create a background for each row
            const rowBackground = scene.add.rectangle(tableX, yPos, scene.game.config.width * 0.4, 100, 0x000000, 1);
            rowBackground.setStrokeStyle(2, 0xffffff, 0.8);
            rowBackground.setOrigin(0.5, 0.5);
            rowBackground.setVisible(false);
            rowBackground.setDepth(1);

            // Create a label for each row
            const rowLabel = scene.add.text(tableX, yPos, item.label, {
                fontSize: '24px',
                fontFamily: 'Roboto',
                color: textColor,
                align: 'center',
                wordWrap: { width: scene.game.config.width * 0.35 }
            });
            rowLabel.setOrigin(0.5, 0.5);
            rowLabel.setVisible(false);
            rowLabel.setDepth(2);

            // Create an icon for each row
            const rowIcon = scene.add.image(tableX, yPos + 40, item.icon);
            rowIcon.setScale(scaleFactor.helps);
            rowIcon.setOrigin(0.5, 0.5);
            rowIcon.setVisible(false);
            rowIcon.setDepth(2);

            // Store the elements in an array for easier access
            item.rowElements = [rowBackground, rowLabel, rowIcon];
        });

        const mouseOver = () => {
            tableBackground.setVisible(true);
            items.forEach(item => {
                item.rowElements.forEach(element => element.setVisible(true));
            });
            characterIcon.setVisible(true);
            scene.cameras.main.setAlpha(0.5);  // Set background opacity to 50%
        };

        const mouseOff = () => {
            tableBackground.setVisible(false);
            items.forEach(item => {
                item.rowElements.forEach(element => element.setVisible(false));
            });
            characterIcon.setVisible(false);
            scene.cameras.main.setAlpha(1);  // Reset background opacity
        };

        slider.on('pointerover', mouseOver);
        characterText.on('pointerover', mouseOver);

        slider.on('pointerout', mouseOff);
        characterText.on('pointerout', mouseOff);
    }


    function createCharacterTooltip(scene, character, x, y, slider, characterText, scaleFactor, tmpHelp) {
        // Set text color based on affiliation
        let textColor = character.faction === 'maga' ? '#ff4040' : '#8080ff';

        // Determine the positions based on the faction
        let iconX = character.faction === 'maga' ? scene.game.config.width * 0.75 : scene.game.config.width * 0.25;
        let textX = character.faction === 'maga' ? scene.game.config.width * 0.25 : scene.game.config.width * 0.75;
        let helpsX = iconX * .4 + textX * .6;
        
        // Format the text to be centered and with the color based on the affiliation
        let roughSize = character.backstory.length * character.backstory[0].length;
        let lineLength;
        let yOffset;
        if (roughSize > 800 && scene.sys.game.config.width > 1000) {
            lineLength = 54;
            yOffset = 140;
        } else {
            if (roughSize > 440) {
                lineLength = 48;
                yOffset = 0;
            } else {
                lineLength = 25;
                yOffset = 0;
            }
        }

        if (y + roughSize / 3 > scene.sys.game.config.height) {
            yOffset = roughSize / 4;
        }

        let graphicObject = tmpHelp;

        // Add an icon or graphic and scale it
        //let backstoryIcon = scene.add.image(iconX, scene.game.config.height / 2, graphicObject);
        //backstoryIcon.setScale(scaleFactor.helps);
        //backstoryIcon.setOrigin(0.5, 0.5);
        //backstoryIcon.setVisible(false);
        //backstoryIcon.setDepth(2);

        // Add a character icon separately based on the faction
        let characterIcon = scene.add.image(iconX, scene.game.config.height / 2, character.characterIcon);
        characterIcon.setScale(0.4);
        characterIcon.setOrigin(0.5, 0.5);
        characterIcon.setVisible(false);
        characterIcon.setDepth(2);

        //let formattedBackstory = insertLinezBreaks(character.backstory.join(' '), lineLength);
        let formattedBackstory = character.backstory.join(' '); // let wordwrap deal with it
        let startY = scene.game.config.height*3/4;
        if (y > scene.game.config.height/2) {
            startY = scene.game.config.height/4;
        }
        let backstoryText = scene.add.text(textX, startY, formattedBackstory, {
            fontSize: '24px',
            fontFamily: 'Roboto',
            color: textColor,
            align: 'center',
            wordWrap: { width: scene.game.config.width * 0.5 }
        });
        backstoryText.setOrigin(0.5, 0.5);
        backstoryText.setVisible(false);
        backstoryText.setDepth(3);

        let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width + 40, backstoryText.height + 20, 0x000000, 1);
        backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff4040 : 0x8080ff, 0.8);
        backstoryBox.isStroked = true;
        backstoryBox.setOrigin(0.5, 0.5);
        backstoryBox.setVisible(false);
        backstoryBox.setDepth(1);

        // Add a label for "helps"
        let helpsLabel = scene.add.text(helpsX, scene.sys.game.config.height/2 - 40, 'Helps: ' + tmpHelp, {
            fontSize: '28px',
            fontFamily: 'Roboto',
            color: textColor,
            align: 'center'
        });
        helpsLabel.setOrigin(0.5, 0.5);
        helpsLabel.setVisible(false);
        helpsLabel.setDepth(2);

        // Add the "helps" icon next to the "helps" text
        let helpsIcon = scene.add.image(helpsX, scene.sys.game.config.height/2, graphicObject);
        helpsIcon.setScale(scaleFactor.helps);
        helpsIcon.setOrigin(0.5, 0.5);
        helpsIcon.setVisible(false);
        helpsIcon.setDepth(2);

        let backstoryHurtIcon = scene.add.image(helpsX, scene.sys.game.config.height/2 + 40, character.hurts);
        backstoryHurtIcon.setScale(scaleFactor.hurts);
        backstoryHurtIcon.setOrigin(0.5, 0.5);
        backstoryHurtIcon.setVisible(false);
        backstoryHurtIcon.setDepth(2);

        let hurtsLabel = scene.add.text(backstoryHurtIcon.x, scene.sys.game.config.height/2 + 80, 'Causes Activists To Protest: ' + character.hurts, {
            fontSize: '20px',
            fontFamily: 'Roboto',
            color: textColor,
            align: 'center'
        });
        hurtsLabel.setOrigin(0.5, 0.5);
        hurtsLabel.setVisible(false);
        hurtsLabel.setDepth(2);

        const mouseOver = () => {
            backstoryText.setVisible(true).setAlpha(.85);
            backstoryBox.setVisible(true).setAlpha(.85);
            //backstoryIcon.setVisible(true);
            backstoryHurtIcon.setVisible(true);
            helpsLabel.setVisible(true);
            helpsIcon.setVisible(true);
            hurtsLabel.setVisible(true);
            characterIcon.setVisible(true);
            scene.characterTitleText.setVisible(false);
        };

        const mouseOff = () => {
            backstoryText.setVisible(false);
            backstoryBox.setVisible(false);
            //backstoryIcon.setVisible(false);
            backstoryHurtIcon.setVisible(false);
            helpsLabel.setVisible(false);
            helpsIcon.setVisible(false);
            hurtsLabel.setVisible(false);
            characterIcon.setVisible(false);
        };

        slider.on('pointerover', mouseOver);
        characterText.on('pointerover', mouseOver);

        slider.on('pointerout', mouseOff);
        characterText.on('pointerout', mouseOff);
    }



    function createCharacterTooltipGood(scene, character, x, y, slider, characterText, scaleFactor, tmpHelp) {
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

        // Add a character icon next to the text on the left side within the bounding box
        let characterIcon = scene.add.image(backstoryBox.x - backstoryBox.width / 2 - 20, backstoryBox.y + backstoryBox.height / 2, character.characterIcon);
        characterIcon.setScale(.2); // Adjust scale as needed
        characterIcon.setOrigin(0.5, 0.5);
        characterIcon.setVisible(false);
        characterIcon.setDepth(2);

        const mouseOver = () => {
            backstoryText.setVisible(true);
            backstoryBox.setVisible(true);
            backstoryIcon.setVisible(true);
            backstoryHurtIcon.setVisible(true);
            helpsLabel.setVisible(true);
            hurtsLabel.setVisible(true);
            characterIcon.setVisible(true); // Show the character icon on mouse over
        };

        const mouseOff = () => {
            backstoryText.setVisible(false);
            backstoryBox.setVisible(false);
            backstoryIcon.setVisible(false);
            backstoryHurtIcon.setVisible(false);
            helpsLabel.setVisible(false);
            hurtsLabel.setVisible(false);
            characterIcon.setVisible(false); // Show the character icon on mouse over

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
