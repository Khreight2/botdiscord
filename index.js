const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const config = require('./Data/config.json');
const Discord = require("discord.js");
const DiscordServer = require("./Data/server.json");
const client = new Client({ 
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./Commands/${file}`);
	client.commands.set(command.data.name, command);
};

client.on('ready', () => {
	console.log(client.user.username + " est en ligne !");
});
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		return interaction.reply({
			content: ':pushpin: *Une erreur s\'est produite lors de l\'utilisation de la mmande.*', 
			ephemeral: true 
		});
	};
});
client.on('messageCreate', message => {
if(message.content.includes("@here") || message.content.includes("@everyone")) return false;
if(message.mentions.has(client.user)) {
	message.react("📌");
	const MentionEmbed = new Discord.MessageEmbed()
	.setColor("#5972FC")
	.setDescription(`\`🔌\` - ***Bonjour ! Mon prefix est \`${config.Prefix}\`***`)
	.setAuthor(message.author.username, message.author.displayAvatarURL())
	message.reply({
		embeds: [MentionEmbed],
		allowedMentions: {
		repliedUser: false,
	},
 });
};
});

client.on('messageDelete', message => {
	if(!message.partial) {
		let channel = client.channels.cache.find(channel => channel.name === DiscordServer.LogsChannel);
		if(channel) {
			const LogDeleteEmbed = new Discord.MessageEmbed()
			.setTitle("📌・Un message a été supprimé")
			.setColor("#FF4C4C")
			.setDescription(":beginner:***・Contenue du message*** \n" + message.content)
			.addField(":loudspeaker:・Auteur", "*・" + message.author.toString() + "*")
			.addField(":books: ・Channel", "*・" + message.channel.toString() + "*")
			.setTimestamp()
			channel.send({embeds: [LogDeleteEmbed]});
		};
	};
})
client.on('guildMemberAdd', guildMember => {
	let role = guildMember.guild.roles.cache.find(role => role.id == DiscordServer.WelcomeRoleID);
	guildMember.roles.add(role)
	let channel = client.channels.cache.find(channel => channel.name === DiscordServer.LogsChannel);
	const GuildMemberAddEmbed = new Discord.MessageEmbed()
	.setDescription(":wave:***・Un utilisateur a rejoint le Discord***")
	.setColor("#FFE94C")
	.addField(":loudspeaker:・User", "*・" + guildMember.toString() + "*")
	.setTimestamp()
	channel.send({
		embeds: [GuildMemberAddEmbed]
	});
});

client.on('guildMemberRemove', guildMember => {
	let channel = client.channels.cache.find(channel => channel.name === DiscordServer.LogsChannel);
	const GuildMemberAddEmbed = new Discord.MessageEmbed()
	.setDescription(":wave:***・Un utilisateur a quitté le Discord***")
	.setColor("#FFA04C")
	.addField(":loudspeaker:・User", "*・" + guildMember.toString() + "*")
	.setTimestamp()
	channel.send({
		embeds: [GuildMemberAddEmbed]
	});
});

client.on('messageReactionAdd', (reaction, user) => {
	if(reaction.message.channel.guild.id === config.guildID) {
		if(!user.bot) {
			if(reaction.emoji.name === '❗') {
				let channel = client.channels.cache.find(channel => channel.name === DiscordServer.LogsChannel);
				const ReportEmbed = new Discord.MessageEmbed()
				.setColor("#FF2D2D")
				.setTitle("📌・Un utilisateur a été report")
				.addField(":loudspeaker:・User", "*・" + reaction.message.author.toString() + "*")
				.addField(":octagonal_sign:・Message", "*・" + reaction.message.content + "*")
				.addField(":fleur_de_lis:・Author", "*・" + user.toString() + "*")
				.setTimestamp()
				channel.send({
					embeds: [ReportEmbed]
				});
				reaction.remove()
			};
			
		};
	};
});
client.login(config.Token);