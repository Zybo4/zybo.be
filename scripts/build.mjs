import { writeFile } from "node:fs/promises";
import { common, formCopy, services, statusCopy, steps } from "./content.mjs";

const site = new URL("../", import.meta.url);
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
  graph: 'M0 0h1v14h15v1H0zm3 8h2v4H3zm4-3h2v7H7zm4-4h2v11h-2z',
  cpu: 'M5 0h1v2h1.5V0h1v2H10V0h1v2h1a2 2 0 0 1 2 2v1h2v1h-2v1.5h2v1h-2V10h2v1h-2v1a2 2 0 0 1-2 2h-1v2h-1v-2H8.5v2h-1v-2H6v2H5v-2H4a2 2 0 0 1-2-2v-1H0v-1h2V8.5H0v-1h2V6H0V5h2V4a2 2 0 0 1 2-2h1zM4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm1 2h6v6H5zm1 1v4h4V6z',
  buildings: 'M1 2h8v4h6v9H1zm1 1v11h3v-3h2v3h1V3zm7 4v7h5V7zM3 4h1v2H3zm3 0h1v2H6zM3 7h1v2H3zm3 0h1v2H6zm4 1h1v2h-1zm2 0h1v2h-1z',
};

function escape(value) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function icon(name) {
  return `<svg class="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="${icons[name]}" fill-rule="evenodd"/></svg>`;
}

function visual(key, asset) {
  const art = {
    web: '<div class="browser-art"><div class="browser-bar"><i></i><i></i><i></i></div><div class="browser-inner"><div class="browser-copy"><i></i><i></i><i></i><i></i></div><div class="browser-shape"></div></div><div class="browser-foot"><i></i><i></i><i></i></div></div>',
    visibility: '<div class="graph-art"><i></i><i></i><i></i><i></i><i></i><i></i><span></span></div>',
    it: '<div class="chip-art"><div class="chip-board"><i></i><i></i><i></i><i></i><div class="chip-core"></div></div></div>',
    estate: `<img src="${asset("media/immobilier.jpg")}" alt="" width="1000" height="667" loading="lazy">`,
  };
  return `<div class="service-art art-${key}" aria-hidden="true">${art[key]}</div>`;
}

function renderPage(page) {
  const prefix = "../".repeat(paths[page].split("/").length - 1) || "./";
  const href = (key, query = "") => prefix + paths[key] + query;
  const asset = name => prefix + "assets/" + name;
  const translations = {};
  const copy = (key, words, tag = "span", attributes = "") => {
    translations[key] = Object.fromEntries(languages.map((lang, i) => [lang, words[i]]));
    return `<${tag} data-copy="${key}"${attributes}>${escape(words[0])}</${tag}>`;
  };
  const paragraph = (key, words, className) => copy(key, words, "p", className ? ` class="${className}"` : "");
  const link = (key, words, url, className, glyph = "arrow") =>
    `<a class="${className}" href="${url}">${copy(key, words)}${glyph ? icon(glyph) : ""}</a>`;
  const wordmark = `<img src="${asset("logo-zybo.png")}" alt="" width="500" height="500">`;
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

  const cta = (service = "") => `<section class="section contact-section"><div class="wrap">
    <div class="contact-band">
      <div>${copy("cta.title", common.ctaTitle, "h2")}${paragraph("cta.lead", common.ctaLead)}</div>
      ${link("cta.start", common.start, href("contact", service ? "?service=" + service : ""), "button button-white")}
    </div>
  </div></section>`;

  const cards = () => `<div class="service-grid">
    ${Object.entries(services).map(([key, value]) => `<article class="service-card" data-reveal>
      <a href="${href(key)}" class="service-link">
        ${visual(key, asset)}
        <div class="service-info">
          <div class="service-icon">${icon(value.icon)}</div>
          <div>${copy("service." + key, value.name, "h3")}${paragraph("short." + key, value.short)}</div>
          <span class="card-arrow">${icon("arrow")}</span>
        </div>
      </a>
    </article>`).join("\n")}
  </div>`;

  const process = () => `<ol class="process-grid">
    ${steps.map(([name, body], index) => `<li data-reveal><span class="step-index" aria-hidden="true">0${index + 1}</span>
      ${copy("step." + index, name, "h3")}
      ${paragraph("step.body." + index, body)}
    </li>`).join("\n")}
  </ol>`;

  const pageHero = (label, headline, intro, side = "", action = "") => `<section class="page-hero">
    <div class="wrap page-hero-inner${side ? " split-hero" : ""}">
      <div class="page-hero-copy">
        ${paragraph("page.label", label, "eyebrow")}
        ${copy("page.headline", headline, "h1")}
        ${paragraph("page.intro", intro, "page-intro")}${action ? "\n        " + action : ""}
      </div>${side ? "\n      " + side : ""}
    </div>
  </section>`;

  const featureList = (features) => `<div class="features-grid">
    ${features.map(([name, body], i) => `<article class="feature" data-reveal>
      ${copy("feature." + i, name, "h3")}${paragraph("feature.body." + i, body)}
    </article>`).join("\n")}
  </div>`;

  let body, title, description;

  if (page === "home") {
    title = ["Zybo · Studio digital et création web", "Zybo · Digitale studio en webdesign", "Zybo · Digital studio and web design"];
    description = ["Zybo accompagne les indépendants et les PME en création web, visibilité digitale, solutions informatiques et présentation immobilière.", "Zybo helpt zelfstandigen en kmo’s met webdesign, digitale zichtbaarheid, IT-oplossingen en vastgoedpresentatie.", "Zybo helps independent businesses and SMEs with web design, digital visibility, IT solutions and property presentation."];
    body = `<section class="hero">
      <div class="hero-scene" aria-hidden="true" data-scene>
        <img class="hero-poster" src="${asset("media/zybo-sculpture.jpg")}" width="1280" height="853" alt="" fetchpriority="high">
        <div class="hero-canvas" data-canvas></div>
      </div>
      <button type="button" class="scene-toggle" data-scene-toggle aria-pressed="false" hidden>${copy("hero.scene", ["Vue 3D", "3D-weergave", "3D view"])}</button>
      <div class="wrap hero-inner">
        <div class="hero-copy">
          ${paragraph("hero.label", common.about, "eyebrow")}
          <h1>${copy("hero.title", ["Faites grandir votre présence", "Laat uw aanwezigheid", "Grow your presence"])}
            ${copy("hero.accent", ["en ligne.", "online groeien.", "online."], "span", ' class="hero-accent"')}</h1>
          ${paragraph("hero.lead", ["Zybo crée des sites web, améliore votre visibilité et simplifie vos outils digitaux. Pour les indépendants, les PME et les porteurs de projets.", "Zybo bouwt websites, vergroot uw zichtbaarheid en vereenvoudigt uw digitale tools. Voor zelfstandigen, kmo’s en iedereen met een project.", "Zybo builds websites, improves your visibility and simplifies your digital tools. For independent businesses, SMEs and new ventures."], "hero-lead")}
          <div class="hero-actions">
            ${link("hero.start", common.start, href("contact"), "button button-primary")}
            ${link("hero.more", common.seeServices, "#expertises", "button button-outline", "down")}
          </div>
        </div>
      </div>
    </section>
    <section class="section expertise-section" id="expertises">
      <div class="wrap">
        <div class="section-head">
          ${copy("expertise.title", ["Comment Zybo peut vous aider", "Hoe Zybo u kan helpen", "How Zybo can help"], "h2")}
          ${paragraph("expertise.lead", ["Choisissez le service qui répond à votre besoin, de la création d’un site à la mise en valeur d’un bien.", "Kies de dienst die bij uw vraag past, van een nieuwe website tot de presentatie van een pand.", "Find the right service for your needs, from building a website to showcasing a property."])}
        </div>
        ${cards()}
      </div>
    </section>
    <section class="section method-section">
      <div class="wrap">
        <div class="section-head">
          ${copy("method.title", common.methodHeading, "h2")}
          ${link("method.link", ["Voir notre méthode", "Bekijk onze werkwijze", "See our process"], href("method"), "text-link")}
        </div>
        ${process()}
      </div>
    </section>
    ${cta()}`;
  } else if (page === "solutions") {
    title = ["Expertises · Zybo", "Expertise · Zybo", "Expertise · Zybo"];
    description = ["Explorez les services de Zybo en création web, visibilité digitale, informatique et présentation immobilière.", "Ontdek Zybo’s diensten voor webdesign, digitale zichtbaarheid, IT en vastgoedpresentatie.", "Explore Zybo’s web design, digital visibility, IT and property presentation services."];
    body = `${pageHero(common.expertise, ["Des solutions digitales pour votre activité.", "Digitale oplossingen voor uw activiteit.", "Digital solutions for your business."], description)}
      <section class="section expertise-section"><div class="wrap">${cards()}</div></section>${cta()}`;
  } else if (page in services) {
    const service = services[page];
    title = service.name.map(name => name + " · Zybo");
    description = service.short;
    body = `${pageHero(service.name, service.headline, service.intro, visual(page, asset), link("service.start", common.start, href("contact", "?service=" + page), "button button-primary"))}
      <section class="section feature-section"><div class="wrap">
        <div class="section-head">${copy("feature.heading", ["Ce que nous pouvons faire pour vous", "Wat we voor u kunnen doen", "What we can do for you"], "h2")}</div>
        ${featureList(service.features)}
        ${link("service.all", common.allServices, href("solutions"), "text-link")}
      </div></section>${cta(page)}`;
  } else if (page === "method") {
    title = ["Notre méthode · Zybo", "Onze werkwijze · Zybo", "Our process · Zybo"];
    description = ["Découvrez comment Zybo définit, crée, optimise et prépare votre projet pour la mise en ligne.", "Ontdek hoe Zybo uw project uitwerkt, optimaliseert en klaarmaakt voor publicatie.", "See how Zybo defines, designs, refines and prepares your project for launch."];
    body = `${pageHero(common.method, common.methodHeading, description)}
      <section class="section method-section"><div class="wrap">${process()}</div></section>${cta()}`;
  } else if (page === "monitoring") {
    title = ["Monitoring · Zybo", "Monitoring · Zybo", "Monitoring · Zybo"];
    description = ["Découvrez comment suivre la disponibilité et les temps de réponse de pages, d’API et de services digitaux.", "Ontdek hoe u de beschikbaarheid en responstijd van pagina’s, API’s en digitale diensten volgt.", "See how to track the availability and response times of pages, APIs and digital services."];
    const features = [
      [["Disponibilité", "Beschikbaarheid", "Availability"], ["Vérifiez si vos pages et services répondent.", "Controleer of uw pagina’s en diensten antwoorden.", "Check whether your pages and services respond."]],
      [["Performances", "Prestaties", "Performance"], ["Repérez les lenteurs et les réponses inattendues.", "Merk trage en onverwachte antwoorden op.", "Spot slow and unexpected responses."]],
      [["Cas d’usage", "Toepassingen", "Use cases"], ["Tableaux de bord internes, suivi de pages stratégiques et reporting.", "Interne dashboards, opvolging van belangrijke pagina’s en rapportage.", "Internal dashboards, monitoring key pages and reporting."]],
    ];
    body = `${pageHero(common.monitor, ["Suivez vos services web.", "Volg uw webdiensten op.", "Monitor your web services."], description, "", link("monitor.status", common.status, href("status"), "button button-primary"))}
      <section class="section feature-section"><div class="wrap">${featureList(features)}</div></section>${cta()}`;
  } else if (page === "status") {
    title = ["État des services · Zybo", "Servicestatus · Zybo", "Service status · Zybo"];
    description = ["Démonstration de suivi de la disponibilité et de la latence de pages Zybo et de l’API publique de GitHub.", "Demo voor de beschikbaarheid en responstijd van Zybo-pagina’s en de publieke GitHub-API.", "A demonstration of availability and latency checks for Zybo pages and the public GitHub API."];
    body = `${pageHero(common.status, ["Disponibilité des services web.", "Beschikbaarheid van webdiensten.", "Web service availability."], description)}
      <section class="section status-section" data-status data-home="${href("home")}" data-contact="${href("contact")}"><div class="wrap">
        <div class="section-head">
          <div>${copy("status.heading", ["Services surveillés", "Gecontroleerde diensten", "Monitored services"], "h2")}
            ${paragraph("status.interval", ["Vérification automatique toutes les 10 secondes.", "Automatische controle om de 10 seconden.", "Checks run automatically every 10 seconds."])}</div>
          <button type="button" class="button button-dark" data-refresh>${copy("status.check", statusCopy.check)}</button>
        </div>
        <div class="status-grid" data-status-cards></div>
        <p class="last-check">${copy("status.last", statusCopy.last)} <time data-last-check aria-live="polite">—</time></p>
        <noscript>Activez JavaScript pour lancer les vérifications.</noscript>
      </div></section>`;
    for (const [key, words] of Object.entries(statusCopy)) copy("status." + key, words);
  } else if (page === "contact") {
    title = ["Contact · Zybo", "Contact · Zybo", "Contact · Zybo"];
    description = ["Contactez Zybo pour discuter d’une création de site, d’une refonte, de votre visibilité, de vos outils ou d’une présentation immobilière.", "Neem contact op met Zybo over een website, redesign, digitale zichtbaarheid, tools of vastgoedpresentatie.", "Contact Zybo to discuss a website, redesign, digital visibility, IT tools or property presentation."];
    body = `${pageHero(common.contact, common.start, description)}
      <section class="section form-section"><div class="wrap contact-layout">
        <aside class="contact-aside">
          ${copy("contact.aside", ["Sur quoi pouvons-nous vous aider ?", "Waarmee kunnen we u helpen?", "What can we help you with?"], "h2")}
          <div class="contact-services">
            ${Object.entries(services).map(([key, value]) => `<a href="${href(key)}">${icon(value.icon)}${copy("service." + key, value.name)}${icon("arrow")}</a>`).join("\n")}
          </div>
        </aside>
        <form class="contact-form" id="contact-form" action="https://formspree.io/f/xblzdnaj" method="post">
          ${copy("contact.form", ["Décrivez votre projet", "Beschrijf uw project", "Tell us about your project"], "h2")}
          <div class="form-row">
            <div><label for="name">${copy("form.name", ["Nom", "Naam", "Name"])}</label><input id="name" name="name" autocomplete="name" required maxlength="120"></div>
            <div><label for="email">${copy("form.email", ["Adresse e-mail", "E-mailadres", "Email address"])}</label><input id="email" type="email" name="email" autocomplete="email" required maxlength="254"></div>
          </div>
          <div><label for="subject">${copy("form.subject", ["Sujet", "Onderwerp", "Subject"])}</label><input id="subject" name="subject" required maxlength="160"></div>
          <div><label for="message">${copy("form.message", ["Message", "Bericht", "Message"])}</label><textarea id="message" name="message" rows="6" required maxlength="6000"></textarea></div>
          <button class="button button-primary" type="submit">${copy("form.submit", ["Envoyer le message", "Verstuur het bericht", "Send message"])}${icon("arrow")}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div></section>`;
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
  <meta name="theme-color" content="#080d20">
  <title>${escape(title[0])}</title>
  <meta name="description" content="${escape(description[0])}">
  <link rel="canonical" href="https://zybo.be/${canonical}">
  <link rel="icon" href="${asset("logo-zybo.png")}" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Sans:wght@400..700&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-reboot.min.css">
  <link rel="stylesheet" href="${asset("style.css")}">
  <script src="${asset("site.js")}" defer></script>
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

await Promise.all(Object.entries(paths).map(([page, path]) => writeFile(new URL(path, site), renderPage(page))));
