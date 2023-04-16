import fetch from "node-fetch";
import { Embed, Message, TextableChannel } from "eris";

export async function query(query: string, variables?: any) {
  return fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      query,
      variables
    })
  }).then(res => res.json());
}

const alIdRegex = /anilist\.co\/anime\/(.\d*)/;
const malIdRegex = /myanimelist\.net\/anime\/(.\d*)/;

export async function getMediaId(input: string): Promise<number | null> {
  // First we try directly parsing the input in case it's the standalone ID
  const output = parseInt(input);
  if (output)
    return output;

  // If that fails, we try parsing it with regex to pull the ID from an AniList link
  let match = alIdRegex.exec(input);
  // If there's a match, parse it and return that
  if (match)
    return parseInt(match[1]);

  // If that fails, we try parsing it with another regex to get an ID from a MAL link
  match = malIdRegex.exec(input);
  // If we can't find a MAL ID in the URL, just return null;
  if (!match)
    return null;

  return await query("query($malId: Int){Media(idMal:$malId){id}}", {malId: match[1]}).then(res => {
    if (res.errors) {
      console.log(JSON.stringify(res.errors));
      return;
    }

    return res.data.Media.id;
  });
}

export function getFromNextDays(days: number = 1) {
  return new Date(new Date().getTime() + (24 * 60 * 60 * 1000 * days));
}

const streamingSites = [
  "Official Site",
  "Adult Swim",
  "Amazon",
  "Asian Crush",
  "Azuki",
  "Bilibili",
  "Bilibili TV",
  "CONtv",
  "Crunchyroll",
  "Disney Plus",
  "Funimation",
  "HBO Max",
  "Hidive",
  "Hulu",
  "iQIYI",
  "Midnight Pulp",
  "Netflix",
  "RetroCrush",
  "Sony Crackle",
  "Tubi TV",
  "Viewster",
  "Vimeo",
  "Viz",
  "VRV",
  "Youtube",
];

export function createAnnouncementEmbed(entry: any, date: Date, upNext?: boolean): Embed {
  let description = `Episode ${entry.episode} of [**${entry.media.title.english}**](${entry.media.siteUrl})${upNext ? "" : " has just Aired !!! <a:yay:833360479648743444>\n<@&833228900799873044> "}`;
  if (entry.media.externalLinks && entry.media.externalLinks.length > 0) {
    const streams = [];
    entry.media.externalLinks.forEach((site: { site: string, url: string }) => {
      if (streamingSites.find(s => s.toLowerCase() === site.site.toLowerCase()))
        streams.push(`[${site.site}](${site.url})`);
    });

    description += "\n\n" + (streams.length > 0 ? "Watch: " + streams.join(" • ") + "\n\nIt may take some time to appear on the above service(s)" : "No licensed streaming links available");
  }

  const format = !entry.media.format ? "" : `Format: ${entry.media.format.includes("_") ? displayify(entry.media.format) : entry.media.format}`;
  const episodes = !entry.media.episodes ? "" : `${entry.media.format.includes("_") ? displayify(entry.media.episodes) : entry.media.episodes} Episode(s)`;  
  const duration = !entry.media.duration ? "" : `Duration: ${formatTime(entry.media.duration * 60)}`;
  const studio = !entry.media.studios || entry.media.studios.edges.length === 0 ? "" : `Studio: ${entry.media.studios.edges[0].node.name}`;

  return {
    color: entry.media.coverImage.color ? parseInt(entry.media.coverImage.color.substr(1), 16) : 43775,
    image: {
      url: entry.media.bannerImage
    },
    author: {
      name: "WeebElves",
      url: "https://anichart.net/airing",
      icon_url: "https://media.discordapp.net/attachments/595551516442624019/848915878812450856/elves.png"
    },
    description,
    timestamp: date,
    footer: {
            text: [format, episodes, duration, studio,].filter(e => e.length > 0).join(" • ")
    }
  } as Embed;
}

function displayify(enumVal: string): string {
  const words = enumVal.split("_");
  for (let i = 0; i < words.length; i++)
    words[i] = words[i].substr(0, 1) + words[i].toLowerCase().substr(1);

  return words.join(" ");
}

export function parseTime(seconds: number) {
  let weeks = Math.floor(seconds / (3600 * 24 * 7));
  seconds -= weeks * 3600 * 24 * 7;
  let days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  let hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return { weeks, days, hours, minutes, seconds };
}

export function formatTime(seconds: number, appendSeconds?: boolean) {
  const time = parseTime(seconds);

  let ret = "";
  if (time.weeks > 0)
    ret += time.weeks + "w";
  if (time.days > 0)
    ret += (ret.length === 0 ? "" : " ") + time.days + "d";
  if (time.hours > 0)
    ret += (ret.length === 0 ? "" : " ") + time.hours + "h";
  if (time.minutes > 0)
    ret += (ret.length === 0 ? "" : " ") + time.minutes + "m";

  if (appendSeconds && time.seconds > 0)
    ret += (ret.length === 0 ? "" : " ") + time.seconds + "s";

  return ret;
}

export function reply(message: Message, content: string): Promise<Message<TextableChannel>> {
  return message.channel.createMessage({
    content,
    messageReferenceID: message.id
  });
}
