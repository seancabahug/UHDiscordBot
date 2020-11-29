if (process.env.NODE_ENV != "production") require("dotenv").config();

const Discord = require('discord.js');
const client = new Discord.Client();
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');

const APIUtil = require('./utils/APIUtil');
const Util = require('./utils/Util');

var schedule = require('node-schedule');

const ConfirmationFor = {
    COOKIE_FILE: 0,
    EXTENSION: 1,
    CHOOSING_METHOD: 2
};

const WaitingFor = {
    EXTENSIONSTRING: 0
};

client.on('ready', () => {
    console.log("ready")
    const channel = client.guilds.fetch("617617235795640330").then(guild => {return guild.channels.cache.find(channel => channel.id == "617830904634802176")})
    schedule.scheduleJob('25 8 * * 1-5', () => {
        channel.send(" **The 1st period bell has rung!**");
    });
    schedule.scheduleJob('25 9 * * 1-5', () => {
        channel.send(" **The 2nd period bell has rung!**");
    });
    schedule.scheduleJob('25 10 * * 1-5', () => {
        channel.send(" **The 3rd period bell has rung!**");
    });
    schedule.scheduleJob('30 11 * * 1-5', () => {
        channel.send(" **The 4th period bell has rung!**");
    });
    schedule.scheduleJob('25 12 * * 1-5', () => {
        channel.send(" **The lunch bell has rung!**");
    });
    schedule.scheduleJob('0 13 * * 1-5', () => {
        channel.send(" **The 6th period bell has rung!**");
    });
    schedule.scheduleJob('0 14 * * 1-5', () => {
        channel.send(" **The 7th period bell has rung!**");
    });
});

var awaitingConfirmation = new Map();
var waitingFor = new Map();

client.on('message', async message => {
    if(!waitingFor.has(message.author.id) || message.channel.type != "dm"){
        if(message.content.startsWith(".")){
            var args = message.content.split(" ");
            switch(args[0].substr(1).toLowerCase()) {
                case 'embedtest':
                    await message.channel.send({
                        embed: {
                            title: "test",
                            description: "it work",
                            color: 0xFFC30B
                        }
                    });
                    break;
                case 'contribute':
                    if (!awaitingConfirmation.has(message.author.id)){
                        if (message.channel.type != "dm") await message.channel.send("Thank you for showing interest in contributing! Please refer to DM for more information.");
                        var confirmationMsg = await message.author.send({
                            embed: {
                                title: "Thank you for the interest in contributing!",
                                description: "Please react accordingly to the contribution process you'd like to go through. Note that both options require a computer with the ability to access Discord (you do not need to download the desktop app).\n\n1️⃣ Temporary Chrome Extension **(recommended)**\n2️⃣ Upload `Cookies` File (works if you've logged into the Teams desktop app before 2020)"
                            }
                        });
                        await confirmationMsg.react("1️⃣");
                        await confirmationMsg.react("2️⃣");
                        awaitingConfirmation.set(message.author.id, {confirmationMessage: confirmationMsg.id, for: ConfirmationFor.CHOOSING_METHOD});
                    } else {
                        await message.channel.send("You still have a message requesting your input, please react to any previous messages in your DM that you haven't given an answer to yet.");
                    }
                    break;
            }
        } else if (message.attachments.size >= 1) {
            if (message.channel.type == 'dm') {
                if(message.attachments.first().name == "Cookies"){
                    if(!awaitingConfirmation.has(message.author.id)) {
                        var confirmationMsg = await message.channel.send({
                            embed: {
                                "title": "**HOLD ON!**",
                                "description": "Before we continue, let's make sure you know what's really happening. Your `Cookies` file hasn't been downloaded nor processed on our end, and you can check out the [bot's source code](https://github.com/seancabahug/UHDiscordBot) if you're skeptical.",
                                "color": 0xFF0000,
                                "fields": [
                                    {
                                        "name": "This `Cookies` file contains **sensitive information**.",
                                        "value": "Though it doesn't store your username or password, it can grant people access to your account. However, it is vital for the bot to use it so that it is able to see assignments in classes it doesn't have access to."
                                    },
                                    {
                                        "name": "WE WILL NOT USE THIS ACCESS WITH MALICIOUS INTENT. You can check the source code.",
                                        "value": "The bot will ONLY use it for seeing your assignments. It WILL NOT GATHER personal information about you (exception being your name); only the assignments, its due dates, and classes pertaining to it will be stored and used for everyone's benefit. The important parts of your `Cookies` file will also be stored PRIVATELY for future resyncing."
                                    },
                                    {
                                        "name": "By reacting with :white_check_mark:...",
                                        "value": "you agree that you are aware of the access you're granting and that you trust the bot with this access. If you disagree, react with :x: and your `Cookies` file will not be stored nor processed."
                                    },
                                ],
                                "footer": {
                                    "text": "Bot developed by @seancabahug (check out my GitHub!)"
                                }
                            }
                        });
                        await confirmationMsg.react("✅");
                        await confirmationMsg.react("❌");
                        awaitingConfirmation.set(message.author.id, {confirmationMessage: confirmationMsg.id, cookiesUrl: message.attachments.first().url, for: ConfirmationFor.COOKIE_FILE});
                    } else {
                        await message.channel.send("There is an unattended confirmation, please scroll up and react to the confirmation titled \"HOLD ON!\" with either :white_check_mark: or :x: depending on your choice before uploading another `Cookies` file.");
                    }
                }
            } else {
                message.attachments.some(async attachment => {
                    if(attachment.filename == "Cookies" && attachment.filesize < 102400){
                        await message.delete();
                        await message.channel.send("**DO NOT** upload your `Cookies` file anywhere except through DM. It contains highly sensitive information and whoever has it can access your school account.");
                        return true;
                    }
                });
            }
        }
    } else {
        var waitingInformation = waitingFor.get(message.author.id);
        if (message.content != ".cancel"){
            switch (waitingInformation.for) {
                case WaitingFor.EXTENSIONSTRING:
                    try {
                        var data = JSON.parse(Buffer.from(message.content, 'base64').toString('utf-8'));
                        if (data.estsauthpersistentval) {
                            APIUtil.fetchToken(data.estsauthpersistentval)
                                .then(token => {
                                    const tokenPayload = Util.getTokenPayload(token);
                                    message.channel.send(`:thumbsup: Processing successful, thank you ${tokenPayload.given_name}! You may now remove the extension from your browser. It is advisable to delete your pastes from the extension from this Discord DM.`);
                                    console.log(tokenPayload);
                                })
                                .catch(res => {
                                    message.channel.send("Something went wrong while trying to process your text. Please ensure you're signed into Teams in your browser, then recopy from the extension. If you would like to cancel the contribution process, type `.cancel`.");
                                });
                        } else {
                            throw 'tsk tsk tsk';
                        }
                    } catch (error) {
                        await message.channel.send("Something went wrong while trying to process your text. Please recopy it from the extension and try again. If you would like to cancel the contribution process, type `.cancel`.");
                    }
                    break;
            }
        } else {
            waitingFor.delete(message.author.id);
            await message.channel.send("Cancelled. You may now use commands again.");
        }
    }
});

client.on('messageReactionAdd', async (messageReaction, user) => {
    if(awaitingConfirmation.has(user.id)) {
        const confirmationInformation = awaitingConfirmation.get(user.id);
        if (messageReaction.message.id == confirmationInformation.confirmationMessage) {
            if (confirmationInformation.for != ConfirmationFor.CHOOSING_METHOD) {
                if (messageReaction.emoji.name == "✅"){
                    awaitingConfirmation.delete(user.id);
                    switch (confirmationInformation.for) {
                        case ConfirmationFor.COOKIE_FILE:
                            await messageReaction.message.channel.send("Confirmed, thank you! Downloading your `Cookies` file for processing...");
                            const cookiesCache = `./cache/${user.id}`;
                            const fileStream = fs.createWriteStream(cookiesCache);
                            https.get(confirmationInformation.cookiesUrl, res => {
                                res.pipe(fileStream);
                                fileStream.on('finish', async () => {
                                    fileStream.close();
                                    await messageReaction.message.channel.send(`Downloaded! Processing file...`);
                                    var cookiesDb = new sqlite3.Database(cookiesCache);
                                    cookiesDb.get("SELECT value FROM cookies WHERE name='ESTSAUTHPERSISTENT'", async (err, row) => {
                                        if(!err) {
                                            APIUtil.fetchToken(row.value)
                                                .then(token => {
                                                    const tokenPayload = Util.getTokenPayload(token);
                                                    messageReaction.message.channel.send(`Processing successful, thank you ${tokenPayload.given_name}! It is advisable to delete your \`Cookies\` file from this Discord DM.`);
                                                })
                                                .catch(res => {
                                                    messageReaction.message.channel.send("There was an error while processing; if this happens again, you may want to try signing in/out from Teams and reuploading your `Cookies` file again. It is advisable to delete your most recently uploaded `Cookies` file.");
                                                    console.log(res);
                                                });
                                        } else {
                                            await messageReaction.message.channel.send("There was an error while processing; make sure you're uploading your `Cookies` file from the correct location. The `Cookies` file you uploaded has not been saved, and it is advisable to delete it.");
                                        }
                                    });
                                    cookiesDb.close(() => {
                                        fs.unlinkSync(cookiesCache);
                                    });
                                });
                            });
                            break;
                        case ConfirmationFor.EXTENSION:
                            await messageReaction.message.channel.send(
                                `
**Thank you for participating!** Please download the attached file anywhere you'd like, preferably to your Downloads folder.

Open File Explorer and find the file you downloaded, then extract it. It should create a folder called "UH Contribution Extension" in the same folder the file you downloaded is in.
Demonstration: https://i.imgur.com/jawZmkJ.gif

Go to Google Chrome, type \`chrome://extensions\` into the URL bar, then hit enter.
Demonstration: https://i.imgur.com/H22SUOY.gif

On the top-right of the page, click on the slider to enable Developer Mode.
Demonstration: https://i.imgur.com/SMOrlDC.gif

Click on the "Load unpacked" at the top of the page, then select the "UH Contribution Extension" folder that you extracted earlier.
Demonstration: https://i.imgur.com/VVETPGv.gif

Click on the Extensions icon (it looks like a puzzle piece) next to the URL bar, and click on the "UH Bot Contribution Extension".
Demonstration: https://i.imgur.com/0LhlVcW.gif

Click on the "Click me to copy!" button, then paste the copied text into this Discord DM and send it as a message.
`,
                            { files: ["./assets/UHContributionExtension.zip"] });
                            waitingFor.set(user.id, {for: WaitingFor.EXTENSIONSTRING});
                            break;
                    }
                } else if (messageReaction.emoji.name == "❌"){
                    await messageReaction.message.channel.send("Cancelled. No sensitive information has been collected. It is advisable to remove any sensitive data (including long encoded text or your `Cookies` file) from this Discord DM.");
                    awaitingConfirmation.delete(user.id);
                }
            } else {
                switch (messageReaction.emoji.name) {
                    case "1️⃣":
                        var confirmationMsg = await messageReaction.message.channel.send({
                            embed: {
                                "title": "**HOLD ON!**",
                                "description": "Before we continue, let's make sure you know what's really happening. You can check out the [bot's source code](https://github.com/seancabahug/UHDiscordBot) if you're skeptical.",
                                "color": 0xFF0000,
                                "fields": [
                                    {
                                        "name": "The data that the Chrome extension will allow you to copy will contain **sensitive information** that can be abused by people with malicious intent.",
                                        "value": "Though it doesn't store your username or password, it can grant people access to your account. However, it is vital for the bot to use it so that it is able to see assignments in classes it doesn't have access to."
                                    },
                                    {
                                        "name": "WE WILL NOT USE THIS ACCESS WITH MALICIOUS INTENT. You can check the source code.",
                                        "value": "The bot will ONLY use it for seeing your assignments. It WILL NOT GATHER personal information about you (exception being your name); only the assignments, its due dates, and classes pertaining to it will be stored and used for everyone's benefit. The important parts of the data you will paste with the Chrome extension will also be stored PRIVATELY for future resyncing."
                                    },
                                    {
                                        "name": "By reacting with :white_check_mark:...",
                                        "value": "you agree that you are aware of the access you're granting and that you trust the bot with this access. If you disagree, react with :x: and this will be cancelled."
                                    },
                                ],
                                "footer": {
                                    "text": "Bot developed by @seancabahug (check out my GitHub!)"
                                }
                            }
                        });
                        await confirmationMsg.react("✅");
                        await confirmationMsg.react("❌");
                        awaitingConfirmation.delete(user.id);
                        awaitingConfirmation.set(user.id, {confirmationMessage: confirmationMsg.id, for: ConfirmationFor.EXTENSION});
                        break;
                    case "2️⃣":
                        await messageReaction.message.channel.send("This method should be used as a fallback if the Chrome extension does not work. If you would like to continue, please upload the file named `Cookies` located at `%appdata%/Microsoft/Teams/` to this DM. https://i.imgur.com/LWYEPOi.gif");
                        break;
                }

            }
        }
    }
});

client.login(process.env.BOT_TOKEN);
