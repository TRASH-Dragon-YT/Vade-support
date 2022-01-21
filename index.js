const { Client, MessageEmbed } = require('discord.js');
const config = require('./config.json');

const { token, supportChannel, supportTeam, oneCategory, twoCategory, threeCategory, fourCategory, fiveCategory } = config;

const client = new Client();

const active = new Map();
const { promisify } = require('util');
const wait = promisify(setTimeout);


client.on("ready", () => {
    console.log(`${client.user.tag} has successfully logged in!`);
})

client.on("message", async message => {

    const prefix = "v!";
    if(message.content.toLowerCase().startsWith(prefix)) {
       if(!message.member.roles.cache.has(supportTeam) && !message.member.permissions.has("ADMINISTRATOR")) {
            return message.channel.send(`You need to be a Support Team member to use that command!`);
       }

       if(message.content.toLowerCase() === "v!close") {
           await message.channel.delete();
       }
    }
    if(message.channel.id !== supportChannel) return;
    console.log(`This is the support channel.`);
    const content = message.content.toLowerCase();
    if(!content) {
        if(!message.deleted && message.deletable) await message.delete();
        return;
    }
    // 1, 2, 3, 4, 5, 6, 7, 8, 9 , 10
    const valid = [1, 2, 3, 4, 5];
    let t;
    let choice;
    for(const one of content) {
        if(valid.includes(parseInt(one))) {
            t = true;
            choice = one;
        }
    }

    if(!t) {
        if(!message.deleted && message.deletable) await message.delete();
        return;
    }

    console.log(choice);
    const { author } = message;
    try {
        if(active.has(author.id)) {
            let activeEmbed = new MessageEmbed()
                .setTitle(`Error!`)
                .setDescription(`You already have a support request active! Please wait until it has been dealt with!`)
                .setColor(`#F00000`)
                .setTimestamp()
                .setFooter(`Vade Support`, client.user.avatarURL());
            await author.send(activeEmbed);
           await message.delete();
            return;
        }
        let embed = new MessageEmbed()
            .setTitle(`Support Request!`)
            .addField(`Support Type`, `You selected choice \`${choice}\`.`)
            .setColor(`#f5f3ff`)
            .setTimestamp()
            .setFooter(`Vade Support`, client.user.avatarURL());

       await author.send(embed);

        let helloEmbed = new MessageEmbed()
            .setTitle(`${author.tag}'s Ticket!`)
            .setDescription(`${author.tag} has created a ticket with the choice: \`${choice}\``)
            .setColor(`#f5f3ff`)

        if(!message.deleted && message.deletable) await message.delete();


        async function perms(guild, category, author) {
            guild.channels.create(`${author.id}`, {
                type: 'text'
            }).then(async channel => {
                await channel.setParent(category);
                await channel.createOverwrite(message.member, {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true,
                    READ_MESSAGE_HISTORY: true,
                });
                await channel.send(`${author}`, helloEmbed);
                active.set(author.id, channel.id);
        });

        }

     switch(parseInt(choice)) {
         case 1: {
           await perms(message.guild, oneCategory, author);
             break;
         }

         case 2: {
            await perms(message.guild, twoCategory, author);
             break;
         }
         case 3: {
             await perms(message.guild, threeCategory, author);
             break;
         }
         case 4: {
             await perms(message.guild, fourCategory, author);
             break;
         }
         case 5: {
             await perms(message.guild, fiveCategory, author);
             break;
         }

         default:
             return;
     }
    } catch (e) {
        console.log(`Unable to DM ${author.tag} ` + e);
        if(!message.deleted && message.deletable) await message.delete();
    }

})

client.on("channelDelete", async channel => {
    const { name } = channel;
    if(active.has(name)) {
       await active.delete(name);
    }
});


client.login(token).then(() => {
    console.log('Vade™');
})
