import { getMediaId, reply } from "../Util";
import Command from "./Command";
import { checkPermission } from "../Permission";

export default new Command({
  name: "watch",
  description: "Adds a new anime to watch for in this channel. You can use the AniList ID, AniList URL, or MyAnimeList URL. Multiple series can be added at the same time.",
  checksPermission: true,
  handler: async (resolve, message, args, serverStore, channelStore, client) => {
    if (!checkPermission(serverStore.permission, message)) {
      message.addReaction("a:error:865086676764983326");
      return resolve();
    }

    const failures: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const watchId = await getMediaId(args[i]);
      if (!watchId || channelStore.shows.includes(watchId)) {
        failures.push(args[i])
        continue;
      }

      channelStore.shows.push(watchId);
    }

    if (failures.length > 0) {
      await reply(message, `There were issues adding ${failures
        .map(f => f.startsWith("https://") ? `<${f}>` : f)
        .reduce((prev, curr, idx) => idx === 0 ? curr : prev + ", " + curr)}`);
    }

    message.addReaction(failures.length === args.length ? "a:error:865086676764983326" : failures.length > 0 ? "a:pusabow:534674497257865216" : "a:done:865068195731341352");
    resolve();
  }
});
