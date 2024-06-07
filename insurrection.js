//=========================================================================================================================
//
//                  Insurrection
//
//=========================================================================================================================
//    2. Make barriers somewhat transparent
//    3. remove the barriers destroying the threats.  bounce or slow is good enough
//    4. When bad things happen, putieville grows.
//      -- Econ collapse
//      -- Gov collapse
//      -- Diplomacy collapse
//    --> Bigger Putieville will cause more collapses
// need to implement createNewPutieville function
//    problem: shield is still too big: putie bounces off economy


import BaseScene from './BaseScene.js';
import { territories } from './BaseScene.js';
//import { difficulty } from './Basescene.js';

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

export class Insurrection extends BaseScene {
    constructor() {
        super({ key: 'insurrection' });
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
            MAGAnessVelocity: 0,
            WokenessVelocity: 0,
            totalPoliticalCapital: 0
        };

    }
    // insurrection: we had to switch everything to sharedData
        setup(data) {
            console.log(' insurrection: set up sharedData from this.icons');
            Object.assign(this.sharedData, data);

        }
        preload() {
                this.load.image('woke_protest', 'assets/woke_protest.png');
                this.load.image('maga_protest', 'assets/maga_protest.jpg');
                this.load.image('woke_riot', 'assets/woke_riot.jpg');
                this.load.image('maga_riot', 'assets/maga_riot.jpg');
                this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
        }
        //====================================================================================
        //
        // create()
        //
        //====================================================================================
    create() {
        if (!Object.keys(this.sharedData.icons).length) {
            console.log('insurrection: new icons');
            // initialize icons...
            this.initializeIcons();

            this.icons = this.sharedData.icons;

            // ...similarly for other icons
        } else {
            //this.icons = this.sharedData.icons;
            console.log('insurrection: recreate from saved state');

            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();

            // recreate the icons with the saved state
            for (let key in this.sharedData.icons) {
                let iconData = this.sharedData.icons[key];
                //console.log(key + ' shieldStrength = ', iconData.shieldStrength);
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
/*
        this.backgroundImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'woke_protest').setDepth(-1).setAlpha(.3);
        let scaleX = this.sys.game.config.width / this.backgroundImage.width;
        let scaleY = this.sys.game.config.height / this.backgroundImage.height;
        let scale = Math.max(scaleX, scaleY);
        this.backgroundImage.setScale(scale);
*/
        this.MAGAness = this.sharedData.MAGAness;
        this.Wokeness = this.sharedData.Wokeness;
        this.putieTerritories = this.sharedData.putieTerritories;
        this.roundThreats = 0;
        this.haventLaunchedYet = true;
        this.switchScene = false;
        console.log('reset switchScene to false');
        this.alreadyCreated = {};
        this.changedBackgroundOnce = false;

        //====================================================================================
        //
        // environmentalImpact inherents 'this' because it is an arrow function
        //     Todo: need some way of indicating that maga and woke may be balanced but there
        //           is too much of both and the icon is on the verge of collapse.
        //           One way to do this is to simply reduce health a lot, and it Will
        //           show up on the health gauge.
        //           We could just go back to balance and completely eliminate total number
        //           of protesters.  More realistic to collapse if total is outrageously high?
        //           I kinda like how it works right now, but need to have some indication
        //           that things are bad.
        //           Came up with the idea of having little hats representing the amount of
        //           maganess and wokeness.  Health can be adjusted every round, but there needs
        //           to be a metric of overall health of the icon that incorporates the maga
        //           and wokeness.
        //
        //====================================================================================
        let environmentalImpact = () => {

            //this.drawHealthBar(1, 100, 100, 'Maga', this.envHealthBarMaga);
            //this.drawHealthBar(0.7, 110, 100, 'woke', this.envHealthBarWoke);

            let thisRoundHealthChange = 0;
            for (let key in this.sharedData.icons) {
                let iconData = this.sharedData.icons[key];

                // For each icon, the health is influenced by the amount of MAGA and Wokeness.  If the two factions
                // are balanced, then health improves.
                let healthChange = Phaser.Math.Clamp((5 - Math.abs(iconData.maga - iconData.woke))/5, -5, 5);
                thisRoundHealthChange += healthChange/5;

                console.log('healthChange = '+ healthChange);

                // Health can grow to be 133% of maximum
                iconData.health = Phaser.Math.Clamp(iconData.health + healthChange, 0, 133*iconData.healthScale);
            }

            function handleCollapse(scene, iconData, key, territories, createPutieThreat) {
                console.log('collapse! health: ' + iconData.health + ' maga: ' + iconData.maga + ' woke: ' + iconData.woke);
                scene.sharedData.putieTerritories++;
                scene.putieTerritories = scene.sharedData.putieTerritories;
                iconData.maga = 0;
                iconData.woke = 0;
                iconData.health = 5;

                let size = 2;
                let numExplosions = 8;
                let lifeSpan = 400;
                let volume = 25;
                let delay = 20;
                let angleRange = { min: 0, max: 360 };
                let speedRange = { min: 225 - size * 20, max: 375 - size * 20 };
                let velocityRange = { min: 0, max: 0 };

                const createExplosion = (x, y) => {
                    for (let i = 0; i < numExplosions; i++) {
                        setTimeout(() => {
                            let emitter = scene.add.particles(400, 250, 'flares', {
                                frame: ['red', 'yellow', 'green'],
                                lifespan: lifeSpan,
                                speed: speedRange,
                                scale: { start: 0.25, end: 0 }, // Reduced scale values
                                gravityY: 250,
                                blendMode: 'ADD',
                                angle: angleRange,
                                velocityX: velocityRange,
                                velocityY: velocityRange,
                                emitting: false
                            });
                            emitter.setPosition(x + Phaser.Math.Between(-volume, volume),
                                                y + Phaser.Math.Between(-volume, volume));
                            emitter.explode(16);
                        }, i * delay); // Delay in milliseconds
                    }
                };

                let originalY = iconData.icon.y;
                let tweenCompleted = false;
                scene.putieCompleted = false;

                // Collapse the sprite from top to bottom and create fire and explosion effects
                scene.tweens.add({
                    targets: [iconData.icon, iconData.gaugeHealth],
                    y: iconData.icon.y + iconData.icon.displayHeight / 3,
                    //scaleX: 0.1, // Shrink to 1/10th of the width
                    scaleY: 0, // Shrink to 1/10th of the height
                    ease: 'Power1',
                    duration: 1000, // Adjust the duration as needed
                    onStart: function() {
                        // Start fire and explosion effects
                        createExplosion(iconData.icon.x, iconData.icon.y);
                    },
                    onComplete: () => {
                        // Reset the icon's position and size after the collapse
                        iconData.icon.y = originalY;
                        createPutieThreat(scene);
                        tweenCompleted = true;
                    }
                });

                const checkAndProceed = () => {
                    if (tweenCompleted && scene.putieCompleted) {
                        setTimeout(() => {
                            // Show the collapse screen
                            scene.collapseScreenShown = true;
                            scene.scene.get('TutorialScene').setup(scene.sharedData);
                            if (scene.sharedData.putieTerritories + scene.sharedData.alienTerritories < territories.length) {
                                scene.scene.start('TutorialScene', { message: capitalizeFirstLetter(key) + ' Collapses!  Need to rebuild...\n Putie uses his political influence\nto create instability in America' });
                            } else {
                                scene.scene.start('TutorialScene', { nextScene: 'youLose', message: capitalizeFirstLetter(key) + ' Collapses!  Need to rebuild...\n I have some bad news:\n Putin has taken over America\n It looks like you lose.' });
                            }
                        }, 1000);
                    } else {
                        setTimeout(checkAndProceed, 100); // Check again after a short delay
                    }
                };

                setTimeout(checkAndProceed, 1005); // Start checking after 1005ms
            }

            // Original collapse condition
            if (this.sharedData.putieTerritories < territories.length / 2 || Math.random() < 0.5) {
                for (let key in this.sharedData.icons) {
                    let iconData = this.sharedData.icons[key];
                    console.log(key + ' collapse imbalance = '+ Math.abs(iconData.maga - iconData.woke));
                    if (Math.abs(iconData.maga - iconData.woke) > this.difficultyLevel().collapseImbalance) {
                        handleCollapse(this, iconData, key, territories, createPutieThreat);
                        this.switchScene = true;
                        return;
                    }
                }
            }

            let sanity_check = Math.random();
            // If you spent all your capital and it's early in the game then you need more capital!
            // Better would be the dilemma screen giving you lots of capital so it doesn't have to be about the aliens
            sanity_check = this.difficultyLevel().alienAttackForCapital ? 0 : sanity_check;

            // if (this.sharedData.MAGAness == 0 && this.sharedData.Wokeness == 0 && this.sharedData.putieTerritories < territories.length/2) {
            //                 sanity_check = 0;
            //             }
            //console.log('check for alien invasion '+ sanity_check + ' switchScene = '+ this.switchScene);
            if ((this.sharedData.year > 2030) && (sanity_check < this.difficultyLevel().oddsOfAlienAttack)  && this.switchScene == false) {
                this.switchScene = true;
                console.log('go to Aliens Attack screen.  this.switchscene = true');
                this.cameras.main.fadeOut(2000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.get('AliensAttack').setup(this.sharedData);
                    this.scene.start('AliensAttack');
                });
            }

            for (let key in this.sharedData.icons) {
                let iconData = this.sharedData.icons[key];
                // Additional collapse condition
                for (let key in this.sharedData.icons) {
                    let iconData = this.sharedData.icons[key];
                    if (iconData.health < 1 || Math.abs(iconData.maga - iconData.woke) > 100 || iconData.maga + iconData.woke > 145) {
                        handleCollapse(this, iconData, key, territories, createPutieThreat);
                        this.switchScene = true;
                        return;
                    }
                }

                let healthTextRange = ['terrible', 'poor', 'so-so', 'good', 'excellent'];
                // Need a fancy formula that incorporates maga and wokeness into health.  Need a new benchmark.  There should be current situation
                // and another that is overall robustness.  This would represent monetary policy of printing a lot of money, that boosts the economy.
                // stability?
                let stability = iconData.health/iconData.healthScale;
                let totalValue = 100;//maga + woke; // totalValue is the sum of MAGA and WOKE values
                let balance;
                let maga = Math.min(100, iconData.maga); // don't let these go beyond 100
                let woke = Math.min(100, iconData.woke);
                if (totalValue == 0) {
                    balance = 0
                } else {
                    balance = Math.abs((maga - woke) / totalValue); // This will be a value between 0 and 1
                }
                stability = stability * (1-balance);
                let healthText = healthTextRange[Phaser.Math.Clamp(Math.round(stability/20),0,4)];
                iconData.iconText.setText(iconData.textBody + healthText);

                this.drawGauges(this, iconData.icon.x, iconData.icon.y, iconData.maga, iconData.woke, iconData.health, iconData.healthScale, iconData.gaugeMaga, iconData.gaugeWoke, iconData.gaugeHealth, iconData.scaleSprite, iconData.littleHats);
            }

            thisRoundHealthChange += this.sharedData.MAGAnessVelocity/5;
            //console.log(this.sharedData.MAGAnessVelocity + ' ' + thisRoundHealthChange);
            thisRoundHealthChange += this.sharedData.WokenessVelocity/5;
            //console.log(this.sharedData.WokenessVelocity + ' ' + thisRoundHealthChange);

            this.sharedData.MAGAness = Phaser.Math.Clamp(this.sharedData.MAGAness + thisRoundHealthChange, 0, 100);
            this.sharedData.Wokeness = Phaser.Math.Clamp(this.sharedData.Wokeness + thisRoundHealthChange, 0, 100);
            //console.log('MAGAness = ' + this.sharedData.MAGAness + ' Wokeness = ' + this.sharedData.Wokeness);

            polCapText.setText('Political Capital ' + Math.floor((this.sharedData.MAGAness + this.sharedData.Wokeness)).toString());

/*
            MAGAnessText.setText('MAGA political\ncapital: ' + this.sharedData.MAGAness);

            WokenessText.setText('Woke political\ncapital: ' + this.sharedData.Wokeness);
 */
        }
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        function createPutieThreat(scene) {
            let territoryWidth = scene.sys.game.config.width / territories.length;
            // Calculate the putie territory with the lowest x value
            let targetTerritory = null;
            let lowestX = Infinity;
            let putieCount = 0;
            let testTerritory = territories.length - 1; // Start at the end of the territories array

            // Make sure number of putie territories is accurate in case an alien claimed something
            while (putieCount < (scene.putieTerritories+1) && testTerritory >= 0) {
                if (territories[testTerritory].faction !== "alien") {
/*
                    territories[testTerritory].faction = "putieVille";
                    territories[testTerritory].name = "PutieVille";
                    territories[testTerritory].color = '0x654321';
*/
                    putieCount++;
                }
                testTerritory--;
            }


            let foo = testTerritory+1;
            console.log('targetTerritory is territory number ' + foo);
            targetTerritory = territories[testTerritory+1];

            // Create the putie threat sprite off the left side of the screen
            let mySprite = scene.physics.add.sprite(scene.sys.game.config.width+150, targetTerritory.y-400, 'putieBase').setScale(0.5);

            // Set the bounce property
            mySprite.setBounce(1.02);

            // Set the sprite to collide with the world bounds
            //mySprite.setCollideWorldBounds(true);

            // Calculate the velocity needed to reach the target territory
            let targetX = targetTerritory.x+territoryWidth*1;
            let targetY = targetTerritory.y;

            // Calculate the velocity vector
            let velocityX = (targetX - mySprite.x) / 5; // Adjust the divisor to control speed
            let velocityY = (targetY - mySprite.y) / 5;

            // Set the initial velocity of the sprite
            mySprite.setVelocity(velocityX, velocityY);
            // Create a physics-enabled placeholder for the target territory
            let territorySprite = scene.physics.add.staticImage(targetX, targetY, null).setSize(50, 50).setVisible(false);

            console.log('add collider to hit ' + targetTerritory);
            // Add a collider to detect when the sprite reaches the target territory
            scene.physics.add.collider(mySprite, territorySprite, () => {
                // Make the sprite disappear
                scene.tweens.add({
                    targets: mySprite,
                    x: mySprite.x - mySprite.displayWidth / 3,
                    y: mySprite.y + mySprite.displayHeight / 2,
                    scaleX: 0.1, // Shrink to 1/10th of the width
                    scaleY: 0.1, // Shrink to 1/10th of the height
                    ease: 'Sine.easeInOut',
                    duration: 1000,
                    onComplete: function () {
                        mySprite.destroy();
                    },
                    callbackScope: scene
                });
                scene.createTerritories();
                // Transition to the next scene
                scene.putieCompleted = true;
                console.log('putie has made contact');
            });
        }

        //====================================================================================
        //
        // function governmentGrowth()
        //  Special function that changes the health of the government depending on maga and wokes
        //
        //====================================================================================
        function governmentGrowth() {
            if (this.sharedData.icons['government'])
            {
                this.sharedData.icons['government'].health += this.sharedData.icons['government'].woke - this.sharedData.icons['government'].maga +3;
                let gov = this.sharedData.icons['government'];
                let governmentSize = gov.health;

                if (1) {//governmentSize < 1200) {
                    let healthTextRange = ['terrible', 'poor', 'so-so', 'good', 'excellent'];
                    let healthText = healthTextRange[Phaser.Math.Clamp(Math.round(gov.health/gov.healthScale/20),0,4)];
                    this.sharedData.icons['government'].textBody = 'Government\nStrength: ';
                    this.sharedData.icons['government'].iconText.setText(gov.textBody + healthText);
                }

                this.drawGauges(this, gov.icon.x, gov.icon.y, gov.maga, gov.woke, gov.health, gov.healthScale, gov.gaugeMaga, gov.gaugeWoke, gov.gaugeHealth, gov.scaleSprite, gov.littleHats);
            }
        }
        //====================================================================================
        //
        // The main body of create()
        //
        //====================================================================================

        this.createTerritories();

        let totalCapital = Math.floor(this.MAGAness + this.Wokeness);

        polCapText = this.add.text(20, 0, 'Political Capital ' + totalCapital, { fontSize: '32px', fill: '#0f0' });

        // Create MAGAness text
        //MAGAnessText = this.add.text(20, 0, 'MAGA Political\n Capital ' + this.MAGAness, { fontSize: '16px', fill: '#fff' });

        // Create Wokeness text
        //WokenessText = this.add.text(1100, 0, 'Wokeness Political\n Capital: ' + this.Wokeness, { fontSize: '16px', fill: '#fff' });

        // Create Year text
        yearText = this.add.text(this.sys.game.config.width * .8, 0, 'Year: ' + this.sharedData.year, { fontSize: '32px', fill: '#fff' });

        // Create Shield Icon over environment
        //this.envIcon = this.physics.add.sprite(70, 100, 'shield').setScale(0.5).setAlpha(0.7);

        //this.envIcon.setImmovable(true);

        this.magaThreats = this.physics.add.group();
        this.magaDefenses = this.physics.add.group();
        this.putieThreats = this.physics.add.group();
        this.wokeThreats = this.physics.add.group();
        this.wokeDefenses = this.physics.add.group();
        this.wokeReturns = this.physics.add.group();
        this.magaReturns = this.physics.add.group();

        //====================================================================================
        //
        // The following function creates the information/misinformation blockers
        // annoying that restoreMisinformationTokens is here AND in BaseScene.  Need to simplify
        //
        //====================================================================================
        restoreMisinformationTokens(this);

        // Timer event to increment the year every second
        this.yearTime = this.time.addEvent({
            delay: 1000,
            callback: incrementYear,
            callbackScope: this,
            loop: true
        });

        // Timer event to adjust Environmental impact every 6 seconds
        this.envTime = this.time.addEvent({
            delay: 6000,
            callback: environmentalImpact,
            callbackScope: this,
            loop: true
        });
        // Timer event to adjust Government Size every 7 seconds
        // I think government health should not improve if there are more wokes than magas
        // this.govTime = this.time.addEvent({
        //     delay: 7000,
        //     callback: governmentGrowth,
        //     callbackScope: this,
        //     loop: true
        // });

        //====================================================================================
        // function restoreMisinformationTokens(scene)
        // function that recreates the information/misinformation blockers
        //
        //====================================================================================
        function restoreMisinformationTokens(scene) {
            // Recreate previously generated misinformation tokens
            for (let key in scene.sharedData.misinformation) {
                // Look up the stored data
                let storedData = scene.sharedData.misinformation[key];

                // Use the stored data when creating the token
                let misinformation = createPowerToken(scene, 'neutral', storedData.text, storedData.x, storedData.y, storedData);
                scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group
                misinformation.container.misinformationIndex = storedData.misinformationIndex; // restore index too!
                misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again

                //data.x = xOffset;
                //data.y = yOffset;
            }

        //====================================================================================
        // Add overlaps for bouncing or slowdowns between threats and shields
        // magaThreatWokeShield(), wokeThreatMagaShield()
        //
        //====================================================================================
            function magaThreatWokeShield(object,threat, shieldStrength)
            {
                // If the object does not have an id, give it one.
                if (!object.hasOwnProperty('id')) {
                    object.id = Phaser.Utils.String.UUID();
                }

                // Initialize the set if it doesn't exist yet
                if (!threat.collidedWith) {
                    threat.collidedWith = new Set();
                }
                //console.log('collider Magaland');

                // If we haven't collided with this object yet...
                if (!threat.collidedWith.has(object.id)) {
                    threat.collidedWith.add(object.id);
                    // Handle collision...
                    let territory = territories[1]; // maga always returns to territory 1
                    let territoryWidth = scene.sys.game.config.width / territories.length;
                    if (Math.random() < shieldStrength) {
                        //console.log('threat bounces due to impact with shield! object at ' + object.x + ','+ object.y + 'threat: ' + threat.x + ',' + threat.y);
                        let helpedIcon = scene.sharedData.icons['environment'];
                        let shortstory = ["MAGA Activists peacefully return home  ",
                            "because it is immune to political attacks"];
                        let faction = 'maga';
                        //tmpChar.shortstory = helpedIcon.iconText + ','+helpedIcon.iconTitle+ ' is immune to all attacks!';
                        let tooltip = createTooltip(scene, shortstory, faction, threat.x, threat.y);
                        if (scene.alreadyCreated[object.id] === undefined) {
                            scene.alreadyCreated[object.id] = true;
                            tooltip.text.setVisible(true);
                            tooltip.box.setVisible(true);
                        }

                        helpedIcon.icon.shieldWoke.setAlpha(0.5);
                        scene.time.delayedCall(5000, () => {
                            tooltip.text.setVisible(false);
                            tooltip.box.setVisible(false);
                            scene.alreadyCreated[object.id] = false;
                        });

                        // "bounce" and move the threat to territory 1
                        scene.physics.moveTo(threat, territory.x + territoryWidth/2, scene.game.config.height, 200);
                        object.setTint(0x8080ff).setAlpha(0.9);
                        scene.tweens.add({
                            targets: object,
                            alpha: 0.1,
                            duration: 500,
                            onComplete: function () {
                                object.setAlpha(0.1);
                            },
                            callbackScope: scene
                        });
                    } else { if (shieldStrength > 0) {
                    console.log('threat body velocity reduced due to impact with shield! object at ' + object.x + ','+ object.y + 'threat: ' + threat.x + ',' + threat.y);
                        threat.body.velocity.x *= 0.3;
                        threat.body.velocity.y *= 0.3;
                    }
                    }
                }
            }
            //====================================================================================
            //    function createTooltip(scene, character, x, y,)
            //====================================================================================
            function createTooltip(scene, shortstory, faction, x, y ) {
                // Set text color based on affiliation
                let textColor = faction === 'maga' ? '#ff8080' : '#8080ff';
                let xOffset = 0;//character.faction === 'maga' ? 320 : -320;

                // Format the text to be centered and with the color based on the affiliation
                let formattedBackstory = insertLineBreaks(shortstory.join(' '), 37);
                let backstoryText = scene.add.text(x+xOffset, y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });
                backstoryText.setOrigin(0.5);
                backstoryText.setVisible(false);
                backstoryText.setDepth(2);

                // Add a bounding box for the text, with rounded corners and a semi-transparent background
                let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
                backstoryBox.setStrokeStyle(2, faction === 'maga' ? 0xff8080 : 0x8080ff, 0.3);
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
            function wokeThreatMagaShield(object,threat, shieldStrength, isItPutie)
            {
                // If the object does not have an id, give it one.
                if (!object.hasOwnProperty('id')) {
                    object.id = Phaser.Utils.String.UUID();
                }
                // Initialize the set if it doesn't exist yet
                if (!threat.collidedWith) {
                    threat.collidedWith = new Set();
                }
                //console.log('collider wokeland');
                // If we haven't collided with this object yet...
                if (!threat.collidedWith.has(object.id)) {
                    threat.collidedWith.add(object.id);
                    // Handle collision...
                    let territory = territories[4]; // for now woke always returns to territory 4
                    let territoryWidth = scene.sys.game.config.width / territories.length;

                    if (Math.random() < shieldStrength) {
                        //console.log('threat bounces due to impact with shield! object at ' + object.x + ','+ object.y + 'threat: ' + threat.x + ',' + threat.y);
                        let helpedIcon = scene.sharedData.icons['environment'];
                        let shortstory;
                        if (isItPutie) {
                            shortstory = ["Russian Troll Farms are deterred ",
                                "because of immunity to internet troll farm attacks"];
                        } else {
                            shortstory = ["Woke Activists peacefully return home  ",
                                "because of temporary immunity to political attacks"];
                        }
                        let faction = 'woke';
                        //tmpChar.shortstory = helpedIcon.iconText + ','+helpedIcon.iconTitle+ ' is immune to all attacks!';
                        let tooltip = createTooltip(scene, shortstory, faction, threat.x, threat.y+100);
                        if (scene.alreadyCreated[object.id] === undefined) {
                            scene.alreadyCreated[object.id] = true;
                            tooltip.text.setVisible(true);
                            tooltip.box.setVisible(true);
                        }

                        helpedIcon.icon.shieldWoke.setAlpha(0.5);
                        scene.time.delayedCall(5000, () => {
                            tooltip.text.setVisible(false);
                            tooltip.box.setVisible(false);
                            scene.alreadyCreated[object.id] = false;
                        });

                        scene.physics.moveTo(threat, territory.x+ territoryWidth/2, scene.sys.game.config.height, 200);
                        object.setTint(0xff8080).setAlpha(0.9);
                        scene.tweens.add({
                            targets: object,
                            alpha: 0,
                            duration: 500,
                            onComplete: function () {
                                object.setAlpha(0.1);
                            },
                            callbackScope: scene
                        });
                    } else { if (shieldStrength > 0) {
                    console.log('threat body velocity reduced due to impact with shield! object at ' + object.x + ','+ object.y + 'threat: ' + threat.x + ',' + threat.y);
                        threat.body.velocity.x *= 0.3;
                        threat.body.velocity.y *= 0.3;
                    }
                    }
                }
            }
            scene.physics.add.overlap(scene.magaThreats, scene.shieldsWoke, function (threat, object) {
                    let shieldStrength = object.shieldStrength;
                    //console.log('object shieldstrength = '+ shieldStrength);
                    magaThreatWokeShield(object,threat, shieldStrength);
                }, null, this);
            scene.physics.add.overlap(scene.wokeThreats, scene.shieldsMaga, function (threat, object) {
                    let shieldStrength = object.shieldStrength;
                    //console.log('object shieldstrength = '+ shieldStrength);
                    wokeThreatMagaShield(object,threat, shieldStrength);
                }, null, this);
            scene.physics.add.overlap(scene.putieThreats, scene.shieldsMaga, function (threat, object) {
                    let shieldStrength = object.shieldStrength;
                    //console.log('object shieldstrength = '+ shieldStrength);
                    wokeThreatMagaShield(object,threat, shieldStrength, true);
                }, null, this);

            //====================================================================================
            //
            // Add overlaps for bouncing or slowdowns between threats and defences
            // fixed a bug where roundThreats was undefined so it didn't exit early when all threats were destroyed.
            // Maybe that's a good thing so time still passes?  Need to test.  I actually don't like it!
            //
            //====================================================================================
            scene.physics.add.overlap(scene.magaDefenses, scene.wokeThreats, function(defense, threat) {
                //console.log('icon maganess = ' + threat.icon.maga);
                if (threat.icon.maga > threat.icon.woke) {
                    console.log("don't destroy threat: it's going to help!");
                    return;
                }
                threat.destroy();
                scene.roundThreats--;
                //console.log('defense destroyed threat.  Down to ' + scene.roundThreats);
                if (scene.roundThreats == 1) {
                    console.log('all threats destroyed but stay here til time ends anyway');
                    scene.victoryText.destroy();
                    //scene.scene.get('politics').setup(this.sharedData);
                    //scene.scene.start('politics');
                }
                //console.log(defense.container);
                if (Math.random() < .1) {
                    scene.tweens.add({
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

            scene.physics.add.overlap(scene.wokeDefenses, scene.magaThreats, function(defense, threat) {
                //console.log('icon wokeness = ' +threat.icon.woke);
                if (threat.icon.woke > threat.icon.maga) {
                    console.log("don't destroy threat: it's going to help!");
                    return;
                }
                threat.destroy();
                scene.roundThreats--;
                //console.log('defense destroyed threat.  Down to ' + scene.roundThreats);
                if (scene.roundThreats == 1) {
                    console.log('all threats destroyed but stay here til time ends anyway');
                    scene.victoryText.destroy();
                    //scene.scene.get('politics').setup(scene.sharedData);scene.scene.start('politics');
                }
                //console.log(defense.container);

                if (Math.random() < .1) {
                    scene.tweens.add({
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
            //
            // Helper function to handle common overlap logic between insurrectionist and icon
            //
            function handleOverlap(icon, defense, threat, incrementAmount, type, gauge, message) {
                let iconColor = type === 'maga' ? 'red' : 'blue';

                scene.tweens.add({
                    targets: threat,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 200,
                    onComplete: function () {
                        threat.destroy();
                    },
                    callbackScope: scene
                });

                if (!threat.isDestroyed) {
                    // if putie, take whichever is larger and make it worse
                    if (type == 'putie') {
                        if (icon.woke > icon.maga) {type = 'woke';}
                        else {type = 'maga';}
                    }
                    icon[type] += incrementAmount;
                    if (icon.maga > icon.woke) {iconColor = 'red'; message = '\nToo much MAGA!';}
                    else if (icon.maga < icon.woke) {iconColor = 'blue'; message = '\nToo much Wokeness!';}
                    else if (icon.maga == icon.woke) {
                        icon.health += 1 * icon.healthScale;
                        iconColor = 'purple';
                    }
                    //console.log(icon.littleHats);
                    icon.littleHats = scene.drawHealthGauge(scene, icon[type]/ 100,defense.x,defense.y, type, gauge, icon.maga, icon.woke, icon.scaleSprite, icon.littleHats);
                    //console.log(icon.littleHats);

                    let stability = icon.health/icon.healthScale;
                    let totalValue = 100;//maga + woke; // totalValue is the sum of MAGA and WOKE values
                    let balance;
                    let maga = Math.min(100, icon.maga); // don't let these go beyond 100
                    let woke = Math.min(100, icon.woke);
                    if (totalValue == 0) {
                        balance = 0
                    } else {
                        balance = Math.abs((maga - woke) / totalValue); // This will be a value between 0 and 1
                    }
                    stability = stability * (1-balance);

                    scene.drawHealthGauge(scene, stability/ 100, defense.x, defense.y, 'Health', icon.gaugeHealth);
                    icon.iconText.setText(icon.textBody + message);
                    hitIcon(icon.iconText, iconColor);
                    threat.isDestroyed = true;
                    scene.roundThreats--;
                    if (scene.roundThreats < 2) {
                        environmentalImpact();
                        scene.time.delayedCall(2000, function() {
                            scene.victoryText.destroy();
                        });
                    }
                    console.log('stay here until 10 seconds elapse so more capital can be rewarded');
                    // if (scene.roundThreats == 1 && scene.switchScene == false) {
                    //     // fix problem with double scene fades!
                    //     // maybe the problem is scene vs. this?
                    //     scene.switchScene = true;
                    //     console.log('no more threats.  switchScene = '+scene.switchScene);
                    //     scene.cameras.main.fadeOut(2000, 0, 0, 0);
                    //     scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    //         scene.scene.get('politics').setup(scene.sharedData);
                    //         scene.scene.start('politics');
                    //     });
                    // }
                }
            }

            for (let key in scene.sharedData.icons) {
                let icon = scene.sharedData.icons[key];
                //console.log(key);
                // Woke overlap
                scene.physics.add.overlap(icon.icon, scene.wokeThreats, function(defense, threat) {
                    //console.log('wokethreat overlap');
                    handleOverlap(icon, defense, threat, 5, 'woke', icon.gaugeWoke, '\nToo much Wokeness!');
                });
                // Maga overlap
                scene.physics.add.overlap(icon.icon, scene.magaThreats, function(defense, threat) {
                    //console.log('magathreat overlap');
                    handleOverlap(icon, defense, threat, 5, 'maga', icon.gaugeMaga, '\nMake America Great Again!');
                });
                // Putin overlap
                scene.physics.add.overlap(icon.icon, scene.putieThreats, function(defense, threat) {
                    // handle the Putin overlap with maga and then increment woke afterward
                    // Increment amount was 2, as in putie doesn't cause as much instability, but That
                    // seems much too confusing.  Better to have all attacks create 1 hat.
                    handleOverlap(icon, defense, threat, 3, 'putie', icon.gaugeMaga, '\nToo Much Putin!');
/*
                    if (!threat.isPutieDestroyed) {
                        let message;
                        let iconColor;
                        threat.isPutieDestroyed = true;
                        icon['woke'] += 5;
                        if (icon.maga > icon.woke) {iconColor = 'red'; message = '\nToo much MAGA!';}
                            else if (icon.maga < icon.woke) {iconColor = 'blue'; message = '\nToo much Wokeness!';}
                            else if (icon.maga == icon.woke) {
                                icon.health += 1 * icon.healthScale;
                                iconColor = 'purple';
                            }
                        scene.drawHealthGauge(icon['woke']/ 100,defense.x,defense.y, 'woke', icon.gaugeWoke);
                        icon.iconText.setText(icon.textBody + Math.floor(icon.health) + message);
                        hitIcon(icon.iconText, iconColor);
                    }
 */
                });
            }
        }

        //====================================================================================
        // function createPowerToken(scene)
        // function that createPowerToken text, rectangle, and dragability
        //
        //====================================================================================

        function createPowerToken(scene, faction, message, x, y, storedData) {
            let factionColor = faction === 'maga'
                ? '0xff0000'
                : faction === 'woke'
                    ? '0x0000ff'
                    : '0x228B22'; // forest green

            let fillColor = faction === 'maga'
                ? '#ffffff'
                : faction === 'woke'
                    ? '#ffffff'
                    : '#80ff80';

            // Add text to the rectangle
            let text = scene.add.text(0, 0, message, { align: 'center', fill: fillColor }).setOrigin(0.5, 0.5);

            // Create a larger white rectangle for outline
            let outline = scene.add.rectangle(0, 0, text.width+4, text.height+4, 0xffffff);

            // Create a smaller factionColor rectangle
            let rectangle = scene.add.rectangle(0, 0, text.width, text.height, factionColor);

            // Create a sprite for physics and bouncing
            let misinformationSprite = scene.physics.add.sprite(0, 0, 'track').setImmovable(true);
            misinformationSprite.setVisible(false); // Hide it, so we only see the graphics and text
            misinformationSprite.setDepth(1);
            misinformationSprite.setScale(.6);

            // Group the text, outline, and rectangle into a single container
            let misinformation = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);

            // Attach the container to the sprite
            misinformationSprite.container = misinformation;

            // Set the size of the container to match the size of the outline rectangle
            misinformation.setSize(outline.width, outline.height);

    /* Don't allow dragging of power tokens during insurrection scene: you need to position them wisely
    */

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

    }

    //====================================================================================
    //
    //        update()
    //
    //====================================================================================
    update() {
        //let scene = this;
        // game loop
        // This is called 60 times per second. Game logic goes here.
        if (this.roundThreats === 0 && this.haventLaunchedYet == true) {
            console.log('launch!');
            this.haventLaunchedYet = false;
            // After 10 seconds we go to politics
            this.time.delayedCall(10000, () => {
                if (this.switchScene == false) {
                    this.switchScene = true;
                    console.log('End of 10 seconds.  switchScene = ' + this.switchScene);
                    this.cameras.main.fadeOut(2000, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                        this.scene.get('politics').setup(this.sharedData);
                        this.scene.start('politics');
                    });
                }
            });
            this.roundThreats = 1;

            this.time.delayedCall(500, () => {
                // Get the keys of your icons object
                let iconKeys = Object.keys(this.sharedData.icons);

                // Shuffle the keys array
                for(let i = iconKeys.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * i);
                    const temp = iconKeys[i];
                    iconKeys[i] = iconKeys[j];
                    iconKeys[j] = temp;
                }
                let magaThreatCounter = 0;
                let wokeThreatCounter = 0;
                let countThreats = 0;
                let nonPutieThreats = 0;
                let magaThreats = 0;
                let wokeThreats = 0;
                let putieThreats = 0;

                // Now your keys array is shuffled, so you can iterate over it
                iconKeys.forEach(key => {
                    let icon = this.sharedData.icons[key];
                    //console.log('maga: ' + icon.maga + ' woke: '+icon.woke + ' attack '+key);

                    // loop through each territory
                    for (let region in territories) {
                        let territory = territories[region];

                        if (territory.faction == 'maga') {
                            magaThreatCounter += icon.maga/25;
                            if (Math.floor(magaThreatCounter) > 0) {
                                // Issue a threat here
                                this.createThreat(territory, '', icon, Math.floor(magaThreatCounter));
                                magaThreatCounter -= Math.floor(magaThreatCounter);
                                countThreats++;
                                nonPutieThreats++;
                                magaThreats++;
                            }
                        }  else if (territory.faction == 'woke') {
                            wokeThreatCounter += icon.woke/25;
                            if (Math.floor(wokeThreatCounter) > 0) {
                                // Issue a threat here
                                this.createThreat(territory, '', icon, Math.floor(wokeThreatCounter));
                                wokeThreatCounter -= Math.floor(wokeThreatCounter);
                                countThreats++;
                                nonPutieThreats++;
                                wokeThreats++;
                            }
                        } else if (territory.faction == 'putieVille') { // one threat automatically issued to every icon from Putie
                            countThreats++;
                            putieThreats++;
                            this.createThreat(territory, '', icon, 1);
                        }
                    }
                });

                let changeBackgroundImage = (imageName) => {
                    if (this.changedBackgroundOnce == false) {
                        this.changedBackgroundOnce = true;
                        //this.backgroundImage.destroy();
                        this.backgroundImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, imageName).setDepth(-1).setAlpha(.3);
                        let scaleX = this.sys.game.config.width / this.backgroundImage.width;
                        let scaleY = this.sys.game.config.height / this.backgroundImage.height;
                        let scale = Math.max(scaleX, scaleY);
                        this.backgroundImage.setScale(scale);
                    }
                }

                console.log('total number of threats fired: '+countThreats);
                let message;
                let backgroundImage;
                if (countThreats == 0) {
                    message = 'America is at peace.\n MAGA and Woke are balanced\nand content.';
                } else {
                    if (magaThreats > wokeThreats) {
                        backgroundImage = 'maga_protest';
                    } else {
                        backgroundImage = 'woke_protest';
                    }
                    switch (Math.floor(nonPutieThreats / 8)) {
                        case 0:
                            message = 'Activists Continue to Apply Pressure';
                            changeBackgroundImage(backgroundImage);
                            break;
                        case 1:
                            message = 'Protest Marches Erupt in Areas of Unrest!';
                            changeBackgroundImage(backgroundImage);
                            break;
                        case 2:
                            message = 'Insurrectionists Attack Unstable Aspects!';
                            if (magaThreats > wokeThreats) {
                                changeBackgroundImage('maga_riot');
                            } else {
                                changeBackgroundImage('woke_riot');
                            }
                            break;
                        default:
                            message = 'Riots in the Streets!  Destruction of Society!';
                            if (magaThreats > wokeThreats) {
                                changeBackgroundImage('maga_riot');
                            } else {
                                changeBackgroundImage('woke_riot');
                            }                    }
                    if (putieThreats > 0) {
                        message += '\n\nAnd Russian Troll Farms Create Additional Instability!';
                    }
                }
                // Create a text object to display a victory message
                this.victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
                    font: 'bold 48px Arial',
                    fill: '#ffffff',
                    align: 'center'
                });
                this.victoryText.setOrigin(0.5);  // Center align the text
                this.victoryText.setAlpha(0.8);
                if (countThreats == 0) {
                    // Create a button using an image
                    let nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);

                    // When the button is clicked, start the next scene
                    nextButton.on('pointerdown', () => {
                        // pass this scene's this.sharedData to insurrection's setup, (where it is assigned to insurrection's this.sharedData)
                        // question: does this scene's sharedData ever even get used?
                        //this.sharedData.icons = this.icons;
                        console.log('impossible situation here');
                        this.scene.get('politics').setup(this.sharedData);
                        this.scene.start('politics');
                    });
                }
            });

        } // this.roundThreats != 0
    } // end of update()

}

function incrementYear() {
    this.sharedData.year++;
    yearText.setText('Year: ' + this.sharedData.year);

    this.sharedData.MAGAness = Phaser.Math.Clamp(this.sharedData.MAGAness + this.sharedData.MAGAnessVelocity, 0, 100);
    this.sharedData.Wokeness = Phaser.Math.Clamp(this.sharedData.Wokeness + this.sharedData.WokenessVelocity, 0, 100);
    console.log('MAGAness = ' + this.sharedData.MAGAness + ' Wokeness = ' + this.sharedData.Wokeness);

    polCapText.setText('Political Capital ' + Math.floor((this.sharedData.MAGAness + this.sharedData.Wokeness)).toString());
}
