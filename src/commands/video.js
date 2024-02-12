import ytSearch from "yt-search";
import youtubedl from "youtube-dl-exec";

export default {
  name: "video",
  description: "Descarga videos de Youtube.",
  alias: ["v", "vid", "videomp3"],
  use: "!video 'nombre o url del video'",

  run: async (socket, msg, args) => {
    try {
      const query = args.join(" ");

      if (!query) {
        return socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Ingresa el nombre o URL del vídeo que quieras ver, Ejemplo: !vid Minecraft.",
        });
      }

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "📹", key: msg.messages[0]?.key },
      });

      const video = (await ytSearch(query)).all.find((i) => i.type === "video");

      if (!video) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Sin resultados disponibles.",
        });

        return socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });
      }

      const { formats } = await youtubedl(video.url, {
        dumpSingleJson: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
      });

      const results = formats.filter((x) => {
        return x.vcodec !== "none" && x.acodec !== "none";
      });

      if (!results.length) {
        await socket.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Vídeo no disponible para su descargar.",
        });

        socket.sendMessage(msg.messages[0]?.key.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      const { url, filesize_approx, format_note } = results[results.length - 1];

      if (filesize_approx > 99999966.82) {
        await socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "No pude enviar el video ya que este supera el limite que puedo soportar :/.",
        });

        socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
          react: { text: "❌", key: msg.messages[0]?.key },
        });

        return;
      }

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        document: { url },
        fileName: video.title,
        mimetype: "video/mp4",
        caption: `*Duración:* ${video.timestamp}\n*Tamaño:* ${parseInt(
          filesize_approx / 1e6
        )} MB\n*Calidad:* ${format_note || "Desconocida"}`,
      });

      socket.sendMessage(msg.messages[0]?.key.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error(error);

      await socket.sendMessage(msg.messages[0].key.remoteJid, {
        text: "Acaba de suceder un error inesperado, vuelve a intentarlo, y si el error persiste contacta a: Wa.me/542215034412.",
      });

      socket.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "❌", key: msg.messages[0]?.key },
      });
    }
  },
};
