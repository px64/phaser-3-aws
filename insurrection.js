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
            WokenessVelocity: 0
        };

    }
    // insurrection: we had to switch everything to sharedData
        setup(data) {
            console.log(' insurrection: set up sharedData from this.icons');
            Object.assign(this.sharedData, data);

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
                console.log(key + ' shieldStrength = ', iconData.shieldStrength);
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
                    iconData.shieldStrength
                );
            }
        }

        this.MAGAness = this.sharedData.MAGAness;
        this.Wokeness = this.sharedData.Wokeness;
        this.putieTerritories = this.sharedData.putieTerritories;
        this.roundThreats = 0;

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
                thisRoundHealthChange += healthChange;

                console.log('healthChange = '+ healthChange);

                // Health can grow to be 133% of maximum
                iconData.health = Phaser.Math.Clamp(iconData.health + healthChange, 0, 133*iconData.healthScale);
            }
            // If Putie has only a few territories, then check collapse all the time
            // If Putie has a lot of territories, then only check for collapse 50% of the time
            if (this.sharedData.putieTerritories < territories.length/2 || Math.random() < .5) {
                for (let key in this.sharedData.icons) {
                    let iconData = this.sharedData.icons[key];
                    if (iconData.maga > 100 || iconData.woke > 100) {
                        this.sharedData.putieTerritories++;
                        this.putieTerritories = this.sharedData.putieTerritories;
                        iconData.maga = 0;
                        iconData.woke = 0;
                        iconData.health = 5;
                        this.scene.get('TutorialScene').setup(this.sharedData);
                        if (this.sharedData.putieTerritories + this.sharedData.alienTerritories < territories.length) {
                            this.scene.start('TutorialScene', { message: capitalizeFirstLetter(key) + ' Collapses!  Need to rebuild...\n Putie uses his political influence\nto create instability in America' });
                        } else {
                            this.scene.start('TutorialScene', { message: capitalizeFirstLetter(key) + ' Collapses!  Need to rebuild...\n I have some bad news:\n Putin has taken over America\n It looks like you lose.' });
                        }
                        return;
                    }
                }
            }
            let sanity_check = Math.random();
            // If you spent all your capital and it's early in the game then you need more capital!
            // Better would be the dilemma screen giving you lots of capital so it doesn't have to be about the aliens
            if (this.sharedData.MAGAness == 0 && this.sharedData.Wokeness == 0 && this.sharedData.putieTerritories < territories.length/2) {
                sanity_check = 0;
            }
            console.log('check for alien invasion '+ sanity_check);
            if ((this.sharedData.year > 2030) && (sanity_check < .3)) {
                this.scene.get('AliensAttack').setup(this.sharedData);
                this.scene.start('AliensAttack');
                return;
            }

            for (let key in this.sharedData.icons) {
                let iconData = this.sharedData.icons[key];

                if (iconData.health < 1 || iconData.maga > 100 || iconData.woke > 100 || iconData.maga + iconData.woke > 100) {
                    this.sharedData.putieTerritories++;
                    this.putieTerritories = this.sharedData.putieTerritories;
                    iconData.maga = 0;
                    iconData.woke = 0;
                    iconData.health = 5;
                    this.scene.get('TutorialScene').setup(this.sharedData);
                    if (this.sharedData.putieTerritories < territories.length) {
                        this.scene.start('TutorialScene', { message: capitalizeFirstLetter(key) + ' Collapses!  Need to rebuild...\n Putie uses his political influence\nto create instability in America' });
                    } else {
                        this.scene.start('TutorialScene', { message: capitalizeFirstLetter(key) + ' Collapses!  Need to rebuild...\n I have some bad news:\n Putin has taken over America\n It looks like you lose.' });
                    }
                    return;
                }

                let healthTextRange = ['terrible', 'poor', 'so-so', 'good', 'excellent'];
                let healthText = healthTextRange[Phaser.Math.Clamp(Math.round(iconData.health/iconData.healthScale/20),0,4)];
                iconData.iconText.setText(iconData.textBody + healthText);

                this.drawGauges(iconData.icon.x, iconData.icon.y, iconData.maga, iconData.woke, iconData.health, iconData.healthScale, iconData.gaugeMaga, iconData.gaugeWoke, iconData.gaugeHealth, iconData.scaleSprite);
            }

            thisRoundHealthChange += this.sharedData.MAGAnessVelocity;
            thisRoundHealthChange += this.sharedData.WokenessVelocity;

            this.sharedData.MAGAness = Phaser.Math.Clamp(this.sharedData.MAGAness + thisRoundHealthChange, 0, 100);
            this.sharedData.Wokeness = Phaser.Math.Clamp(this.sharedData.Wokeness + thisRoundHealthChange, 0, 100);
            console.log('MAGAness = ' + this.sharedData.MAGAness + ' Wokeness = ' + this.sharedData.Wokeness);

            polCapText.setText('Political Capital: ' + Math.floor((this.sharedData.MAGAness + this.sharedData.Wokeness)).toString());

/*
            MAGAnessText.setText('MAGA political\ncapital: ' + this.sharedData.MAGAness);

            WokenessText.setText('Woke political\ncapital: ' + this.sharedData.Wokeness);
 */
        }
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        //====================================================================================
        //
        // function governmentGrowth()
        //  Note that it is called with a callbackscope of 'this'
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

                this.drawGauges(gov.icon.x, gov.icon.y, gov.maga, gov.woke, gov.health, gov.healthScale, gov.gaugeMaga, gov.gaugeWoke, gov.gaugeHealth, gov.scaleSprite);
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

        //====================================================================================
        //
        // The following function creates the information/misinformation blockers
        //
        //====================================================================================
        createMisinformationManagement(this);

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
        this.govTime = this.time.addEvent({
            delay: 7000,
            callback: governmentGrowth,
            callbackScope: this,
            loop: true
        });

        //====================================================================================
        // function createMisinformationManagement(scene)
        // function that recreates the information/misinformation blockers
        //
        //====================================================================================
        function createMisinformationManagement(scene) {
            scene.misinformationData = [
                //{type: 'maga', text: 'Make America\nGreat Again'},
/*
                {type: 'maga', text: 'Virtue Signaling'},
                {type: 'maga', text: 'Dog Whistle'},
                {type: 'maga', text: 'The Thin Blue Line'},
                {type: 'maga', text: 'Tucker Carlson'},
                {type: 'maga', text: 'Media Bias'},
                {type: 'maga', text: 'Candace Owens'},
                {type: 'woke', text: 'Public Awareness'},
                {type: 'woke', text: 'Black Lives Matter'},
                {type: 'woke', text: 'Police Brutality'},
                {type: 'woke', text: 'Anthony Fauci'},
                {type: 'woke', text: 'Amanda Gorman'}
*/
                //{type: 'woke', text: 'Wokeness'}
            ];



            scene.magaThreats = scene.physics.add.group();
            scene.magaDefenses = scene.physics.add.group();
            scene.putieThreats = scene.physics.add.group();
            scene.wokeThreats = scene.physics.add.group();
            scene.wokeDefenses = scene.physics.add.group();
            scene.wokeReturns = scene.physics.add.group();
            scene.magaReturns = scene.physics.add.group();


            // Recreate previously generated misinformation tokens
            for (let key in scene.sharedData.misinformation) {
                // Look up the stored data
                let storedData = scene.sharedData.misinformation[key];

                // Use the stored data when creating the token
                let misinformation = createPowerToken(scene, 'neutral', storedData.text, storedData.x, storedData.y, storedData);
                scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group
                misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again

                //data.x = xOffset;
                //data.y = yOffset;
            }

            scene.physics.add.collider(scene.magaDefenses, scene.wokeThreats);
            scene.physics.add.collider(scene.wokeDefenses, scene.magaThreats);

            //scene.physics.add.collider(scene.envIcon, scene.magaThreats);
            //scene.physics.add.collider(scene.envIcon, scene.wokeThreats);


/*
            // this will slow down the threat when it hits an object by reducing its velocity by half.
            // Assuming that each threat and object has a unique 'id' property...
            scene.physics.add.collider(scene.wokeThreats, scene.envIcon, function (threat, object) {
                // Initialize the set if it doesn't exist yet
                if (!threat.collidedWith) {
                    threat.collidedWith = new Set();
                }
                console.log('collider wokeland');
                // If we haven't collided with this object yet...
                if (!threat.collidedWith.has(object.id)) {
                    threat.collidedWith.add(object.id);
                    // Handle collision...
                    console.log('wokecollide');
                    threat.body.velocity.x *= 0.5;
                    threat.body.velocity.y *= 0.5;
                }
            }, null, this);

            scene.physics.add.collider(scene.magaThreats, scene.envIcon, function (threat, object) {
                // Initialize the set if it doesn't exist yet
                if (!threat.collidedWith) {
                    threat.collidedWith = new Set();
                }
                    console.log('collider magaland');

                // If we haven't collided with this object yet...
                if (!threat.collidedWith.has(object.id)) {
                    threat.collidedWith.add(object.id);
                    // Handle collision...
                    console.log('magacollide');
                    threat.body.velocity.x *= 0.5;
                    threat.body.velocity.y *= 0.5;
                }
            }, null, this);
 */
        //====================================================================================
        // Add overlaps for bouncing or slowdowns between threats and shields
        // magaThreatWokeShield(), wokeThreatMagaShield()
        //
        //====================================================================================
            function magaThreatWokeShield(object,threat, shieldStrength)
            {
/*
                if (threat.body.velocity.x == 0 && threat.body.velocity.y == 0) {
                    console.log('swap object and threat');
                    let temp = threat;
                    threat = object;
                    object = temp;
                }
 */
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

                        // "bounce" and move the threat to territory 1
                        scene.physics.moveTo(threat, territory.x + territoryWidth/2, scene.game.config.height, 200);
                        object.setTint(0x8080ff).setAlpha(0.9);
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

            function wokeThreatMagaShield(object,threat, shieldStrength)
            {
/*
                if (threat.body.velocity.x == 0 && threat.body.velocity.y == 0) {
                    console.log('swap object and threat');
                    let temp = threat;
                    threat = object;
                    object = temp;
                }
 */
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
                    wokeThreatMagaShield(object,threat, shieldStrength);
                }, null, this);

            //====================================================================================
            //
            // Add overlaps for bouncing or slowdowns between threats and defences
            //
            //====================================================================================
            scene.physics.add.overlap(scene.magaDefenses, scene.wokeThreats, function(defense, threat) {
                threat.destroy();
                this.roundThreats--;
                console.log('defense destroyed threat.  Down to ' + this.roundThreats);
                if (this.roundThreats == 1) {
                    this.scene.get('politics').setup(this.sharedData);
                    this.scene.start('politics');
                }
                if (Math.random() < .1) {
                    scene.tweens.add({
                        targets: defense,
                        alpha: 0,
                        duration: 500,
                        onComplete: function () {
                            defense.container.destroy();
                        },
                        callbackScope: scene
                    });
                }
            }, null, this);

            scene.physics.add.overlap(scene.wokeDefenses, scene.magaThreats, function(defense, threat) {
                threat.destroy();
                this.roundThreats--;
                console.log('defense destroyed threat.  Down to ' + this.roundThreats);
                if (this.roundThreats == 1) {this.scene.get('politics').setup(this.sharedData);this.scene.start('politics');}
                if (Math.random() < .1) {
                    scene.tweens.add({
                        targets: defense,
                        alpha: 0,
                        duration: 500,
                        onComplete: function () {
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
                    duration: 500,
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
                    scene.drawHealthGauge(icon[type]/ 100,defense.x,defense.y, type, gauge, icon.maga, icon.woke, icon.scaleSprite);
                    scene.drawHealthGauge(icon.health/ icon.healthScale/ 100, defense.x, defense.y, 'Health', icon.gaugeHealth);
                    icon.iconText.setText(icon.textBody + Math.floor(icon.health) + message);
                    hitIcon(icon.iconText, iconColor);
                    threat.isDestroyed = true;
                    scene.roundThreats--;
                    console.log('scene.roundThreats = ' + scene.roundThreats);
                    if (scene.roundThreats == 1) {
                        environmentalImpact();
                        scene.cameras.main.fadeOut(2000, 0, 0, 0);
                        scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                            scene.scene.get('politics').setup(scene.sharedData);
                            scene.scene.start('politics');
                        });
                    }
                }
            }

            for (let key in scene.sharedData.icons) {
                let icon = scene.sharedData.icons[key];
                // Woke overlap
                scene.physics.add.overlap(icon.icon, scene.wokeThreats, function(defense, threat) {
                    handleOverlap(icon, defense, threat, 5, 'woke', icon.gaugeWoke, '\nToo much Wokeness!');
                });
                // Maga overlap
                scene.physics.add.overlap(icon.icon, scene.magaThreats, function(defense, threat) {
                    handleOverlap(icon, defense, threat, 5, 'maga', icon.gaugeMaga, '\nMake America Great Again!');
                });
                // Putin overlap
                scene.physics.add.overlap(icon.icon, scene.putieThreats, function(defense, threat) {
                    // handle the Putin overlap with maga and then increment woke afterward
                    handleOverlap(icon, defense, threat, 2, 'putie', icon.gaugeMaga, '\nToo Much Putin!');
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
        let scene = this;
        // game loop
        // This is called 60 times per second. Game logic goes here.
        if (this.roundThreats === 0) {
            console.log('launch!');
            this.time.delayedCall(10000, () => {
                this.cameras.main.fadeOut(2000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.get('politics').setup(this.sharedData);
                    this.scene.start('politics');
                });
            });
            this.roundThreats = 1;

            this.time.delayedCall(500, () => {
                // Get the keys of your icons object
                let iconKeys = Object.keys(scene.sharedData.icons);

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
                // Now your keys array is shuffled, so you can iterate over it
                iconKeys.forEach(key => {
                    let icon = scene.sharedData.icons[key];
                    console.log('maga: ' + icon.maga + ' woke: '+icon.woke + ' attack '+key);

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
                            }
                        }  else if (territory.faction == 'woke') {
                            wokeThreatCounter += icon.woke/25;
                            if (Math.floor(wokeThreatCounter) > 0) {
                                // Issue a threat here
                                this.createThreat(territory, '', icon, Math.floor(wokeThreatCounter));
                                wokeThreatCounter -= Math.floor(wokeThreatCounter);
                                countThreats++;
                            }
                        } else if (territory.faction == 'putieVille') { // one threat automatically issued to every icon from Putie
                            countThreats++;
                            this.createThreat(territory, '', icon, 1);
                        }
                    }
                    });
                    console.log('total number of threats fired: '+countThreats);
                    let message;
                if (countThreats == 0) {
                    message = 'America is at peace.\n MAGA and Woke are balanced\nand content.';
                } else {
                    message = 'Activists Apply Pressure!';
                }
                // Create a text object to display a victory message
                let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
                    font: 'bold 48px Arial',
                    fill: '#ffffff',
                    align: 'center'
                });
                victoryText.setOrigin(0.5);  // Center align the text
                victoryText.setAlpha(0.8);
                if (countThreats == 0) {
                    // Create a button using an image
                    let nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);

                    // When the button is clicked, start the next scene
                    nextButton.on('pointerdown', () => {
                        // pass this scene's this.sharedData to insurrection's setup, (where it is assigned to insurrection's this.sharedData)
                        // question: does this scene's sharedData ever even get used?
                        //this.sharedData.icons = this.icons;
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
