const Nightmare = require("nightmare");
const express = require("express");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

const app = express();
let agendaWeekend = [];

app.use(express.json());

// Définir le port et l'URL de base
const PORT = process.env.PORT || 8000;
const ROOT_URL = process.env.ROOT_URL || `http://localhost:${PORT}`;

// Définir la tâche cron pour exécuter la fonction toutes les 3 heures
// cron.schedule("0 */3 * * *", async () => {
cron.schedule("* * * * *", async () => {
  try {
    const nightmare = Nightmare({ show: false });
    await nightmare.goto(
      "https://escaut.fff.fr/recherche-clubs?scl=7178&tab=resultats&subtab=agenda"
    );

    // Utiliser des sélecteurs CSS pour extraire les données
    agendaWeekend = await nightmare.evaluate(() => {
      const matches = Array.from(document.querySelectorAll("div.detail")).map(
        (element) => element.innerHTML
      );
      return matches;
    });

    await nightmare.end();

    // Envoyer les données extraites à l'API
    await axios.post(`${ROOT_URL}:${PORT}/api`, agendaWeekend);

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
  console.log(
    `Le serveur est en cours d'exécution sur ${ROOT_URL} et sur le port ${PORT}.`
  );
});
