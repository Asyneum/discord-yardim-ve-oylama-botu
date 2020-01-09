const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');


var prefix = ayarlar.prefix;

client.on('ready', () => {
  console.log(`${client.user.tag} Başlatıldı!`);
});

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

if (message.content.toLowerCase().startsWith(prefix + `destek`)) {
    const reason = message.content.split(" ").slice(1).join(" ");
    if (!message.guild.roles.exists("name", "Support")) return message.channel.send(`Bu sunucuda \` Destek \` rolü açılmamış.\nEğer yetkili isen Destek rolü oluştur.`);
    if (message.guild.channels.exists("name", "ticket-" + message.author.username)) return message.channel.send(`Zaten bir ticket oluşturmuşsun.`);
    message.guild.createChannel(`yardım-${message.author.username}`, "text").then(c => {
        let role = message.guild.roles.find("name", "Support");
        let role2 = message.guild.roles.find("name", "@everyone");
        c.overwritePermissions(role, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        c.overwritePermissions(role2, {
            SEND_MESSAGES: false,
            READ_MESSAGES: false
        });
        c.overwritePermissions(message.author, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        message.channel.send(`:person_tipping_hand: Destek biletini oluşturuldum, **#${c.name}** kanalına giderek yetkililer ile görüşebilirsin.`);
        const embed = new Discord.RichEmbed()
        .setColor(0xCF40FA)
        .addField(`Hey ${message.author.username}!`, `Hangi konuda yardıma ihtiyaç duyduğunu lütfen **Destek Yetkililerimizle** paylaş.Yardım aldıktan sonra lütfen ticket'ını kapatmayı unutma.Ticket'ını kapatmak için !kapat.`)
        .setTimestamp();
        c.send({ embed: embed });
    }).catch(console.error);
}
if (message.content.toLowerCase().startsWith(prefix + `kapat`)) {
    if (!message.channel.name.startsWith(`yardım-`)) return message.channel.send(`Bunu oluşturduğun ticket kanalından kapatman gerek.`);

    message.channel.send(`Kapatmak istediğine emin misin? Kabul etmeden önce, bu kanalı kapatırsan geri getiremeyiz!\nKabul ediyorsan, \`-evet\` yaz. Hiçbir şey yazmazsan 10 saniye içerisinde otomatik olarak iptal olacaktır.`)
    .then((m) => {
      message.channel.awaitMessages(response => response.content === '-evet', {
        max: 1,
        time: 10000,
        errors: ['time'],
      })
      .then((collected) => {
          message.channel.delete();
        })
        .catch(() => {
          m.edit('Ticket kapatıldı.').then(m2 => {
              m2.delete();
          }, 3000);
        });
    });
}

});

client.on('message', msg => {
  if (msg.content.toLowerCase() === prefix + 'yetkili') {
    msg.reply('Yetkililerimiz şuanda sizlere aktif olarak hizmet vermeye çalışmakta yardım almak için Üst Rehber ve altını etiketleyebilirsiniz.');
  }
});
client.on('guildBanAdd' , (guild, user) => {
  let genel = guild.channels.find('name', 'genel-sohbet');
  if (!genel) return;
  genel.send('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif **Cya** ' + user.username +' ' );
});

client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

client.on("guildMemberAdd", member => {
	
	var channel = member.guild.channels.find("name", "hoşgeldiniz");
	if (!channel) return;
	
	var role = member.guild.roles.find("name", "RedMoon");
	if (!role) return;
	
	member.addRole(role);
	
	member.send("**RedMoon**'a hoşgeldin! Oyunun keyfini çıkarmadan önce Discord ve Oyun kurallarını okumayı ihmal etme!")
	
});

const lastChar = (str) => str.split('').reverse().join(',').replace(',', '')[str.length === str.length + 1 ? 1 : 0];
const emojiList = ['✅','❎'];
const emojiLetterList = ['🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯','🇰','🇱','🇲','🇳','🇴','🇵','🇶','🇷','🇸','🇹','🇺','🇻','🇼','🇽','🇾','🇿'];

function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms)
  })
}

client.on('message', message => {
  if(message.author.bot) return;
  
  if (message.content.startsWith("!" + "basitoylama")) { // Basit Oylama
    let splitCommand = message.content.split(" ");
    let time = parseFloat(splitCommand.slice(1).shift());
    let question = splitCommand.slice(2) + '';
    if (lastChar(question) != "?") {
      question += "?"
    }
    if (!(isNaN(time)) && (time <= 120)) {
      if (time >= 10) {
        message.channel.send('`'+question.replace(/,/g, ' ')+'` Oylama '+time+' dakika sonra sona erecektir.')
          .then(async function (message) {
            let reactionArray = [];
            reactionArray[0] = await message.react(emojiList[0]);
            reactionArray[1] = await message.react(emojiList[1]);

            if (time) {
              // Mesajı Geri Getir ve Oylama Sonuçlarını Al
              message.channel.fetchMessage(message.id)
                .then(async function (message) {
                  await sleep(time*60000)
                  var reactionCountsArray = [];                               
                  for (var i = 0; i < reactionArray.length; i++) {
                    reactionCountsArray[i] = message.reactions.get(emojiList[i]).count-1;
                  }

                  // Kazananları Bul
                  var max = -Infinity, indexMax = [];
                  for(var i = 0; i < reactionCountsArray.length; ++i)
                    if(reactionCountsArray[i] > max) max = reactionCountsArray[i], indexMax = [i];
                    else if(reactionCountsArray[i] === max) indexMax.push(i);

                  // Kazananları Görüntüle
                  console.log(reactionCountsArray); // Ayıklanan Oylar
                  var winnersText = "";
                  if (reactionCountsArray[indexMax[0]] == 0) {
                    winnersText = "No one voted!"
                  } else {
                    for (var i = 0; i < indexMax.length; i++) {
                      winnersText += emojiList[indexMax[i]] + " " + reactionCountsArray[indexMax[i]] + " oy\n";
                    }
                  }
                  message.channel.send("**`"+question.replace(/,/g, ' ')+"` için sonuçlar: ** " + winnersText);
                });
            }
          })
      } else {
        message.channel.send('Oylamayı 10 dakikadan az açamazsın!');
      }
    } else {
      message.channel.send('Oylamayı 2 saatten fazla açamazsın!');
    }
  }
  if (message.content.startsWith("!" + "cokluoylama")) { // Çoklu Oylama
    let splitCommand = message.content.split(" ");
    let time = parseFloat(splitCommand.slice(1).shift());
    let secondSection = (splitCommand.slice(2) + '').replace(/,/g, ' ');
    let secondSectionSplitted = secondSection.split(';');
    let question = secondSectionSplitted.slice(-1)[0]
    let options = secondSectionSplitted.slice(0, secondSectionSplitted.length-1)
    if (options.length > 20) {
      options = options.slice(0, 20)
    }
    console.log(options)
    if (lastChar(question) != "?") {
      question += "?"
    }
    if (!(isNaN(time)) && (time <= 120)) {
      if (time >= 10) {
        let optionText = ""
        let count = 0;
        for (var option in options) {
          console.log(option)
          optionText += "\n"+emojiLetterList[count]+" - "+options[option]
          count += 1
        }
        message.channel.send('`'+question.replace(/,/g, ' ')+'` Oylama '+time+' dakika sonra sona erecektir..')
          .then(async function (message) {
            let reactionArray = [];
            let count = 0;
            for (var option in options) {
              reactionArray[count] = await message.react(emojiLetterList[count]);
              count += 1
            }

            if (time) {
              // Mesajı Geri Getir ve Oylama Sonuçlarını Al
              message.channel.fetchMessage(message.id)
                .then(async function (message) {
                  await sleep(time*60000)
                  var reactionCountsArray = [];                               
                  for (var i = 0; i < reactionArray.length; i++) {
                    reactionCountsArray[i] = message.reactions.get(emojiLetterList[i]).count-1;
                  }

                  // Kazananları Bul
                  var max = -Infinity, indexMax = [];
                  for(var i = 0; i < reactionCountsArray.length; ++i)
                    if(reactionCountsArray[i] > max) max = reactionCountsArray[i], indexMax = [i];
                    else if(reactionCountsArray[i] === max) indexMax.push(i);

                  // Kazananları Görüntüle
                  console.log(reactionCountsArray); // Ayıklanan Oylar
                  var winnersText = "";
                  if (reactionCountsArray[indexMax[0]] == 0) {
                    winnersText = "No one voted!"
                  } else {
                    for (var i = 0; i < indexMax.length; i++) {
                      winnersText += emojiLetterList[indexMax[i]] + ": " + options[indexMax[i]] + " " + reactionCountsArray[indexMax[i]] + " oy\n";
                    }
                  }
                  message.channel.send('`'+question.replace(/,/g, ' ')+'` Oylama '+time+' dakika sonra sona erecektir.');
                });
            }
          })
      } else {
        message.channel.send('Oylamayı 10 dakikadan az açamazsın!');
      }
    } else {
      message.channel.send('Oylamayı 2 saatten fazla açamazsın!');
    }
  }
	  if (message.content.startsWith("!" + "philosoylama")) { // Oylama Komutları
    message.channel.send('`!philosoylama` - Buradaki komutları gösterir.');
    message.channel.send('`!basitoylama [zaman(dakika)] [soru]` - basit bir evet/hayır oylaması başlatır.');
    message.channel.send('`!cokluoylama [zaman(dakika)] [seçenek1;seçenek2;seçenek3;...] [soru]` - 20 seçeneğe kadar çıkabilen oylama başlatır.');
  }
});

client.login('NjUxNzczMjM3MDYzMzE5NTUz.Xegc3Q.0Eu4TH_9G-ML4aAfsINxyq_08Mk');