
//var MAGAness = 0;
//var Wokeness = 0;
var year = 2023; // the starting year
var governmentSize = 40; // the starting size of the government
var economyMaga = 0;
var economyWoke = 0;
var economyStrength = 75;
var justiceMaga = 0;
var justiceWoke = 0;
// testTerritory

const ICON_MARGIN = 10;
const GAUGE_HEIGHT = 30;
const ICON_SPACING = 10;
const ICON_SCALE = 0.03;

// An aspect of society is complete when its score reaches this percentage.  Winning needs all six complete.
export const ASPECT_GOAL = 90;

// Score shown on the ring around each aspect of society: its health, reduced by how unbalanced
// MAGA and Woke pressure on it are.  Enough protesting can pull a complete aspect back below the goal.
export function aspectPercent(maga, woke, health, healthScale) {
    let balance = Math.abs(Math.min(100, maga) - Math.min(100, woke)) / 100; // 0 (balanced) to 1
    return health / healthScale * (1 - balance);
}

export function aspectComplete(iconData) {
    return aspectPercent(iconData.maga, iconData.woke, iconData.health, iconData.healthScale) >= ASPECT_GOAL;
}

export default class BaseScene extends Phaser.Scene {

    preload() {
        this.load.image('track', 'assets/track.png');
        this.load.image('handle', 'assets/handle.png');
        this.load.image('magaBase', 'assets/magaBase2.png');
        this.load.image('environment', 'assets/earth.png');
        this.load.image('government', 'assets/government.png');
        this.load.image('economy', 'assets/economy.png');
        this.load.image('justice', 'assets/justice.png');
        this.load.image('diplomacy', 'assets/diplomacy_un2.png');
        this.load.image('military', 'assets/military.png');
        this.load.image('wokeBase', 'assets/wokebase2.png');
        this.load.image('putieBase', 'assets/putin_2.png');
        this.load.image('alienBase', 'assets/threat.png');
        this.load.image('threat', 'assets/threat.png');
        this.load.image('shield', 'assets/shield.png');
        this.load.image('libertarian', 'assets/libertarian.png');
        this.load.image('independent', 'assets/IPNY_Logo.png');
        this.load.image('scale_arms', 'assets/scale_arms2.png');
        this.load.image('scale_body', 'assets/scale_body2.png');
        //this.load.image('negotiation', 'assets/negotiation.png');
        this.load.image('negotiation', 'assets/discussion3.png');
        this.load.image('peace', 'assets/handshake.png');
        this.load.image('hacker', 'assets/hacker.png');
        this.load.image('aliens_win', 'assets/aliens_win.jpg');
        this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
        this.load.image('checkboxUnchecked', 'assets/checkboxUnchecked.png');
        this.load.image('checkboxChecked', 'assets/checkboxChecked.png');
        this.load.image('capitalIcon', 'assets/capitalIcon.png');
        this.load.image('Barnes', 'assets/Barnes.png');
        this.load.image('Baldwin', 'assets/Baldwin.png');
        this.load.image('Caldwell', 'assets/Caldwell.png');
        this.load.image('Chen', 'assets/Chen.png');
        this.load.image('EagleEye', 'assets/EagleEye.png');
        this.load.image('Franklin', 'assets/Franklin.png');
        this.load.image('Grant', 'assets/Grant2.png');
        this.load.image('Greenfield', 'assets/Greenfield2.png');
        this.load.image('Harmon', 'assets/Harmon.png');
        this.load.image('Hartwell', 'assets/Hartwell.png');
        this.load.image('Jackson', 'assets/Jackson.png');
        this.load.image('Martinez', 'assets/Martinez2.png');
        this.load.image('Max', 'assets/Max.png');
        this.load.image('Maya', 'assets/Maya.png');
        this.load.image('Rene', 'assets/Rene.png');
        this.load.image('Sasha', 'assets/Sasha.png');
        this.load.image('Sterling', 'assets/Sterling.png');
        this.load.image('Rivera', 'assets/Rivera2.png');
        this.load.image('Welch', 'assets/Welch.png');

    }



    initializeIcons() {
        function getRandomSample(arr, n) {
            const shuffled = arr.slice().sort(() => 0.5 - Math.random()); // This shuffles the copy of the array
            return shuffled.slice(0, n); // Returns the first `n` elements of the shuffled array
        }

        let xStart = this.sys.game.config.width * .05;
        let xOffset = (this.sys.game.config.width-xStart*2) / 5;

        let icons = ['environment', 'economy', 'justice', 'government', 'diplomacy', 'military'];

        // Shuffle the icons array for positions
        let shuffledIcons = Phaser.Utils.Array.Shuffle(icons.slice()); // Cloning the array before shuffling
        // Select 2 random icons to be weak
        let weakIcons = getRandomSample(icons, 2);

        // Now create each icon using the shuffled array for positions
        shuffledIcons.forEach((icon, index) => {
            switch(icon) {
                case 'environment':
                    this.sharedData.icons[icon] = this.createIconWithGauges(xStart+xOffset*index, 125, 0.15, icon, 0, 0, weakIcons.includes(icon) ? 5 : 50, 'Environmental\nHealth ', 1, 16, 0, 'The EPA');
                    break;
                case 'economy':
                    this.sharedData.icons[icon] = this.createIconWithGauges(xStart+xOffset*index, 125, 0.1, icon, economyMaga, economyWoke, weakIcons.includes(icon) ? 5 : economyStrength, "Economy " ,1, 16, 0, 'Wall Street');
                    break;
                case 'justice':
                    this.sharedData.icons[icon] = this.createIconWithGauges(xStart+xOffset*index, 125, 0.05, icon, justiceMaga, justiceWoke, weakIcons.includes(icon) ? 5 : 50,  'Social\nJustice ', 1, 16, 0, 'The Supreme Court');
                    break;
                case 'government':
                    this.sharedData.icons[icon] = this.createIconWithGauges(xStart+xOffset*index, 125, 0.05, icon, 5, 5, weakIcons.includes(icon) ? 5 : governmentSize, 'Government\nHealth ', 1, 16, 0, 'The US Capital');
                    break;
                case 'diplomacy':
                    this.sharedData.icons[icon] = this.createIconWithGauges(xStart+xOffset*index, 125, 0.16, icon, 0, 0, weakIcons.includes(icon) ? 5 : 50,  'International\nRelations\n ', 1, 16, 0, 'The United Nations');
                    break;
                case 'military':
                    this.sharedData.icons[icon] = this.createIconWithGauges(xStart+xOffset*index, 125, 0.12, icon, 0, 0, weakIcons.includes(icon) ? 5 : 50,  'Alien\nDefense ', 2, 16, 0, 'The Pentagon');
                    break;
            }
        });
    }

    //====================================================================================
    //
    // createIconWithGauges
    //
    //====================================================================================
    createIconWithGauges = (xPos, yPos, scaleFactor, iconName, maga, woke, health, textBody, healthScale, textSize, shieldStrength, iconTitle)  => {
        let icon = this.physics.add.sprite(xPos, yPos, iconName).setAlpha(.8).setScale(scaleFactor);
        //let gaugeMaga; = this.add.graphics();
        //let gaugeWoke; = this.add.graphics();
        let scaleSprite = this.physics.add.sprite(xPos, yPos+60, 'scale_body').setScale(0.06).setDepth(1).setAlpha(0); // make invisible
        let gaugeMaga = this.physics.add.sprite(xPos, yPos+60, 'scale_arms').setScale(0.06).setDepth(1).setAlpha(0); // make invisible
        let gaugeWoke = gaugeMaga;

        let gaugeHealth = this.add.graphics();
        let shieldVisible = true;

        icon.iconName = iconName;

        // Note that drawGauges is an arrow function so it keeps 'this' from this context
        let littleHats = this.drawGauges(this, xPos, yPos, maga, woke, health, healthScale, gaugeMaga, gaugeWoke, gaugeHealth, scaleSprite, []);
        //this.drawBalance(xPos, yPos, maga, woke, health, healthScale, gaugeMaga, gaugeWoke, gaugeHealth);

        if (shieldStrength < .1) {shieldVisible = false;}
        // Create Shield Icon over the Icon
        let shieldMaga = this.physics.add.sprite(xPos, yPos, 'shield').setScale(0.23).setAlpha(0.1);
        shieldMaga.setImmovable(true);
        shieldMaga.shieldStrength = shieldStrength;
        if (!shieldVisible) shieldMaga.setAlpha(0);
        let shieldWoke = this.physics.add.sprite(xPos, yPos, 'shield').setScale(0.23).setAlpha(0.1);
        shieldWoke.setImmovable(true);
        shieldWoke.shieldStrength = shieldStrength;
        if (!shieldVisible) shieldWoke.setAlpha(0);

        icon.shieldMaga = shieldMaga;
        icon.shieldWoke = shieldWoke;

        // Add shields to their respective groups
        this.shieldsMaga.add(shieldMaga);
        this.shieldsWoke.add(shieldWoke);

        let healthTextRange = ['terrible', 'poor', 'so-so', 'good', 'excellent'];
        let stability = health/healthScale;
        let totalValue = 100;//maga + woke; // totalValue is the sum of MAGA and WOKE values
        let balance;
        maga = Math.min(100, maga); // don't let these go beyond 100
        woke = Math.min(100, woke);
        if (totalValue == 0) {
            balance = 0
        } else {
            balance = Math.abs((maga - woke) / totalValue); // This will be a value between 0 and 1
        }
        stability = stability * (1-balance);
        let healthText = ''; //healthTextRange[Phaser.Math.Clamp(Math.round(stability/20),0,4)];
        //let healthText = healthTextRange[Phaser.Math.Clamp(Math.round(health/healthScale/20),0,4)];

        let iconText = this.add.text(xPos - (textSize / 2) - 50, yPos - /*75*/85, textBody + healthText, { fontSize: textSize + 'px', fill: '#fff' });
        return {icon, gaugeMaga, gaugeWoke, gaugeHealth, iconText, textBody, maga, woke, health, healthScale, shieldStrength, iconName, scaleSprite, scaleFactor, littleHats, iconTitle};
    }

    //====================================================================================
    //
    // drawBalance
    //
    //====================================================================================
    //drawGauges = (scene, x, y, maga, woke, health, healthScale, gaugeMaga, gaugeWoke, gaugeHealth, scaleSprite, littleHatsRemove) => {
    drawGauges(scene, x, y, maga, woke, health, healthScale, gaugeMaga, gaugeWoke, gaugeHealth, scaleSprite, littleHatsRemove) {
        // 'track' is the scale object (could be a sprite or any game object)

        let littleHatsCreate = this.drawHealthGauge(scene, 0,x,y, 'Woke', gaugeWoke, maga, woke, scaleSprite, littleHatsRemove);

        this.drawHealthGauge(scene, aspectPercent(maga, woke, health, healthScale)/100, x, y, 'Health', gaugeHealth);

        return littleHatsCreate;
    }

    // So we now have 'health' which can be renamed 'strength' and 'stability'
    // you're icon may be strong, but not very stable

    drawNewHealthGauge(icon) {
        this.drawHealthGauge(this, aspectPercent(icon.maga, icon.woke, icon.health, icon.healthScale)/100, icon.icon.x, icon.icon.y, 'Health', icon.gaugeHealth);
    }

    // // TODO: Add little hat icons for every 10 magas or wokes accumulated

    drawHealthGauge(scene, percentage, posX, posY, style, healthGauge, maga, woke, scaleSprite, littleHats) {
        // 'track' is the scale object (could be a sprite or any game object)
        if (style == 'Health') {
            // percentage is the aspect score / 100 (see aspectPercent).  Reaching the goal completes the aspect.
            let radius = 45;
            let complete = percentage * 100 >= ASPECT_GOAL;
            let shown = Phaser.Math.Clamp(percentage, 0, 1);
            // Stop any pulse from a previous draw so pulses don't pile up
            if (healthGauge.pulseTween) {
                healthGauge.pulseTween.stop();
                healthGauge.pulseTween = null;
            }
            healthGauge.setAlpha(complete ? 1 : 0.7);
            healthGauge.clear();
            // Draw full gray gauge (background)
            healthGauge.lineStyle(7, 0x404040);
            healthGauge.beginPath();
            healthGauge.arc(posX, posY, radius, 0, Math.PI * 2, false);
            healthGauge.strokePath();

            // Draw the gauge with an arc proportional to the score: gold when complete, red when very low
            let color = complete ? 0xffd700 : (percentage > .25 ? 0xffffff : 0xff0000);
            healthGauge.lineStyle(complete ? 9 : 7, color);
            healthGauge.beginPath();
            healthGauge.arc(posX, posY, radius, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + 360 * shown), false);
            healthGauge.strokePath();

            // Mark the goal on the ring with a small notch
            if (!complete) {
                let goalAngle = Phaser.Math.DegToRad(270 + 360 * ASPECT_GOAL / 100);
                healthGauge.lineStyle(3, 0xffd700);
                healthGauge.beginPath();
                healthGauge.moveTo(posX + Math.cos(goalAngle) * (radius - 7), posY + Math.sin(goalAngle) * (radius - 7));
                healthGauge.lineTo(posX + Math.cos(goalAngle) * (radius + 7), posY + Math.sin(goalAngle) * (radius + 7));
                healthGauge.strokePath();
            }

            // Show the score as a number next to the ring
            if (!healthGauge.percentText || !healthGauge.percentText.scene) {
                healthGauge.percentText = scene.add.text(posX + 34, posY - 34, '', { font: 'bold 16px Arial' }).setOrigin(0, 1).setDepth(2);
            }
            let percentText = healthGauge.percentText;
            percentText.setPosition(posX + 34, posY - 34);
            percentText.setText((complete ? '\u2713 ' : '') + Math.max(0, Math.round(percentage * 100)) + '%');
            percentText.setColor(complete ? '#ffd700' : (percentage > .25 ? '#ffffff' : '#ff4040'));

            if (percentage <= .25) {
                // Very low: pulse the ring
                healthGauge.pulseTween = this.tweens.add({
                    delay: Phaser.Math.Between(0, 500),
                    targets: healthGauge,
                    duration: Math.max(200, percentage * 10000), // Duration of one shimmer
                    repeat: -1, // -1 for infinite repeats
                    yoyo: true, // Yoyo makes the tween animate back to its original value after reaching its target.
                    ease: 'Sine.easeInOut',
                    alpha: {
                        start: .33,
                        to: 1
                    }
                });
            }
        } else {
            //console.log('x,y = ' + posX + ',' + posY + ' maga: ' + maga + ' woke: ' + woke);

            let totalValue = 100;//maga + woke; // totalValue is the sum of MAGA and WOKE values
            let balance;
            maga = Math.min(100, maga); // don't let these go beyond 100
            woke = Math.min(100, woke);
            if (totalValue == 0) {
                balance = 0
            } else {
                balance = (maga - woke) / totalValue; // This will be a value between -1 and 1
            }
            let rotationAngle = balance * Math.PI / 4; // This will give an angle between -45 and 45 degrees
            healthGauge.setRotation(rotationAngle);

            // Determine the tint based on the balance
            // If balance is 0, color is neutral (no tint). If balance is positive, color goes towards red. If balance is negative, color goes towards blue.
            let color;
            //console.log('balance = ' + balance);
            if (balance > 0) {
                // Convert balance (0 to 1) to a value in the range 0xffffff (white) to 0xff0000 (red)
                let amount = Phaser.Display.Color.Interpolate.RGBWithRGB(255, 128, 128, 255, 0, 0, 100, balance * 100);
                color = Phaser.Display.Color.GetColor(amount.r, amount.g, amount.b);
            } else if (balance < 0) {
                // Convert balance (-1 to 0) to a value in the range 0xffffff (white) to 0x0000ff (blue)
                let amount = Phaser.Display.Color.Interpolate.RGBWithRGB(128, 128, 255, 0, 0, 255, 100, balance * -100);
                color = Phaser.Display.Color.GetColor(amount.r, amount.g, amount.b);
            } else {
                // Neutral color
                color = 0xffffff;
            }

            healthGauge.setTint(color).setDepth(1);
            scaleSprite.setTint(color).setDepth(1);



            //clear all the little hats
            if (littleHats.length > 0) {
                littleHats.forEach(hat => {
                     hat.destroy();
                 });
             }
             //littleHats = [];

            // Assuming the icons should appear below the health gauge
            let iconY = posY + GAUGE_HEIGHT + ICON_MARGIN;
            littleHats = drawIcons(scene, posX-20 - ICON_SPACING*3, iconY, 'magaBase', 0, maga/5,  littleHats);
            littleHats = drawIcons(scene, posX-20 + ICON_SPACING*3, iconY, 'wokeBase', 0, woke/5, littleHats); // Offset the Y position for the second row of icons

        }
        return littleHats;
    }

    createThreat(territory, faction, icon, numThreats) {
        let attackerTerritory = territory;
        let territoryWidth = this.sys.game.config.width / territories.length;

        if (faction == '') {
            faction = attackerTerritory.faction;
        }

        let threatIcon = faction === 'maga'
            ? 'magaBase'
            : faction === 'woke'
                ? 'wokeBase'
                : 'putieBase';

        let threatGroup = faction == 'maga'
            ? this.magaThreats
            : faction == 'woke'
                ? this.wokeThreats
                : this.putieThreats;

        let message = 'Protestors March on ';
        message += icon.iconTitle + '!';
        let offsetY = icon.icon.x*.2-50;
        let fillColor;
        if (faction == 'maga') {
            fillColor = '#ff0000';
        } else {
            fillColor = '#0000ff';
        }
        // Create a text object to display an attack message
        if (threatIcon != 'putieBase') {
            this.attackText = this.add.text(this.cameras.main.centerX, this.sys.game.config.height*.8 + offsetY, message, {
                font: 'bold 48px Arial',
                fill: fillColor,
                align: 'center'
            });
            this.attackText.setOrigin(0.5);  // Center align the text
            this.attackText.setAlpha(1);
            this.tweens.add({
                targets: this.attackText,
                alpha: 0,
                ease: 'Linear',
                duration: 3000,
                onComplete: function () {
                    this.attackText.setAlpha(0);
                    this.attackText.destroy();
                    //tooltip.text.setVisible(false);
                    //tooltip.box.setVisible(false);
                },
                callbackScope: this
            });
        }

        for (let i = 0; i < numThreats; i++) {
            // Create threat
            let threat = threatGroup.create(attackerTerritory.x + territoryWidth / 2, this.game.config.height, threatIcon).setScale(0.1);
            threat.y -= threat.displayHeight / 2 + 5;
            threat.setBounce(1); //JCS : want to only do this in insurrection

            // Setup threat physics properties after delay
            this.time.delayedCall(i * 200, () => {
                //threat.setBounce(1);
                threat.setCollideWorldBounds(true);

                // Enable world bounds event for this body
                threat.body.onWorldBounds = true;
                threat.onLeaveWorld = () => {
                    threat.destroy();
                    this.roundThreats--;
                    if (this.roundThreats == 1 && this.switchScene == false && !this.aliensInvade) {
                        this.switchScene = true;
                        this.cameras.main.fadeOut(2000, 0, 0, 0);
                        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                            this.scene.get('politics').setup(this.sharedData);
                            this.scene.start('politics');
                        });
                    }
                };
                this.listenForWorldBounds();

                let attackedIcon = icon.icon;
                threat.icon = icon;
                this.physics.moveTo(threat, attackedIcon.x, attackedIcon.y, 450); // 100 is the speed of the threat.
                this.roundThreats++;
            });
        }
    }

    // A single 'worldbounds' listener per physics world.  Each threat that should react to
    // hitting the edge of the screen carries its own onLeaveWorld handler.
    listenForWorldBounds() {
        let world = this.physics.world;
        if (world.threatBoundsListener) {
            return;
        }
        world.threatBoundsListener = (body) => {
            let gameObject = body.gameObject;
            if (gameObject && gameObject.onLeaveWorld && !gameObject.hasLeftWorld) {
                gameObject.hasLeftWorld = true;
                gameObject.onLeaveWorld();
            }
        };
        world.on('worldbounds', world.threatBoundsListener);
    }

    returnThreat(territory, faction, icon, numThreats, returnedIcon) {
        let message = 'Protestors recognize advocate and\n return home';
        if (icon) {message += ' from ' + icon.iconTitle + '...';}
        let offsetY = 10;
        let fillColor;
        if (faction == 'maga') {
            fillColor = '#ff0000';
        } else {
            fillColor = '#0000ff';
        }
        if (icon) {
            // Create a text object to display an attack message
            this.attackText = this.add.text(Math.max(50,icon.icon.x-10), this.sys.game.config.height*.24 + offsetY, message, {
                font: '28px Arial',
                fill: fillColor,
                align: 'center'
            });
            this.attackText.setOrigin(0.5);  // Center align the text
            this.attackText.setAlpha(1);
            this.tweens.add({
                targets: this.attackText,
                alpha: 0,
                ease: 'Linear',
                duration: 3000,
                onComplete: function () {
                    this.attackText.setAlpha(0);
                    this.attackText.destroy();
                    //tooltip.text.setVisible(false);
                    //tooltip.box.setVisible(false);
                },
                callbackScope: this
            });
        }
        for (let i = 0; i < numThreats; i++) {
            let attackerTerritory = territory;
            let territoryWidth = this.sys.game.config.width / territories.length;
            if (icon){
                returnedIcon = icon.icon;
            }

            if (faction == '') {
                faction = attackerTerritory.faction;
            }

            let threatIcon = faction === 'maga'
                ? 'magaBase'
                : faction === 'woke'
                    ? 'wokeBase'
                    : 'putieBase';

            let threatGroup = faction == 'maga'
                ? this.magaReturns
                : faction == 'woke'
                    ? this.wokeReturns
                    : this.putieThreats;

            // Create threat
            let threat = threatGroup.create(returnedIcon.x, returnedIcon.y, threatIcon).setScale(0.1);
            threat.y += threat.displayHeight / 2 + 55;

            // Setup threat physics properties after delay
            this.time.delayedCall(i * 200, () => {
                //threat.setBounce(1);
                threat.setCollideWorldBounds(true);

                // Enable world bounds event for this body
                threat.body.onWorldBounds = true;
                if (icon) {
                    icon[faction] -= 5; // don't forget that faction is a multiple of 5
                    // Note that drawGauges is an arrow function so it keeps 'this' from this context
                    icon.littleHats = this.drawGauges(this, icon.icon.x, icon.icon.y, icon.maga, icon.woke, icon.health, icon.healthScale, icon.gaugeMaga, icon.gaugeWoke, icon.gaugeHealth, icon.scaleSprite, icon.littleHats);
                }
                threat.onLeaveWorld = () => {
                    threat.destroy();
                    this.roundThreats--;
                };
                this.listenForWorldBounds();

                this.physics.moveTo(threat, attackerTerritory.x, attackerTerritory.y, 220); // 220 is the speed of the threat.
                this.roundThreats++;
            });
        }
    }

    updatePoliticalCapitalIcons(totalCapital) {
        // Clear existing icons
        this.politicalCapitalIcons.forEach(icon => icon.destroy());
        this.politicalCapitalIcons = [];

        // Calculate number of icons needed
        let numIcons = Math.floor(totalCapital / 4);

        for (let i = 0; i < numIcons; i++) {
            let x = 370 + i * 35; // Horizontal placement
            let y = 25; // Vertical position of icons
            let icon = this.add.image(x, y, 'capitalIcon').setScale(0.05); // Scale as needed
            this.politicalCapitalIcons.push(icon);
        }
    }

    // Example function to change political capital and update the display

    //====================================================================================
    // function restoreMisinformationTokens(scene)
    // function that recreates the information/misinformation blockers
    //
    //====================================================================================

    restoreMisinformationTokens(scene) {
        for (let key in scene.sharedData.misinformation) {
            // Look up the stored data
            let storedData = scene.sharedData.misinformation[key];
            //console.log(storedData);

            // Add an icon or graphic and scale it
            let helpfulTokenIcon = scene.add.image(0, 0, 'negotiation');  // Position the icon at the original y position
            helpfulTokenIcon.setScale(.12);  // scale the icon
            helpfulTokenIcon.setOrigin(0.5, .66);  // change origin to bottom center
            helpfulTokenIcon.setVisible(true);
            //helpfulTokenIcon.setDepth(2);  // set depth below the text and above the bounding box
            helpfulTokenIcon.setAlpha(.9);

            let dropOnce;
            if ((storedData.wokeHats + storedData.magaHats) > 0) {
                dropOnce = 'drop once';
            }
            // Recreate old 'discussion' tokens
            // Use the stored data when creating the token
            //                                    (scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce, tokenIcon)
            let misinformation = createPowerToken(scene, 'neutral', storedData.text, storedData.x, storedData.y, storedData, 'normal', true, dropOnce, helpfulTokenIcon);

            scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
            scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group
            // Initialize littleHats
            misinformation.littleHats = [];
            let wokeHats = storedData.wokeHats;
            if (wokeHats) {
                misinformation.littleHats = drawIcons(scene, misinformation.container.x, misinformation.container.y, 'wokeBase',0 , wokeHats, misinformation.littleHats,1);
            }
            let magaHats = storedData.magaHats;
            if (magaHats) {
                misinformation.littleHats = drawIcons(scene, misinformation.container.x, misinformation.container.y, 'magaBase', misinformation.littleHats.length, magaHats, misinformation.littleHats,1);
            }
            misinformation.container.misinformationIndex = storedData.misinformationIndex; // restore index too!
            misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
            misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again
            scene.misinformationTokens.push(misinformation); // Push token to stack
            storedData.littleHats = misinformation.littleHats;

            //data.x = xOffset;
            //data.y = yOffset;
        }



    }

    //====================================================================================
    // addDiscussionTokenOverlaps()
    // Discussion tokens (community forums) absorb activists.  Each activist that is absorbed
    // becomes a little hat on the token.  Once a token holds more than 15 hats, the activists
    // go home and the token dissolves.  Used by politics, insurrection and dilemma.
    //====================================================================================
    addDiscussionTokenOverlaps() {
        let scene = this;
        let absorbThreat = (defense, threat, faction) => {
            let otherFaction = faction == 'maga' ? 'woke' : 'maga';
            // Activists heading to an icon that is dominated by the other faction will help balance it
            if (threat.icon && threat.icon[otherFaction] > threat.icon[faction]) {
                return;
            }
            let tokenData = scene.sharedData.misinformation[defense.container.misinformationIndex];
            if (!tokenData || defense.dissolving) {
                return; // the token is already going away
            }
            threat.destroy();
            scene.roundThreats--;
            let magaHats = tokenData.magaHats;
            let wokeHats = tokenData.wokeHats;
            if (magaHats + wokeHats > 15) {
                defense.dissolving = true;
                if (defense.littleHats) {
                    defense.littleHats.forEach(hat => hat.destroy());
                }
                scene.returnThreat(territories[2], 'maga', null, magaHats, defense.container); // arbitrarily picked territories to return to
                scene.returnThreat(territories[4], 'woke', null, wokeHats, defense.container);
                // discussion forum should slowly fade away
                scene.tweens.add({
                    targets: defense.container,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 2000,
                    onComplete: function () {
                        delete scene.sharedData.misinformation[defense.container.misinformationIndex];
                        defense.container.destroy();
                    }
                });
            } else {
                // The first absorbed activist turns the token into a peace token that can no longer be moved
                if (!defense.littleHats) {
                    if (!tokenData.littleHats) {
                        tokenData.littleHats = [];
                    }
                    defense.littleHats = tokenData.littleHats;
                    replaceTokenIcon(scene, defense.container, 'peace');
                    defense.container.disableInteractive();
                }
                let iconY = defense.container.y + ICON_MARGIN;
                let iconX = defense.container.x - 20 + (faction == 'woke' ? ICON_SPACING*3 : -ICON_SPACING*3);
                defense.littleHats = drawIcons(scene, iconX, iconY, faction + 'Base', defense.littleHats.length, 1, defense.littleHats, 1);
                tokenData[faction + 'Hats']++; // update the hats in the shared data structure
                tokenData.littleHats = defense.littleHats;
            }
        };
        this.physics.add.overlap(this.magaDefenses, this.wokeThreats, (defense, threat) => absorbThreat(defense, threat, 'woke'));
        this.physics.add.overlap(this.wokeDefenses, this.magaThreats, (defense, threat) => absorbThreat(defense, threat, 'maga'));
    }

    createTerritories()
    {
        console.log('Putie Territories = ' + this.putieTerritories);

        // Make sure Putie Territories are up to date
        let testTerritory = territories.length - 1; // Arrays are 0-indexed
        let putieCount = 0; // Counter to track how many territories have been changed

        // Make sure number of putie territories is accurate in case an alien claimed something
        while (putieCount < this.putieTerritories && testTerritory >= 0) {
            if (territories[testTerritory].faction !== "alien") {
                territories[testTerritory].faction = "putieVille";
                territories[testTerritory].name = "PutieVille";
                territories[testTerritory].color = '0x654321';
                putieCount++;
            }
            testTerritory--;
        }

        this.territoryWidth = this.sys.game.config.width  / territories.length;

        territories.forEach((territory, index) => {
            territory.y = this.game.config.height - 20;
            territory.x = this.territoryWidth * index;
        });

        for (let i = 0; i < territories.length; i++) {
            let territoryGraphics = this.add.graphics();
            let territory = territories[i];
            territoryGraphics.fillStyle(territory.color, 1.0);
            territoryGraphics.fillRect(i * this.territoryWidth, this.game.config.height - 30, this.territoryWidth, 30);
            territory.graphics = territoryGraphics;  // create reference to graphics so we can modify it later

            let baseFaction;
            // Add a base icon to the territory
            if (territory.faction == 'maga') {
                baseFaction = 'magaBase';
            } else if (territory.faction == 'woke') {
                baseFaction = 'wokeBase';
            } else if (territory.faction == 'putieVille') {
                baseFaction = 'putieBase';
            } else if (territory.faction == 'alien') {
                baseFaction = 'alienBase';
            }
            territory.sprite = this.physics.add.sprite(territory.x + this.territoryWidth/2, territory.y-30, baseFaction ).setScale(0.1).setAlpha(0.8);

            // Create territory name
            let nameText = this.add.text(
              territory.x + this.territoryWidth/2,
              territory.y,
              territory.name,
              { font: '16px Arial', fill: '#ffffff', align: 'center' }
            );

            territory.nameText = nameText; // create reference to nametext so we can modify it later

            // Set origin to the center of the text to properly align it
            nameText.setOrigin(0.5, 0.5);
        }
        let graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xaaaaaa } });

        for (let i = 1; i < territories.length; i++) {
            let territory1 = territories[i];
            graphics.beginPath();
            graphics.moveTo(territory1.x, this.game.config.height - 30);  // Starting from the top of the territory area
            graphics.lineTo(territory1.x, this.game.config.height);  // Ending at the bottom of the territory area
            graphics.closePath();
            graphics.strokePath();
        }
    }

    //====================================================================================
    // How to play: a one-screen rules reference, opened from the difficulty screen
    // and from the "?" button during play.  Click anywhere (or press Escape) to close.
    //====================================================================================
    showHowToPlay() {
        if (this.howToPlay && this.howToPlay.text.scene) {
            return; // already open
        }
        let width = this.sys.game.config.width;
        let height = this.sys.game.config.height;
        let fontSize = Math.max(12, Math.min(20, Math.floor(height / 40)));
        let rules = [
            'HOW TO PLAY',
            '',
            'GOAL: Get all six aspects of society to 90%, when their rings turn gold.',
            'The score drops when MAGA and Woke pressure on an aspect is unbalanced,',
            'so protesters can pull a gold ring back down.',
            '',
            'EACH ROUND, IN POLITICS:',
            '\u2022 Spend all your diamonds (political capital) endorsing advocates.',
            '\u2022 Two endorsements (\u25CF\u25CF), one per round, and next round the advocate creates a token.',
            '   Drag it onto the aspect they help. Every advocate also stirs up protesters somewhere else.',
            '\u2022 Hackers shield an aspect for a round. Negotiators create extra community forums.',
            '\u2022 Drag community forums into the protesters\' path: they absorb them.',
            '\u2022 Click the Earth to continue.',
            '',
            'ALONG THE WAY:',
            '\u2022 Legislative reform: pick a policy. Good choices raise your capital income for years.',
            '\u2022 Insurrection: protesters march on unbalanced aspects. Push one too far and it',
            '   collapses, and Putin takes a territory.',
            '\u2022 Alien attack: click to fire missiles. Holding them off earns capital.',
            '\u2022 Earn capital and new advocates join your cause, some from across the aisle.',
            '',
            'You lose if Putin and the aliens take over every territory.',
            '',
            'Click anywhere to close'
        ];
        let backdrop = this.add.rectangle(0, 0, width, height, 0x000000, 0.96).setOrigin(0).setDepth(1000).setInteractive();
        let text = this.add.text(width / 2, height / 2, rules.join('\n'), {
            font: fontSize + 'px Arial',
            fill: '#ffffff',
            align: 'left',
            lineSpacing: 4,
            wordWrap: { width: width * 0.85 }
        }).setOrigin(0.5).setDepth(1001);
        let close = () => {
            backdrop.destroy();
            text.destroy();
            this.input.keyboard.off('keydown-ESC', close);
            this.howToPlay = null;
        };
        this.howToPlay = { backdrop, text };
        backdrop.once('pointerdown', close);
        this.input.keyboard.on('keydown-ESC', close);
    }

    // Small round "?" button that opens the rules
    addHelpButton(x, y) {
        let circle = this.add.circle(x, y, 16, 0x000000).setStrokeStyle(2, 0xffffff).setDepth(50).setInteractive({ useHandCursor: true });
        let mark = this.add.text(x, y, '?', { font: 'bold 22px Arial', fill: '#ffffff' }).setOrigin(0.5).setDepth(51);
        circle.on('pointerdown', () => this.showHowToPlay());
        circle.on('pointerover', () => mark.setColor('#ffff00'));
        circle.on('pointerout', () => mark.setColor('#ffffff'));
        return circle;
    }

    // Game over: the game keeps its state in module-level data (characters, territories, military
    // assets) and in each scene, so a new game starts from a fresh page load.
    showPlayAgain() {
        let playAgainText = this.add.text(this.cameras.main.centerX, this.sys.game.config.height - 60, 'Click to play again', {
            font: 'bold 32px Arial',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5).setDepth(2);
        this.tweens.add({
            targets: playAgainText,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        // Wait a moment so a click that was already in progress doesn't restart immediately
        this.time.delayedCall(1500, () => {
            this.input.once('pointerdown', () => window.location.reload());
        });
    }

    difficultyLevel() {
        let config = difficultyList[this.sharedData.difficultyLevel];
        config.alienAttackForCapital = config.alienAttackForCapitalFunc(this.sharedData);
        config.dilemmaOdds = config.dilemmaOddsFunc(this.sharedData);
        return config;
    }
}
//====================================================================================
// function createPowerToken(scene, ...)
// Creates a token (text, rectangle, optional icon) that can be dragged around.
//
// This function can be called to either create a 'misinformation token' or a 'helpful token'
// When creating a helpful token, dropOnce is false because it can be moved around as much as you want
//
// size: 'normal' or 'large'.  Large creates a big box that tweens away slowly
// hasBeenCreatedBefore: true means that it is static and cannot be dragged around
// dropOnce: 'drop once' means that it has already been placed and can no longer be moved
//====================================================================================
export function createPowerToken(scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce, tokenIcon) {
    let factionColor = faction === 'maga'
        ? '0xff0000'
        : faction === 'woke'
            ? '0x0000ff'
            : '0x800080';
    let fillColor = faction === 'maga'
        ? '#ffffff'
        : faction === 'woke'
            ? '#ffffff'
            : '#ffffff';
    // Add text to the rectangle
    let text = scene.add.text(0, 0, message, { align: 'center', fill: fillColor }).setOrigin(0.5, 0.5);
    if (size == 'large' ) {text.setFontSize(36);}

    // Create a larger white rectangle for outline
    let outline = scene.add.rectangle(0, 0, text.width+4, text.height+4, 0xffffff);

    // Create a smaller factionColor rectangle
    let rectangle = scene.add.rectangle(0, 0, text.width, text.height, factionColor);

    // Create a sprite for physics and bouncing
    let misinformationSprite = scene.physics.add.sprite(0, 0, 'track');
    misinformationSprite.setVisible(false); // Hide it, so we only see the graphics and text
    misinformationSprite.setDepth(1);

    let misinformationContainer;
    let newTokenIcon;

    // Group the text, outline, and rectangle into a single container
    if (tokenIcon) { // ... and group tokenIcon too if it exists
        console.log('token icon exists');
        rectangle.setSize(text.width, text.height+tokenIcon.displayHeight);
        outline.setSize(text.width+4, text.height+4+tokenIcon.displayHeight);
        text.y += tokenIcon.displayHeight/2;
        //rectangle.x adjustment??
        if (faction == 'neutral' && size != 'large'){
            // Add an icon or graphic and scale it
            newTokenIcon = scene.add.image(0, 0, 'peace');  // Position the icon at the original y position
            newTokenIcon.setScale(.12);  // scale the icon
            newTokenIcon.setOrigin(0.5, .66);  // change origin to bottom center
            newTokenIcon.setVisible(false);
            newTokenIcon.setAlpha(.9);

            outline.setVisible(false);
            rectangle.setVisible(false);
            rectangle.setSize(text.width, text.height+tokenIcon.displayHeight-8);
            outline.setSize(text.width+4, text.height+4+tokenIcon.displayHeight);
            misinformationContainer = scene.add.container(x, y, [outline, rectangle, text, tokenIcon, newTokenIcon, misinformationSprite]);}
        else {
            misinformationContainer = scene.add.container(x, y-tokenIcon.displayHeight/2, [outline, rectangle, text, tokenIcon, misinformationSprite]);
        }
        misinformationContainer.setSize(outline.width, outline.height+tokenIcon.displayHeight);
    } else {
        console.log('token Icon does not exist');
        misinformationContainer = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);
        misinformationContainer.setSize(outline.width, outline.height);
    }

    let tweens;

    {
         misinformationContainer.setSize(outline.width, outline.height);
         // Set the initial size to near zero
         misinformationContainer.setScale(0.01);

        const timerID = scene.time.delayedCall(Object.keys(scene.sharedData.helperTokens).length *400, () => {
             if (typeof storedData.character !== 'undefined') {
                 console.log('generate helpful token for '+storedData.character.charText.text);

                // Current position as the target for the tween
                var targetX = misinformationContainer.x;
                var targetY = misinformationContainer.y;

                // Set initial position
                misinformationContainer.x = storedData.character.charText.x;
                misinformationContainer.y = storedData.character.charText.y;

                scene.tweens.add({
                    targets: misinformationContainer,
                     x: targetX, // Move to this X position
                     y: targetY, // Move to this Y position
                     scaleX: 1, // expand to the width
                     scaleY: 1, // expand to the height
                     ease: 'Sine.easeInOut',
                     duration: 1000,
                     onComplete: function () {
                         misinformationContainer.setSize(outline.width, outline.height);
                         tweens = pulseIt(scene, outline, rectangle, tokenIcon);
                     },
                     callbackScope: scene
                 });
             } else if (hasBeenCreatedBefore != true) {
                console.log('create new misinformationContainer token');
                // Add a tween to expand the container and its contents
                 scene.tweens.add({
                     targets: misinformationContainer,
                     scaleX: 1, // expand to the width
                     scaleY: 1, // expand to the height
                     ease: 'Sine.easeInOut',
                     duration: 1000,
                     onComplete: function () {
                         misinformationContainer.setSize(outline.width, outline.height);
                         tweens = pulseIt(scene, outline, rectangle, tokenIcon);
                     },
                     callbackScope: scene
                 });
             } else {
                console.log('recreate old misinformationContainer token');
                misinformationContainer.setScale(1); // It was there, just very tiny!
                if (dropOnce != 'drop once')
                {
                    console.log('drop once is false');
                    tweens = pulseIt(scene, outline, rectangle, tokenIcon);
                } else {
                    console.log('drop once is true.  container = ');
                    let container = misinformationContainer;
                    console.log(container);
                    let oldTokenIconIndex = -1;
                    for (let i = 0; i < container.list.length; i++) {
                        let item = container.list[i];
                        if (item && item.texture && item.texture.key === 'negotiation') {  // Assuming 'negotiation' is the key for the old icon
                            console.log('found Old at '+i);
                            oldTokenIconIndex = i;
                            misinformationContainer.list[oldTokenIconIndex].setVisible(false);
                            break;
                        }
                    }
                    let newTokenIconIndex = -1;
                    for (let i = 0; i < container.list.length; i++) {
                        let item = container.list[i];
                        if (item && item.texture && item.texture.key === 'peace') {  // Assuming 'peace' is the key for the new icon
                            console.log('found New at '+i);
                            newTokenIconIndex = i;
                            misinformationContainer.list[newTokenIconIndex].setVisible(true);
                            break;
                        }
                    }
                }
             }
        });
    }

    // Set the size of the container to match the size of the outline rectangle
    //misinformation.setSize(outline.width, outline.height);
    misinformationSprite.setScale(.6);
    //misinformationSprite.setSize(outline.width*.1, 1);

    // Attach the container to the sprite
    misinformationSprite.container = misinformationContainer;
    if (size == 'large' ) {misinformationContainer.setDepth(4);}

    if (dropOnce == 'drop once') {
        //tweens.outlineTween.stop();
        //tweens.rectangleTween.stop();
        //tweens.tokenIconTween.stop();
        rectangle.setVisible(true);
        misinformationContainer.disableInteractive();
        misinformationSprite.setImmovable(true);
        misinformationContainer.setInteractive({ draggable: false });
        //let rectangle = misinformationContainer.list[1]; // Assuming the rectangle is the second item added to the container
        rectangle.setFillStyle(0x228B22); // Now the rectangle is forest green
        rectangle.setAlpha(.5);
    } else {
        // Now that the container has a size, it can be made interactive and draggable
        misinformationContainer.setInteractive({ draggable: true });
        // Listen to the 'drag' event
        misinformationContainer.on('drag', function(pointer, dragX, dragY) {
            this.x = dragX;
            this.y = dragY;
            storedData.x = dragX;
            storedData.y = dragY;
            misinformationSprite.setImmovable(true);
        });
    }

    return {
        container: misinformationContainer,
        sprite: misinformationSprite
    };
}

function pulseIt(scene, outline, rectangle, tokenIcon) {
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
    let tokenIconTween;
    if (tokenIcon) { // ... and group tokenIcon too if it exists
        tokenIconTween = scene.tweens.add({
            targets: tokenIcon, // object that the tween affects
            scaleX: tokenIcon._scaleX * 1.2, // start scaling to 120% of the original size
            scaleY: tokenIcon._scaleY * 1.2, // start scaling to 120% of the original size
            duration: 1000, // duration of scaling to 120% will be 1 second
            ease: 'Linear', // type of easing
            yoyo: true, // after scaling to 120%, it will scale back to original size
            loop: -1, // -1 means it will loop forever
        });
    }
    return [outlineTween, rectangleTween, tokenIconTween];
}

// Swap the 'negotiation' icon in a discussion token for the 'peace' icon
function replaceTokenIcon(scene, container, newIcon) {
    let oldTokenIcon = container.list.find(item => item && item.texture && item.texture.key === 'negotiation');
    let newTokenIcon = container.list.find(item => item && item.texture && item.texture.key === newIcon);
    container.list.forEach(item => scene.tweens.killTweensOf(item));
    if (newTokenIcon) {
        newTokenIcon.setVisible(true);
        newTokenIcon.setAlpha(0);
        scene.tweens.add({
            targets: newTokenIcon,
            alpha: 1,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });
    }
    if (oldTokenIcon) {
        scene.tweens.add({
            targets: oldTokenIcon,
            alpha: 0,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });
    }
}

    // Draw little hats
    export function drawIcons(scene, x, y, texture, startIndex, count,  littleHats, angerLevel) {
        for (let i = startIndex; i < startIndex + count; i++) {
            let xOffset = (i % 5) * ICON_SPACING;
            let yOffset = Math.floor(i / 5) * ICON_SPACING;
            // Each icon will be positioned slightly to the right of the previous one
            let icon = scene.add.image(x + xOffset, y + yOffset, texture);

            // Adjust the size of the icons if necessary
            icon.setScale(ICON_SCALE);

            const jumpHeight = 20; // Adjust the height of the jump
            const durationUp = 150; // Duration for the upward movement
            const durationDown = 300; // Duration for the downward movement with bounce
            // Store the original position
            const originalY = icon.y;

            // Create an infinite loop of jumping
            const jump = () => {
                // Add the upward movement tween
                scene.tweens.add({
                    targets: icon,
                    y: originalY - jumpHeight,
                    ease: 'Power1', // Fast upward movement
                    duration: durationUp,
                    onComplete: () => {
                        // Add the downward movement tween with bounce effect
                        scene.tweens.add({
                            targets: icon,
                            y: originalY,
                            ease: 'Bounce.easeOut', // Bounce effect on downward movement
                            duration: durationDown,
                            onComplete: jump // Chain the jump to repeat
                        });
                    }
                });
            };
            const murmur = () => {
                // Define the horizontal movement range and duration
                const murmurWidth = 20; // Move 10 pixels to each side
                const durationSide = 500; // Half a second to each side

                // Start the movement to the right
                scene.tweens.add({
                    targets: icon,
                    x: icon.x + murmurWidth, // Move to the right
                    ease: 'Sine.easeInOut', // Smooth transition for a gentle sway
                    duration: durationSide,
                    yoyo: true, // Automatically reverse the tween
                    repeat: -1, // Loop the tween indefinitely
                });
            };

            if (angerLevel == 1) {
                // Start the jumping animation with a random delay
                scene.time.delayedCall(Math.random() * 500, murmur);
            } else {
                // Start the jumping animation with a random delay
                scene.time.delayedCall(Math.random() * 500, jump);
            }

            littleHats.push(icon);
        }
        return littleHats;
    }

//    1. Character creates a barricade
//    2. Character "creates" a new power token (called powerToken).
//       --These tokens can also be used to boost the strength of an icon, but increases maga or wokeness of another icon when it's done.
//    3. Character "creates" a shield around an icon.  Same thing: power token boosts shield
//    5. This is automatically is directed to a predetermined icon.
// I think we need to have several characters produce 2 outcomes, not just one.
// economy calming measures? what is that?? union/ strike negotiators helps social justice
// environment calming measures, opening new oil fields vs. polar bears? green energy!
// government calming measures,  repubs and dems bipartisan legislation
// social justice calming measures?  morality police?  supreme court progress?  Stop the shooting?
// international relations calming measures?  maga: build a wall, woke: world peace!  maga big: hits economy

// impact on alien wars.  oh wait prevent putieville!
// econ, gov, diplomacy collapse all increase putieville
// economy health: make more weapons faster/ stronger


export const characters = [
    {
        name: 'Al Welch',
        backstory: [
            "A charismatic and bold character and the CEO of a large multinational corporation, Al has used his influence and resources to support various MAGA ideals.",
            "Born in a small town and raised in a household that valued hard work and ambition, Al's upbringing instilled in him a deep appreciation for the principles of individualism, free enterprise, and limited government interference.",
            "A self-made billionaire, Al is a shrewd businessman who believes that a successful America is one built on economic growth and a strong private sector.",
            "This has made him a key figure on the MAGA side of the game, where he uses his financial clout and business acumen to bolster the country's defenses and develop advanced missile technologies.",
            "In the game, Al's corporate resources could give a significant boost to the player's defense capabilities, but his unwavering belief in industrial progress at any cost might lead to increased environmental damage and instability."
        ],
        shortstory: [
            "Al's corporate resources give a significant boost to the player's defense capabilities,",
            "but his unwavering belief in industrial progress at any cost might lead to increased environmental damage and instability.",
            "He helps the economy but increases MAGA on the environment"
        ],
        faction: 'maga',
        power: 'Private Sector Boost',
        powerTokenType: 'type_5', //  automatically directed to a predetermined icon: economy
        helps: 'economy',
        hurts: 'environment',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 1,
        wokeLevel: 3,
        fogLevel: 2,
        characterIcon: 'Welch'
    },
    {
        name: 'Commander Jackson',
        backstory: [
            "Commander Jackson, a distinguished veteran, demonstrates unwavering dedication to the country's defense from the extraterrestrial",
            "menace. His long-standing commitment to limited government and fiscal conservatism mirrors in his decisive, no-nonsense approach",
            "towards the alien threat. His battle-hardened experience and profound tactical acumen give him a distinct edge, making him a valuable",
            "asset to those with the MAGA alignment. Despite resistance from proponents of government intervention, Commander Jackson holds his",
            "ground, emphasizing that the key to victory lies in bolstering military strength and empowering individual citizens, rather than in",
            "bureaucratic expansion."
        ],
        shortstory: [
            "He is skilled in tactics, leadership, and combat, and",
            "provides valuable guidance to players.  He is opposed to big government. ",
            "He helps the military but increases MAGA on the government."
        ],
        faction: 'maga',
        power: 'Military Tactics\n Training',
        powerTokenType: 'type_5',  //  automatically directed to a predetermined icon: military
        helps: 'military',
        hurts: 'government',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        fogLevel: 2,
        magaLevel: 1,
        wokeLevel: 3,
        characterIcon: 'Jackson'
    },
    {
        name: 'Dr. Emily Hartwell',
        backstory: [
            "Dr. Hartwell, an esteemed inventor, embodies a deep-seated commitment to her country and its safeguarding from alien threats.",
            "Her strong belief in the traditional American way of life significantly influences her scientific endeavors. She advocates",
            "for individual liberties and a free-market approach in technological innovation, contending that advancements should foremost",
            "fortify national security. Her views often ignite contention with those championing socio-economic concerns. Nevertheless, her",
            "engineering expertise and technological prowess remain pivotal in enhancing national defenses and innovating unprecedented",
            "weaponry – critical tools in this looming battle."
        ],
        shortstory: [
            "Her expertise in engineering and technology assists players in upgrading their",
            "defenses and researching new weapons. She has a strong moral code",
            "She helps the military but increases MAGA on justice"
        ],
        faction: 'maga',
        power: 'Alien Military\n Defense Research',
        powerTokenType: 'type_5',  //  automatically directed to a predetermined icon: military
        helps: 'military',
        hurts: 'justice',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        fogLevel: 2,
        magaLevel: 2,
        wokeLevel: 4,
        characterIcon: 'Hartwell'
    },
    {
        name: 'Andrew "Drew" Barnes',
        backstory: [
            "An innovative entrepreneur from rural America, Drew has always been a passionate MAGA supporter, with a firm belief in individual freedom, hard work, and limited government interference.",
            "After successfully running a tech start-up, he moved back to his small hometown to invest in his community.",
            "He established a pioneering renewable energy company that harnesses wind and solar power, promoting self-sufficiency and contributing to environmental preservation in his region.",
            "In the game, Drew helps players understand and implement sustainable energy solutions, reducing reliance on polluting resources and contributing to a cleaner environment."
        ],
        shortstory: [
            "A passionate MAGA supporter, he understands and implements sustainable energy solutions.",
            "A strong believer in building the wall, he doesn't want foreigners to overrun his country.",
            "He helps the environment but increases MAGA on diplomacy."
        ],
        faction: 'maga',
        power: 'Self-sufficient\nEnergy',
        powerTokenType: 'type_5',  // automatically directed to a predetermined icon: environment
        helps: 'environment',
        hurts: 'diplomacy',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 1,
        wokeLevel: 3,
        fogLevel: 2,
        characterIcon: 'Barnes'
    },
    {
        name: "Ethan 'EagleEye' Thompson",
        faction: "maga",
        backstory: [
            "Once a prodigy in Silicon Valley, Ethan was disillusioned by what he saw as a lack of patriotism and respect for traditional values in the tech industry.",
            "He left his lucrative career to use his hacking skills to expose what he perceives as bias in the media and social networks."
        ],
        shortstory: [
            "Ethan's activities sow mistrust in the media and the tech industry, making it harder for them to influence public opinion.",
            "However, his actions also trigger economic instability, shaking investor confidence and causing market fluctuations."
        ],
        power: 'Hacking and\nInformation Warfare',
        powerTokenType: "type_3",
        hurts: 'economy',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 1,
        wokeLevel: 2,
        fogLevel: 1,
        characterIcon: 'EagleEye'
    },
    {
        name:  'Ambassador Aria Chen',
        backstory: [
            "A skilled diplomat and advocate for global cooperation,",
            "Ambassador Chen believes that humanity's best chance for survival lies in",
            "working together with other countries. She helps players navigate the",
            "complexities of international diplomacy, forging alliances and securing valuable",
            "resources."
        ],
        shortstory: [
            "She helps players navigate the",
            "complexities of international diplomacy, forging alliances and securing valuable",
            "resources.  She helps diplomacy but puts Woke pressure on the Military."
        ],
        faction: 'woke',
        power: 'International\nAlliance',
        powerTokenType: 'type_5',  //  automatically is directed to a predetermined icon: diplomacy
        helps: 'diplomacy',
        hurts: 'military',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 3,
        wokeLevel: 1,
        fogLevel: 2,
        characterIcon: 'Chen'
    },
    {
        name:  'Dr. James Baldwin',
        backstory: [
            "An environmental scientist and social activist, Dr. Baldwin",
            "is dedicated to finding sustainable solutions to the global crisis. His",
            "knowledge of ecology and renewable resources assists players in developing",
            "strategies that minimize harm to the environment while combating the alien",
            "threat."
        ],
        shortstory: [
            "He assists players in developing",
            "strategies that minimize harm to the environment while combating the alien",
            "threat.  He helps the environment but puts Woke pressure on Justice."
        ],
        faction: 'woke',
        power: 'Green Energy',
        powerTokenType: 'type_5',  // automatically is directed to a predetermined icon: environment
        helps: 'environment',
        hurts: 'justice',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 3,
        wokeLevel: 1,
        fogLevel: 2,
        characterIcon: 'Baldwin'
    },
    {
        name:  'Maya Rodriguez',
        backstory: [
            "A community organizer and human rights activist, Maya is",
            "passionate about social justice and inclusivity. She helps players build bridges",
            "between different communities and cultures, fostering understanding and",
            "collaboration between the factions."
        ],
        shortstory: [
            "She helps players build bridges",
            "between different communities and cultures, fostering understanding and",
            "collaboration.  She improves negotiations and peace."
        ],
        faction: 'woke',
        power: 'Maya Rodriguez is\nBuilding Bridges',
        powerTokenType: 'type_2', // When power token is dropped into an icon, the maga and wokeness go down
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 2,
        wokeLevel: 1,
        fogLevel: 1,
        characterIcon: 'Maya'
    },
    {
        name: 'Sasha Goldman',
        backstory: [
            "In her early years, Sasha was a rising star in the world of digital security, praised for her uncanny ability to safeguard information systems and protect user privacy.",
            "Driven by her passion for social justice and a belief in the transformative power of technology, she left the corporate world to use her skills for the greater good.",
            "Using her hacking prowess, she is committed to protecting the digital landscape from manipulation and ensuring information equality in the face of disinformation campaigns.",
            "For Sasha, the battle isn't just in the physical world, but also in the realm of ones and zeros, where she stands as a digital sentinel for truth and justice."
        ],
        shortstory: [
            "Sasha's mastery in cyber-security and hacking safeguards vital information and digital systems from intrusion, maintaining the integrity of your faction's digital platforms.",
            "In the game, her actions fortify your online defenses and ensure that your narrative isn't hijacked or sabotaged.",
            "Moreover, Sasha's actions expose biases and misinformation in the digital world, helping to shape a more equitable and informed society."
        ],
        faction: 'woke',
        power: 'Expand Diversity,\nEquality and\nInclusivity',
        powerTokenType: 'type_3',  // Creates a shield around any icon
        hurts: 'justice',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 3,
        wokeLevel: 1,
        fogLevel: 1,
        characterIcon: 'Sasha'
    },
    {
        name: 'Senator Patricia Greenfield',
        backstory: [
            "A seasoned senator from the Midwest, Patricia Greenfield has always stood as a beacon of unity and compromise in the tumultuous world of politics.",
            "Despite being a staunch MAGA supporter, she believes that the country's strength lies in its ability to reconcile its differences and work towards a common goal.",
            "Patricia's popularity among both MAGA and Woke communities is a testament to her commitment to open dialogue, mutual respect, and bipartisan cooperation.",
            "In a political climate characterized by stark division, her efforts to bridge the gap between MAGA and Woke factions have earned her respect across party lines.",
            "As a game character, Patricia can help reduce the intensity of conflicts and foster better relationships between the factions, benefiting both sides and helping to maintain balance and stability."
        ],
        shortstory: [
            "As a seasoned senator, Patricia has always stood for unity and compromise in politics.",
            "Her efforts to bridge the gap between MAGA and Woke factions could help maintain balance and stability in the game. ",
            "She helps government but puts MAGA pressure on Justice."
        ],
        faction: 'maga',
        power: 'Senator Greenfield is\nWorking Across\nThe Aisle',
        powerTokenType: 'type_2',
        //helps: 'government',
        hurts: 'justice',
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 1,
        wokeLevel: 3,
        fogLevel: 1,
        characterIcon: 'Greenfield'
},
{
        name: "Rene Stellar",
        faction: "woke",
        backstory: [
            "Growing up in the heartland, Rene Stellar was captivated by the cosmos. A scholarship to a prestigious engineering institution allowed Rene to explore her",
            "passion for astrophysics and rocketry. Her expertise was unparalleled, and her innovations were groundbreaking. College was also a time of",
            "personal revelation. Rene came out as transgender, overcoming discrimination in the traditional STEM field. Her resilience sharpened her determination",
            "and solidified her identity. After graduation, Rene was recruited by the military. Her advanced propulsion systems and rocketry enhancements became crucial in",
            "national defense against extraterrestrial threats. Beyond her scientific work, Rene is a leader with a cause. Passionate about promoting inclusivity in STEM",
            "and the military, she tirelessly established mentoring programs, advocacy groups, and inclusive policies. Rene Stellar is now a symbol of scientific genius",
            "and the push for a more inclusive future."
        ],
        shortstory: [
            "Rene's advanced knowledge in rocketry significantly bolsters our Alien Defense. However, her ambitious projects require substantial funding,",
            "increasing the pressure on the Economy. ",
            "She helps alien defense but puts Woke pressure on the economy."
        ],
        power: 'Propulsion Systems\nand Rocketry',
        helps: 'military',
        hurts: 'economy',
        powerTokenType: "type_5",
        value: 0,
        prevValue: 0,
        endorsement: 5,
        dne: false,
        magaLevel: 3,
        wokeLevel: 1,
        fogLevel: 2,
        characterIcon: 'Rene'
},
{
    name: "Justice Benjamin Harmon",
    faction: "maga",
    backstory: [
        "Justice Benjamin Harmon, a retired Supreme Court judge, epitomizes the core values of traditionalism and rule of law. His",
        "distinguished legal career is marked by rulings that echo the principles of constitutional originalism, highlighting the",
        "inherent strength of our nation's founding guidelines. Post-retirement, his philanthropic pursuits and community leadership",
        "focus on nurturing respect for cultural heritage and fostering societal unity. Justice Harmon remains a central figure in",
        "policy reform discussions, using his influence to reinforce the importance of safeguarding justice and individual rights.",
        "However, his conservative economic approach often stands in conflict with expansive social programs, making for complex policy dynamics."
    ],
    shortstory: [
        "Ben's influence promotes the wellbeing of the community and boosts the health of society,",
        "although his social programs require considerable funding, placing pressure on the Economy.",
    ],
    power: 'Community Engagement\nand Social Reform',
    helps: 'justice',
    hurts: 'economy',
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 1,
    wokeLevel: 3,
    fogLevel: 2,
    characterIcon: 'Harmon'
},
{
    name: "Professor Isabelle Martinez",
    faction: "woke",
    backstory: [
        "Professor Isabelle Martinez, a celebrated sociologist, champions social equality with an empathetic yet analytic approach.",
        "Her groundbreaking research into systemic disparities across income, education, and healthcare sectors has redefined how",
        "these issues are addressed in contemporary policy making. Drawing from an array of intersectional perspectives, Isabelle",
        "emphasizes the urgent need for structural change, advocating for holistic strategies that uplift marginalized communities",
        "and foster equitable access to resources. However, her bold vision for social justice is often met with opposition from those",
        "favoring traditional governance and fiscal conservatism, resulting in contentious political debates."
    ],
    shortstory: [
        "Isabelle's insights help to promote social justice and reduce inequality. However, her progressive social policies",
        "cause unrest in the house and senate, putting pressure on the government."
    ],
    power: 'Sociology and\nSocial Justice',
    helps: 'justice',
    hurts: 'government',
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 3,
    wokeLevel: 1,
    fogLevel: 2,
    characterIcon: 'Martinez'
},
{
    name: "Dr. Max Greenfield",
    faction: "woke",
    backstory: [
        "A charismatic thought leader in the field of tech innovation, Dr. Greenfield's work has revolutionized communication and connectivity across the globe.",
        "His development of the next-generation virtual reality systems has enabled people from different parts of the world to interact as if they were physically present in the same room."
    ],
    shortstory: [
        "His virtual reality systems have enabled people from different parts of the world to interact as if they were physically present in the same room.",
        "While Dr. Greenfield's innovations foster global unity and are a boon to the economy, the production and disposal of his VR systems have",
        "significant environmental impact, contributing to electronic waste and increasing the demand for rare-earth minerals."
    ],
    power: 'Tech Innovation\nand Virtual Reality',
    helps: 'economy',
    hurts: 'environment',
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 3,
    wokeLevel: 1,
    fogLevel: 2,
    characterIcon: 'Max'
},
{
    name: "Dr. Laura Franklin",
    faction: "woke",
    backstory: [
        "A globally recognized climatologist and passionate environmental activist. Dr. Franklin's work in understanding and mitigating climate change has won her",
        "numerous accolades and she has become a leading voice in the global environmental movement."
    ],
    shortstory: [
        "Dr. Franklin's focus on climate change research and environmental preservation improves the overall health of the planet,",
        "but her efforts can be expensive and put a significant strain on the economy."
    ],
    power: 'Climatology\nand Environmental Activism',
    helps: 'environment',
    hurts: 'economy',
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 4,
    wokeLevel: 3,
    fogLevel: 2,
    characterIcon: 'Franklin'
},
{
    name: "Senator John Caldwell",
    faction: "maga",
    backstory: [
        "A seasoned senator with a strong focus on fiscal responsibility. Senator Caldwell is known for his rigorous approach to economic policy and",
        "his persistent efforts to reduce government spending and taxes."
    ],
    shortstory: [
        "Senator Caldwell's expertise in fiscal policy strengthens the economy. However, his focus on reducing government spending can often",
        "come at the expense of government services."
    ],
    power: 'Fiscal Policy\nand Economic Management',
    helps: 'economy',
    hurts: 'government',
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 2,
    wokeLevel: 4,
    fogLevel: 2,
    characterIcon: 'Caldwell'
},
{
    name: 'Senator Linda Sterling',
    backstory: [
        "Hailing from the heartland of America, Senator Linda Sterling is a stalwart of the MAGA movement.  Her ability to successfully lobby and negotiate key policies",
        "has led to numerous victories in government.  Despite her political leanings, Sterling has demonstrated an ability to bridge the partisan divide, earning",
        "her respect from both MAGA and Woke factions.  Her dedication to bipartisan cooperation serves as a beacon of unity in a time marked by political division.",
        "Sterling's unique position allows her to significantly influence governmental decisions, yet her methods often come under fire from advocates of social justice."
    ],
    shortstory: [
        "Sterling's lengthy political career and effective lobbying have yielded substantial impacts on governmental policy.",
        "Her skill in fostering dialogue and compromise between divided factions promotes balance and stability.",
        "However, her strategies occasionally conflict with those championing radical social justice reforms."
    ],
    faction: 'maga',
    power: 'Effective Lobbying\nand Negotiation',
    powerTokenType: 'type_5',
    helps: 'government',
    hurts: 'justice',
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 1,
    wokeLevel: 2,
    fogLevel: 2,
    characterIcon: 'Sterling'
},
{
    name: "Ambassador Charlotte Grant",
    faction: "maga",
    backstory: [
        "A distinguished diplomat with decades of experience in foreign policy. Ambassador Grant's skilled diplomacy and negotiation tactics have",
        "helped foster peace and strong international relations for the country."
    ],
    shortstory: [
        "Ambassador Grant's diplomatic skills improve international relations, enhancing global diplomacy. However, her focus on maintaining good relations",
        "can sometimes cause great harm to the economy"
    ],
    power: 'Diplomacy\nand International Relations',
    helps: 'diplomacy',
    hurts: 'economy',
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 2,
    wokeLevel: 4,
    fogLevel: 2,
    characterIcon: 'Grant'
},
{
    name: "Professor Theo Rivera",
    faction: "woke",
    backstory: [
        "Professor Theo Rivera, a dedicated urban planner and community organizer, has spent decades transforming urban decay into thriving, sustainable", "communities. His innovative approaches to housing and public spaces have rejuvenated neighborhoods and encouraged inclusive urban development.",
        "His projects often serve as models for cities worldwide, demonstrating how urban environments can enhance quality of life while promoting social", "justice and economic equality. His advocacy for policy changes often leads to increased governmental oversight and regulation, which, while",
        "beneficial for urban development, can sometimes slow down private sector initiatives."
    ],
    shortstory: [
        "Through his work, Professor Rivera collaborates closely with government agencies to design urban policies that prioritize affordable housing and", "public transport, making cities more accessible and equitable for all residents.",
        "His advocacy for policy changes often leads to increased governmental oversight and regulation, which, while beneficial for urban development,",
        "can sometimes slow down private sector initiatives."
    ],
    power: "Urban Planning and Community Development",
    helps: "government",
    hurts: "economy",
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 4,
    wokeLevel: 3,
    fogLevel: 3,
    characterIcon: 'Rivera'
}

];
//        - limited missiles to fire: more missiles
//        - faster missiles
//        - improved accuracy
//        - bigger explosions (would need to add missile detonation at destination and an explosion)
//        - more frequent reload (would need to add a time delay between missile launches)

export const militaryAssets = [
    {
        name: 'Number of Missiles',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "Number of Missiles per Base."
        ],
    },
    {
        name: 'Missile Speed',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "Higher the tech level, faster the missile."
        ],
    },
    {
        name: 'Accuracy',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "As tech improves, missile don't vear off course as much."
        ],
    },
    {
        name: 'Explosion Size',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "Damage caused by the missile."
        ],
    },
    {
        name: 'Reload Time',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "How frequently missiles can be fired."
        ],
    }
];

export const territories = [
    {
        name: 'West Coast',
        faction: 'woke',
        color: 0x0000FF,
        backing: 5,
        x: 0
    },
    {
        name: 'Midwest',
        faction: 'maga',
        color: 0xFF0000,
        backing: 7,
        x: 200
    },
    {
        name: 'South',
        faction: 'maga',
        color: 0xFF0000,
        backing: 3,
        x: 400
    },
    {
        name: 'East Coast',
        faction: 'woke',
        color: 0x0000FF,
        backing: 5,
        x: 600
    },
    {
        name: 'Heartland',
        faction: 'maga',
        color: 0xFF0000,
        backing: 6,
        x: 800
    },
        {
        name: 'Silicon Valley',
        faction: 'woke',
        color: 0x0000FF,
        backing: 6,
        x: 1000
    }
    /*
    {
        name: 'Texas',
        faction: 'maga',
        color: 0xFF0000,
        backing: 5,
        x: 1200
    },
    {
        name: 'Southwest',
        faction: 'woke',
        color: 0x0000FF,
        backing: 3,
        x: 1400
    },
    {
        name: 'Mountain West',
        faction: 'maga',
        color: 0xFF0000,
        backing: 4,
        x: 1600
    },
    {
        name: 'New England',
        faction: 'woke',
        color: 0x0000FF,
        backing: 6,
        x: 1800
    },
    {
        name: 'Great Lakes',
        faction: 'maga',
        color: 0xFF0000,
        backing: 5,
        x: 2000
    },
    {
        name: 'Florida',
        faction: 'woke',
        color: 0x0000FF,
        backing: 4,
        x: 2200
    }
    */
];
//    Right now 'tuning' is when a threat hits an icon, the maganess or wokeness increase by 5
//    when putie hits an icon, the maganess or wokeness increase by 2
export const difficultyList = {
    'A Beginner': {
        alienIncreasePerRound: 1,
        alienDefenseFromSameBase: true,
        militaryAutoSpend: true,
        militaryAllocationAmount: 10,
        alienAttackForCapitalFunc: function(sharedData) { // Give opportunity for extra capital if you have none
            return sharedData.MAGAness < 4
                    && sharedData.Wokeness < 4
                    && sharedData.putieTerritories < territories.length / 2;
        },
        dilemmaOddsFunc: function(sharedData) {
            return (sharedData.WokenessVelocity < 1
                    || (Math.random() < .3));
        },
        militaryTechBoost: 50,
        hackerShieldStrength: 1,
        oddsOfAlienAttack: 0.66, //more attacks: easier to get capital,
        oddsOfAlienAttackFirstRound: 0, // New plan: aliens don't attack immediately: too confusing!
        startingEndorsement: 'all',
        putieThreat: 1,
        collapseImbalance: 100,
        multiplier: 1,
        runTutorial: true
    },
    'A Beginner but skip the tutorial': {
        alienIncreasePerRound: 1,
        alienDefenseFromSameBase: true,
        militaryAutoSpend: true,
        militaryAllocationAmount: 10,
        alienAttackForCapitalFunc: function(sharedData) { // Give opportunity for extra capital if you have none
            return sharedData.MAGAness < 4
                    && sharedData.Wokeness < 4
                    && sharedData.putieTerritories < territories.length / 2;
        },
        dilemmaOddsFunc: function(sharedData) {
            return (sharedData.WokenessVelocity < 1
                    || (Math.random() < .3));
        },
        militaryTechBoost: 50,
        hackerShieldStrength: 1,
        oddsOfAlienAttack: 0.66, //more attacks: easier to get capital,
        oddsOfAlienAttackFirstRound: 0, // New plan: aliens don't attack immediately: too confusing!
        startingEndorsement: 'all',
        putieThreat: 1,
        collapseImbalance: 100,
        multiplier: 1,
        runTutorial: false
    },
    'Going to Need Some Help': {
        alienIncreasePerRound: 2,
        alienDefenseFromSameBase: false,
        militaryAutoSpend: true,
        militaryAllocationAmount: 10,
        alienAttackForCapitalFunc: function(sharedData) { // Give opportunity for extra capital if you have none
            return sharedData.MAGAness === 0
                    && sharedData.Wokeness === 0
                    && sharedData.putieTerritories < territories.length / 2;
        },
        dilemmaOddsFunc: function(sharedData) { // Go to Dilemma screen based on whether you are earning capital or not
            let sanity_check = Math.random();
            //console.log('dilemma probability = ' + sanity_check+ ' sharedData.WokenessVelocity = '+sharedData.WokenessVelocity);
            return (!(sharedData.WokenessVelocity > 2)
                    && (sharedData.WokenessVelocity < .75
                        || (sanity_check < .3)));
        },
        militaryTechBoost: 15,
        hackerShieldStrength: 1,
        oddsOfAlienAttack: 0.58,
        oddsOfAlienAttackFirstRound: .8,
        startingEndorsement: 'ideology',
        putieThreat: 2,
        collapseImbalance: 90, // 100 (leave this for testing collapses for now)
        multiplier: 2,
        runTutorial: false
    },
    'Realistic': {
        alienIncreasePerRound: 3,
        alienDefenseFromSameBase: false,
        militaryAutoSpend: false,
        militaryAllocationAmount: 38,
        alienAttackForCapitalFunc: function(sharedData) {
            return sharedData.MAGAness === 0
                    && sharedData.Wokeness === 0
                    && sharedData.totalPoliticalCapital < 20
                    && sharedData.putieTerritories < territories.length / 2;
        },
        dilemmaOddsFunc: function(sharedData) {
            return (sharedData.WokenessVelocity < .5
                    || (Math.random() < .3));
        },
        militaryTechBoost: 0,
        hackerShieldStrength: .333,
        oddsOfAlienAttack: 0.5,
        oddsOfAlienAttackFirstRound: .8,
        startingEndorsement: 'ideology',  //JCS tuning: give hacker and peacekeeper a starting endorsement
        putieThreat: 2,
        collapseImbalance: 50,
        multiplier: 3,
        runTutorial: false
    }
};
