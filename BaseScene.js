
var MAGAness = 0;
var MAGAupdate = 0;
var MAGAnessText;
var Wokeness = 0;
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

export default class BaseScene extends Phaser.Scene {
/*
    constructor() {
        super();

        this.MAGAness = 0;
        this.Wokeness = 0;
    }
 */

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
        this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');

    }

    initializeIcons() {
            let xStart = this.sys.game.config.width * .05; // 70;
            let xOffset = this.sys.game.config.width * 200/1280;
            this.sharedData.icons['environment'] = this.createIconWithGauges(xStart+xOffset*0, 125, 0.15, 'environment', 0, 0, 50, 'Environmental\nHealth: ', 1, 16, 0); //1
            this.sharedData.icons['economy'] = this.createIconWithGauges(xStart+xOffset*1, 125, 0.1, 'economy', economyMaga, economyWoke, economyStrength, "Economy: " ,1, 16, 0); //440
            this.sharedData.icons['justice'] = this.createIconWithGauges(xStart+xOffset*2, 125, 0.05, 'justice', justiceMaga, justiceWoke, 5,  'Social\nJustice: ', 1, 16, 0); //.15
            this.sharedData.icons['government'] = this.createIconWithGauges(xStart+xOffset*3, 125, 0.03, 'government', 5, 5, governmentSize, 'Government\nHealth: ', 1, 16, 0); //50
            this.sharedData.icons['diplomacy'] = this.createIconWithGauges(xStart+xOffset*4, 125, 0.16, 'diplomacy', 0, 0, 50,  'International\nRelations:\n ', 1, 16, 0); // 1
            this.sharedData.icons['military'] = this.createIconWithGauges(xStart+xOffset*5, 125, 0.13, 'military', 0, 0, 5,  'Alien\nDefense: ', 1, 16, 0); // 1
     }

    //====================================================================================
    //
    // createIconWithGauges
    //
    //====================================================================================
    createIconWithGauges = (xPos, yPos, scaleFactor, iconName, maga, woke, health, textBody, healthScale, textSize, shieldStrength)  => {
        let icon = this.physics.add.sprite(xPos, yPos, iconName).setAlpha(.8).setScale(scaleFactor);
        //let gaugeMaga; = this.add.graphics();
        //let gaugeWoke; = this.add.graphics();
        let scaleSprite = this.physics.add.sprite(xPos+60, yPos+48, 'scale_body').setScale(0.06).setDepth(1).setAlpha(1);
        let gaugeMaga = this.physics.add.sprite(xPos+60, yPos+48, 'scale_arms').setScale(0.06).setDepth(1).setAlpha(1);
        let gaugeWoke = gaugeMaga;

        let gaugeHealth = this.add.graphics();
        let shieldVisible = true;

        icon.iconName = iconName;

        this.drawGauges(xPos, yPos, maga, woke, health, healthScale, gaugeMaga, gaugeWoke, gaugeHealth, scaleSprite);
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
        let healthText = healthTextRange[Phaser.Math.Clamp(Math.round(health/healthScale/20),0,4)];

        let iconText = this.add.text(xPos - (textSize / 2) - 50, yPos - /*75*/85, textBody + healthText, { fontSize: textSize + 'px', fill: '#fff' });
        return {icon, gaugeMaga, gaugeWoke, gaugeHealth, iconText, textBody, maga, woke, health, healthScale, shieldStrength, iconName, scaleSprite};
    }

    //====================================================================================
    //
    // drawBalance
    //
    //====================================================================================
    drawGauges = (x, y, maga, woke, health, healthScale, gaugeMaga, gaugeWoke, gaugeHealth, scaleSprite) => {
        // 'track' is the scale object (could be a sprite or any game object)
        console.log('x,y = ' + x + ',' + y);

        this.drawHealthGauge(0,x,y, 'Woke', gaugeWoke, maga, woke, scaleSprite);
        this.drawHealthGauge(health/healthScale/100,x,y, 'Health', gaugeHealth);
        gaugeHealth.setAlpha(.7);

/*
        let totalValue = 100;//maga + woke; // totalValue is the sum of MAGA and WOKE values
        let balance;
        if (totalValue == 0) {
            balance = 0
        } else {
            balance = (maga - woke) / totalValue; // This will be a value between -1 and 1
        }
        let rotationAngle = balance * Math.PI / 4; // This will give an angle between -45 and 45 degrees
        gaugeMaga.setRotation(rotationAngle);

        // Determine the tint based on the balance
        // If balance is 0, color is neutral (no tint). If balance is positive, color goes towards red. If balance is negative, color goes towards blue.
        let color;
        if (balance > 0) {
            // Convert balance (0 to 1) to a value in the range 0xffffff (white) to 0xff0000 (red)
            let amount = Phaser.Display.Color.Interpolate.RGBWithRGB(255, 255, 255, 255, 0, 0, 100, balance * 100);
            color = Phaser.Display.Color.GetColor(amount.r, amount.g, amount.b);
        } else if (balance < 0) {
            // Convert balance (-1 to 0) to a value in the range 0xffffff (white) to 0x0000ff (blue)
            let amount = Phaser.Display.Color.Interpolate.RGBWithRGB(255, 255, 255, 0, 0, 255, 100, balance * -100);
            color = Phaser.Display.Color.GetColor(amount.r, amount.g, amount.b);
        } else {
            // Neutral color
            color = 0xffffff;
        }

        gaugeMaga.setTint(color);
 */

    }

    drawHealthGauge(percentage, posX, posY, style, healthGauge, maga, woke, scaleSprite) {
        // 'track' is the scale object (could be a sprite or any game object)

        if (style == 'Health') {
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
        } else {
            console.log('x,y = ' + posX + ',' + posY + ' maga: ' + maga + ' woke: ' + woke);

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
            console.log('balance = ' + balance);
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
        }
        return healthGauge;

    }
/*
    //====================================================================================
    //
    // drawGauges
    //
    //====================================================================================
    drawGauges = (x, y, maga, woke, health, healthScale, gaugeMaga, gaugeWoke, gaugeHealth) => {
        this.drawHealthGauge(maga/100,x,y, 'Maga', gaugeMaga);
        this.drawHealthGauge(woke/100,x,y, 'Woke', gaugeWoke);
        this.drawHealthGauge(health/healthScale/100,x,y, 'Health', gaugeHealth);

        gaugeMaga.setAlpha(0.5).setDepth(1);
        gaugeWoke.setAlpha(0.5).setDepth(1);
        gaugeHealth.setAlpha(0.9).setDepth(1);
    }
 */
    //====================================================================================
    //
    //      drawHealthGauge(percentage, posX, posY, style, healthGauge)
    //
    //====================================================================================
/*
    drawHealthGauge(percentage, posX, posY, style, healthGauge) {
        let ringNum;
        let color;
        if (style == 'Maga' || style == 'maga') {color = 0xff0000; ringNum = 3;}
        if (style == 'Woke' || style == 'woke') {color = 0x0000ff; ringNum = 1;}
        if (style == 'Health') {color = 0xffffff; ringNum = 2;}
        healthGauge.clear();
        // Draw full gray gauge (background)
        healthGauge.lineStyle(7, 0x808080);
        healthGauge.beginPath();
        healthGauge.arc(posX, posY, 45+(ringNum-1)*10, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false);
        healthGauge.strokePath();

        // Draw the health gauge with an arc, with the angle proportional to the health
        healthGauge.lineStyle(7, color);
        healthGauge.beginPath();
        healthGauge.arc(posX, posY, 45+(ringNum-1)*10, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + (360 * (percentage))), false);
        healthGauge.strokePath();

        return healthGauge;
    }
 */
    //====================================================================================
    //
    //          drawHealthBar(percentage, posX, posY, style, healthBar)
    //
    //====================================================================================
/*
    drawHealthBar(percentage, posX, posY, style, healthBar) {
        let ringNum;
        let color;
        if (style == 'Maga') {color = 0xff0000; ringNum = 3;}
        if (style == 'Woke') {color = 0x0000ff; ringNum = 1;}
        if (style == 'Health') {color = 0xffffff; ringNum = 2;}

        healthBar.clear();

        //this.healthBar.fillStyle(0x2ecc71, 1);
        healthBar.fillStyle(color, 1);

        var width = 5;
        var height = 80;

        healthBar.fillRect(posX, posY - percentage*height, width, percentage*height);
    }
 */

    createThreat(territory, faction, icon, numThreats) {
        for (let i = 0; i < numThreats; i++) {
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
                        console.log('left screen.  threats is down to ' + this.roundThreats);
                        if (this.roundThreats == 1) {
                            this.cameras.main.fadeOut(2000, 0, 0, 0);
                            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                                this.scene.get('politics').setup(this.sharedData);
                                this.scene.start('politics');
                            });
                        }
                    }
                }, this);

                let attackedIcon = icon.icon; //220
                this.physics.moveTo(threat, attackedIcon.x, attackedIcon.y, 220); // 100 is the speed of the threat.
                this.roundThreats++;
            });
        }
    }

    returnThreat(territory, faction, icon, numThreats) {
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

                // Enable world bounds event for this body
                threat.body.onWorldBounds = true;
                icon[faction] -= 10;
                this.drawGauges(icon.icon.x, icon.icon.y, icon.maga, icon.woke, icon.health, icon.healthScale, icon.gaugeMaga, icon.gaugeWoke, icon.gaugeHealth, icon.scaleSprite);

                // Listen for the event
                this.physics.world.on('worldbounds', (body) => {
                    // Check if the body's game object is the one we're interested in
                    if (body.gameObject === threat) {
                        body.gameObject.destroy();
                        this.roundThreats--;
                        console.log('left screen.  threats is down to ' + this.roundThreats);
                    }
                }, this);

                this.physics.moveTo(threat, attackerTerritory.x, attackerTerritory.y, 220); // 220 is the speed of the threat.
                this.roundThreats++;
            });
        }
    }

    createTerritories()
    {
        console.log('Putie Territories = ' + this.putieTerritories);

        // Make sure Putie Territories are up to date
        let testTerritory = territories.length - 1; // Arrays are 0-indexed
        let putieCount = 0; // Counter to track how many territories have been changed

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
            this.physics.add.sprite(territory.x + this.territoryWidth/2, territory.y-30, baseFaction ).setScale(0.1).setAlpha(0.8);

            // Create territory name
            let nameText = this.add.text(
              territory.x + this.territoryWidth/2,
              territory.y,
              territory.name,
              { font: '16px Arial', fill: '#ffffff', align: 'center' }
            );

            // Set origin to the center of the text to properly align it
            nameText.setOrigin(0.5, 0.5);
        }
        let graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xaaaaaa } });

        for (let i = 1; i < territories.length; i++) {
            let territory1 = territories[i];
            graphics.beginPath();
            graphics.moveTo(territory1.x, this.game.config.height - 30);  // Starting from the top of the game area
            graphics.lineTo(territory1.x, this.game.config.height);  // Ending at the bottom of the game area
            graphics.closePath();
            graphics.strokePath();
        }
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
// economy health: make more weapons faster


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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
    },
    {
        name: 'Commander Jackson',
        backstory: [
            "A retired military officer with years of combat experience,",
            "Commander Jackson advocates for a strong national defense and decisive action",
            "against the alien threat. He is skilled in tactics, leadership, and combat, and",
            "provides valuable guidance to players aligned with the MAGA faction."
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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
    },
    {
        name: 'Dr. Emily Hartwell',
        backstory: [
            "A renowned scientist and inventor, Dr. Hartwell has a strong moral code and is dedicated",
            "to developing new technologies to protect her country from the extraterrestrial",
            "invaders. With her expertise in engineering and technology, she assists players",
            "in upgrading their defenses and researching new weapons."
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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
    },
    {
        name:  'Maya Rodriguez - Bridge Builder',
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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
    },
    {
        name: 'Sasha Goldman - Social Hacker',
        backstory: [
            "A brilliant economist and a fervent believer in social justice, Sasha is a leading figure on the Woke side.",
            "She combines her sharp economic acumen with a deep commitment to equality and social empowerment.",
            "In the game, Sasha helps players to strategize economic growth that benefits all members of society, enhancing income equality and boosting social welfare.",
            "She believes in the power of a diverse, inclusive economy to drive growth and prosperity for all."
        ],
        shortstory: [
            "Sasha helps players to strategize economic growth that benefits all members of society, enhancing income equality and boosting social welfare.",
            "She believes in the power of a diverse, inclusive economy to drive growth and prosperity for all. ",
            "She's a great computer hacker and can protect systems from attacks."
        ],
        faction: 'woke',
        power: 'Expand Diversity,\nEquality and\nInclusivity',
        powerTokenType: 'type_3',  // Creates a shield around any icon
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
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
            "She helps government but puts Woke pressure on Justice."
        ],
        faction: 'maga',
        power: 'Working Across\n The Aisle',
        powerTokenType: 'type_5',
        helps: 'government',
        hurts: 'justice',
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
},
{
        name: "Rene Stellar",
        faction: "woke",
        backstory: [
            "A visionary rocket scientist and a fervent advocate for LGBTQ+ rights. Rene is recognized not only for their expertise in rocketry but also",
            "their work in promoting inclusivity and representation within STEM fields."
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
        value: 3,
        prevValue: 3,
        endorsement: 5,
        dne: false
},
{
    name: "Supreme Court Justice Benjamin Harmon",
    faction: "maga",
    backstory: [
        "A retired Supreme court judge, respected philanthropist and community leader. Ben has dedicated his life to social reform and bridging cultural divides.",
        "His efforts in fostering mutual understanding have made him a key player in promoting peace and unity."
    ],
    shortstory: [
        "Ben's influence promotes the wellbeing of the community and boosts the health of society,",
        "although his social programs require considerable funding, placing pressure on the Economy.",
    ],
    power: 'Community Engagement\nand Social Reform',
    helps: 'justice',
    hurts: 'economy',
    powerTokenType: "type_5",
    value: 3,
    prevValue: 3,
    endorsement: 5,
    dne: false
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
        "Number of Missiles total that you can fire."
        ],
    },
    {
        name: 'Missile Speed',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "Number of Missiles total that you can fire."
        ],
    },
    {
        name: 'Accuracy',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "Number of Missiles total that you can fire."
        ],
    },
    {
        name: 'Explosion Size',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "Number of Missiles total that you can fire."
        ],
    },
    {
        name: 'Reload Time',
        value: 0,
        prevValue: 0,
        techLevel: 0,
        shortstory: [
        "Number of Missiles total that you can fire."
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
];
