import express from "express";
import axios from "axios";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

const app = express();
let agendaWeekend = [];

app.use(express.json());

function getRootUrl() {
  const port = process.env.PORT || 8000;
  const dev = process.env.NODE_ENV !== "production";
  const ROOT_URL = dev
    ? `http://localhost:${port}`
    : "https://api.julienderache.fr";

  return ROOT_URL;
}

// Définir la tâche cron pour exécuter la fonction toutes les 3 heures
// cron.schedule("0 */3 * * *", async () => {
cron.schedule("* * * * *", async () => {
  try {
    // Lancer une instance de Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Naviguer vers la page web
    await page.goto(
      "https://escaut.fff.fr/recherche-clubs?scl=7178&tab=resultats&subtab=agenda"
    );

    // Récupérer le contenu de la page avec Axios
    const html = await page.content();

    // Charger le contenu avec Cheerio
    const $ = cheerio.load(html);

    // Utiliser Cheerio pour extraire les données
    agendaWeekend = [];
    $("div.detail").each((i, element) => {
      agendaWeekend.push($(element).html());
    });

    // Fermer l'instance de Puppeteer
    await browser.close();

    // Envoyer les données extraites à l'API
    await axios.post(`${getRootUrl()}/api`, agendaWeekend);

    const now = new Date();
    console.log(
      `Les données ont été envoyées à l'API à ${now.toLocaleTimeString()}.`
    );
  } catch (error) {
    console.error(error);
  }
});

app.get("/api", (req, res) => {
  res.send(agendaWeekend);
});

app.post("/api", (req, res) => {
  agendaWeekend.push(req.body);
  res.status(201).send("Données ajoutées avec succès.");
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Le serveur est en cours d'exécution sur le port.`);
});

export default app;
