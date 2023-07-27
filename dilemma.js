//=========================================================================================================================
//
//                  Dilemma
//      The scene is to present the user with a dilemma of sorts and they have to choose
//
//=========================================================================================================================
//    Ideas on things that can improve the situation:
//
//=========================================================================================================================

import BaseScene from './BaseScene.js';
import { characters } from './BaseScene.js';
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

export class DilemmaScene extends BaseScene {

    constructor() {
        super({ key: 'dilemma' });
        this.sharedData = {
            icons: {},
            MAGAness: 0,
            Wokeness: 0,
            putieTerritories: 0,
            alienTerritories: 0,
            year: 2023,
            misinformation: {},
            helperTokens: {},
            militaryAllocation: 0
        };
        this.scenarioNumber = 0;
    }
    // dilemma
    setup(data) {
/*
        var stack = new Error().stack;
        console.log("Called by: ", stack);
 */

        console.log(' Dilemma: setup is loading sharedData');

        Object.assign(this.sharedData, data);


        console.log('MAGA: ' + this.sharedData.MAGAness + ' Woke: ' + this.sharedData.Wokeness);
        //console.log(this.sharedData.icons);
    }

    preload() {
            //this.load.image('newspaper', 'assets/newspaper-border.png');
            this.load.image('newspaper', 'assets/protest2.jpg');

    }

    //====================================================================================
    //
    // create()
    //
    //====================================================================================
    create() {
        //console.log(this.sharedData.icons);
        if (!Object.keys(this.sharedData.icons).length) {
            console.log('new data here in dilemma');
            // initialize icons...
            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();
            this.initializeIcons();

            this.icons = this.sharedData.icons;
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
            this.extraMisinformationTokens = 0;

            // ...similarly for other icons
        } else {
            this.icons = this.sharedData.icons;
            console.log('already have shared data to use.');
            this.MAGAness = this.sharedData.MAGAness;
            this.Wokeness = this.sharedData.Wokeness;
            this.putieTerritories = this.sharedData.putieTerritories;
            console.log('in create, MAGA: ' + this.MAGAness + ' Woke: ' + this.Wokeness);
            this.shieldsMaga = this.physics.add.group();
            this.shieldsWoke = this.physics.add.group();

            // recreate the icons with the saved state
            for (let key in this.sharedData.icons) {
                let iconData = this.sharedData.icons[key];
                //console.log(key + ' shieldStrength = ', iconData.shieldStrength);
                let fontSize = parseInt(iconData.iconText.style.fontSize, 10);
                this.icons[key] = this.createIconWithGauges(
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

        this.totalMilitaryAllocThisScene = 0;
        this.decisionGroup = []; // store radio buttons for easy removal

                  // Add a background
        this.cameras.main.fadeIn(2000, 0, 0, 0);

        let image = this.add.image(0,0, 'newspaper').setDepth(-1).setAlpha(.3);
        let scaleX = this.sys.game.config.width / image.width;
        let scaleY = this.sys.game.config.height / image.height;
        let scale = Math.min(scaleX, scaleY);

        image.setScale(scale).setOrigin(0, 0);


        this.roundThreats = 0;

        //====================================================================================
        //
        // The main body of create()
        //
        //====================================================================================
        this.createTerritories();

        let totalCapital = Math.floor(this.sharedData.MAGAness + this.sharedData.Wokeness);

        polCapText = this.add.text(20, 0, 'Political Capital ' + totalCapital, { fontSize: '32px', fill: '#0f0' });

        // Create MAGAness text
        //MAGAnessText = this.add.text(20, 0, 'MAGA Political\n Capital ' + this.MAGAness, { fontSize: '16px', fill: '#fff' });

        // Create Wokeness text
        //WokenessText = this.add.text(1100, 0, 'Wokeness Political\n Capital: ' + this.Wokeness, { fontSize: '16px', fill: '#fff' });

        // Create Year text
        yearText = this.add.text(this.sys.game.config.width * .8, 0, 'Year: ' + this.sharedData.year, { fontSize: '32px', fill: '#fff' });


        //this.envHealthBarMaga = this.add.graphics();
        //this.envHealthBarWoke = this.add.graphics();
        //this.drawHealthBar(1, 100, 100, 'maga', this.envHealthBarMaga);
        //this.drawHealthBar(0.8, 110, 100, 'woke', this.envHealthBarWoke);

        this.magaThreats = this.physics.add.group();
        this.magaDefenses = this.physics.add.group();
        this.wokeThreats = this.physics.add.group();
        this.wokeDefenses = this.physics.add.group();
        this.helperIcons = this.physics.add.group();

        this.magaReturns = this.physics.add.group();
        this.wokeReturns = this.physics.add.group();

          // This one is easy:
        // MAGA: economy+, environment gets blue woke hats,
        // Woke: economy-, MAGA hats go to.. environment?  or economy?
        //    Woke Alternative: no change in economy health, but MAGAs hit both econ and env.
        //        -- definitely MAGAs on env makes the most sense but from gameplay maybe both.
        let scenarioDescription = [
            "A major corporation wants to establish a new industrial plant in your region.",
            "This would undoubtedly boost the economy, creating jobs and potentially leading",
            "to prosperity. However, environmental activists are concerned that this",
            "development would cause significant harm to local ecosystems and contribute",
            "to climate change."
        ];

        // This one is harder: enact: social justice+, MAGAs hit social justice!
        // don't enact: social justice- (or same), Wokes hit social justice!
        let scenarioDescription3 = [
            "In recent times, tensions have been growing in our society, fanned by an increase",
            "in online hate speech. Citizens are increasingly reporting that they feel targeted,",
            "unsafe, and marginalized by the inflammatory rhetoric. A groundswell of support has",
            "gathered behind a new piece of legislation designed to crack down on hate speech,",
            "with advocates arguing that it is necessary to protect the rights and emotional wellbeing",
            "of all citizens, particularly those belonging to minority groups. They believe the",
            "enforcement of such a law could potentially reduce social unrest and contribute to",
            "a safer, more harmonious society.",
            "||",
            "However, there is a strong counter-argument being raised by free speech proponents.",
            "They contend that the proposed legislation is tantamount to censorship, stifling citizens'",
            "right to express their views freely, however unpopular those views may be. They argue that",
            "it's a dangerous precedent to give the government such broad powers over determining what",
            "constitutes 'acceptable speech'. Some of these citizens fear the slippery slope of censorship",
            "and the potential for the government to misuse the legislation for political gains.",
            "||",
            "As the leader, it's up to you to make a difficult decision. Do you support the legislation",
            "and crack down on hate speech, potentially reducing social unrest? Or do you",
            "uphold the sanctity of free speech, despite the potential for it to be used irresponsibly?"
        ];
        let scenarios = [
        {
            description: [
            "In recent times, tensions have grown fanned by an increase in online hate speech.",
            "Citizens are increasingly reporting that they feel targeted,",
            "unsafe, and marginalized by the inflammatory rhetoric. A groundswell of support has",
            "gathered behind a new piece of legislation designed to crack down on hate speech,",
            "with advocates arguing that it is necessary to protect the rights and emotional wellbeing",
            "of all citizens, particularly those belonging to minority groups. They believe the",
            "enforcement of such a law could potentially reduce social unrest and contribute to",
            "a safer, more harmonious society.",
            "||",
            "Opponents argue that this may lead to censorship, infringing upon citizens' right to express unpopular views.",
            "They argue that",
            "it's a dangerous precedent to give the government such broad powers over determining what",
            "constitutes 'acceptable speech'.",
            "||",
            "As the leader, your decision is crucial. Will you support the legislation,",
            "potentially reducing social unrest? Or uphold the sanctity of free speech,",
            "despite its potential misuse?  If you chose wisely, you will receive a steady",
            "flow of political capital for quite some time."
            ],
            choices: [
                {
                    name: 'Enact the legislation without changes',
                    MAGACapRequired: 20,
                    WokeCapRequired: 0,
                    helps: 'justice',
                    helpBenefit: 30,
                    hurts: 'justice',
                    hurtCost: 5,
                    hurtFaction: 'maga'
                },
                {
                    name: 'Reject the legislation completely',
                    MAGACapRequired: 0,
                    WokeCapRequired: 20,
                    helps: 'justice',
                    helpBenefit: 0,
                    hurts: 'justice',
                    hurtCost: 5,
                    hurtFaction: 'woke'
                },
                {
                    name:'Modify the legislation to be less stringent',
                    MAGACapRequired: 5,
                    WokeCapRequired: 5,
                    helps: 'justice',
                    helpBenefit: 10,
                    hurts: 'justice',
                    hurtCost: 2,
                    hurtFaction: 'both'
                },
                {
                    name:'Modify the legislation to be more stringent',
                    MAGACapRequired: 30,
                    WokeCapRequired: 0,
                    helps: 'justice',
                    helpBenefit: 40,
                    hurts: 'justice',
                    hurtCost: 8,
                    hurtFaction: 'maga'
                },
                {
                    name:'Postpone the decision and gather more information',
                    MAGACapRequired: 0,
                    WokeCapRequired: 0,
                    helps: 'justice',
                    helpBenefit: -5,
                    hurts: 'government',
                    hurtCost: 5,
                    hurtFaction: 'woke'
                }
            ]
        },
        {
            description: [
            "In recent times, the growth and expansion of the government has become a major concern.",
            "Many citizens feel that the government has become a leviathan, reaching into every",
            "aspect of their lives and stifling individual freedom and economic prosperity.",
            "There's a strong push for a comprehensive legislative reform aimed at reducing the",
            "size and reach of the government, advocates argue that such changes are necessary",
            "to preserve the foundational principles of liberty and free market that the nation was built upon.",
            "They believe that a leaner government could lead to a more prosperous society with",
            "greater individual freedom.",
            "||",
            "Opponents of this reform believe that a strong government plays a vital role in",
            "protecting citizens' rights, providing essential services, and maintaining economic stability.",
            "They fear that the proposed cuts could lead to a lack of oversight, increased",
            "economic disparity, and inadequate public services.",
            "||",
            "As the leader, your decision carries great weight. Will you support the legislative",
            "reform and move towards a smaller government? Or will you oppose the reform, maintaining",
            "the government's size and reach to ensure stability and services? Your choice",
            "will shape the political landscape for years to come."
            ],
            choices: [
                {
                    name: 'Push for the reform without changes',
                    MAGACapRequired: 20,
                    WokeCapRequired: 0,
                    helps: 'government',
                    helpBenefit: 30,
                    hurts: 'government',
                    hurtCost: 5,
                    hurtFaction: 'woke'
                },
                {
                    name: 'Reject the reform completely',
                    MAGACapRequired: 0,
                    WokeCapRequired: 20,
                    helps: 'government',
                    helpBenefit: 20,
                    hurts: 'government',
                    hurtCost: 5,
                    hurtFaction: 'maga'
                },
                {
                    name:'Modify the reform to be less drastic',
                    MAGACapRequired: 5,
                    WokeCapRequired: 5,
                    helps: 'government',
                    helpBenefit: 10,
                    hurts: 'government',
                    hurtCost: 2,
                    hurtFaction: 'both'
                },
                {
                    name:'Modify the reform to be more drastic',
                    MAGACapRequired: 30,
                    WokeCapRequired: 0,
                    helps: 'government',
                    helpBenefit: 40,
                    hurts: 'government',
                    hurtCost: 8,
                    hurtFaction: 'woke'
                },
                {
                    name:'Postpone the decision and gather more information',
                    MAGACapRequired: 0,
                    WokeCapRequired: 0,
                    helps: 'government',
                    helpBenefit: -5,
                    hurts: 'government',
                    hurtCost: 5,
                    hurtFaction: 'maga'
                }
            ]
        },
        {
            title: 'Public Education Reform',
            description: [
                "In recent times, the state of the public education system has become a major",
                "point of contention. Many believe that it's failing to adequately prepare",
                "students for the demands of the modern world, leading to widening socioeconomic gaps.",
                "Advocates for reform argue that a complete overhaul of the system is necessary,",
                "with increased funding, updated curriculums, and higher teacher salaries.",
                "They believe these changes will provide all students with a more",
                "equitable and high-quality education, helping to bridge the gap between different",
                "socioeconomic classes.",
                "||",
                "Opponents of the reform argue that throwing money at the problem won't solve it.",
                "They advocate for more accountability, standardized testing, and school choice as a",
                "way to improve the education system. They argue that increased competition",
                "between schools will naturally lead to improvements in quality and efficiency.",
                "||",
                "As the leader, your decision on this matter will heavily impact the future of",
                "your nation's youth and the country's overall economic prosperity. Will you",
                "endorse the proposed reforms or opt for a more market-based approach? The fate",
                "of the education system is in your hands."
            ],
            choices: [
                {
                    name: 'Support the reform as proposed',
                    MAGACapRequired: 0,
                    WokeCapRequired: 20,
                    helps: 'government',
                    helpBenefit: 30,
                    hurts: 'government',
                    hurtCost: 5,
                    hurtFaction: 'maga'
                },
                {
                    name: 'Oppose the reform completely',
                    MAGACapRequired: 20,
                    WokeCapRequired: 0,
                    helps: 'government',
                    helpBenefit: 0,
                    hurts: 'government',
                    hurtCost: 5,
                    hurtFaction: 'woke'
                },
                {
                    name:'Modify the reform to include more accountability',
                    MAGACapRequired: 5,
                    WokeCapRequired: 5,
                    helps: 'government',
                    helpBenefit: 10,
                    hurts: 'government',
                    hurtCost: 2,
                    hurtFaction: 'both'
                },
                {
                    name:'Modify the reform to focus on school choice',
                    MAGACapRequired: 0,
                    WokeCapRequired: 30,
                    helps: 'economy',
                    helpBenefit: 40,
                    hurts: 'government',
                    hurtCost: 8,
                    hurtFaction: 'woke'
                },
                {
                    name:'Postpone the decision and commission a study',
                    MAGACapRequired: 0,
                    WokeCapRequired: 0,
                    helps: 'government',
                    helpBenefit: -5,
                    hurts: 'economy',
                    hurtCost: 5,
                    hurtFaction: 'both'
                }
            ]
        }
        ];
        // Spell out exactly how many and what kind of insurrectionist will attack which icon
        console.log('this scenario number is ' + this.scenarioNumber);
        let formattedScenario = insertLinezBreaks(scenarios[this.scenarioNumber].description.join(' '), 110);

        let nextScreenTutorial = [
            {
                story: [
                    "This screen offers the chance to receive a steady stream of Political Capital for many years to come.",
                    "But! Be careful how much near term instability it can cause.  The hats on the bottom",
                    "will flash indicating their anger at the various choices you could make.  One icon at the top will have",
                    "a shaded outline indicating where the activists will direct their unhappiness."
                ]
            },
            {
                story: [
                    "Click on the Earth Icon to",
                        "move to the next screen"
                ]
            }
        ];
        // add some helpful text
        if (!this.hasBeenCreatedBefore) {
            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(nextScreenTutorial[0].story.join(' '), 65);
            this.backstoryText = this.add.text(this.sys.game.config.width/2, this.sys.game.config.height/2, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: '#0f0', align: 'center' });
            this.backstoryText.setOrigin(0.5);
            this.backstoryText.setVisible(true);
            this.backstoryText.setDepth(2);
            this.backstoryText.setAlpha(1);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            this.backstoryBox = this.add.rectangle(this.backstoryText.x, this.backstoryText.y, this.backstoryText.width, this.backstoryText.height, 0x000000, 1);
            this.backstoryBox.setStrokeStyle(2, 0x00ff00, 0.8);
            this.backstoryBox.isStroked = true;
            this.backstoryBox.setOrigin(0.5);
            this.backstoryBox.setVisible(true);
            this.backstoryBox.setDepth(1);
            this.backstoryBox.setAlpha(1);

            setTimeout(() => {
                this.backstoryText.setVisible(false);
                this.backstoryBox.setVisible(false);
            }, 20000);
           this.hasBeenCreatedBefore = true;
        }

        let titleText = this.add.text(0, 0, 'Legislative Reform', { font: '48px Arial', fill: '#0ff' });
        titleText.setPosition(this.sys.game.config.width/2 - titleText.width/2, 230);

        let scenarioText = this.add.text(0, 0, formattedScenario, { font: '20px Arial', fill: '#ffffff' });
        scenarioText.setPosition(this.sys.game.config.width/2 - scenarioText.width/2, 290);

        let makeAChoiceText = this.add.text(this.sys.game.config.width/2 - 240, 600, 'Please Make A Choice:', { color: '#0ff', fontSize: '20px',fontFamily: 'Roboto' });

        this.decisionGroup.push(makeAChoiceText); // Add decision Title to the group

        this.isTweening = false;
        scenarios[this.scenarioNumber].choices.forEach((choice, index) => {
            let decision = this.add.text(this.sys.game.config.width/2 - 240, 620 + index * 20, choice.name , { color: '#ffffff', fontSize: '20px',fontFamily: 'Roboto' })
                .setInteractive()
                .on('pointerdown', () => chooseOption(choice))
                .on('pointerover', () => this.enterButtonHoverState(decision, choice))
                .on('pointerout', () => this.enterButtonRestState(decision, choice))

                this.decisionGroup.push(decision); // Add decision button to the group
        });
        // move to next scenario next time
        this.scenarioNumber = (this.scenarioNumber +1 ) % 3;

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        let chooseOption = (choice) => {
            let healthChange;
            let threats;

            let objectsToFade = [titleText, scenarioText, ...this.decisionGroup];
            // Total number of objects to fade and destroy
            let total = objectsToFade.length;

            objectsToFade.forEach(object => {
                this.tweens.add({
                    targets: object,
                    alpha: 0,
                    ease: 'Linear',
                    duration: 1000,
                    onComplete: function () {
                        object.destroy();
                        total--;

                        // Check if all objects have been destroyed
                        if (total === 0) {
                            this.decisionGroup = []; // reset the radio button group

                            // Here you can proceed to the next scene or execute some other logic
                        }
                    }
                });
            });

            this.time.delayedCall(1000, () => {
                console.log(choice);
                let fruit;
                if (choice.helpBenefit > 0) {
                    fruit = 'You chose to ' + choice.name + '\n      ' + capitalizeFirstLetter(choice.helps) + ' gets stronger!\nBut! ' + capitalizeFirstLetter(choice.hurtFaction) + ' causes ' + choice.hurtCost + ' activists to put pressure on '+ capitalizeFirstLetter(choice.hurts);
                    fruit += '\n\nGood news!  Political Capital will be boosted by +'+choice.helpBenefit/40+'/year for many years to come!';
                } else {
                    fruit = 'You chose to ' + choice.name + '\n      ' + capitalizeFirstLetter(choice.hurtFaction) + ' causes ' + choice.hurtCost + ' activists to put pressure on '+ capitalizeFirstLetter(choice.hurts);
                    fruit += '\n\nBad news!  Political Capital will suffer by '+choice.helpBenefit/40+'/year for many years to come!';
                }

                let resultsText = this.add.text(80, 300, fruit, { font: '24px Arial', fill: '#ffffff' });

                // Implement the results of the chosen option.  Shortcut: just give velocity to Wokeness to make game design easier for now.
                // If someday this becomes a 2-person game then the velocities will need to be separated
                this.sharedData.WokenessVelocity = this.sharedData.WokenessVelocity + choice.helpBenefit/40;
                console.log(this.sharedData.WokenessVelocity);
                this.icons[choice.helps].health += choice.helpBenefit;
                this.drawNewHealthGauge(this.icons[choice.helps]);
                //this.drawHealthGauge(this.icons[choice.helps].health/ this.icons[choice.helps].healthScale/ 100, this.icons[choice.helps].icon.x, this.icons[choice.helps].icon.y, 'Health', this.icons[choice.helps].gaugeHealth);
                if (choice.hurtFaction == 'both') {
                    this.createThreat(territories[2], 'maga', this.icons[choice.hurts], choice.hurtCost);
                    this.createThreat(territories[3], 'woke', this.icons[choice.hurts], choice.hurtCost);
                } else if (choice.hurtFaction == 'maga'){
                    this.createThreat(territories[2], choice.hurtFaction, this.icons[choice.hurts], choice.hurtCost);
                } else {
                    this.createThreat(territories[3], choice.hurtFaction, this.icons[choice.hurts], choice.hurtCost);
                }

                this.time.delayedCall(4000, () => {
                    scene.cameras.main.fadeOut(2000, 0, 0, 0);
                    scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                        this.scene.get('insurrection').setup(this.sharedData);
                        this.scene.start('insurrection');
                    });
                }, [], this);
            });
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



        function chooseOptionOld(faction) {
            if (faction === 'maga') {
                // Increase economy strength, maybe decrease environmental health?
                this.sharedData.icons['economy'].health += 20;
                this.sharedData.icons['environment'].health -= 10;

                // Increase MAGAness
                this.sharedData.MAGAness += 20;
            } else if (faction === 'woke') {
                // Decrease economy strength, increase environmental health
                this.sharedData.icons['economy'].health -= 10;
                this.sharedData.icons['environment'].health += 20;

                // Increase Wokeness
                this.sharedData.Wokeness += 20;
            }

            // Then return to the previous scene or update the game state in some other way
                this.scene.get('politics').setup(this.sharedData);
                this.scene.start('politics');
        }

        let scene = this;

        //====================================================================================
        //
        // The following function creates the information/misinformation blockers
        //
        //====================================================================================
        //createMisinformationManagement(this);

        //====================================================================================
        //
        // Add overlaps for bouncing or slowdowns between threats and defences
        //
        //====================================================================================
        this.physics.add.overlap(this.magaDefenses, this.wokeThreats, function(defense, threat) {
            threat.destroy();
            this.roundThreats--;
            //console.log('defense destroyed threat.  Down to ' + this.roundThreats);

            if (Math.random() < .1) {
                this.tweens.add({
                    targets: defense,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 200,
                    onComplete: function () {
                        console.log('delete index ' + defense.container.misinformationIndex);
                        delete scene.sharedData.misinformation[defense.container.misinformationIndex];
                        defense.container.destroy();
                    },
                    callbackScope: scene
                });
            }
        }, null, this);

        this.physics.add.overlap(this.wokeDefenses, this.magaThreats, function(defense, threat) {
            threat.destroy();
            this.roundThreats--;
            console.log('defense destroyed threat.  Down to ' + this.roundThreats);
            if (Math.random() < .1) {
                this.tweens.add({
                    targets: defense,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 200,
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
                icon[type] += incrementAmount;
                if (icon.maga > icon.woke) {iconColor = 'red'; message = '\nToo much MAGA!';}
                else if (icon.maga < icon.woke) {iconColor = 'blue'; message = '\nToo much Wokeness!';}
                else if (icon.maga == icon.woke) {
                    icon.health += 1 * icon.healthScale;
                    iconColor = 'purple';
                }
                scene.drawHealthGauge(icon[type]/ 100,defense.x,defense.y, type, gauge, icon['maga'], icon['woke'], icon.scaleSprite, icon.littleHats);
                scene.drawNewHealthGauge(icon);
                //scene.drawHealthGauge(icon.health/ icon.healthScale/ 100, defense.x, defense.y, 'Health', icon.gaugeHealth);
                icon.iconText.setText(icon.textBody + Math.floor(icon.health) + message);
                hitIcon(icon.iconText, iconColor);
                threat.isDestroyed = true;
                scene.roundThreats--;
            }
        }

        for (let key in scene.sharedData.icons) {
            let icon = scene.sharedData.icons[key];
            scene.physics.add.overlap(icon.icon, scene.helperIcons, function(base, helper) {
                handleHelperOverlap(icon, base, helper, 70, '', icon.gaugeWoke, '');
            });


            scene.physics.add.overlap(icon.icon, scene.wokeThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 5, 'woke', icon.gaugeWoke, '\nToo much Wokeness!');
            });

            scene.physics.add.overlap(icon.icon, scene.magaThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 5, 'maga', icon.gaugeMaga, '\nMake America Great Again!');
            });

            scene.physics.add.overlap(icon.icon, scene.putieThreats, function(defense, threat) {
                handleOverlap(icon, defense, threat, 2, 'maga', icon.gaugeMaga, '\nToo Much Putin!');
                if (!threat.isPutieDestroyed) {
                    threat.isPutieDestroyed = true;
                    icon['woke'] += 5;
                    scene.drawHealthGauge(icon['woke']/ 100,defense.x,defense.y, 'woke', icon.gaugeWoke, icon['maga'],icon['woke'], icon.scaleSprite, icon.littleHats);
                }
            });
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
    }

    enterButtonHoverState(button, choice) {
        button.setStyle({ fill: '#ff0'}); // change color to yellow
        this.backstoryBox.setVisible(false);
        this.backstoryText.setVisible(false);
        let helpedIcon = this.icons[choice.helps];
        let hurtIcon = this.icons[choice.hurts];

        //let helpedIcon = scene.sharedData.icons.find(asset => asset.iconName === character.helps);
        let helpedColor;
        let hurtColor;
        let originalScale = 0.1;
        if (choice.hurtFaction == 'maga') {
            helpedColor = 0x0000ff;
            hurtColor = 0xff0000;
            if (!this.isTweening) {
                let sprite = territories[2].sprite;
                let originalY = sprite.y;
                let originalScale = sprite.scale;
                this.isTweening = true;
                this.myTween = this.tweens.add({
                    targets: sprite,
                    y: sprite.y - 20,
                    scale: originalScale * 2, // Double the scale. Adjust this value for a bigger or smaller bounce.
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Bounce',
                    onComplete: () => {
                        this.isTweening = false;
                        sprite.y = originalY;
                        sprite.scale = originalScale;
                    }
                });
            }
        } else if (choice.hurtFaction == 'woke') {
            helpedColor = 0xff0000;
            hurtColor = 0x0000ff;
            if (!this.isTweening) {
                let sprite = territories[3].sprite;
                let originalY = sprite.y;
                let originalScale = sprite.scale;
                this.isTweening = true;
                this.myTween = this.tweens.add({
                    targets: sprite,
                    y: sprite.y - 20,
                    scale: originalScale * 2, // Double the scale. Adjust this value for a bigger or smaller bounce.
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Bounce',
                    onComplete: () => {
                        this.isTweening = false;
                        sprite.y = originalY;
                        sprite.scale = originalScale;

                    }
                });
            }
        } else { //both
            hurtIcon.icon.shieldMaga.setAlpha(1).setTint(0xff0000);
            hurtIcon.icon.shieldWoke.setAlpha(1).setTint(0x0000ff);
            if (!this.isTweening) {
                let sprite = territories[2].sprite;
                let originalY = sprite.y;
                let originalScale = sprite.scale;
                this.isTweening = true;
                this.myTween = this.tweens.add({
                    targets: sprite,
                    y: sprite.y - 20,
                    scale: originalScale * 2, // Double the scale. Adjust this value for a bigger or smaller bounce.
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Bounce',
                    onComplete: () => {
                        this.isTweening = false;
                        sprite.y = originalY;
                        sprite.scale = originalScale;
                    }
                });

                let sprite2 = territories[3].sprite;
                let originalY2 = sprite2.y;
                let originalScale2 = sprite2.scale;
                this.myTween2 = this.tweens.add({
                    targets: sprite2,
                    y: sprite2.y - 20,
                    scale: originalScale * 2, // Double the scale. Adjust this value for a bigger or smaller bounce.
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Bounce',
                    onComplete: () => {
                        this.isTweening = false;
                        sprite2.y = originalY2;
                        sprite2.scale = originalScale2;
                    }
                });
            }
            return;
        }
        // Provide a hint by changing the tint of the shield of the helped and hurt Icons
        // doesn't matter at this point which shield it is since they are on top of each other
        hurtIcon.icon.shieldMaga.setAlpha(1).setTint(hurtColor);
    }

    enterButtonRestState(button, choice) {
        button.setStyle({ fill: '#ffffff'}); // change color back to white

        let helpedIcon = this.icons[choice.helps];
        let hurtIcon = this.icons[choice.hurts];

        //let helpedIcon = scene.sharedData.icons.find(asset => asset.iconName === character.helps);
        let helpedColor;
        let hurtColor;
        //console.log(helpedIcon);
        if (choice.hurtFaction == 'maga') {
            helpedColor = 0xffffff;
            hurtColor = 0xff0000;
        } else {
            helpedColor = 0xffffff;
            hurtColor = 0x0000ff;
        }
        // Provide a hint by changing the tint of the shield of the helped and hurt Icons
        hurtIcon.icon.shieldMaga.setAlpha(0).setTint(0xffffff);
        hurtIcon.icon.shieldWoke.setAlpha(0).setTint(0xffffff);
        if (this.isTweening && this.myTween) {
            this.myTween.complete();
        }
        if (this.isTweening && this.myTween2) {
            this.myTween2.complete();
        }
    }
}
