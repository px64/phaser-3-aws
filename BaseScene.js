
//var MAGAness = 0;
var MAGAupdate = 0;
var MAGAnessText;
//var Wokeness = 0;
var WokeUpdate = 0;
var WokenessText;
var year = 2023; // the starting year
var yearText;
var enviromentalHealth = 11; // the starting health of the environment
var enviromentText;
var governmentSize = 40; // the starting size of the government
var governmentText;
var economyMaga = 0;
var economyWoke = 0;
var economyStrength = 75;
var justiceMaga = 0;
var justiceWoke = 0;
var justiceStrength = 50;
var charVal = {};
// testTerritory

const ICON_MARGIN = 10;
const GAUGE_HEIGHT = 50;
const ICON_SPACING = 10;
const ICON_SCALE = 0.03;

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
        //this.load.image('scale_arms', 'assets/scale_arms2.png');
        //this.load.image('scale_body', 'assets/scale_body2.png');
        this.load.image('negotiation', 'assets/negotiation.png');
        this.load.image('hacker', 'assets/hacker.png');
        this.load.image('aliens_win', 'assets/aliens_win.jpg');
        this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
        this.load.image('checkboxUnchecked', 'assets/checkboxUnchecked.png');
        this.load.image('checkboxChecked', 'assets/checkboxChecked.png');

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

/*
    initializeIcons() {
        let xStart = this.sys.game.config.width * .05;
        let xOffset = (this.sys.game.config.width - xStart * 2) / 5;

        // Define the icons in an array
        let icons = ['environment', 'economy', 'justice', 'government', 'diplomacy', 'military'];

        // Shuffle the array
        Phaser.Utils.Array.Shuffle(icons);

        // Take the first two items and assign them a low strength
        let weakIcons = icons.slice(0, 2);

        this.sharedData.icons[icons[0]] = this.createIconWithGauges(xStart + xOffset * 0, 125, 0.15, 'environment', 0, 0, weakIcons.includes('environment') ? 5 : 50, 'Environmental\nHealth ', 1, 16, 0, 'The EPA');
        this.sharedData.icons[icons[1]] = this.createIconWithGauges(xStart + xOffset * 1, 125, 0.1, 'economy', economyMaga, economyWoke, weakIcons.includes('economy') ? 5 : economyStrength, "Economy ", 1, 16, 0, 'Wall Street');
        this.sharedData.icons[icons[2]] = this.createIconWithGauges(xStart + xOffset * 2, 125, 0.05, 'justice', justiceMaga, justiceWoke, weakIcons.includes('justice') ? 5 : 50, 'Social\nJustice ', 1, 16, 0, 'The Supreme Court');
        this.sharedData.icons[icons[3]] = this.createIconWithGauges(xStart + xOffset * 3, 125, 0.05, 'government', 5, 5, weakIcons.includes('government') ? 5 : governmentSize, 'Government\nHealth ', 1, 16, 0, 'The US Capital');
        this.sharedData.icons[icons[4]] = this.createIconWithGauges(xStart + xOffset * 4, 125, 0.16, 'diplomacy', 0, 0, weakIcons.includes('diplomacy') ? 5 : 50, 'International\nRelations\n ', 1, 16, 0, 'The United Nations');
        this.sharedData.icons[icons[5]] = this.createIconWithGauges(xStart + xOffset * 5, 125, 0.12, 'military', 0, 0, weakIcons.includes('military') ? 5 : 50,  'Alien\nDefense ', 2, 16, 0, 'The Pentagon');
    }

    initializeIcons() {
            let xStart = this.sys.game.config.width * .05; // 70;
            //let xOffset = this.sys.game.config.width * 200/1280;
            let xOffset = (this.sys.game.config.width-xStart*2) / 5;
            this.sharedData.icons['environment'] = this.createIconWithGauges(xStart+xOffset*0, 125, 0.15, 'environment', 0, 0, 50, 'Environmental\nHealth ', 1, 16, 0, 'The EPA');
            this.sharedData.icons['economy'] = this.createIconWithGauges(xStart+xOffset*1, 125, 0.1, 'economy', economyMaga, economyWoke, economyStrength, "Economy " ,1, 16, 0, 'Wall Street');
            this.sharedData.icons['justice'] = this.createIconWithGauges(xStart+xOffset*2, 125, 0.05, 'justice', justiceMaga, justiceWoke, 5,  'Social\nJustice ', 1, 16, 0, 'The Supreme Court');
            this.sharedData.icons['government'] = this.createIconWithGauges(xStart+xOffset*3, 125, 0.05, 'government', 5, 5, governmentSize, 'Government\nHealth ', 1, 16, 0, 'The US Capital');
            this.sharedData.icons['diplomacy'] = this.createIconWithGauges(xStart+xOffset*4, 125, 0.16, 'diplomacy', 0, 0, 50,  'International\nRelations\n ', 1, 16, 0, 'The United Nations');
            this.sharedData.icons['military'] = this.createIconWithGauges(xStart+xOffset*5, 125, 0.12, 'military', 0, 0, 5,  'Alien\nDefense ', 2, 16, 0, 'The Pentagon');
     }
*/
    //====================================================================================
    //
    // createIconWithGauges
    //
    //====================================================================================
    createIconWithGauges = (xPos, yPos, scaleFactor, iconName, maga, woke, health, textBody, healthScale, textSize, shieldStrength, iconTitle)  => {
        let icon = this.physics.add.sprite(xPos, yPos, iconName).setAlpha(.8).setScale(scaleFactor);
        //let gaugeMaga; = this.add.graphics();
        //let gaugeWoke; = this.add.graphics();
        let scaleSprite = this.physics.add.sprite(xPos, yPos+60, 'scale_body').setScale(0.06).setDepth(1).setAlpha(1);
        let gaugeMaga = this.physics.add.sprite(xPos, yPos+60, 'scale_arms').setScale(0.06).setDepth(1).setAlpha(1);
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

        this.drawHealthGauge(scene, stability/100,x,y, 'Health', gaugeHealth);
        gaugeHealth.setAlpha(.7);

        return littleHatsCreate;
    }

    // So we now have 'health' which can be renamed 'strength' and 'stability'
    // you're icon may be strong, but not very stable

    drawNewHealthGauge(icon) {
        const ICON_MARGIN = 10;
        const GAUGE_HEIGHT = 50;
        const ICON_SPACING = 10;
        const ICON_SCALE = 0.03;
        let posX = icon.icon.x;
        let posY = icon.icon.y;
        let healthGauge = icon.gaugeHealth;

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
        let percentage = stability/ 100;

        let color = 0xffffff; let ringNum = 1;
        healthGauge.clear();
        // Draw full gray gauge (background)
        healthGauge.lineStyle(7, 0x404040);
        healthGauge.beginPath();
        healthGauge.arc(posX, posY, 45+(ringNum-1)*10, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false);
        healthGauge.strokePath();

        // Draw the health gauge with an arc, with the angle proportional to the health
        healthGauge.lineStyle(7, color);
        healthGauge.beginPath();
        healthGauge.arc(posX, posY, 45+(ringNum-1)*10, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + (360 * (percentage))), false);
        healthGauge.strokePath();
    }

    // // TODO: Add little hat icons for every 10 magas or wokes accumulated

    drawHealthGauge(scene, percentage, posX, posY, style, healthGauge, maga, woke, scaleSprite, littleHats) {
        // 'track' is the scale object (could be a sprite or any game object)
        if (style == 'Health') {
            let color = 0xffffff; let ringNum = 1;
            healthGauge.clear();
            // Draw full gray gauge (background)
            healthGauge.lineStyle(7, 0x404040);
            healthGauge.beginPath();
            healthGauge.arc(posX, posY, 45+(ringNum-1)*10, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false);
            healthGauge.strokePath();

            // // Draw the health gauge with an arc, with the angle proportional to the health
            // healthGauge.lineStyle(7, color);
            // healthGauge.beginPath();
            // healthGauge.arc(posX, posY, 45+(ringNum-1)*10, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + (360 * (percentage))), false);
            // healthGauge.strokePath();

            if (percentage > .25) {
                // Draw the normal health gauge (static)
                //healthGauge.clear();
                healthGauge.lineStyle(7, 0xffffff);
                healthGauge.beginPath();
                healthGauge.arc(posX, posY, 45 + (ringNum - 1) * 10, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + (360 * (percentage))), false);
                healthGauge.strokePath();
            } else {
                // Draw the red gauge (will be pulsing)
                //healthGauge.clear();
                healthGauge.lineStyle(7, 0xff0000);
                healthGauge.beginPath();
                healthGauge.arc(posX, posY, 45 + (ringNum - 1) * 10, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + (360 * (percentage))), false);
                healthGauge.strokePath();

                let shimmerTween = this.tweens.add({
                    delay: Phaser.Math.Between(0, 500),
                    targets: healthGauge,
                    duration: (percentage * 10000), // Duration of one shimmer
                    repeat: -1, // -1 for infinite repeats
                    yoyo: true, // Yoyo makes the tween animate back to its original value after reaching its target.
                    ease: 'Sine.easeInOut',
                    alpha: {
                        start: .33, // Fully transparent
                        to: 1    // Fully visible
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

            healthGauge.setTint(color);
            scaleSprite.setTint(color);



            //clear all the little hats
            if (littleHats.length > 0) {
                littleHats.forEach(hat => {
                     hat.destroy();
                 });
             }
             //littleHats = [];

            // Assuming the icons should appear below the health gauge
            let iconY = posY + GAUGE_HEIGHT + ICON_MARGIN;
            littleHats = drawIcons(scene, posX-20 + ICON_SPACING*3, iconY, maga/5, 'magaBase', littleHats);
            littleHats = drawIcons(scene, posX-20 - ICON_SPACING*3, iconY, woke/5, 'wokeBase', littleHats); // Offset the Y position for the second row of icons

        }
        return littleHats;

        // Draw little hats
        function drawIcons(scene, x, y, count, texture, littleHats) {
            for (let i = 0; i < count; i++) {
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

                // Start the jumping animation with a random delay
                scene.time.delayedCall(Math.random() * 500, jump);

                littleHats.push(icon);
            }
            return littleHats;
        }

        /*
        function drawIcons(scene, x, y, count, texture, littleHats) {
            for (let i = 0; i < count; i++) {
                let xOffset = (i%5) * ICON_SPACING;
                let yOffset = Math.floor(i/5) * ICON_SPACING;
                // Each icon will be positioned slightly to the right of the previous one
                let icon = scene.add.image(x + xOffset, y + yOffset, texture);

                // Adjust the size of the icons if necessary
                icon.setScale(ICON_SCALE);

                littleHats.push(icon);

            }
            return littleHats;
        }
        */

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

                // Listen for the event
                this.physics.world.on('worldbounds', (body) => {
                    // Check if the body's game object is the one we're interested in
                    if (body.gameObject === threat) {
                        body.gameObject.destroy();
                        this.roundThreats--;
                        if (this.roundThreats == 1 && this.switchScene == false) {
                            this.switchScene = true;
                            console.log('switchscene is set to true in basescene 347');
                            this.cameras.main.fadeOut(2000, 0, 0, 0);
                            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                                this.scene.get('politics').setup(this.sharedData);
                                this.scene.start('politics');
                            });
                        }
                    }
                }, this);

                let attackedIcon = icon.icon;
                threat.icon = icon;
                this.physics.moveTo(threat, attackedIcon.x, attackedIcon.y, 450); // 100 is the speed of the threat.
                this.roundThreats++;
            });
        }
    }

    returnThreat(territory, faction, icon, numThreats) {
        //let message = 'Your advocate persuades protestors to go home from ';
        let message = 'Protestors recognize advocate and\n return home from ';
        message += icon.iconTitle + '...';
        let offsetY = 10;
        let fillColor;
        if (faction == 'maga') {
            fillColor = '#ff0000';
        } else {
            fillColor = '#0000ff';
        }
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
        for (let i = 0; i < numThreats; i++) {
            let attackerTerritory = territory;
            let territoryWidth = this.sys.game.config.width / territories.length;
            let returnedIcon = icon.icon;

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

                // // It's good that the littlehat is now associated with this icon, but you can't just pop
                // // a random hat since it could be maga or it could be woke.
                // let lastIcon = icon.littleHats.pop();
                // if (lastIcon) { // Check to ensure the icon exists before calling destroy on it
                //     lastIcon.destroy();
                // }

                // Enable world bounds event for this body
                threat.body.onWorldBounds = true;
                icon[faction] -= 5;
                // Note that drawGauges is an arrow function so it keeps 'this' from this context
                icon.littleHats = this.drawGauges(this, icon.icon.x, icon.icon.y, icon.maga, icon.woke, icon.health, icon.healthScale, icon.gaugeMaga, icon.gaugeWoke, icon.gaugeHealth, icon.scaleSprite, icon.littleHats);

                // Listen for the event
                this.physics.world.on('worldbounds', (body) => {
                    // Check if the body's game object is the one we're interested in
                    if (body.gameObject === threat) {
                        body.gameObject.destroy();
                        this.roundThreats--;
                        //console.log('left screen.  threats is down to ' + this.roundThreats);
                    }
                }, this);

                this.physics.moveTo(threat, attackerTerritory.x, attackerTerritory.y, 220); // 220 is the speed of the threat.
                this.roundThreats++;
            });
        }
    }

    //====================================================================================
    // function restoreMisinformationTokens(scene)
    // function that recreates the information/misinformation blockers
    //
    //====================================================================================

    restoreMisinformationTokens(scene) {
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

    difficultyLevel() {
        let config = difficultyList[this.sharedData.difficultyLevel];
        config.alienAttackForCapital = config.alienAttackForCapitalFunc(this.sharedData);
        config.dilemmaOdds = config.dilemmaOddsFunc(this.sharedData);
        return config;
    }
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
        fogLevel: 2
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
        wokeLevel: 3
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
        wokeLevel: 4
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
        fogLevel: 2
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
        fogLevel: 1
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
        fogLevel: 2
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
        fogLevel: 2
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
        fogLevel: 1
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
        fogLevel: 1
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
        fogLevel: 1
},
{
        name: "Rene Stellar",
        faction: "woke",
        backstory: [
            "Growing up in the heartland, Rene Stellar was captivated by the cosmos. A scholarship to a prestigious engineering institution allowed Rene to explore their passion for astrophysics and rocketry. Their expertise was unparalleled, their innovations, groundbreaking.",
            "College was also a time of personal revelation. Rene came out as transgender, facing and overcoming the hurdles of discrimination in the traditional STEM field. Their resilience only sharpened their determination and solidified their sense of identity.",
            "After graduation, Rene was recruited by the military. Their advanced propulsion systems and rocketry enhancements have become crucial in national defense, particularly against extraterrestrial threats.",
            "However, Rene was far more than a scientist dedicated to their work. They were a leader with a cause. Passionate about promoting inclusivity and representation within the traditionally conservative STEM and military fields, Rene worked tirelessly to establish mentoring programs, advocacy groups, and inclusive policies. They were an unwavering advocate for LGBTQ+ rights, consistently fighting for acceptance and equality both inside and outside of their field. Rene Stellar is now a symbol of both scientific genius and the push for a more inclusive future."
        ],
        shortstory: [
            "Rene's advanced knowledge in rocketry significantly bolsters our Alien Defense. However, their ambitious projects require substantial funding,",
            "increasing the pressure on the Economy. ",
            "They help the military but puts Woke pressure on the economy."
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
        fogLevel: 2
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
    fogLevel: 2
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
    fogLevel: 2
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
    fogLevel: 2
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
    helps: 'government',
    hurts: 'economy',
    powerTokenType: "type_5",
    value: 0,
    prevValue: 0,
    endorsement: 5,
    dne: false,
    magaLevel: 4,
    wokeLevel: 3,
    fogLevel: 2
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
    fogLevel: 2
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
    fogLevel: 2
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
    fogLevel: 2
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
        multiplier: 1
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
        collapseImbalance: 10, // 100 (leave this for testing collapses for now)
        multiplier: 2
    },
    'Realistic': {
        alienIncreasePerRound: 3,
        alienDefenseFromSameBase: false,
        militaryAutoSpend: false,
        militaryAllocationAmount: 38,
        alienAttackForCapitalFunc: function(sharedData) {
            return sharedData.MAGAness === 0
                    && sharedData.Wokeness === 0
                    && sharedData.putieTerritories < territories.length / 2;
        },
        dilemmaOddsFunc: function(sharedData) {
            return (sharedData.WokenessVelocity < .5
                    || (Math.random() < .3));
        },
        militaryTechBoost: 0,
        hackerShieldStrength: .75,
        oddsOfAlienAttack: 0.6,
        oddsOfAlienAttackFirstRound: .8,
        startingEndorsement: 'ideology',  //JCS tuning: give hacker and peacekeeper a starting endorsement
        putieThreat: 2,
        collapseImbalance: 80,
        multiplier: 3
    }
};
