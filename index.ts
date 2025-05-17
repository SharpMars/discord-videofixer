import { $ } from "bun";
import {
  ActivityType,
  AttachmentBuilder,
  Client,
  GatewayIntentBits,
} from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("I am ready!");
  client.user?.setActivity({
    name: "Thou shall have your videos fixed.",
    type: ActivityType.Custom,
  });
});

client.on("error", (error) => {
  console.error(error);
});

client.on("messageCreate", async (message) => {
  if (message.member?.id == client.user?.id || message.attachments.size == 0)
    return;

  const attachments: AttachmentBuilder[] = [];

  for (const attachment of message.attachments) {
    if (attachment[1].contentType === "video/mp4") {
      const raw_metadata =
        await $`ffprobe -v quiet -print_format json -show_format -show_streams ${attachment[1].proxyURL}`.json();

      const audio = raw_metadata.streams[1];
      if (audio.profile === "HE-AACv2") {
        const fixedVideo = (
          await $`ffmpeg -i ${attachment[1].proxyURL} -c:v copy -f mp4 -movflags 'frag_keyframe+empty_moov' -`.quiet()
        ).bytes();
        attachments.push(
          new AttachmentBuilder(Buffer.from(fixedVideo), {
            name: attachment[1].name,
          })
        );
      }
    }
  }

  message.reply({
    content: "Thy video wast broken. I mended it for convenience of all.",
    files: [...attachments],
  });
});

client.login(TOKEN);
