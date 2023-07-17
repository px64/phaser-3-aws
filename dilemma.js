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
        console.log(this.sharedData.icons);
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
        console.log(this.sharedData.icons);
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
                    iconData.shieldStrength
                );
            }
        }

        this.totalMilitaryAllocThisScene = 0;

        // Don't allow people to cheat and skip the legislation
        // // Create a button using an image
        // let nextButton = this.add.sprite(this.game.config.width-50, this.game.config.height-50, 'environment').setInteractive().setScale(0.16);
        //
        // // When the button is clicked, start the next scene
        // nextButton.on('pointerdown', () => {
        //     // pass this scene's this.sharedData to insurrection's setup, (where it is assigned to insurrection's this.sharedData)
        //     // question: does this scene's sharedData ever even get used?
        //     //this.sharedData.icons = this.icons;
        //     //this.sharedData.MAGAness = this.MAGAness;
        //     //this.sharedData.Wokeness = this.Wokeness;
        //
        //     this.scene.get('insurrection').setup(this.sharedData);
        //     this.scene.start('insurrection');
        // });
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
            let formattedBackstory = insertLineBreaks(nextScreenTutorial[0].story.join(' '), 55);
            let backstoryText = this.add.text(300, 150, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: '#0f0', align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(true);
            backstoryText.setDepth(2);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = this.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
            backstoryBox.setStrokeStyle(2, 0x00ff00, 0.8);
            backstoryBox.isStroked = true;
            backstoryBox.setOrigin(0.5);
            backstoryBox.setVisible(true);
            backstoryBox.setDepth(1);

            setTimeout(() => {
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
            }, 20000);
           this.hasBeenCreatedBefore = true;
        }

        let titleText = this.add.text(0, 0, 'Legislative Reform', { font: '48px Arial', fill: '#0ff' });
        titleText.setPosition(this.sys.game.config.width/2 - titleText.width/2, 230);

        let scenarioText = this.add.text(0, 0, formattedScenario, { font: '20px Arial', fill: '#ffffff' });
        scenarioText.setPosition(this.sys.game.config.width/2 - scenarioText.width/2, 290);

        this.add.text(this.sys.game.config.width/2 - 240, 600, 'Please Make A Choice:', { color: '#0ff', fontSize: '20px',fontFamily: 'Roboto' });
        this.isTweening = false;
        scenarios[this.scenarioNumber].choices.forEach((choice, index) => {
            let decision = this.add.text(this.sys.game.config.width/2 - 240, 620 + index * 20, choice.name , { color: '#ff0000', fontSize: '20px',fontFamily: 'Roboto' })
                .setInteractive()
                .on('pointerdown', () => chooseOption(choice))
                .on('pointerover', () => this.enterButtonHoverState(decision, choice))
                .on('pointerout', () => this.enterButtonRestState(decision, choice))
        });
        // move to next scenario next time
        this.scenarioNumber = (this.scenarioNumber +1 ) % 3;

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        let chooseOption = (choice) => {
            let healthChange;
            let threats;
            titleText.destroy();
            scenarioText.destroy();
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

        this.physics.add.overlap(this.wokeDefenses, this.magaThreats, function(defense, threat) {
            threat.destroy();
            this.roundThreats--;
            console.log('defense destroyed threat.  Down to ' + this.roundThreats);
            if (Math.random() < .1) {
                this.tweens.add({
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


        //====================================================================================
        // function createMisinformationManagement(scene)
        // function that creates the information/misinformation blockers
        //
        //====================================================================================
        function createMisinformationManagement(scene) {
            let misinformationData = [
                {type: 'maga', text: 'Public Forums'},
                {type: 'woke', text: 'Constructive\nConversations'},
                {type: 'maga', text: 'Collaborative\nProjects'},
                {type: 'woke', text: 'Joint Initiatives'},
                {type: 'maga', text: 'Shared Goals'},
                {type: 'woke', text: 'Common Ground'},
                {type: 'maga', text: 'Mutual Understanding'},
                {type: 'woke', text: 'Bipartisan Efforts'},
                {type: 'maga', text: 'Civic Engagement'},
                {type: 'woke', text: 'Cooperative Programs'},
                {type: 'maga', text: 'Community Outreach'},
                {type: 'woke', text: 'Inclusive Policies'},
                {type: 'maga', text: 'Reconciliation\nEfforts'},
            ];

            // Initialize the offset if it's not yet set
            if (!scene.yMagaOffset) {
                scene.yMagaOffset = 250;
            }
            if (!scene.yWokeOffset) {
                scene.yWokeOffset = 250;
            }


           if (!scene.currentMisinformationIndex) {
                scene.currentMisinformationIndex = 0;
            }

            let numEntries = 0;
            if (scene.sharedData.ideology.faction == 'maga') {
                numEntries = 2;
            }
            if (scene.hasBeenCreatedBefore) {

                numEntries = scene.extraMisinformationTokens;
                console.log('extraTokens = ' + scene.extraMisinformationTokens);
                scene.extraMisinformationTokens = 0;
                if (Math.random < .2) numEntries += 1;
                /*
                    for (let tmpHelper in scene.helperIcons) {
                        if (tmpHelper.powerTokenType == 'type_2') {
                            tmpHelper.container.destroy();
                        }
                    };
                */

                // Restore all the old misinformation Tokens first
                for (let key in scene.sharedData.misinformation) {
                    // Look up the stored data
                    let storedData = scene.sharedData.misinformation[key];
                    //console.log(storedData);

                    // Use the stored data when creating the token
                    let misinformation = createPowerToken(scene, 'neutral', storedData.text, storedData.x, storedData.y, storedData, 'normal', true);
                    scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                    scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group
                    //misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                    misinformation.container.misinformationIndex = storedData.misinformationIndex; // restore index too!
                    console.log('restore misinformation index '+ misinformation.container.misinformationIndex);
                    misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again
                    // just keep track of offsets in case the tokens are still in their original positions for below
                    if (storedData.type === 'maga') {
                        scene.yMagaOffset += misinformation.container.displayHeight;
                    } else {
                        scene.yWokeOffset += misinformation.container.displayHeight;
                    }
                }
            }

            // This block should run regardless of whether the scene has been created before
            for (let i = 0; i < numEntries; i++) { // create 2 entries the first time, then some number depending on politics
                if (scene.currentMisinformationIndex < misinformationData.length) { // if we haven't reached the end of the array
                    let data = misinformationData[scene.currentMisinformationIndex];

                    let xOffset = data.type === 'maga' ? 500: 800;
                    let yOffset = data.type === 'maga' ? scene.yMagaOffset: scene.yWokeOffset;

                    // Store the position data
                    let storedData = {
                        x: xOffset,
                        y: yOffset,
                        type: data.type,
                        text: data.text,
                        misinformationIndex: scene.currentMisinformationIndex
                    };

                    scene.sharedData.misinformation[scene.currentMisinformationIndex] = storedData;

                    let misinformation = createPowerToken(scene, 'neutral', data.text, xOffset, yOffset, storedData, 'normal', false, 'drop once');
                    scene.magaDefenses.add(misinformation.sprite); // add the defense to the Maga group
                    scene.wokeDefenses.add(misinformation.sprite); // add the defense to the Woke group

                    misinformation.container.setInteractive({ draggable: true }); // setInteractive for each defense item
                    misinformation.sprite.setImmovable(true); // after setting container you need to set immovable again

                    misinformation.container.misinformationIndex = scene.currentMisinformationIndex;
                    // Increment the corresponding offset for next time
                    if (data.type === 'maga') {
                        scene.yMagaOffset += misinformation.container.displayHeight;
                    } else {
                        scene.yWokeOffset += misinformation.container.displayHeight;
                    }
                    scene.currentMisinformationIndex++; // increment the index for the next call
                }
            }


        }
        //====================================================================================
        //
        // Helper function to handle common overlap logic between Helpful Token and icon
        //
        //====================================================================================

        function handleHelperOverlap(icon, base, helper, incrementAmount, faction, gauge, message) {
            let iconColor = faction === 'maga' ? 'red' : 'blue';
            console.log(helper.container.character.powerTokenType);
            // Do the appropriate thing depending on the helper type
            if (helper.container.character.powerTokenType == 'type_3') {
                let helpedIcon = icon.icon;
                let tooltip = createTooltip(scene, helper.container.character, 500, 500, helpedIcon.icon, helpedIcon.iconText);
                scene.icons[icon.iconName].shieldStrength = 1;
                helpedIcon.shieldWoke.setAlpha(0.1);

                scene.tweens.add({
                    targets: helper.container,
                    alpha: 0,
                    duration: 50,
                    onComplete: function () {
                        helper.container.destroy();
                        //tooltip.text.setVisible(false);
                        //tooltip.box.setVisible(false);
                    },

                    callbackScope: scene
                });

                scene.tweens.add({
                    targets: helpedIcon.shieldWoke,
                    alpha: 1,
                    ease: 'Sine.easeInOut',
                    duration: 500,
                    delay: 0,
                    yoyo: true,  // after going up, go back down
                    repeat: 2,
                    //onComplete: function () {
                        //helpedIcon.shieldMaga.setAlpha(0.1);
                    //    helper.container.destroy();
                    //},
                    callbackScope: scene
                });

                if (!helper.isDestroyed) {
                    delete scene.sharedData.helperTokens[helper.container.character.name];
                    //tooltip.text.setVisible(true);
                    //tooltip.box.setVisible(true);
                    helper.isDestroyed = true;
                }

                //console.log(helpedIcon.shieldMaga);
                //console.log(icon.iconName + ' ' + scene.icons[icon.iconName]);
            }
            if (helper.container.character.powerTokenType == 'type_5') {
                // Automatically directed to a predetermined icon.  If this is the wrong one, nothing happens.
                //console.log(helper.container.character.faction + ' ' + helper.container.character.helps + '  ' + icon.iconName + ' ' + helper.container.character.hurts);
                //console.log(scene.icons[helper.container.character.hurts][helper.container.character.faction]);
                // The helper token's representative character's help icon matches the icon into which it's been dropped.
                // This where we apply the various actions based on attributes contributed by the represented character's power
                if (helper.container.character.helps == icon.iconName) {
                    let helpedIcon = scene.icons[helper.container.character.helps];
                    let tooltip = createTooltip(scene, helper.container.character, 500, 500, helpedIcon.icon, helpedIcon.iconText);
                    scene.tweens.add({
                        targets: helper.container,
                        alpha: 0,
                        duration: 5000,
                        onComplete: function () {
                            helper.container.destroy();
                            tooltip.text.setVisible(false);
                            tooltip.box.setVisible(false);

                        },
                        callbackScope: scene
                    });

                    if (!helper.isDestroyed) {
                        // The health of the 'helps' icon is improved
                        icon.health += incrementAmount;
                        // Bonus: Someone of your own faction can reduce the MAGAness or Wokeness of your own faction.
                        // Imagine the scenario of a bunch of angry MAGA protesters storming around the environment icon and some
                        // super MAGA supporter shows up and provides an environmental solution they like.  That would reduce MAGAness.
                        let otherFaction = helper.container.character.faction == 'maga' ? 'woke' : 'maga';
                        if (icon[helper.container.character.faction]> icon[otherFaction]) {
                            let numReturns = Math.min(5,(icon[helper.container.character.faction] -  icon[otherFaction])/10);
                            let territory = territories[4]; // arbitrarily picked this territory to return to
                            scene.returnThreat(territory, helper.container.character.faction, helpedIcon, numReturns);
                            //icon[helper.container.character.faction] = icon[otherFaction];
                        }
                        scene.drawGauges(helpedIcon.icon.x, helpedIcon.icon.y, helpedIcon.maga, helpedIcon.woke, helpedIcon.health, helpedIcon.healthScale, helpedIcon.gaugeMaga, helpedIcon.gaugeWoke, helpedIcon.gaugeHealth);
                        // Delete data from sharedData.helperTokens
                        console.log('delete name ' + helper.container.character.name);
                        delete scene.sharedData.helperTokens[helper.container.character.name];
                        let hurtIcon = scene.icons[helper.container.character.hurts];
                        let territory = territories[3]; // arbitrarily picked this territory to launch from
                        // But we also launch 5 faction threats at the 'hurts' icon
                        console.log('character ' + helper.container.character.name + 'launches 5 threats');
                        scene.createThreat(territory, helper.container.character.faction, hurtIcon, 5);
                        scene.drawGauges(hurtIcon.icon.x, hurtIcon.icon.y, hurtIcon.maga, hurtIcon.woke, hurtIcon.health, hurtIcon.healthScale, hurtIcon.gaugeMaga, hurtIcon.gaugeWoke, hurtIcon.gaugeHealth);
                        tooltip.text.setVisible(true);
                        tooltip.box.setVisible(true);
                        if (icon.iconName == 'military') {
                            scene.militaryAllocation = true;
                            scene.totalMilitaryAllocThisScene += 10;
                        }
                        helper.isDestroyed = true;
                    }
                }
            }
        }

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
                icon[type] += incrementAmount;
                if (icon.maga > icon.woke) {iconColor = 'red'; message = '\nToo much MAGA!';}
                else if (icon.maga < icon.woke) {iconColor = 'blue'; message = '\nToo much Wokeness!';}
                else if (icon.maga == icon.woke) {
                    icon.health += 1 * icon.healthScale;
                    iconColor = 'purple';
                }
                scene.drawHealthGauge(icon[type]/ 100,defense.x,defense.y, type, gauge, icon['maga'], icon['woke'], icon.scaleSprite);
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
                    scene.drawHealthGauge(icon['woke']/ 100,defense.x,defense.y, 'woke', icon.gaugeWoke, icon['maga'],icon['woke'], icon.scaleSprite);
                }
            });
        }
        //====================================================================================
        // function createPowerToken(scene)
        // function that createPowerToken text, rectangle, and dragability
        //
        // This function can be called to either create a 'misinformation token' or a 'helpful token'
        // When creating a helpful token, dropOnce is false because it can be moved around as much as you want
        //
        // size: 'normal' or 'large'.  Large creates a big box that tweens away slowly
        // hasBeenCreatedBefore: true means that it is static and cannot be dragged around
        // dropOnce: true means that it can be dragged into one position and then can becomes static, no longer can be moved
        //
        //====================================================================================

        function createPowerToken(scene, faction, message, x, y, storedData, size, hasBeenCreatedBefore, dropOnce) {
            let factionColor = faction === 'maga'
                ? '0xff0000'
                : faction === 'woke'
                    ? '0x0000ff'
                    : '0x800080';
            let fillColor = faction === 'maga'
                ? '#ffffff'
                : faction === 'woke'
                    ? '#ffffff'
                    : '#80ff80';
            // Add text to the rectangle
            let text = scene.add.text(0, 0, message, { align: 'center', fill: fillColor }).setOrigin(0.5, 0.5);
            if (size == 'large' ) {text.setFontSize(36);}
            // Create a larger white rectangle for outline
            let outline = scene.add.rectangle(0, 0, text.width+4, text.height+4, 0xffffff);
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
            // Create a smaller factionColor rectangle
            let rectangle = scene.add.rectangle(0, 0, text.width, text.height, factionColor);
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

            // Create a sprite for physics and bouncing
            let misinformationSprite = scene.physics.add.sprite(0, 0, 'track');
            misinformationSprite.setVisible(true); // Hide it, so we only see the graphics and text
            misinformationSprite.setDepth(1);

            // Group the text, outline, and rectangle into a single container
            let misinformation = scene.add.container(x, y, [outline, rectangle, text, misinformationSprite]);

            // Set the size of the container to match the size of the outline rectangle
            //misinformation.setSize(outline.width, outline.height);
            misinformation.setSize(outline.width, outline.height);
            misinformationSprite.setScale(.6);
            //misinformationSprite.setSize(outline.width*.1, 1);

            // Now that the container has a size, it can be made interactive and draggable
            misinformation.setInteractive({ draggable: true });
            // Attach the container to the sprite
            misinformationSprite.container = misinformation;
            if (size == 'large' ) {misinformation.setDepth(1);}
            // Listen to the 'drag' event
            misinformation.on('drag', function(pointer, dragX, dragY) {
                this.x = dragX;
                this.y = dragY;
                storedData.x = dragX;
                storedData.y = dragY;
                misinformationSprite.setImmovable(true);
            });
            if (dropOnce == 'drop once') {
                misinformation.on('dragend', function(pointer, dragX, dragY) {
                    outlineTween.stop();
                    rectangleTween.stop();
                    this.disableInteractive();
                    misinformationSprite.setImmovable(true);
                    let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                    rectangle.setFillStyle(0x228B22); // Now the rectangle is forest green
                });
            }
            if (hasBeenCreatedBefore == true) {
                console.log('hasBeenCreatedBefore, so stop everything');
                outlineTween.stop();
                rectangleTween.stop();
                misinformation.disableInteractive();
                misinformationSprite.setImmovable(true);
                let rectangle = misinformation.list[1]; // Assuming the rectangle is the second item added to the container
                rectangle.setFillStyle(0x228B22); // Now the rectangle is red
            }

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

        //====================================================================================
        // Function:
        //      createSlider
        //
        //====================================================================================
        function createSlider(scene, x, y, character, characterText, callback, initialValue) {
            let track = scene.add.sprite(x, y, 'track');
            let slider = scene.add.sprite(x, y, 'handle').setInteractive();
            scene.input.setDraggable(slider);
            // Attach track to slider
            slider.track = track;

            let numberOfSteps = 7; // Define the number of steps
            let stepSize = (track.width-20) / (numberOfSteps - 1); // Calculate the size of each step

            // Calculate the initial slider position based on the initial value
            let initialStep = Math.round(initialValue * (numberOfSteps - 1));
            slider.x = (track.x - track.width / 2) + (initialStep * stepSize) + 12;

            slider.on('drag', function(pointer, dragX, dragY) {
                // Calculate the closest step
                let closestStep = Math.round((dragX - (this.track.x - this.track.width / 2)-12) / stepSize);

                // Clamp the value to make sure it stays within the track
                closestStep = Phaser.Math.Clamp(closestStep, 0, numberOfSteps - 1);

                // Calculate the new X position of the slider
                let newSliderX = (this.track.x - this.track.width / 2) + (closestStep * stepSize)+12;

                // Update the slider's position
                this.x = newSliderX;

                // Update the text dynamically as the slider is being dragged
                characterText.setText(character.name + '\nBacking: ' + closestStep + '/ 6,\nEndorsement: ' + character.endorsement);


                // Calculate MAGAupdate/WokeUpdate here
                if (character.faction == 'maga') {
                    MAGAupdate = (closestStep - character.prevValue);
                    WokeUpdate = 0;
                } else {
                    WokeUpdate = (closestStep - character.prevValue);
                    MAGAupdate = 0;
                }
                // Update MAGAnessText and WokenessText here
                let tmpMAG = scene.MAGAness - MAGAupdate;
                let tmpWok = scene.Wokeness - WokeUpdate;

                polCapText.setText('Political\ncapital: ' + (tmpMAG+tmpWok).toString());
                polCapText.setColor('#ff0000'); // Change text color to red
                polCapText.setBackgroundColor('#ffff00'); // Change background color to yellow
/*
                MAGAnessText.setText('MAGA political\ncapital: ' + tmpMAG);
                MAGAnessText.setColor('#ff0000'); // Change text color to red
                MAGAnessText.setBackgroundColor('#ffff00'); // Change background color to yellow

                WokenessText.setText('Woke political\ncapital: ' + tmpWok);
                WokenessText.setColor('#0000ff'); // Change text color to blue
                WokenessText.setBackgroundColor('#ffff00'); // Change background color to yellow
 */

            });

            slider.on('dragend', function(pointer, dragX, dragY) {
                // Calculate the closest step
                let closestStep = Math.round((this.x - (this.track.x - this.track.width / 2)-12) / stepSize);

                // Clamp the value to make sure it stays within the track
                closestStep = Phaser.Math.Clamp(closestStep, 0, numberOfSteps - 1);

                // Calculate and return the value
                let value = closestStep;

                // Update the underlying character's value
                character.value = value;

                // Calculate MAGAupdate/WokeUpdate here
                if (character.faction == 'maga') {
                    MAGAupdate = (value - character.prevValue);
                    WokeUpdate = 0;
                } else {
                    WokeUpdate = (value - character.prevValue);
                    MAGAupdate = 0;
                }

                // Update MAGAnessText and WokenessText here
                let tmpMAG = scene.MAGAness - MAGAupdate;
                if (tmpMAG < 0) {
                    MAGAupdate = scene.MAGAness;
                    tmpMAG = 0;
                    value = MAGAupdate + character.prevValue;
                    characterText.setText(character.name + '\nBacking: ' + value + '/ 6,\nEndorsement: ' + character.endorsement);
                    this.x = (this.track.x - this.track.width / 2) + (value * stepSize)+12;
                }
                let tmpWok = scene.Wokeness - WokeUpdate;
                if (tmpWok < 0) {
                    WokeUpdate = scene.Wokeness;
                    tmpWok = 0;
                    value = WokeUpdate + character.prevValue;
                    characterText.setText(character.name + '\nBacking: ' + value + '/ 6,\nEndorsement: ' + character.endorsement);
                    this.x = (this.track.x - this.track.width / 2) + (value * stepSize)+12;
                    }

                polCapText.setText('Political\ncapital: ' + (tmpMAG+tmpWok).toString());
                polCapText.setColor('#ffffff'); // Change text color back to white
                polCapText.setBackgroundColor('#000000'); // Change background color back to black

 /*
                MAGAnessText.setText('MAGA political\ncapital: ' + tmpMAG);
                MAGAnessText.setColor('#ffffff'); // Change text color back to white
                MAGAnessText.setBackgroundColor('#000000'); // Change background color back to black

                WokenessText.setText('Woke political\ncapital: ' + tmpWok);
                WokenessText.setColor('#ffffff'); // Change text color to back to white
                WokenessText.setBackgroundColor('#000000'); // Change background color back to black
 */

                // Save the previous value for next calculation
                character.prevValue = value;

                // Update MAGAness and Wokeness with new values
                scene.MAGAness = tmpMAG;
                scene.Wokeness = tmpWok;
            });

            createCharacterTooltip(scene, character, x, y, slider, characterText);

            return {track: track, slider: slider};

            //====================================================================================
            //  function mouseOver()
            //====================================================================================

            function mouseOver() {
                backstoryBox.setVisible(true);
                backstoryText.setVisible(true);
                //scene.yearTime.paused = true;
                //scene.envTime.paused = true;
                //scene.govTime.paused = true;
            }
            //====================================================================================
            //  function mouseOver()
            //====================================================================================

            function mouseOff() {
                backstoryBox.setVisible(false);
                backstoryText.setVisible(false);
                //scene.yearTime.paused = false;
                //scene.envTime.paused = false;
                //scene.govTime.paused = false;
            }
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
        //====================================================================================
        //    function createTooltip(scene, character, x, y, slider, characterText)
        //====================================================================================
        function createTooltip(scene, character, x, y, slider, characterText) {
            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
            let xOffset = 0;//character.faction === 'maga' ? 320 : -320;

            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(character.shortstory.join(' '), 37);
            let backstoryText = scene.add.text(x+xOffset, y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(false);
            backstoryText.setDepth(2);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
            backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff8080 : 0x8080ff, 0.3);
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
        //    function createCharacterTooltip(scene, character, x, y, slider, characterText)
        //====================================================================================
        function createCharacterTooltip(scene, character, x, y, slider, characterText) {

            // Set text color based on affiliation
            let textColor = character.faction === 'maga' ? '#ff8080' : '#8080ff';
            let xOffset = character.faction === 'maga' ? 320 : -320;

            // Format the text to be centered and with the color based on the affiliation
            let formattedBackstory = insertLineBreaks(character.shortstory.join(' '), 37);
            let backstoryText = scene.add.text(x+xOffset, y, formattedBackstory, { fontSize: '24px', fontFamily: 'Roboto', color: textColor, align: 'center' });
            backstoryText.setOrigin(0.5);
            backstoryText.setVisible(false);
            backstoryText.setDepth(2);

            // Add a bounding box for the text, with rounded corners and a semi-transparent background
            let backstoryBox = scene.add.rectangle(backstoryText.x, backstoryText.y, backstoryText.width, backstoryText.height, 0x000000, 1);
            backstoryBox.setStrokeStyle(2, character.faction === 'maga' ? 0xff8080 : 0x8080ff, 0.8);
            backstoryBox.isStroked = true;
            backstoryBox.setOrigin(0.5);
            backstoryBox.setVisible(false);
            backstoryBox.setDepth(1);

            const mouseOver = () => {
                backstoryText.setVisible(true);
                backstoryBox.setVisible(true);
            };

            const mouseOff = () => {
                backstoryText.setVisible(false);
                backstoryBox.setVisible(false);
            };

            slider.on('pointerover', mouseOver);
            characterText.on('pointerover', mouseOver);

            slider.on('pointerout', mouseOff);
            characterText.on('pointerout', mouseOff);
        }

        // the very end of create()
        this.hasBeenCreatedBefore = true;
    }

    enterButtonHoverState(button, choice) {
        button.setStyle({ fill: '#ff0'}); // change color to yellow

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
        button.setStyle({ fill: '#ff0000'}); // change color back to red

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

    //====================================================================================
    //
    //        update()
    //
    //====================================================================================
    update() {
        // game loop
        // This is called 60 times per second. Put game logic here.
/*
        if (this.roundThreats == 20) {this.scene.start('AliensAttack'); }
        if (Math.random() < 0.01) {
            let attackerIndex = Phaser.Math.Between(0, territories.length - 1);
            let attackerTerritory = territories[attackerIndex];
            let territoryWidth = this.sys.game.config.width / territories.length;

            let threatIcon = attackerTerritory.faction === 'maga'? 'magaBase': 'wokeBase';
            let threat;

            if (attackerTerritory.faction == 'maga'){
                threat = this.magaThreats.create(attackerTerritory.x + territoryWidth/2, this.game.config.height-25, threatIcon).setScale(0.1);
            } else {
                threat = this.wokeThreats.create(attackerTerritory.x + territoryWidth/2, this.game.config.height-25, threatIcon).setScale(0.1);
            }
            threat.setBounce(1);

            let keys = Object.keys(this.icons);
            let attackedIconKey = keys[Phaser.Math.Between(0, keys.length - 1)];
            let attackedIcon = this.icons[attackedIconKey].icon;

            this.physics.moveTo(threat, attackedIcon.x, attackedIcon.y, 100); // 100 is the speed of the threat.
            this.roundThreats++;
        }
 */
    }
}
