import { insertLineBreaks} from './politicsUtils.js';

        export let nextScreenTutorial = [
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

    export function displayTutorial(scene) {
    //export let displayTutorial = () => {
        console.log('current index = '+ scene.currentTutorialIndex + ' total length = ' + nextScreenTutorial.length);
        if (scene.currentTutorialIndex < nextScreenTutorial.length) {
            // Initialize an array to store arrow graphics
            let arrowGraphicsArray = [];
            let snog;
            let tutorial = nextScreenTutorial[scene.currentTutorialIndex];
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

            let backstoryText = scene.add.text(window.innerWidth/5*2, window.innerHeight/5*2+scene.currentTutorialIndex*20, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: '#fff', align: 'center' });

            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(true);
            backstoryText.setDepth(4);

            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
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

            scene.tweens.add({
                targets: [backstoryText, backstoryBox],
                alpha: { from: 1, to: .5 },
                ease: 'Linear',
                duration: 1000,
                repeat: -1,
                yoyo: true
            });

            // Optional: Add a full-screen invisible sprite to capture clicks anywhere
            if (!backdrop) {
                backdrop = scene.add.rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height-100, 0x000000, 0).setOrigin(0, 0).setInteractive();
            }

            // Cleanup function to clear current tutorial item
            const clearCurrentTutorial = () => {
                clearTimeout(timeoutHandle);  // Clear the timeout to avoid it firing after manual advance
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
                scene.tweens.killTweensOf([backstoryText, backstoryBox]);
                backdrop.off('pointerdown');
                scene.input.keyboard.off('keydown-ENTER');

                // Clear all pending timers for drawing arrows
                arrowTimerIDs.forEach(timerID => clearTimeout(timerID));
                arrowTimerIDs = []; // Clear the timer IDs array after cancellation

                // Destroy all arrow graphics
                arrowGraphicsArray.forEach(arrow => arrow.destroy());
                arrowGraphicsArray = []; // Clear the array after destruction

                scene.currentTutorialIndex++;
                displayTutorial(scene); // Display next item
            };

            // Set up listeners for pointer down and ENTER key
            backdrop.on('pointerdown', clearCurrentTutorial);
            scene.input.keyboard.on('keydown-ENTER', clearCurrentTutorial);
            scene.nextButton.on('pointerdown', () => {
                scene.currentTutorialIndex = 99;
                clearCurrentTutorial();
            });

            // Set a timeout to automatically advance
            timeoutHandle = setTimeout(clearCurrentTutorial, 10000);
        }
    };

// Function to draw an arrow with the head on the starting point
export function drawArrow(scene, startX, startY, endX, endY) {
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
