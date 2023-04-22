import { checkPermission, Type } from "../Permission";
import Command from "./Command";

export default new Command({
  name: "prefix",
  description: "Allows the server owner to set the command prefix for this server.",
  checksPermission: true,
  handler(resolve, message, args, serverStore, channelStore, client) {
    if (checkPermission(Type.SERVER_OWNER, message)) {
      serverStore.prefix = args[0];
      message.addReaction("a:done:865068195731341352");
    }
    else
      message.addReaction("a:error:865086676764983326");
    resolve();
  }
});
