const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeData() {
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
    const agendaWeekend = [];
    $(".detail").each((i, element) => {
      agendaWeekend.push($(element).html());
    });
    console.log(agendaWeekend);

    // Fermer l'instance de Puppeteer
    await browser.close();
  } catch (error) {
    console.error(error);
  }
}

scrapeData();
