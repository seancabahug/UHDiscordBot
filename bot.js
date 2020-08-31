if (process.env.NODE_ENV != "production") require("dotenv").config();

const Discord = require('discord.js');
const client = new Discord.Client();
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');

const APIUtil = require('./utils/APIUtil');

var schedule = require('node-schedule');

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

client.on('message', async message => {
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
            default:
                await message.channel.send("Invalid command. Please type `.help` for a list of available commands.");
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
                    awaitingConfirmation.set(message.author.id, {confirmationMessage: confirmationMsg.id, cookiesUrl: message.attachments.first().url})
                } else {
                    await message.channel.send("There is an unattended `Cookies` confirmation, please scroll up and react to the confirmation titled \"HOLD ON!\" with either :white_check_mark: or :x: depending on your choice before uploading another `Cookies` file.");
                }
            }
        } else {
            message.attachments.some(async attachment => {
                if(attachment.filename == "Cookies" && attachment.filesize < 102400){
                    await message.delete();
                    await message.channel.send("**DO NOT** upload your `Cookies` file anywhere except through DM. It contains highly sensitive information and whoever has it can access your school account.");
                    return true;
                }
            })
        }
    }
});

client.on('messageReactionAdd', async (messageReaction, user) => {
    if(awaitingConfirmation.has(user.id)) {
        const confirmationInformation = awaitingConfirmation.get(user.id);
        if (messageReaction.message.id == confirmationInformation.confirmationMessage) {
            if (messageReaction.emoji.name == "✅"){
                awaitingConfirmation.delete(user.id);
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
                                    .then(res => {
                                        const token = res.request.res.responseUrl.split("&")[0].split("=")[1];
                                        const tokenPayload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
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
            } else if (messageReaction.emoji.name == "❌"){ 
                await messageReaction.message.channel.send("Cancelled. No sensitive information has been collected. It is advisable to delete your `Cookies` file from this Discord DM.");
                awaitingConfirmation.delete(user.id);
            }
        }
    }
});

client.login(process.env.BOT_TOKEN);
