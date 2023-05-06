const {Client, IntentsBitField } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
});
const prefix = "!";

client.on('ready', (c) => {
    console.log(`It is I, ${c.user.username}, here to slay ultimates`);
})

client.on("messageCreate", async(message) => {
    if(!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    //implements search functionality
    if(command === "search") {
        //joins all the elements together and converts it to lowercase
        const itemName = args.join(' ').toLowerCase();

        //Searches xivapi for items related to desired item
        const itemSearchUrl = `https://xivapi.com/search?string=${itemName}&indexes=item&columns=ID,Name,Icon`;

        //asks axios to search xivapi, waiting for a response from ti
        let response = await axios.get(itemSearchUrl);
        let itemSearchResults = response.data;

        //Stores results into one array, adding a number value to it
        const itemIds = itemSearchResults.Results.map((result, index) =>  {
            const number = index + 1;
            return(`${number}. ${result.Name}`)
        })

        const itemIdsString = itemIds.join('\n');

        message.reply(`Searching for items with keyword "${itemName}": \n${itemIdsString} \nEnter number corresponding to desired item:`);
        const filter = (m) => m.author.id === message.author.id
        const collector = message.channel.createMessageCollector({filter: filter, time:15000});

        collector.on('collect', async(m) => {
            const numResponse = m.content.trim();
            if(numResponse > itemIds.length){
                message.channel.send("why didn't you send a proper value :(");
            }
            else {
                const selectedItemId = itemSearchResults.Results[numResponse - 1].ID;
                const itemDataUrl = `https://xivapi.com/item/${selectedItemId}`;
                const itemResponse = await axios(itemDataUrl);
                const itemData = itemResponse.data;
                const itemName = itemData.Name;

                const marketDataUrl = `https://universalis.app/api/v2/Ragnarok/${selectedItemId}`;
                const marketResponse = await axios.get(marketDataUrl);
                const marketData = marketResponse.data;

                const priceperUnit = marketData.listings.map((price, index) => {
                    const number = index + 1;
                    return(`${number}. ${price.pricePerUnit}`)
                });

                const priceper = priceperUnit.join('\n');

                message.reply(`Prices per unit are: \n ${priceper}`);

            }
            collector.stop();
        })

        collector.on('end', (collected) => {
            if(collected.length === 0) {
                message.channel.send("why didn't you send a proper value :(");
            }
        })
    }
})


client.login('MTEwNDEzMjcyODcxMjA4OTYyMg.GDfYdg.n9XtxNIuomocfBBOlItbgvvUUaAwvP2qgTxj6w');