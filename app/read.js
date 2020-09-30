const bodyParser = require("body-parser");
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

const id = require("./id");

const Episode = require("./modelsEpisode");
const getEpisode = require("./spotifyEpisode");

// Lendo/chamando arquivos
mongoose.connect(id.mongodb, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

// Cores de cada embed dos programas
const colors = {
  Xêpa: 1315860,
  "Inferno Astral": 7421905,
  Bicuda: 6064811,
  "Não Ouvo": 16767504,
  "Se Eu Fosse Você": 15974098,
};

const regexGetGuildId = /\d{18}/gm;

// Procurando URL do episódio no banco
async function findURL(idDiscord) {
  const procurar = await Episode.findOne({ idDiscord });
  return procurar;
}

async function mountEmbed() {
  const episode = await getEpisode();
  const resultRegex = id.botURL.match(regexGetGuildId);
  if (!resultRegex) {
    throw new Error("Não pegou id do discord");
  }
  const idDiscord = resultRegex[0];
  // Recebendo EPISODE separando em variáveis

  const {
    name: nome,
    description: desc,
    images: [img],
    external_urls: urlEpisode,
  } = episode.items[0];

  const episodeFind = await findURL(idDiscord);
  if (!episodeFind || episodeFind.spotify !== urlEpisode.spotify) {
    // Criando variáveis com o split do nome

    const [nome_bot, ...titulo] = nome.split(/(?: #| -)+/);
    const body = {
      username: "Não Ouvo Podcasts",
      content: `<@&${id.role_id}>`,
      embeds: [
        {
          author: {
            name: `${nome_bot}`,
          },
          description: `${titulo.join(" -").trim()} \n\n${desc}`,
          color: `${colors[nome_bot]}`,
          fields: [
            {
              name: "Link:",
              value: `${urlEpisode.spotify}`,
            },
          ],
          image: {
            url: `${img.url}`,
          },
          footer: {
            icon_url: "https://i.imgur.com/Dgbq5ph.png",
            text:
              "Todos os podcasts da família Não Salvo. Um programa diferente por dia. Segunda: Xêpa! | Terça: Inferno Astral | Quarta: Bicuda | Quinta: Não Ouvo | Sexta: Se Eu Fosse Você",
          },
        },
      ],
    };

    async function saveURL(urlEpisode) {
      if (episodeFind) {
        episodeFind.spotify = urlEpisode.spotify;
        await episodeFind.save();
      } else {
        const body = {
          idDiscord,
          spotify: urlEpisode.spotify
        }
        const newEp = new Episode(body)
        await newEp.save()
      }

    }

    saveURL(urlEpisode);

    return body;
  }
  console.log("Old EP");
}

async function getMessage() {
  try {
    const body = await mountEmbed();
    if (body) {
      await axios({
        method: "POST",
        url: id.botURL,
        headers: { "Content-Type": "application/json" },
        data: body,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

// ROTAS
app.get("/", function (req, res) {
  res.json({ ok: true });
});

app.get("/newepisode", (req, res) => {
  getMessage();
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server on");
});
