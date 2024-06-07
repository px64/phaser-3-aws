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
// It would be interesting if you get a mix of maga and woke characters that changes every game.
// or perhaps if you choose maga, the two defensive characters are woke, but if you choose woke,
// the two defensive characters are maga!



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
import { difficultyList } from './BaseScene.js';
//foo
var healthBar;
var healthBox;
var healthGauge;
var thereBeThreats;
let MAGAslider;
let Wokeslider;
var foo;
var MAGAnessText;
var WokenessText;
var polCapText;
var yearText;

//====================================================================================
//
//        class AliensAttack extends BaseScene
//
// AliensAttack informative text about the upcoming Alien Invasion
//
//====================================================================================
export class AliensAttack extends BaseScene {
    constructor() {
        super({ key: 'AliensAttack' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023,
            totalPoliticalCapital: 0
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
        this.input.setDefaultCursor('default');

        // Create a text object to display a victory message
        let healthTextRange = ['terrible', 'poor', 'so-so', 'good', 'excellent'];
        let health = 1;
        let healthScale = 1;
        if (this.sharedData.icons['military']) {
          health = this.sharedData.icons['military'].health;
          healthScale = this.sharedData.icons['military'].healthScale;
        }
        let healthText = capitalizeFirstLetter(healthTextRange[Phaser.Math.Clamp(Math.round(health/healthScale/20),0,4)]);

        let diplomacy = 0;

        if (this.sharedData.icons['diplomacy']) {
            diplomacy = this.sharedData.icons['diplomacy'].health;
        }
console.log(this.sharedData.ideology.faction);
console.log(diplomacy);
console.log(this.difficultyLevel().alienDefenseFromSameBase);
        let bonusText = '';
        if (this.sharedData.ideology.faction == 'none'
            || diplomacy > 95
            || this.difficultyLevel().alienDefenseFromSameBase == true) {
            bonusText = "\n\nDue to good diplomacy, both \nfaction's bases will fend off the attacks";
        } else {
            bonusText = "\n\nDue to weak diplomacy, only your\n own faction will fend off the attacks";
        }

        let victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
           'Alien Invasion!\n You need to defend America from\n' + this.sharedData.thisRoundAlienAttacks +
           ' alien Attack' + ((this.sharedData.thisRoundAlienAttacks > 1) ? 's': '') +'!\nYour Alien Defense is: ' + healthText + bonusText, {
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
//
//====================================================================================
// There needs to be some point where Putie just wins when 3 territories or less.  Game goes on forever
// when you are losing.  Maybe if total number of insurrectionists > 50 you automatically lose
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
            ideology: 'maga',
            totalPoliticalCapital: 0
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
        //====================================================================================
        //
        //             findValidTerritory(thisFaction, otherFaction)
        //
        //====================================================================================
        let findValidTerritory = (thisFaction, otherFaction) => {
            let count = 0;
            let base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
            while (base.faction != thisFaction && base.faction != otherFaction) {
                // pick a new territory
                this.roundRobinLaunch++;
                base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
                console.log('base faction = ' + base.faction + ' ideology = ' + this.sharedData.ideology.faction);
                if (count++ > 16) {
                    console.log('something went wrong.  got stuck in looking for a new territory.');
                    break;
                }
            }
            return base;
        }

        //====================================================================================
        //
        //             flashBase()
        //
        //====================================================================================
        let flashBase = (base) => {
            let flashCount = 0;
            let isGreen = true;

            // Update text with number of missiles
            base.nameText.setText(base.name + ' ' + numberToBars(this.missilesPerTerritory));

            // Immediately turn it green
            base.graphics.clear();
            base.graphics.fillStyle(0x00ff00, 1.0);
            base.graphics.fillRect(base.x, base.y - 10, this.territoryWidth, 30);

            let flash = this.time.addEvent({
                delay: 200, // flash every 200ms
                callback: () => {
                    base.graphics.clear();

                    if (isGreen) {
                        base.graphics.fillStyle(base.color, 1.0); // or other color when not flashing
                        isGreen = false;
                    } else {
                        base.graphics.fillStyle(0x00ff00, 1.0);
                        isGreen = true;
                    }

                    base.graphics.fillRect(base.x, base.y - 10, this.territoryWidth, 30);

                    flashCount++;
                    if (flashCount >= 5) { // We stop flashing after 5 changes (2 1/2 full flash cycles)
                        flash.remove();
                    }
                },
                loop: true // it will loop indefinitely if we don't stop it manually
            });
        }

        function numberToBars(number) {
            let bars = '';
            for (let i = 0; i < number; i++) {
                bars += '|';
            }
            return bars;
        }
        //====================================================================================
        //
        //             start of create()
        //
        //====================================================================================
        // set up game objects
        // The 'this' keyword refers to the scene.
        this.input.setDefaultCursor('crosshair');

        this.MAGAness = this.sharedData.MAGAness;
        this.Wokeness = this.sharedData.Wokeness;
        this.putieTerritories = this.sharedData.putieTerritories;
        this.totalAlienAttacks = this.sharedData.thisRoundAlienAttacks;
        this.sharedData.thisRoundAlienAttacks += this.difficultyLevel().alienIncreasePerRound; // each round n more aliens attack
        this.icons = this.sharedData.icons;
        this.aliensWin = false;
        this.attackIndex = 0; // need to start with this pointing to something so missiles can be launched from it
        this.missilesMaga = this.physics.add.group();
        this.missilesWoke = this.physics.add.group();
        this.threats = this.physics.add.group();
        this.roundRobinLaunch = 0;
        let missileNumberAsset = militaryAssets.find(asset => asset.name === 'Number of Missiles');
        this.missilesPerTerritory = 3 + Math.floor(missileNumberAsset.techLevel/10);
        this.territoriesWithMissiles = Math.min(this.sharedData.thisRoundTerritoriesWithMissiles, territories.length - this.sharedData.alienTerritories - this.sharedData.putieTerritories);

        thereBeThreats = 0;
        console.log('MAGA: ' + this.MAGAness + 'Woke: ' + this.Wokeness);
        territories.forEach((territory, index) => {
            territory.y = this.game.config.height - 50;
        });
        this.territoryWidth = this.sys.game.config.width / territories.length;

        this.createTerritories();

        let totalCapital = Math.floor(this.MAGAness + this.Wokeness);

        polCapText = this.add.text(20, 0, 'Political Capital ' + totalCapital, { fontSize: this.sharedData.medFont, fill: '#0f0' });

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

        let base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
        let thisFaction = this.sharedData.ideology.faction;
        let otherFaction = this.sharedData.ideology.faction;
        if (this.sharedData.ideology.faction == 'none') {
            thisFaction = 'maga';
            otherFaction = 'woke';
        }
        let diplomacy = 0;
        if (this.sharedData.icons['diplomacy']) {
            diplomacy = this.sharedData.icons['diplomacy'].health;
        }
        // If diplomacy is good, then both MAGA and Woke work together on defending
        if (this.sharedData.ideology.faction == 'none' || diplomacy > 95) {
            if (diplomacy < 96) {
                this.roundRobinLaunch++;  // if no affiliation and poor diplomacy, random bases fire
            }
            otherFaction = (thisFaction == 'maga' ? 'woke': 'maga');
        }

        base = findValidTerritory(thisFaction, otherFaction);
        flashBase(base);

        let lastClickTime = 0;

        this.input.on('pointerdown', function (pointer) {
            let missileLaunchDelayAsset = militaryAssets.find(asset => asset.name === 'Reload Time');
            let delay = Math.max(1200 - missileLaunchDelayAsset.techLevel*40, 0);
            let currentTime = new Date().getTime();
            if (currentTime - lastClickTime < delay) {
                return;
            }
            lastClickTime = currentTime;
            //let baseOffset = Phaser.Math.Wrap(this.attackIndex + territories.length/2, 0, territories.length-1);
            let base = territories[Phaser.Math.Wrap((this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length, 0, territories.length)];
            let diplomacy = 0;
            if (this.sharedData.icons['diplomacy']) {
                diplomacy = this.sharedData.icons['diplomacy'].health;
            }
            //console.log('base faction = ' + base.faction + ' ideology = ' + this.sharedData.ideology.faction);
            let thisFaction = this.sharedData.ideology.faction; // start with both factions the same.
            let otherFaction = this.sharedData.ideology.faction;
            if (this.sharedData.ideology.faction == 'none') {
                thisFaction = 'maga';
                otherFaction = 'woke';
                if (diplomacy < 96) {
                    this.roundRobinLaunch++;  // if no affiliation and poor diplomacy, random bases fire
                }
            }

            // If diplomacy is good, then both MAGA and Woke work together on defending
            if (this.sharedData.ideology.faction == 'none'
                || diplomacy > 95
                || this.difficultyLevel().alienDefenseFromSameBase) {
                otherFaction = (thisFaction == 'maga' ? 'woke': 'maga');
            }

            base = findValidTerritory(thisFaction, otherFaction);

            //console.log(((Phaser.Math.Wrap(this.attackIndex + generateNumber(this.roundRobinLaunch)) % territories.length), 0, territories.length) + ' ' + this.roundRobinLaunch % territories.length)
            if (this.missilesPerTerritory > 0) {
                this.missilesPerTerritory--; // use up one missile
                base.nameText.setText(base.name + ' ' + numberToBars(this.missilesPerTerritory));
                if (base.faction == 'woke') {
                    let oldBase = base; // need to remember old base because it gets changed below on the last missile launched
                    // Calculate the angle to the target
                    let angle = Phaser.Math.Angle.Between(base.x+this.territoryWidth/2, base.y, pointer.x, pointer.y);
                    angle += 90*(Math.PI/180);
                    let missile2 = this.fireMissile(base, angle, pointer, 30, .03, 150, 3, this.missilesWoke);
                    // Timer event to delay missile firing
                    this.time.delayedCall(400, () => {
                        let angle = Phaser.Math.Angle.Between(oldBase.x+this.territoryWidth/2, oldBase.y, pointer.x, pointer.y);
                        angle += 90*(Math.PI/180);
                        // Code to fire missile goes here
                        let missile1 = this.fireMissile(oldBase, angle, pointer, 30, .03, 150, 3, this.missilesWoke)
                    }, [], this);
                    this.time.delayedCall(800, () => {
                        let angle = Phaser.Math.Angle.Between(oldBase.x+this.territoryWidth/2, oldBase.y, pointer.x, pointer.y);
                        angle += 90*(Math.PI/180);
                        // Code to fire missile goes here
                        let missile3 = this.fireMissile(oldBase, angle, pointer, 30, .03, 150, 3, this.missilesWoke)
                    }, [], this);
                } else if (base.faction == 'maga') {
                    let angle = Phaser.Math.Angle.Between(base.x+this.territoryWidth/2, base.y, pointer.x, pointer.y);
                    angle += 90*(Math.PI/180);
                    let missile = this.fireMissile(base, angle, pointer, 30, 0.1, 50, 9, this.missilesMaga);
                }
            }

            if (this.missilesPerTerritory <= 0) {
                if (this.territoriesWithMissiles-- > 0) { // not quite right because a territory that already spent its missiles can be picked again
                    this.roundRobinLaunch++;
                    base = findValidTerritory(thisFaction, otherFaction);
                    this.missilesPerTerritory = 3 + Math.floor(missileNumberAsset.techLevel/10); // update missiles before flashing Base
                    flashBase(base);
                } else {
                    console.log('no more territories have missiles!');
                }
            }

        }, this);

        this.physics.add.overlap(this.missilesMaga, this.threats, function (missile, threat) {
            this.explode(missile, 3);
            missile.destroy();
            threat.hitpoints -= missile.power;
            if (threat.hitpoints <= 0) {
                this.MAGAness += threat.score;
                polCapText.setText('Political Capital ' + Math.floor((this.MAGAness + this.Wokeness)).toString());
                this.explode(threat, threat.score == 1 ? 4: 10);
                threat.destroy();
            }
        }, null, this);
        this.physics.add.overlap(this.missilesWoke, this.threats, function (missile, threat) {
            this.explode(missile, 1);
            missile.destroy();
            threat.hitpoints -= missile.power;
            if (threat.hitpoints <= 0) {
                this.Wokeness += threat.score;
                polCapText.setText('Political Capital: ' + Math.floor((this.MAGAness + this.Wokeness)).toString());
                this.explode(threat, threat.score == 1 ? 4: 10);
                threat.destroy();
            }
        }, null, this);

        function generateNumber(n) {
            return Math.floor((n+1)/2) * (n % 2 === 0 ? 1 : -1);
        }

    } // end of create()

    fireMissile(base, angle, pointer, offset, scale, missileSpeed, missilePower, missileSprite) {
        let missileNum = missileSprite.create(base.x+this.territoryWidth/2, base.y, 'missile');
        missileNum.setRotation(angle);
        let missilePowerAsset = militaryAssets.find(asset => asset.name === 'Explosion Size');
        missileNum.power = missilePower + missilePowerAsset.techLevel/3.3;
        let size = scale + missilePowerAsset.techLevel/600;
        missileNum.setScale(size);
        let missileSpeedAsset = militaryAssets.find(asset => asset.name === 'Missile Speed');
        if (missileSpeedAsset) {
            missileSpeed += missileSpeedAsset.techLevel * 10;
        } else {
            console.log("'Missile Speed' asset not found");
        }
        let missileAccuracyAsset = militaryAssets.find(asset => asset.name === 'Accuracy');
        if (missileAccuracyAsset.techLevel > 9) {
            offset = offset*9/missileAccuracyAsset.techLevel;
        }
        this.physics.moveTo(missileNum, pointer.x+Phaser.Math.Between(-offset,offset), pointer.y+Phaser.Math.Between(-offset, offset), missileSpeed);
        return {missileNum: missileNum};
    }

    explode(object, size) {
      let numExplosions = 8;
      let lifeSpan = 400;
      let volume = 25;
      let delay = 20;
      let angleRange = { min: 0, max: 360};
      let speedRange = { min: 225-size*20, max: 375-size*20 };
      let velocityRange = {min: 0, max: 0 };

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
          case 20:
              numExplosions = 16;
              lifeSpan = 6000;
              volume = 0;
              delay = 20;
              angleRange = { min: 250, max: 290 };
              speedRange = { min: 300, max: 500 };
              velocityRange = {min: -100, max: 100 };
              break;
      }
      for (let i = 0; i < numExplosions; i++) {
          setTimeout(() => {
              let emitter = this.add.particles(400, 250, 'flares', {
                  frame: [ 'red', 'yellow', 'green' ],
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
              emitter.setPosition(object.x + Phaser.Math.Between(-volume, volume),
                                  object.y + Phaser.Math.Between(-volume,volume));
              emitter.explode(16);
          }, i * delay); // Delay in milliseconds
      }
    }

    update() {
        // game loop
        // This is called 60 times per second. Put game logic here.
        if (Math.random() < 0.001 && this.totalAlienAttacks > 0) {
            let threat = this.threats.create(this.sys.game.config.width, 25, 'threat').setScale(0.5);
            threat.hitpoints = 30;
            threat.score = 8;

            this.physics.moveTo(threat, 0, 25, 250); // the speed of the threat.
        }
        if (Math.random() < 0.01 && this.totalAlienAttacks > 0) {
            this.totalAlienAttacks--;
            let threat = this.threats.create(Math.random() * this.sys.game.config.width, 0, 'threat').setScale(0.1);
            threat.hitpoints = 9;
            threat.score = 1;

            console.log(`The aliens are attacking ${this.attackedTerritory.name}!`);

            this.physics.moveTo(threat, this.attackedTerritory.x + this.territoryWidth/2, this.sys.game.config.height, 100); // 100 is the speed of the threat.
        }
        if (this.threats.countActive(true) > 0) {
            thereBeThreats = 1;
        }
        // If aliens have aleady reached the bottom of the screen then you can't have deterred the attack
        if (this.totalAlienAttacks < 1 && thereBeThreats == 1 && this.threats.countActive(true) == 0 && this.aliensWin == false) {
            console.log('All threats have been destroyed!');
            thereBeThreats = 0;
            if (this.attackedTerritory.faction == 'maga') {
                this.MAGAness += 10;
            } else {
                this.Wokeness += 10;
            }
            this.sharedData.totalPoliticalCapital += (this.Wokeness + this.MAGAness - this.sharedData.Wokeness - this.sharedData.MAGAness);
            console.log('new total political capital = ' + this.sharedData.totalPoliticalCapital);
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
            // Mothership does not rotate
            if (alien.score  < 3) {
                alien.angle += 4;
            }
            // If an alien has reached the bottom of the screen
            if (this.aliensWin == false && alien.y > this.sys.game.config.height) {
                console.log('Oh no alien has reached the bottom of the screen!');
                this.explode(alien, 20);
                this.sharedData.alienTerritories++;
                this.aliensWin = true; // aliens can only win once per attack and fadeout allows multiple wins
                console.log(this.sharedData.putieTerritories);
                console.log(this.sharedData.alienTerritories);

                if (this.sharedData.alienTerritories + this.sharedData.putieTerritories >= territories.length) {
                    console.log('you lose!');
                    this.scene.get('TutorialScene').setup(this.sharedData);
                    this.scene.start('TutorialScene', { nextScene: 'aliensWin', message: 'I have some bad news:\n the Aliens have taken over America\n It looks like you lose.' });
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
                // some random icon gets clobbered
                if (this.sharedData.icons['environment']) {
                    this.sharedData.icons[randomKey].health = Math.max(0, this.sharedData.icons[randomKey].health - 50);
                    // What happens when an alien reaches the base.  Ignore on first round
                    this.MAGAness = Math.max(0, this.MAGAness-10);
                    this.Wokeness = Math.max(0, this.Wokeness-10);
                }

                let messageString = 'Aliens have taken over The '+ this.attackedTerritory.name;

                this.attackedTerritory.faction = 'alien';
                this.attackedTerritory.name = "Aliens";
                this.attackedTerritory.color = '0x123456';

                thereBeThreats = 0;
                this.sharedData.Wokeness = this.Wokeness;
                this.sharedData.MAGAness = this.MAGAness;
                this.sharedData.icons = this.icons;

                this.cameras.main.fadeOut(3000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.get('VictoryScene').setup(this.sharedData);
                    this.scene.start('VictoryScene', { message: messageString});
                });
            }
            if (alien.x <= 0 || alien.y > this.sys.game.config.height) {
                alien.destroy();
            }
        }, this); // 'this' refers to our scene

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

    }
}
