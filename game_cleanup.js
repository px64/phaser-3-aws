//===============================
//
// MAGA vs. Woke Game
//
// Things to do list:
//    1. During 'politics', you can move barriers around, but not during 'insurrection'?
//    2. Alien Invasion: need to add a military Icon that you can drop helperTokens into to boost military strength
//        -- military strength can take on several different aspects.
//            - limited missiles to fire: more missiles
//            - faster missiles
//            - improved accuracy
//            - bigger explosions (would need to add missile detonation at destination and an explosion)
//            - more frequent reload (would need to add a time delay between missile launches)
//                  -- idea that also impacts putieville: perhaps each territory has a launch delay and
//                  -- it automatically round-robins between territories so the delay can catch up when returning to territory #1
//        -- How does user get to add to the military strength (or defense) aspects?
//            -- easiest: round robin: but doesn't make much sense
//            -- another scene that has slider bars for all of the aspects: the best but more work. Yes but need to wait for insurrectionists to finish.
//            -- a popup overlay when military health is boosted?
//    3. Need to come up with some negative impact of Putieville on the aliens attack screen.
//        -- See above on the round-robin reload idea for fewer bases to fire from
//        -- putieville can launch it's own 'decoy puties' that can impact or deflect your missiles but don't harm aliens
//            -- this might be pretty easy to implement
//    6. Need to add general rules for all gauges:
//        - If difference between Maga and Woke is large: health goes down
//        - If sum of Maga AND Woke is large: chance of icon collapse
//        - If difference is small: health goes up

// Problem: when we go to alien attack screen, we never encounter the insurrection screen!
//  you should always go to insurrectionist attack.  Actually go to the military allocation screen, then insurrectionists attack, then aliens attack

// Two player game:
// one player plays MAGA, the other plays Woke.
// During politics, each allocates capital to their own people only.
//  -- MAGA spends capital building better alien attacks and defenses.
//  -- Woke spends capital building better infrastructure against collapse/ insurrection

// NEW IDEA: have social justice only improve by answering difficult questions.



// Done:
//    add a 'quit' button to insurrection screen so it can end in case there are only a few threats floating around (maybe a timer?  30 secs?)
//          -- Have a Putie-ville (and China) that grow across the country
//
//            -- If difference between Maga and Woke is large: Need an indicator of this difference on the gauge!
//                 - fix gauge color so it stays the color of the greatest of maga or woke

import BaseScene from './BaseScene.js';
import {Politics} from './politics.js';
import {DilemmaScene} from './dilemma.js';
import {Insurrection} from './insurrection.js';
import {MilitaryAllocation} from './MilitaryAllocation.js';
import { territories } from './BaseScene.js'
import { characters } from './BaseScene.js';
import { militaryAssets } from './BaseScene.js';

var healthBar;
var healthBox;
var healthGauge;
var thereBeThreats = 0;
let MAGAslider;
let Wokeslider;
var foo;
var MAGAnessText;
var WokenessText;
var polCapText;
var yearText;


class TitleScene extends Phaser.Scene {
    constructor () {
        super({ key: 'titlescene'});
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
            thisRoundTerritoriesWithMissiles: 6
        };
    }

    create() {
        // The story text
        let storyLines = [
            "In the year 2023, America stood divided. A philosophical war had taken",
            "hold, a conflict of ideas and ideals that divided the nation into two",
            "distinct factions: MAGA and Woke. These two sides stood in opposition, each",
            "one convinced that its own path was the one true way to guide America towards",
            "prosperity.",
            " ",
            "MAGA supporters, with their rallying cry of 'Make America Great Again',",
            "yearned for a return to traditional values, less government interference, and",
            "a strong sense of national identity. They envisioned an America that was",
            "united under a single flag, with patriotism as the driving force that",
            "propelled the nation forward.",
            " ",
            "On the other side, the Woke faction called for change, inclusivity,",
            "diversity, and a focus on social and environmental responsibility. They",
            "wanted a future where everyone had a place, a voice, and the ability to",
            "contribute to society, regardless of their background.",
            " ",
            "As time went on, these ideological differences began to form a chasm",
            "between the two factions, threatening to tear the nation apart. But in the",
            "shadows, a new threat was looming. A threat that didn't care about political",
            "affiliations or philosophical disagreements. An alien invasion was on the",
            "horizon.",
            " ",
            "The only hope for survival lay in unity. But could these two factions, so",
            "deeply entrenched in their beliefs, set aside their differences and work",
            "together for the greater good of humanity? Only time would tell as the first",
            "signs of the extraterrestrial threat began to emerge."
        ];

        // Create a group to hold your text lines
        let textGroup = this.add.group();

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            // Skip to the next scene
            this.scene.get('ChooseYourIdeologyScene').setup(this.sharedData);
            this.scene.start('ChooseYourIdeologyScene');
        }, this);

        if (this.sys.game.config.width < 704) {
            this.sharedData.fontSize = '24px';
            this.sharedData.medFont = '18px';
        } else {
          this.sharedData.fontSize = '48px';
          this.sharedData.medFont = '32px';
        }
        // For each line of text...
        for (let i = 0; i < storyLines.length; i++) {
            // ...create a timed event that waits i*1000 milliseconds, then...
            this.time.addEvent({
                delay: i * 1400,
                callback: () => {
                    // Create the text line
                    let text = this.add.text(this.cameras.main.centerX, this.sys.game.config.height /* + i * 5 */, storyLines[i], {
                            font: 'bold ' + this.sharedData.fontSize + ' Arial',
                            fill: '#ffffff',
                            align: 'center'
                        });

                    // Center align the text
                    text.setOrigin(0.5);

                    // Adjust the scale based on the line number
                    let startScale = 0.5 + (10 / storyLines.length) / 2;
                    text.setScale(startScale);

                    // Calculate the duration based on the starting and ending scale
                    let duration = 20000 * (1 + startScale);

                    // Create a tween to scroll and scale the text
                    this.tweens.add({
                        targets: text,
                        y: '-=1050',
                        scaleX: '-=0.7',
                        scaleY: '-=0.7',
                        // y: '-=700',
                        // scaleX: '-=0.35',
                        // scaleY: '-=0.35',
                        ease: 'Linear',
                        duration: 33000,
                        repeat: 0,
                        onComplete: function () {
                            text.destroy(); // destroy the text once it's off the screen
                            if (i === storyLines.length - 1) {
                                this.scene.get('ChooseYourIdeologyScene').setup(this.sharedData);
                                this.scene.start('ChooseYourIdeologyScene');
                            }
                        }, callbackScope: this
                    });
                }, callbackScope: this
            });
        }
    }
}

//class ChooseYourIdeologyScene extends Phaser.Scene {
export class ChooseYourIdeologyScene extends BaseScene {

    constructor() {
        super({ key: 'ChooseYourIdeologyScene' });
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
            thisRoundTerritoriesWithMissiles: 6
        };
    }
    setup(data) {
            Object.assign(this.sharedData, data);
    }
    preload() {
        // Call BaseScene's preload
        super.preload();

        this.load.image('background', 'assets/aliencrash.png');
    }

    create() {
        // Add a background
        this.add.image(400, 300, 'background');

        // Create an array of ideologies
        let ideologies = [
        {
            name: "MAGA",
            color: '#ff0000',
            icon: 'magaBase',
            faction: 'maga'
        },
        {
            name: "Woke",
            color: '#0000ff',
            icon: 'wokeBase',
            faction: 'woke'
        },
/*
        {
            name: "Libertarian RINO", color: '#ff00ff',
            icon: 'libertarian',
            faction: 'rino'
        },
        {
            name: "Independent", color: '#ff00ff',
            icon: 'independent',
            faction: 'independent'
        },
 */
        {
            name: "Not interested in politics/\n  Hoping to be abducted", color: '#00ff00',
            icon: 'threat',
            faction: 'none'
        }
        ];
        let textColor = 1 ? '#ff8080' : '#8080ff';

        // Set the title text
        let titleText = this.add.text(this.sys.game.config.width/2 - 20, 200, 'Choose Your Ideology', { fontSize: '32px', fontFamily: 'Roboto', color: textColor, fill: '#fff' }).setOrigin(0.5);

        // Create the radio buttons
        for(let i = 0; i < ideologies.length; i++) {
            let radioButton = this.add.text(this.sys.game.config.width/2 - 20, 300 + (i * 50), ideologies[i].name, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive();
            let icon = this.add.sprite(this.sys.game.config.width/2 - 20 - radioButton.width/2 - 40, 300 + (i * 50), ideologies[i].icon).setScale(.1);

            radioButton.on('pointerdown', () => this.selectIdeology(ideologies[i]));
            radioButton.on('pointerover', () => this.enterButtonHoverState(radioButton));
            radioButton.on('pointerout', () => this.enterButtonRestState(radioButton));
        }
    }

    selectIdeology(ideology) {
        // Here you would set the player's ideology and move on to the next scene
        console.log(`You chose ${ideology.name}`);
        let textColor = ideology.color;
        let ideologyText = this.add.text(this.sys.game.config.width/2 - 20, 700, 'You chose '+ ideology.name + '!', { fontSize: '32px', fontFamily: 'Roboto', color: textColor }).setOrigin(0.5);
        let icon = this.add.sprite(this.sys.game.config.width/2 - 20 - ideologyText.width/2 - 120, 700, ideology.icon).setScale(.3);
        let icon2 = this.add.sprite(this.sys.game.config.width/2 - 20 + ideologyText.width/2 + 120, 700, ideology.icon).setScale(.3);

        this.sharedData.ideology = ideology;
        characters.forEach((character, index) => {
            if (character.faction == ideology.faction) {
                character.endorsement += 5;
            }
        });
        if (ideology.faction == 'maga') {
            this.sharedData.MAGAness += 10;
        } else if (ideology.faction == 'woke') {
            this.sharedData.Wokeness += 10;
        } else {
            this.sharedData.MAGAness += 5;
            this.sharedData.Wokeness += 5;
        }

        this.cameras.main.fadeOut(3000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.get('AliensAttack').setup(this.sharedData);
            this.scene.start('AliensAttack');
            });
    }

    enterButtonHoverState(button) {
        button.setStyle({ fill: '#ff0'}); // change color to yellow
    }

    enterButtonRestState(button) {
        button.setStyle({ fill: '#fff'}); // change color back to white
    }
}


class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023
        };
    }
    setup(data) {
            Object.assign(this.sharedData, data);
            console.log('victory in year ' + this.sharedData.year);
    }
    preload() {
        // Preload an image for the victory scene
        this.load.image('victory', 'assets/aliencrash.png');
    }

    create(data) {
        // Create a text object to display a victory message
        let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, data.message, {
            font: 'bold '+ this.sharedData.fontSize + ' Arial',
            fill: '#ffffff',
            align: 'center'
        });

        victoryText.setOrigin(0.5);  // Center align the text

        // Optionally, display a victory image
        let victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'victory');
        victoryImage.setScale(0.5);  // Scale down the image
        victoryImage.setAlpha(0.4);  // Make the image semi-transparent

        // Bring the text to the top
        victoryText.setDepth(1);

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            // Switch to the next scene
            this.scene.get('politics').setup(this.sharedData);
            this.scene.start('politics');
        }, this);
    }
}

class AliensAttack extends Phaser.Scene {
    constructor() {
        super({ key: 'AliensAttack' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023
        };
    }
    setup(data) {
            Object.assign(this.sharedData, data);
            console.log('Aliens Attack cover screen in year ' + this.sharedData.year);
    }

    preload() {
        // Preload an image for the aliens attack scene
        this.load.image('attack', 'assets/aliencrash.png');
    }

    create() {
        // Create a text object to display a victory message
        let healthTextRange = ['terrible', 'poor', 'so-so', 'good', 'excellent'];
        let health = 1;
        let healthScale = 1;
        if (this.sharedData.icons['military']) {
          health = this.sharedData.icons['military'].health;
          healthScale = this.sharedData.icons['military'].healthScale;
        }
        let healthText = capitalizeFirstLetter(healthTextRange[Phaser.Math.Clamp(Math.round(health/healthScale/20),0,4)]);

        let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
           'Alien Invasion!\n You need to defend America from\n' + this.sharedData.thisRoundAlienAttacks +
           ' alien Attack' + ((this.sharedData.thisRoundAlienAttacks > 1) ? 's': '') +'!\nYour Alien Defense is: ' + healthText, {
            font: 'bold ' + this.sharedData.fontSize + ' Arial',
            fill: '#ffffff',
            align: 'center'
        });

        victoryText.setOrigin(0.5);  // Center align the text

        // Optionally, display a victory image
        let victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'attack');
        //victoryImage.setScale(0.5);  // Scale down the image
        victoryImage.setAlpha(0.4);  // Make the image semi-transparent

        // Bring the text to the top
        victoryText.setDepth(1);

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            // Switch to the next scene
            this.scene.get('scene2').setup(this.sharedData);
            console.log('back on cover screen sharedData has been sent.  Now start scene2');
            this.scene.start('scene2');
        }, this);
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }
}
class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023
        };
    }

    setup(data) {
            Object.assign(this.sharedData, data);
    }

    preload() {
        // Preload an image for the tutorial scene
        this.load.image('tutorial', 'assets/aliencrash.png');
    }

    create(data) {
        // Use data.message as the message text
        let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, data.message,  {
            font: 'bold ' + this.sharedData.fontSize + ' Arial',
            fill: '#ffffff',
            align: 'center'
        });

        victoryText.setOrigin(0.5);  // Center align the text

        // Optionally, display a victory image
        let victoryImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'tutorial');
        victoryImage.setScale(0.5);  // Scale down the image
        victoryImage.setAlpha(0.2);  // Make the image semi-transparent

        // Bring the text to the top
        victoryText.setDepth(1);

        console.log('year is '+ this.sharedData.year);

        // Input event listener
        this.input.on('pointerdown', function (pointer) {
            // Switch to the next scene
            this.scene.get('politics').setup(this.sharedData);
            this.scene.start('politics');
        }, this);
    }
}


//====================================================================================
//
//        class Scene2 extends Phaser.Scene
//             Alien Invasion
//             Missile Attack
//
//         The idea is that each round, n more aliens attack.  Each territory gets some
//         number of missiles.  A territory shoots all of its missiles before the game
//         moves on to the next territory.  Early in the game, only 1 territory has
//         missiles.  As the game progresses, more territories have missiles.  It is done
//         this way because we want the player to be able to take multiple shots from
//         the same territory in order to improve aim.
//
//         New idea: other kinds of threats are zipping by, not necessarily landing.  If
//         they get destroyed, bonus points are given.  The logic behind this is that a
//         player who invests in military can get more political capital by destroying
//         more aliens.  Sort of like an arcade at an amusement park: you hit the ducks,
//         you win a prize.  If you have super-fast accurate weapons, you get lots of
//         prizes.
//
//         Another thing: Need to somehow differentiate between the ideology chosen at
//         the start of the game.  Some brainstorming:
//         1) you choose Maga, you only fire maga missiles, same for Woke.
//         2) If you broker peace with the other faction, then you can start firing their
//             missiles too.  Maybe if government hits 100% health, you can fire both.
//             -- early on: my faction only.  X missiles per territory, then next territory
//                of the same faction.
//         3) Does it matter which territory the aliens attack? not bad -- in fact it's
//            good to defeat when other territory because you get other's capital
//         4) Make it clear that if the aliens are attacking the other faction, you get
//            their political capital for defeating the alien attack.
//
//         New Features:
//             Could add a protective shield around a territory
//             Should add icons showing how many missiles each territory has left
//             Add in-place explosion/ detonation
//             Need to add an 'aliens reach bottom of screen' scene.  Could have a diff.
//             message if the aliens captured an opposing territory
//
//====================================================================================
export class Scene2 extends BaseScene {

    constructor() {
        super({ key: 'scene2' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023,
            misinformation: {},
            helperTokens: {},
            ideology: 'maga'
        };



    }
    // Alien Invasion
    setup(data) {
        console.log(' scene2: setup is loading sharedData');
            Object.assign(this.sharedData, data);

            console.log('scene2 in year '+ this.sharedData.year);
            this.icons = this.sharedData.icons;
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
    }
    preload() {
        // preload assets
        // Load any images or assets here.
        let mbase = this.load.image('magaBase', 'assets/magaBase.png');
        this.load.image('wokeBase', 'assets/wokeBase.png');
        this.load.image('missile', 'assets/missile.png');
        this.load.image('threat', 'assets/threat.png');
    }
    create() {
        // set up game objects
        // The 'this' keyword refers to the scene.
        this.MAGAness = this.sharedData.MAGAness;
        this.Wokeness = this.sharedData.Wokeness;
        this.putieTerritories = this.sharedData.putieTerritories;
        this.totalAlienAttacks = this.sharedData.thisRoundAlienAttacks;
        this.sharedData.thisRoundAlienAttacks += 2; // each round 2 more alien attacks
        this.icons = this.sharedData.icons;

        console.log('MAGA: ' + this.MAGAness + 'Woke: ' + this.Wokeness);
        territories.forEach((territory, index) => {
            territory.y = this.game.config.height - 50;
        });
        this.territoryWidth = this.sys.game.config.width / territories.length;

        this.createTerritories();

        let totalCapital = this.MAGAness + this.Wokeness;

        polCapText = this.add.text(20, 0, 'Political Capital ' + totalCapital, { fontSize: this.sharedData.medFont, fill: '#0f0' });

        // Create MAGAness text
        //MAGAnessText = this.add.text(20, 0, 'MAGA Political\n Capital ' + this.MAGAness, { fontSize: '16px', fill: '#fff' });

        // Create Wokeness text
        //WokenessText = this.add.text(1100, 0, 'Wokeness Political\n Capital: ' + this.Wokeness, { fontSize: '16px', fill: '#fff' });

        // Create Year text
        yearText = this.add.text(this.sys.game.config.width * .8, 0, 'Year: ' + this.sharedData.year, { fontSize: this.sharedData.medFont, fill: '#fff' });

/*
        let offsetIndex = Phaser.Math.Between(0, territories.length - 1) + territories.length / 2;
        this.attackIndex = Phaser.Math.Wrap(offsetIndex, 0, territories.length);
 */

        // New and improved version: aliens never attack putieville and only your own faction attacks the aliens, at least early on.
        // Note that it's random whether they attack maga or woke, and whoever is attacked gets the political capital
        // Maybe in "shooting gallery" mode you just give political capital to both maga and to woke for every hit
        // It doesn't seem right that the aliens attack the other faction.  Why defend?  Maybe don't defend.  New icon: alien base
        let faction = 'putieVille';
        let count = 0;
        while (faction == 'putieVille' || faction == 'alien') {
            this.attackIndex = Phaser.Math.Between(0, territories.length - 1);
            this.attackedTerritory = territories[this.attackIndex];
            faction = this.attackedTerritory.faction;
            if (count++ > 100) {
                console.log('something went wrong.  got stuck in looking for a non putieville.');
                break;
            } // something went wrong: can only find putieVille everywhere
        }

        //this.magaBase = this.physics.add.sprite(100, this.sys.game.config.height - 100, 'magaBase').setScale(0.1);
        //this.wokeBase = this.physics.add.sprite(this.sys.game.config.width - 100, this.sys.game.config.height - 100, 'wokeBase').setScale(0.1);

        this.missilesMaga = this.physics.add.group();
        this.missilesWoke = this.physics.add.group();
        this.threats = this.physics.add.group();
        this.roundRobinLaunch = 0;
        this.missilesPerTerritory = 3;  // hard code missiles per territory to 3 for now
        this.territoriesWithMissiles = this.sharedData.thisRoundTerritoriesWithMissiles;

        this.input.on('pointerdown', function (pointer) {
            //let baseOffset = Phaser.Math.Wrap(this.attackIndex + territories.length/2, 0, territories.length-1);
            let base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
            let count = 0;
            console.log('base faction = ' + base.faction + ' ideology = ' + this.sharedData.ideology.faction);
            while (base.faction != this.sharedData.ideology.faction) {
                this.roundRobinLaunch++;
                base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
                console.log('base faction = ' + base.faction + ' ideology = ' + this.sharedData.ideology.faction);
                if (count++ > 100) {
                    console.log('something went wrong.  got stuck in looking for a new territory.');
                    break;
                }
            }
            console.log(((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length) + ' ' + this.roundRobinLaunch % territories.length)
            if (this.missilesPerTerritory-- <= 0) {
                if (this.territoriesWithMissiles-- > 0) {
                    this.roundRobinLaunch++;
                    this.missilesPerTerritory = 3;
                    }
            }
            if (this.missilesPerTerritory >= 0) {
                if (base.faction == 'woke') {
                    // Calculate the angle to the target
                    let angle = Phaser.Math.Angle.Between(base.x+this.territoryWidth/2, base.y, pointer.x, pointer.y);
                    angle += 90*(Math.PI/180);
                    let missile2 = this.fireMissile(base, angle, pointer, Phaser.Math.Between(-30,30), .03, 150, this.missilesWoke);
                    // Timer event to delay missile firing
                    this.time.delayedCall(400, () => {
                        // Code to fire missile goes here
                        let missile1 = this.fireMissile(base, angle, pointer, Phaser.Math.Between(0,30), .03, 150, this.missilesWoke)
                    }, [], this);
                    this.time.delayedCall(800, () => {
                        // Code to fire missile goes here
                        let missile3 = this.fireMissile(base, angle, pointer, Phaser.Math.Between(-30,0), .03, 150, this.missilesWoke)
                    }, [], this);
                } else if (base.faction == 'maga') {
                    let angle = Phaser.Math.Angle.Between(base.x+this.territoryWidth/2, base.y, pointer.x, pointer.y);
                    angle += 90*(Math.PI/180);
                    let missile = this.fireMissile(base, angle, pointer, Phaser.Math.Between(-30,30), 0.1, 50, this.missilesMaga);
                }
            }
        }, this);

        this.physics.add.overlap(this.missilesMaga, this.threats, function (missile, threat) {
            this.explode(missile, 3);
            missile.destroy();
            threat.hitpoints -= 9;
            if (threat.hitpoints <= 0) {
                this.MAGAness += threat.score;
                polCapText.setText('Political Capital ' + (this.MAGAness + this.Wokeness).toString());
                this.explode(threat, threat.score == 1 ? 5: 10);
                threat.destroy();
            }
        }, null, this);
        this.physics.add.overlap(this.missilesWoke, this.threats, function (missile, threat) {
            this.explode(missile, 1);
            missile.destroy();
            threat.hitpoints -= 3;
            if (threat.hitpoints <= 0) {
                this.Wokeness += threat.score;
                polCapText.setText('Political Capital: ' + (this.MAGAness + this.Wokeness).toString());
                this.explode(threat, threat.score == 1 ? 5: 10);
                threat.destroy();
            }
        }, null, this);

        function generateNumber(n) {
            return Math.floor((n+1)/2) * (n % 2 === 0 ? 1 : -1);
        }

    } // end of create()

    fireMissile(base, angle, pointer, offset, scale, missileSpeed, missileSprite) {
        let missileNum = missileSprite.create(base.x+this.territoryWidth/2, base.y, 'missile').setScale(scale);
        missileNum.setRotation(angle);
        let missileSpeedAsset = militaryAssets.find(asset => asset.name === 'Missile Speed');
        console.log(missileSpeedAsset);
        if (missileSpeedAsset) {
            missileSpeed += missileSpeedAsset.techLevel * 10;
        } else {
            console.log("'Missile Speed' asset not found");
        }
        this.physics.moveTo(missileNum, pointer.x+offset, pointer.y-offset, missileSpeed);
        return {missileNum: missileNum};
    }

    explode(object, size) {
      let numExplosions = 8;
      let lifeSpan = 400;
      let volume = 25;
      let delay = 20;
      switch(size) {
          case 1:
              numExplosions = 4;
              lifeSpan = 200;
              break;
          case 2:
              numExplosions = 8;
              lifeSpan = 400;
              break;
          case 3:
              numExplosions = 10;
              lifeSpan = 600;
              break;
          case 4:
              numExplosions = 14;
              lifeSpan = 800;
              break;
          case 5:
              numExplosions = 16;
              lifeSpan = 4000;
              volume = 50;
              delay = 50;
              break;
          case 10:
              numExplosions = 40;
              lifeSpan = 6000;
              volume = 100;
              delay = 100;
              break;
      }
      for (let i = 0; i < numExplosions; i++) {
          setTimeout(() => {
              let emitter = this.add.particles(400, 250, 'flares', {
                  frame: [ 'red', 'yellow', 'green' ],
                  lifespan: lifeSpan,
                  speed: { min: 225-size*20, max: 375-size*20 }, // Reduced speed values
                  scale: { start: 0.25, end: 0 }, // Reduced scale values
                  gravityY: 250,
                  blendMode: 'ADD',
                  emitting: false
              });
              emitter.setPosition(object.x + Phaser.Math.Between(-volume, volume),
                                  object.y + Phaser.Math.Between(-volume,volume));
              emitter.explode(16);
          }, i * delay); // Delay in milliseconds
      }
    }

    update() {
        // game loop
        // This is called 60 times per second. Put game logic here.
        if (Math.random() < 0.001) {
            let threat = this.threats.create(this.sys.game.config.width, 25, 'threat').setScale(0.5);
            threat.hitpoints = 15;
            threat.score = 8;

            this.physics.moveTo(threat, 0, 25, 250); // the speed of the threat.
        }
        if (Math.random() < 0.01 && this.totalAlienAttacks-- > 0) {
            let threat = this.threats.create(Math.random() * this.sys.game.config.width, 0, 'threat').setScale(0.1);
            threat.hitpoints = 9;
            threat.score = 1;

            console.log(`The aliens are attacking ${this.attackedTerritory.name}!`);

            this.physics.moveTo(threat, this.attackedTerritory.x + this.territoryWidth/2, this.sys.game.config.height, 100); // 100 is the speed of the threat.
        }
        if (this.threats.countActive(true) > 0) {
            thereBeThreats = 1;
        }
        if (thereBeThreats == 1 && this.threats.countActive(true) == 0) {
            console.log('All threats have been destroyed!');
            thereBeThreats = 0;
            if (this.attackedTerritory.faction == 'maga') {
                this.MAGAness += 10;
            } else {
                this.Wokeness += 10;
            }
            this.sharedData.Wokeness = this.Wokeness;
            this.sharedData.MAGAness = this.MAGAness;
            this.sharedData.icons = this.icons;
            this.cameras.main.fadeOut(3000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.get('VictoryScene').setup(this.sharedData);
                this.scene.start('VictoryScene', { message: 'Alien attack deterred!\nYou get great publicity.\nPolitical Capital raised by 10 points!'});
            });
        }
        // Check all alien objects
        this.threats.children.each(function(alien) {
            if (alien.score  < 3) {
                alien.angle += 4;
            }
            // If an alien has reached the bottom of the screen
            if (alien.y > this.sys.game.config.height) {
                console.log('Oh no alien has reached the bottom of the screen!');
                this.sharedData.alienTerritories++;
                if (this.sharedData.alienTerritories + this.sharedData.putieTerritories >= territories.length) {
                    console.log('you lose!');
                    this.scene.get('TutorialScene').setup(this.sharedData);
                    this.scene.start('TutorialScene', { message: 'I have some bad news:\n the Aliens have taken over America\n It looks like you lose.' });
                    return;
                }
                // Convert the object keys into an array
                let keys = Object.keys(this.sharedData.icons);

                // Get a random index
                let destroyedIndex = Phaser.Math.Between(0, keys.length - 1); // -1 because indices start at 0

                // Get the corresponding key
                let randomKey = keys[destroyedIndex];

                // Access the icon using the key, then modify its health
                // in the very first round, the icons haven't been created yet
                if (this.sharedData.icons['environment']) {
                    this.sharedData.icons[randomKey].health = Math.max(0, this.sharedData.icons[randomKey].health - 50);
                    // What happens when an alien reaches the base.  Ignore on first round
                    this.MAGAness = Math.max(0, this.MAGAness-10);
                    this.Wokeness = Math.max(0, this.Wokeness-10);
                }

                this.attackedTerritory.faction = 'alien';
                this.attackedTerritory.name = "Aliens";
                this.attackedTerritory.color = '0x123456';

                thereBeThreats = 0;
                this.sharedData.Wokeness = this.Wokeness;
                this.sharedData.MAGAness = this.MAGAness;
                this.sharedData.icons = this.icons;

                this.scene.get('politics').setup(this.sharedData);
                this.scene.start('politics');
            }
            if (alien.x <= 0) {
                alien.destroy();
            }
        }, this); // 'this' refers to our scene

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

    }
}

let config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
    },
    scene: [
        TitleScene,
        ChooseYourIdeologyScene,
        Insurrection,
        Politics,
        AliensAttack,
        Scene2,
        VictoryScene,
        TutorialScene,
        MilitaryAllocation,
        DilemmaScene
    ]
};

var game = new Phaser.Game(config);
