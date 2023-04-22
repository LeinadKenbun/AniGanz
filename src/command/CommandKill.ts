import Command from "./Command";
import { Message } from 'eris';

export default new Command({
  name: "kill",
  description: "Turn off the bot and stop the project",
  checksPermission: true,
  handler: async (resolve, message: Message, args, serverStore, channelStore, client) => {
    try {
      // Add any cleanup code you need here before shutting down the bot
      await message.addReaction("a:done:865068195731341352");
      process.exit(0);
    } catch (err) {
      console.error(err);
      await message.channel.createMessage("An error occurred while turning off the bot");
    }
  }
});