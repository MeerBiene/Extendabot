// TODO: fucking ratelimit

exports.run = (client, message, args, level) => {
try {
  message.delete()
} catch(e) {
  console.error(e)
}
//if (message.channel.id != config.commandchannel) return;
if (!args[0]) return message.reply(client.error(`You forgot to give an actual suggestion.`)).then(msg => msg.delete({timeout: 20000}).catch(console.error));

const Discord = require('discord.js')
const config = require('../config.json')



  message.reply(`Thank you for your suggestion it has been posted in ${message.guild.channels.cache.get(config["suggestions-channel"]).toString()}`).then(msg => {
        try {
            msg.delete({ timeout: 20000 });
        } catch(e) {
            client.logger.debug(e)
        }
  })
  const ID = message.author.id
  const texto = args.join(' ')
  if (texto.length > 250) return message.channel.send(client.error(`Your suggestion text was too long. Please try again.`)).then(msg => {
    msg.delete({ timeout: 30000 }).catch(console.error)
  })
  // TODO sanitize input for length
  var embed = new Discord.MessageEmbed()
    .setColor(config.colors.defaultembed)
    .setTitle("New Suggestion")
    .setThumbnail(
      message.author.avatarURL({ format: "gif", dynamic: true, size: 1024 })
    )
    .addField("**Suggestion:**", "```" + texto + "```")
    .addField("**Suggested by:**", message.author)
    .setDescription(
      `Please vote with :white_check_mark: or :x: to either let it go through or cancel it. \n\n __**You all have ${config["vote-timeout-in-minutes"]} minutes.**__`
    );
  client.channels.cache
    .get(config["suggestions-channel"])
    .send(embed).then(voteMsg => {
        voteMsg.react("✅").then( voteMsg.react("❌"));

      client.messagecache.add(message.id)
      setTimeout(async function() {
        client.messagecache.delete(message.id)
      }, 60000*config["cooldown-in-minutes"])


  setTimeout(async function () {

    var reactions = await voteMsg.reactions.cache.array();
    var yesreaction = reactions[0];
    var noreaction = reactions[1];
    var usercheckyes = yesreaction.users.cache.get(ID)
    var usercheckno = noreaction.users.cache.get(ID)

    let yescount = yesreaction.count;
    let nocount = noreaction.count;

    yescount--
    nocount--

    if (usercheckyes) {parseInt(yescount--)} 
    if (usercheckno) {parseInt(nocount--)}

    //console.log(yesreaction, noreaction)
    if (parseInt(yescount) > parseInt(nocount+3)) {
      message
        .reply(
          `The vote is over and your suggestion \`\`\`${texto} \`\`\`has been approved.`
        )
        .then((msg) => {
          msg.delete({ timeout: 20000 }).catch(console.error);
        });
      var newEmbed = new Discord.MessageEmbed()
        .setColor(config.colors.approvedembed)
        .setTitle("New Suggestion")
        .addField("**Suggestion:**", "```" + texto + "```")
        .addField("__**Votes:**__", `👍  **${yescount}**  👎  **${nocount}**`)
        .addField("**Suggested by:**", message.author)
        .setTimestamp()
        .setThumbnail(
          message.author.avatarURL()
        )
        .setFooter(message.author.id);
      client.channels.cache.get(config["approved-channel"]).send(newEmbed);
    } else if (parseInt(yescount) < parseInt(nocount)) {
             message
               .reply(
                 `Unfortunately the vote is over and your suggestion \`\`\`${texto} \`\`\` lost.`
               )
               .then((msg) => {
                 msg.delete({ timeout: 20000 }).catch(console.error);
               });
           } else if (parseInt(yescount) === parseInt(nocount)) {
                    message
                      .reply(
                        `It was a tie! That's cool. Your suggestion: \`\`\`${texto} \`\`\`is gonna go through in that case.`
                      )
                      .then((msg) => {
                        msg.delete({ timeout: 20000 }).catch(console.error);
                      });
                    var newembed = new Discord.MessageEmbed()
                      .setColor(config.colors.approvedembed)
                      .setTitle("New Suggestion")
                      .addField("**Suggestion:**", "```" + texto + "```")

                      .addField(
                        "__**Votes:**__",
                        `👍  **${yescount}**  👎  **${nocount}**`
                      )
                      .addField("**Suggested by:**", message.author)
                      .setThumbnail(
                        message.author.avatarURL()
                      )
                      .setFooter(message.author.id)
                      .setTimestamp();
                    //send to approved suggestions channel
                    //TODO: APPROVED CHANNEL IN DB UND APPROVEDCHANNEL COMMAND MACHEN DU HURENSOHN!
                    client.channels.cache
                      .get(config["approved-channel"])
                      .send(newembed);
                  }
  }, 60000*config["vote-timeout-in-minutes"]); //1800000
})
};