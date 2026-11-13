import { mkdir, stat, writeFile } from "node:fs/promises";
import { common, formCopy, services, statusCopy, steps } from "./content.mjs";
import { renderNetworkLab } from "./network-lab.mjs";
import { methodDetails, serviceDetails, serviceExamples } from "./page-details.mjs";

const site = new URL("../", import.meta.url);
const globeKilobytes = Math.round((await stat(new URL("assets/media/zybo-globe.webp", site))).size / 1000);
const languages = ["fr", "nl", "en"];

const paths = {
  home: "index.html", solutions: "projects.html", method: "lab/index.html",
  contact: "contact.html", monitoring: "lab/monitoring.html", status: "server-status.html",
  ...Object.fromEntries(Object.entries(services).map(([key, service]) => [key, service.path])),
};

const icons = {
  arrow: 'M14 2.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0 0 1h6.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V10.5a.5.5 0 0 0 1 0z',
  down: 'M7.646 13.854a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L8.5 12.293V2.5a.5.5 0 0 0-1 0v9.793L4.354 9.146a.5.5 0 1 0-.708.708z',
  chevron: 'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708',
  window: 'M2.5 3A1.5 1.5 0 0 0 1 4.5V5h14v-.5A1.5 1.5 0 0 0 13.5 3zM15 6H1v5.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5zM0 4.5A2.5 2.5 0 0 1 2.5 2h11A2.5 2.5 0 0 1 16 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 11.5z',
  app: 'M2 1h4v6H2zm1 1v4h2V2zm5-1h6v4H8zm1 1v2h4V2zm-1 5h6v8H8zm1 1v6h4V8zM2 9h4v6H2zm1 1v4h2v-4z',
  flow: 'M1 1h5v4H4v2.5h8V10h-1V8.5H4V11h2v4H1v-4h2V5H1zm1 1v2h3V2zm0 10v2h3v-2zm8-1h5v4h-5zm1 1v2h3v-2z',
  lock: 'M5 6V4a3 3 0 1 1 6 0v2h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1 0h4V4a2 2 0 0 0-4 0zM4 7v7h8V7zm3.5 2h1v3h-1z',
  checklist: 'M1 1h14v14H1zm1 1v12h12V2zm1 4 .7-.7.8.8 1.8-2 .7.7-2.5 2.8zM8 5h4v1H8zm-5 6 .7-.7.8.8 1.8-2 .7.7-2.5 2.8zM8 10h4v1H8z',
  settings: 'M1 2h14v1H1zm0 5h14v1H1zm0 5h14v1H1zM4 1h2v3H4zm6 5h2v3h-2zm-5 5h2v3H5z',
};

function escape(value) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function icon(name) {
  return `<svg class="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="${icons[name]}" fill-rule="evenodd"/></svg>`;
}

function renderPage(page) {
  const prefix = "../".repeat(paths[page].split("/").length - 1) || "./";
  const href = (key, query = "") => prefix + paths[key] + query;
  const asset = name => prefix + "assets/" + name;
  const globe = (layout) => `<div class="${layout}" aria-hidden="true">
    <div class="hero-art-image" data-globe>
      <img class="hero-poster" src="${asset("media/zybo-globe.webp")}" width="900" height="790" alt="" fetchpriority="${page === "home" ? "high" : "low"}">
      <img class="moon-texture" src="${asset("media/zybo-moon.webp")}" width="256" height="256" alt="" decoding="async" fetchpriority="low" hidden>
      <canvas class="hero-globe"></canvas>
    </div>
  </div>`;
  const translations = {};
  const copy = (key, words, tag = "span", attributes = "") => {
    translations[key] = Object.fromEntries(languages.map((lang, i) => [lang, words[i]]));
    return `<${tag} data-copy="${key}"${attributes}>${escape(words[0])}</${tag}>`;
  };
  const paragraph = (key, words, className) => copy(key, words, "p", className ? ` class="${className}"` : "");
  const link = (key, words, url, className, glyph = "arrow") =>
    `<a class="${className}" href="${url}">${copy(key, words)}${glyph ? icon(glyph) : ""}</a>`;
  const example = key => {
    const { title, rows } = serviceExamples[key];
    return `<figure class="service-example">
      <figcaption>
        <span class="example-icon">${icon(services[key].icon)}</span>
        <span>
          ${copy("example.label", ["Exemple d’usage", "Praktijkvoorbeeld", "Example use case"], "span", ' class="example-label"')}
          ${copy(`example.${key}.title`, title, "strong")}
        </span>
      </figcaption>
      <dl>
        ${rows.map(([name, details], index) => `<div>
          ${copy(`example.${key}.name.${index}`, name, "dt")}
          ${copy(`example.${key}.details.${index}`, details, "dd")}
        </div>`).join("\n        ")}
      </dl>
    </figure>`;
  };
  const wordmark = `<span class="wordmark" aria-hidden="true">
    <span class="wordmark-bar wordmark-bar-top"></span>
    <span class="wordmark-bar wordmark-bar-bottom"></span>
    <span class="wordmark-letters wordmark-zy"><img src="${asset("logo-zy.png")}" alt="" width="88" height="42"></span>
    <span class="wordmark-letters wordmark-bo"><img src="${asset("logo-bo.png")}" alt="" width="96" height="43"></span>
  </span>`;
  const active = page === "method" ? "method" : page === "solutions" || page in services ? "solutions" : "";
  const nav = `<header class="site-header">
    <div class="wrap nav-shell">
      <a class="brand" href="${href("home")}" aria-label="Zybo">${wordmark}</a>
      <button class="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded="false">
        <span class="menu-lines" aria-hidden="true"></span>${copy("menu", ["Menu", "Menu", "Menu"])}
      </button>
      <nav id="main-navigation" class="main-nav" aria-label="Navigation principale">
        <a href="${href("solutions")}"${active === "solutions" ? ' aria-current="' + (page === "solutions" ? "page" : "true") + '"' : ""}>${copy("nav.expertise", common.expertise)}</a>
        <a href="${href("method")}"${active === "method" ? ' aria-current="page"' : ""}>${copy("nav.method", common.method)}</a>
        <a class="mobile-contact" href="${href("contact")}"${page === "contact" ? ' aria-current="page"' : ""}>${copy("nav.contact", common.contact)}</a>
      </nav>
      <div class="nav-actions">
        <details class="languages">
          <summary aria-label="Langue / Taal / Language"><span data-current-lang>FR</span>${icon("chevron")}</summary>
          <div class="language-list">
            <button type="button" data-language="fr" lang="fr" aria-pressed="true">Français</button>
            <button type="button" data-language="nl" lang="nl" aria-pressed="false">Nederlands</button>
            <button type="button" data-language="en" lang="en" aria-pressed="false">English</button>
          </div>
        </details>
        ${link("nav.contact", common.contact, href("contact"), "nav-contact")}
      </div>
    </div>
  </header>`;

  const footer = `<footer class="site-footer">
    <div class="wrap">
      <div class="footer-main">
        <div><a class="brand" href="${href("home")}" aria-label="Zybo">${wordmark}</a>
          ${paragraph("footer.about", ["Création web et solutions digitales.", "Webdesign en digitale oplossingen.", "Web design and digital solutions."])}</div>
        <div class="footer-links">
          ${Object.entries(services).map(([key, value]) => link("service." + key, value.name, href(key), "", "")).join("\n")}
        </div>
        <div class="footer-links">
          ${link("nav.method", common.method, href("method"), "", "")}
          ${link("nav.contact", common.contact, href("contact"), "", "")}
          ${link("nav.monitor", common.monitor, href("monitoring"), "", "")}
        </div>
      </div>
      <div class="footer-bottom"><span>© Zybo</span>${link("nav.status", common.status, href("status"), "", "")}</div>
    </div>
  </footer>`;

  const cta = (service = "") => `<section class="contact-section contact-close"><div class="wrap">
    <a class="contact-row" href="${href("contact", (service ? "?service=" + service : "") + "#contact-form")}">
      <div class="contact-row-copy">
        ${copy("cta.title", ["Écrire à Zybo", "Schrijf Zybo", "Write to Zybo"], "h2", " data-scan")}
        ${copy("cta.lead", ["Une demande, un site à revoir ou une question technique.", "Een aanvraag, een website om te vernieuwen of een technische vraag.", "An enquiry, a site to update or a technical question."])}
      </div>
      <span class="contact-arrow">${icon("arrow")}</span>
    </a>
  </div></section>`;

  const cards = () => `<div class="service-browser" data-service-browser>
    <div class="service-rows">
      ${Object.entries(services).map(([key, value]) => `<article class="service-card">
        <a href="${href(key)}" class="service-link" data-service="${key}">
          <span class="service-icon">${icon(value.icon)}</span>
          <div>${copy("service." + key, value.name, "h3")}${paragraph("short." + key, value.short)}</div>
          <span class="card-arrow">${icon("arrow")}</span>
        </a>
      </article>`).join("\n")}
    </div>
    <div class="service-preview" aria-hidden="true" data-service-preview data-active="web">
      ${Object.keys(services).map(key => `<div class="preview-panel${key === "web" ? " is-active" : ""}" data-preview="${key}">
        ${example(key)}
      </div>`).join("\n")}
    </div>
  </div>`;

  const process = () => `<div class="process-track" data-process>
    <div class="process-line" aria-hidden="true"><span class="process-packet"></span></div>
    <ol class="process-grid">
    ${steps.map(([name, body], index) => `<li><span class="step-index" aria-hidden="true">0${index + 1}</span>
      ${copy("step." + index, name, "h3")}
      ${paragraph("step.body." + index, body)}
    </li>`).join("\n")}
    </ol>
  </div>`;

  const pageHero = (label, headline, intro, side = "", action = "") => `<section class="page-hero">
    <div class="wrap page-hero-inner${side ? " split-hero" : ""}">
      <div class="page-hero-copy">
        ${paragraph("page.label", label, "eyebrow")}
        ${copy("page.headline", headline, "h1", ' data-scan')}
        ${paragraph("page.intro", intro, "page-intro")}${action ? "\n        " + action : ""}
      </div>${side ? "\n      " + side : ""}
    </div>
  </section>`;

  const featureList = (features) => `<div class="features-grid">
    ${features.map(([name, body], i) => `<article class="feature" data-reveal>
      ${copy("feature." + i, name, "h3")}${paragraph("feature.body." + i, body)}
    </article>`).join("\n")}
  </div>`;

  const detailRows = (key, entries) => `<ol class="detail-rows">
    ${entries.map(([heading, details], index) => `<li data-reveal>
      <span class="detail-index" aria-hidden="true">0${index + 1}</span>
      ${copy(key + "." + index, heading, "h3")}
      ${paragraph(key + ".body." + index, details)}
    </li>`).join("")}
  </ol>`;

  const faq = (entries) => `<section class="section faq-section"><div class="wrap faq-layout">
    ${copy("faq.title", ["Questions fréquentes", "Veelgestelde vragen", "Frequently asked questions"], "h2", " data-scan")}
    <div class="faq-list">${entries.map(([question, answer], i) => `<details>
      <summary>${copy("faq.q." + i, question)}<span aria-hidden="true">+</span></summary>
      ${paragraph("faq.a." + i, answer)}
    </details>`).join("")}</div>
  </div></section>`;

  const carousel = () => `<section class="section gallery-section"><div class="wrap" data-carousel>
    <div class="section-head">
      ${copy("gallery.title", ["Explorez nos expertises.", "Ontdek onze expertise.", "Explore our expertise."], "h2", ' id="gallery-title" data-scan')}
      <div class="gallery-controls" hidden>
        <button type="button" data-slide-direction="-1" aria-controls="service-slides"><span class="visually-hidden">${copy("gallery.prev", ["Précédent", "Vorige", "Previous"])}</span><span aria-hidden="true">←</span></button>
        <output data-slide-position aria-live="polite">01 / ${String(Object.keys(services).length).padStart(2, "0")}</output>
        <button type="button" data-slide-direction="1" aria-controls="service-slides"><span class="visually-hidden">${copy("gallery.next", ["Suivant", "Volgende", "Next"])}</span><span aria-hidden="true">→</span></button>
      </div>
    </div>
    <div class="service-slides" id="service-slides" tabindex="0" role="region" aria-labelledby="gallery-title">
      ${Object.entries(services).map(([key, service]) => `<article class="service-slide" data-slide>
        <div class="service-slide-copy">${copy("service." + key, service.name, "h3")}
          ${paragraph("short." + key, service.short)}
          ${link("gallery.open", ["Voir le service", "Bekijk de dienst", "Explore the service"], href(key), "slide-link")}
        </div>
        ${example(key)}
      </article>`).join("")}
    </div>
  </div></section>`;

  let body, title, description;

  if (page === "home") {
    title = ["Zybo · Studio digital et création web", "Zybo · Digitale studio en webdesign", "Zybo · Digital studio and web design"];
    description = ["Sites web, applications, automatisation, solutions informatiques, confidentialité et stockage, gestion personnelle.", "Websites, applicaties, automatisering, IT-oplossingen, privacy en opslag, persoonlijke organisatie.", "Websites, apps, automation, IT solutions, privacy and storage, and personal organisation."];
    body = `<section class="hero" data-pointer-area>
      <div class="hero-atmosphere" aria-hidden="true">
        <div class="atmosphere-grid"></div>
        <div class="atmosphere-stars"></div>
        <div class="atmosphere-orbits"><i></i><i></i><i></i></div>
      </div>
      ${globe("hero-art")}
      <div class="wrap hero-inner">
        <div class="hero-copy">
          ${copy("hero.label", ["Sites web, applications et automatisation", "Websites, apps en automatisering", "Websites, apps and automation"], "p", ' class="eyebrow" data-intro')}
          <h1 class="hero-title">
            <span class="hero-line">${copy("hero.title", ["Votre activité", "Uw bedrijf", "Your business"], "span", ' data-intro')}</span>
            <span class="hero-line">${copy("hero.accent", ["prend place.", "valt op.", "stands out."], "span", ' class="hero-accent" data-intro data-pointer-text')}</span>
          </h1>
          ${copy("hero.lead", ["Zybo aide les indépendants et les PME à présenter leurs services, automatiser les tâches répétitives et organiser leurs outils et leurs fichiers.", "Zybo helpt zelfstandigen en kmo’s hun diensten te tonen, terugkerende taken te automatiseren en tools en bestanden te organiseren.", "Zybo helps independent businesses and SMEs showcase their services, automate repetitive work and organise tools and files."], "p", ' class="hero-lead" data-intro')}
          <div class="hero-actions" data-intro>
            ${link("hero.start", common.start, href("contact"), "button button-primary magnetic")}
            ${link("hero.more", common.seeServices, "#expertises", "text-link hero-more", "down")}
          </div>
        </div>
      </div>
    </section>
    <section class="section expertise-section" id="expertises">
      <div class="wrap">
        <div class="section-head" data-reveal>
          ${copy("expertise.title", ["Nos expertises.", "Onze expertise.", "Our expertise."], "h2", " data-scan")}
          ${paragraph("expertise.lead", ["Créez votre présence en ligne, simplifiez vos tâches et organisez vos données.", "Bouw uw online aanwezigheid op, vereenvoudig taken en organiseer uw gegevens.", "Build your online presence, simplify tasks and organise your data."])}
        </div>
        ${cards()}
      </div>
    </section>
    <section class="section method-section home-method">
      <div class="wrap">
        <div class="section-head" data-reveal>
          ${copy("method.title", common.methodHeading, "h2", " data-scan")}
          ${link("method.link", ["Voir notre méthode", "Bekijk onze werkwijze", "See our process"], href("method"), "text-link")}
        </div>
        ${process()}
      </div>
    </section>
    ${renderNetworkLab(copy, paragraph, globeKilobytes)}
    ${cta()}`;
  } else if (page === "solutions") {
    title = ["Expertises · Zybo", "Expertise · Zybo", "Expertise · Zybo"];
    description = ["Créez votre site ou votre application, automatisez vos tâches et organisez vos outils, vos fichiers et votre quotidien.", "Maak een website of app, automatiseer taken en organiseer uw tools, bestanden en dagelijks werk.", "Build a website or app, automate tasks and organise your tools, files and daily work."];
    body = `${pageHero(common.expertise, ["Des outils adaptés à votre activité.", "Tools op maat van uw activiteit.", "Tools suited to your work."], description)}
      ${carousel()}
      <section class="section detail-section"><div class="wrap">
        <div class="section-head">${copy("solutions.uses", ["Quel est votre besoin ?", "Wat hebt u nodig?", "What do you need?"], "h2", " data-scan")}</div>
        ${detailRows("solutions.use", Object.values(services).map(service => [service.name, service.intro]))}
      </div></section>${cta()}`;
  } else if (page in services) {
    const service = services[page];
    const detail = serviceDetails[page];
    title = service.name.map(name => name + " · Zybo");
    description = service.short;
    body = `${pageHero(service.name, service.headline, service.intro, example(page), link("service.start", common.start, href("contact", "?service=" + page + "#contact-form"), "button button-primary"))}
      <section class="section feature-section"><div class="wrap">
        <div class="section-head">${copy("feature.heading", detail.handoff, "h2", " data-scan")}</div>
        ${featureList(service.features)}
      </div></section>
      <section class="section detail-section"><div class="wrap">
        <div class="section-head">${copy("detail.title", detail.heading, "h2", " data-scan")}</div>
        ${detailRows("detail", detail.items)}
      </div></section>
      ${faq(detail.questions)}
      <div class="wrap related-links">
        ${link("service.related", services[detail.related].name, href(detail.related), "text-link")}${page === "it" ? "\n        " + link("service.route", ["Voir le trajet d’un site", "Bekijk de route van een site", "See a website’s route"], href("home", "#trajet-web"), "text-link") : ""}
        ${link("service.all", common.allServices, href("solutions"), "text-link")}
      </div>${cta(page)}`;
  } else if (page === "method") {
    title = ["Notre méthode · Zybo", "Onze werkwijze · Zybo", "Our process · Zybo"];
    description = ["Voyez ce que nous préparons ensemble, ce que vous pouvez valider et ce que nous vérifions avant la publication.", "Bekijk wat we samen voorbereiden, wat u kunt goedkeuren en wat we vóór publicatie controleren.", "See what we prepare together, what you can review and what we check before launch."];
    body = `${pageHero(common.method, common.methodHeading, description, "", link("method.jump", ["Voir les étapes", "Bekijk de stappen", "See the steps"], "#etapes", "button button-outline", "down"))}
      <section id="etapes" class="section method-section home-method"><div class="wrap">
        <div class="section-head">${copy("method.steps", ["Quatre étapes, de l’idée au site.", "Vier stappen van idee naar website.", "Four steps from idea to website."], "h2", " data-scan")}</div>
        ${process()}
      </div></section>
      <section class="section detail-section"><div class="wrap">
        <div class="section-head">${copy("method.details", ["Ce que vous pouvez valider.", "Wat u kunt goedkeuren.", "What you can review."], "h2", " data-scan")}</div>
        ${detailRows("method.check", methodDetails)}
      </div></section>
      ${faq([serviceDetails.web.questions[1], serviceDetails.it.questions[0]])}
      <div class="wrap related-links">${link("method.route", ["Comprendre le domaine et l’hébergement", "Domein en hosting begrijpen", "Understand domains and hosting"], href("home", "#trajet-web"), "text-link")}</div>${cta()}`;
  } else if (page === "monitoring") {
    title = ["Monitoring · Zybo", "Monitoring · Zybo", "Monitoring · Zybo"];
    description = ["Découvrez comment suivre la disponibilité et les temps de réponse de pages, d’API et de services digitaux.", "Ontdek hoe u de beschikbaarheid en responstijd van pagina’s, API’s en digitale diensten volgt.", "See how to track the availability and response times of pages, APIs and digital services."];
    const features = [
      [["Disponibilité", "Beschikbaarheid", "Availability"], ["Vérifiez si vos pages et services répondent.", "Controleer of uw pagina’s en diensten antwoorden.", "Check whether your pages and services respond."]],
      [["Performances", "Prestaties", "Performance"], ["Repérez les lenteurs et les réponses inattendues.", "Merk trage en onverwachte antwoorden op.", "Spot slow and unexpected responses."]],
      [["Cas d’usage", "Toepassingen", "Use cases"], ["Tableaux de bord internes, suivi de pages stratégiques et reporting.", "Interne dashboards, opvolging van belangrijke pagina’s en rapportage.", "Internal dashboards, monitoring key pages and reporting."]],
    ];
    body = `${pageHero(common.monitor, ["Comprenez ce que votre site renvoie.", "Begrijp wat uw website terugstuurt.", "Understand how your website responds."], description, "", link("monitor.status", common.status, href("status"), "button button-primary"))}
      <section class="section feature-section"><div class="wrap">
        <div class="section-head">${copy("monitor.features", ["Trois façons de suivre un service.", "Drie manieren om een dienst te volgen.", "Three ways to monitor a service."], "h2", " data-scan")}</div>
        ${featureList(features)}
      </div></section>
      <section class="section detail-section"><div class="wrap">
        <div class="section-head">${copy("monitor.signals", ["Comment lire un contrôle HTTP.", "Een HTTP-controle lezen.", "How to read an HTTP check."], "h2", " data-scan")}</div>
        ${detailRows("monitor.signal", [
          [["200 OK", "200 OK", "200 OK"], ["Le service a répondu avec succès. Vérifiez le contenu si vous devez contrôler une fonction précise.", "De dienst heeft succesvol geantwoord. Controleer de inhoud als u een specifieke functie wilt testen.", "The service responded successfully. Check the content if you need to test a specific feature."]],
          [["404 ou 5xx", "404 of 5xx", "404 or 5xx"], ["Un 404 indique une ressource introuvable. Un 5xx signale une erreur côté serveur.", "Een 404 betekent dat de bron niet is gevonden. Een 5xx wijst op een serverfout.", "A 404 means the resource was not found. A 5xx signals a server-side error."]],
          [["Temps de réponse", "Responstijd", "Response time"], ["Le temps mesuré varie avec la connexion, l’emplacement et le traitement de la demande.", "De gemeten tijd varieert met verbinding, locatie en verwerking van het verzoek.", "The measured time varies with the connection, location and how the request is processed."]],
        ])}
      </div></section>${cta()}`;
  } else if (page === "status") {
    title = ["État des services · Zybo", "Servicestatus · Zybo", "Service status · Zybo"];
    description = ["Vérifiez la réponse de deux pages Zybo et de l’API publique de GitHub depuis votre connexion.", "Controleer vanaf uw verbinding het antwoord van twee Zybo-pagina’s en de openbare GitHub-API.", "Check how two Zybo pages and the public GitHub API respond from your connection."];
    body = `${pageHero(common.status, ["Disponibilité des services web.", "Beschikbaarheid van webdiensten.", "Web service availability."], description)}
      <section class="section status-section" data-status data-home="${href("home")}" data-contact="${href("contact")}"><div class="wrap">
        <div class="section-head">
          <div>${copy("status.heading", ["Résultats de votre connexion", "Resultaten van uw verbinding", "Results from your connection"], "h2", " data-scan")}
            ${paragraph("status.interval", ["Vérification toutes les 10 secondes pendant que cet onglet est visible.", "Controle om de 10 seconden zolang dit tabblad zichtbaar is.", "Checks run every 10 seconds while this tab is visible."])}</div>
          <button type="button" class="button button-dark" data-refresh>${copy("status.check", statusCopy.check)}</button>
        </div>
        <div class="status-grid" data-status-cards></div>
        <p class="last-check">${copy("status.last", statusCopy.last)} <time data-last-check aria-live="polite">—</time></p>
        <noscript>Activez JavaScript pour lancer les vérifications.</noscript>
      </div></section>
      <section class="section detail-section"><div class="wrap">
        <div class="section-head">${copy("status.guide", ["Interpréter le résultat.", "Het resultaat lezen.", "Reading the result."], "h2", " data-scan")}</div>
        ${detailRows("status.guide", [
          [["Temps de réponse", "Responstijd", "Response time"], ["Le compteur mesure le délai jusqu’à la réception des en-têtes HTTP dans votre navigateur.", "De teller meet de tijd tot uw browser de HTTP-headers ontvangt.", "The timer measures how long your browser takes to receive the HTTP headers."]],
          [["Une erreur depuis votre navigateur", "Een fout vanuit uw browser", "An error from your browser"], ["Une connexion interrompue ou un blocage du navigateur peut empêcher le test. Essayez aussi d’ouvrir la page concernée directement.", "Een verbroken verbinding of browserblokkering kan de test verhinderen. Probeer de pagina ook rechtstreeks te openen.", "A dropped connection or browser restriction can prevent the check. Try opening the affected page directly as well."]],
        ])}
        ${link("status.monitor", ["Comprendre le monitoring", "Monitoring begrijpen", "Understand monitoring"], href("monitoring"), "text-link")}
      </div></section>`;
    for (const [key, words] of Object.entries(statusCopy)) copy("status." + key, words);
  } else if (page === "contact") {
    title = ["Contact · Zybo", "Contact · Zybo", "Contact · Zybo"];
    description = ["Un site à créer, une application à développer ou une tâche à automatiser. Dites-nous ce dont vous avez besoin.", "Een website, een app of een taak om te automatiseren. Vertel ons wat u nodig hebt.", "A website, an app or a task to automate. Tell us what you need."];
    body = `<section class="contact-stage" aria-labelledby="contact-title">
      <div class="wrap contact-layout">
        <div class="contact-intro">
          ${paragraph("page.label", common.contact, "eyebrow")}
          ${copy("page.headline", ["Écrivez-nous.", "Schrijf ons.", "Write to us."], "h1", ' id="contact-title" data-scan')}
          ${paragraph("page.intro", description)}
          ${globe("contact-globe")}
        </div>
        <form class="contact-form" id="contact-form" action="https://formspree.io/f/xblzdnaj" method="post">
          ${copy("contact.form", ["Votre message", "Uw bericht", "Your message"], "h2")}
          <fieldset class="contact-topics" hidden>
            ${copy("contact.topics", ["Choisir un sujet", "Kies een onderwerp", "Choose a topic"], "legend")}
            <div>${Object.entries(services).map(([key, value]) => `<button type="button" data-contact-topic="${key}" aria-pressed="false">${icon(value.icon)}${copy("service." + key, value.name)}</button>`).join("")}</div>
          </fieldset>
          <div class="form-row">
            <div><label for="name">${copy("form.name", ["Nom", "Naam", "Name"])}</label><input id="name" name="name" autocomplete="name" required maxlength="120"></div>
            <div><label for="email">${copy("form.email", ["Adresse e-mail", "E-mailadres", "Email address"])}</label><input id="email" type="email" name="email" autocomplete="email" required maxlength="254"></div>
          </div>
          <div><label for="subject">${copy("form.subject", ["Sujet", "Onderwerp", "Subject"])}</label><input id="subject" name="subject" required maxlength="160"></div>
          <div><label for="message">${copy("form.message", ["Message", "Bericht", "Message"])}</label><textarea id="message" name="message" rows="4" required maxlength="6000" aria-describedby="contact-message-tip"></textarea>
            ${copy("contact.tip", ["Décrivez ce que vous aimeriez améliorer. Ajoutez le lien de votre site ou le nom de l’outil que vous utilisez, si cela aide à comprendre votre demande.", "Beschrijf wat u wilt verbeteren. Voeg indien nuttig uw webadres toe of noem de tool die u gebruikt.", "Describe what you want to improve. Include your website address or the name of the tool you use if it helps explain your request."], "p", ' id="contact-message-tip"')}
          </div>
          <button class="button button-primary" type="submit">${copy("form.submit", ["Envoyer le message", "Verstuur het bericht", "Send message"])}${icon("arrow")}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>
    ${faq([serviceDetails.web.questions[1], serviceDetails.web.questions[0]])}`;
    for (const [key, words] of Object.entries(formCopy)) copy("form." + key, words);
  }

  copy("meta.title", title);
  copy("meta.description", description);
  const skip = link("skip", ["Aller au contenu", "Naar de inhoud", "Skip to content"], "#main", "skip-link visually-hidden-focusable", "");
  const canonical = paths[page].replace(/index\.html$/, "");
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#101329">
  <title>${escape(title[0])}</title>
  <meta name="description" content="${escape(description[0])}">
  <link rel="canonical" href="https://zybo.be/${canonical}">
  <link rel="icon" href="${asset("logo-zybo.png")}" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Sans:wght@400..700&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-reboot.min.css">
  <link rel="stylesheet" href="${asset("style.css")}">
  <link rel="stylesheet" href="${asset("studio.css")}">
  <link rel="stylesheet" href="${asset("pages.css")}">${page === "home" ? `\n  <link rel="stylesheet" href="${asset("network-lab.css")}">` : ""}
  <script src="${asset("site.js")}" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>
  <script src="${asset("experience.js")}" defer></script>${page === "home" || page === "contact" ? `\n  <script src="${asset("globe.js")}" defer></script>` : ""}${page === "home" ? `\n  <script src="${asset("network-lab.js")}" defer></script>` : ""}
</head>
<body data-page="${page}">
  ${skip}
  ${nav}
  <main id="main" tabindex="-1">${body}</main>
  ${footer}
  <script type="application/json" id="translations">${JSON.stringify(translations).replaceAll("<", "\\u003c")}</script>
</body>
</html>
`;
}

await Promise.all(Object.entries(paths).map(async ([page, path]) => {
  const output = new URL(path, site);
  await mkdir(new URL(".", output), { recursive: true });
  await writeFile(output, renderPage(page));
}));

const retiredServicePages = ["legal/index.html", "marketing/index.html"];
await Promise.all(retiredServicePages.map(async path => {
  const output = new URL(path, site);
  await mkdir(new URL(".", output), { recursive: true });
  await writeFile(output, `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=../projects.html">
  <link rel="canonical" href="https://zybo.be/projects.html">
  <title>Expertises · Zybo</title>
</head>
<body><main><h1>Expertises Zybo</h1><p><a href="../projects.html">Voir les expertises</a></p></main></body>
</html>
`);
}));
