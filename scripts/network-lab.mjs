const equipmentIcons = {
  router: "M3 15a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm14 2v.01M13 17v.01M15 13v-2m-3.25-2.25a4 4 0 0 1 6.5 0M8.5 6.5a8 8 0 0 1 13 0",
  server: "M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm0 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM7 8v.01M7 16v.01",
  desktop: "M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm4 17h10m-5-4v4",
  switch: "M3 8h18v8H3zM7 12h1m3 0h1m3 0h1m3 0h1",
  internet: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM2 12h20M12 2c-5 5-5 15 0 20m0-20c5 5 5 15 0 20",
};

function equipmentIcon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${equipmentIcons[name]}"/></svg>`;
}

export function renderWebRoute(copy, paragraph) {
  const item = (key, words) => copy("route." + key, words);
  const phases = [
    ["dns", ["Résoudre le domaine", "Domein opzoeken", "Resolve the domain"], ["Le résolveur DNS renvoie une adresse IP. Le résultat peut déjà être en cache.", "De DNS-resolver geeft een IP-adres terug. Het resultaat kan al in de cache staan.", "The DNS resolver returns an IP address. The result may already be cached."], "A example.com", "192.0.2.42"],
    ["tls", ["Établir HTTPS", "HTTPS opzetten", "Establish HTTPS"], ["Le navigateur et le serveur négocient une connexion chiffrée. Le navigateur vérifie le certificat du domaine.", "De browser en server zetten een versleutelde verbinding op. De browser controleert het domeincertificaat.", "The browser and server negotiate an encrypted connection. The browser checks the domain’s certificate."], "TLS · ClientHello", "TLS · ServerHello"],
    ["http", ["Charger la page", "Pagina laden", "Load the page"], ["Sur la connexion HTTPS, le navigateur demande la page. Le serveur renvoie le HTML, puis le navigateur demande les styles, scripts et images nécessaires.", "Via HTTPS vraagt de browser de pagina op. De server stuurt HTML terug, waarna de browser stijlen, scripts en beelden opvraagt.", "Over HTTPS, the browser requests the page. The server returns HTML, then the browser requests styles, scripts and images."], "GET /", "200 OK · text/html"],
  ];
  return `<div class="route-panel" id="trajet-web" data-web-route data-phase="dns">
    <div class="route-heading">
      ${copy("route.title", ["Le trajet d’un site public.", "De route naar een openbare website.", "The route to a public website."], "h3", ' id="route-title" data-scan')}
      <div>
        ${paragraph("route.intro", ["Suivez les échanges déclenchés quand vous ouvrez example.com, avec une adresse IP de démonstration.", "Volg wat er gebeurt wanneer u example.com opent, met een voorbeeld-IP-adres.", "Follow what happens when you open example.com, using an example IP address."])}
        <button class="route-play" type="button" data-route-play hidden><span aria-hidden="true">↻</span> ${item("play", ["Rejouer le trajet", "Route opnieuw afspelen", "Replay the route"])}</button>
      </div>
    </div>
    <div class="route-map" aria-hidden="true">
      <svg class="route-wires" viewBox="0 0 600 180" preserveAspectRatio="none" fill="none">
        <path class="route-wire route-dns" data-path="dns-out" d="M88 132 V52 Q88 35 105 35 H300"/>
        <path class="route-wire route-dns route-return" data-path="dns-in" d="M300 52 H121 Q105 52 105 68 V132"/>
        <path class="route-wire route-web" data-path="web-out" d="M94 121 H506"/>
        <path class="route-wire route-web route-return" data-path="web-in" d="M506 144 H94"/>
        <path class="route-trail"/>
        <circle class="route-head" r="4"/>
      </svg>
      <span class="route-node route-resolver">${item("resolver", ["Résolveur DNS", "DNS-resolver", "DNS resolver"])}</span>
      <span class="route-node route-browser">${item("browser", ["Navigateur", "Browser", "Browser"])}</span>
      <span class="route-internet">Internet</span>
      <span class="route-node route-host">${item("host", ["Hébergement", "Hosting", "Hosting"])}</span>
    </div>
    <div class="route-readout" aria-hidden="true">
      ${phases.map(([key, , , request, reply]) => `<div data-route-log="${key}"><code class="route-out">↗ ${request}</code><code class="route-in">↙ ${reply}</code></div>`).join("")}
    </div>
    <ol class="route-steps">
      ${phases.map(([key, title, details, request, reply], i) => `<li data-route-step="${key}">
        <button type="button" data-phase-button="${key}" aria-pressed="${i === 0}"><span aria-hidden="true">0${i + 1}</span>${item(key, title)}</button>
        <div class="route-step-copy">${paragraph("route." + key + ".detail", details)}<code>${request} → ${reply}</code></div>
      </li>`).join("")}
    </ol>
    <dl class="route-terms">
      <div><dt>${item("domain", ["Nom de domaine", "Domeinnaam", "Domain name"])}</dt><dd>${item("domain.detail", ["L’adresse que vous enregistrez et renouvelez chez un bureau d’enregistrement.", "Het adres dat u registreert en verlengt bij een registrar.", "The address you register and renew with a domain registrar."])}</dd></div>
      <div><dt>DNS</dt><dd>${item("records", ["Un enregistrement A ou AAAA pointe vers une IP. Un CNAME sert d’alias vers un autre nom.", "Een A- of AAAA-record wijst naar een IP-adres. Een CNAME is een alias voor een andere naam.", "An A or AAAA record points to an IP address. A CNAME aliases another name."])}</dd></div>
      <div><dt>${item("hosting", ["Hébergement", "Hosting", "Hosting"])}</dt><dd>${item("hosting.detail", ["Le service qui publie les fichiers du site et les envoie au navigateur.", "De dienst die de sitebestanden publiceert en naar de browser stuurt.", "The service that publishes the site files and sends them to the browser."])}</dd></div>
    </dl>
  </div>`;
}

export function renderNetworkLab(copy, paragraph, globeKilobytes) {
  const label = (key, words) => copy("lab." + key, words);
  const card = (node, type, name) =>
    `<div class="lab-node lab-${node}" data-node="${node}">${equipmentIcon(type)}<span>${name}</span></div>`;
  const sizes = [
    ["mobile", ["Mobile", "Mobiel", "Mobile"], 390],
    ["tablet", ["Tablette", "Tablet", "Tablet"], 768],
    ["desktop", ["Bureau", "Desktop", "Desktop"], 1440],
  ];

  return `<section id="demo" class="section network-lab" aria-labelledby="network-lab-title" data-lab>
    <div class="wrap">
      <div class="section-head lab-heading">
        ${copy("lab.title", ["Du réseau à l'écran.", "Van netwerk naar scherm.", "From network to screen."], "h2", ' id="network-lab-title" data-scan')}
        ${paragraph("lab.intro", ["Suivez le trajet d’une page web, du réseau jusqu’à son affichage sur votre écran.", "Volg de route van een webpagina, van het netwerk tot uw scherm.", "Follow a web page from the network to your screen."])}
      </div>
      <div class="lab-grid">
        <section class="lab-card network-card" aria-labelledby="lab-topology-title">
          ${copy("lab.topology", ["Réseau local", "Lokaal netwerk", "Local network"], "h3", ' id="lab-topology-title"')}
          <div class="screen-switch lab-modes" role="group" aria-labelledby="lab-topology-title" hidden>
            <button type="button" data-network-mode="local" aria-pressed="true">${label("mode.local", ["Serveur local", "Lokale server", "Local server"])}</button>
            <button type="button" data-network-mode="internet" aria-pressed="false">${label("mode.internet", ["Vers Internet", "Naar internet", "To the internet"])}</button>
          </div>
          <div class="lab-topology" data-topology data-mode="local" data-direction="request" data-client="pc01">
            <svg class="lab-cables" viewBox="0 0 520 260" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path class="cable" d="M260 67 V104 M328 130 H426 V67 M426 16 V6 H94 V16 M260 155 V173 H94 V194 M260 173 V194 M260 173 H426 V194"/>
              ${[["pc01", "M94 194 V173 H260"], ["pc02", "M260 194 V173"], ["pc03", "M426 194 V173 H260"]].map(([client, path]) => `<path class="cable-signal" data-local="${client}" pathLength="100" d="${path} V67"/>
              <path class="cable-signal" data-internet="${client}" pathLength="100" d="${path} V130 H426 V6 H94 V16"/>`).join("\n              ")}
            </svg>
            ${card("internet", "internet", "Internet")}
            ${card("server", "server", label("server", ["Serveur web", "Webserver", "Web server"]))}
            ${card("switch", "switch", "Switch")}
            ${card("router", "router", label("router", ["Routeur", "Router", "Router"]))}
            ${card("pc01", "desktop", "PC-01")}
            ${card("pc02", "desktop", "PC-02")}
            ${card("pc03", "desktop", "PC-03")}
          </div>
          <div class="lab-terminal">
            <div class="terminal-top"><span aria-hidden="true">&gt;_</span> ${label("terminal", ["Terminal · simulation", "Terminal · simulatie", "Terminal · simulation"])}</div>
            <div class="terminal-lines">
              <p><span class="terminal-prompt" data-prompt>pc-01 $</span> <code data-command>curl -I http://192.168.1.10</code></p>
              <p><code data-result>HTTP/1.1 200 OK<br>content-type: text/html</code><span class="terminal-caret" aria-hidden="true"></span></p>
            </div>
          </div>
          <div class="lan-notes" data-network-notes data-mode="local">
            ${paragraph("lab.local-detail", ["Sur le même sous-réseau, le switch relie les postes au serveur local. Le routeur reste en attente.", "Binnen hetzelfde subnet verbindt de switch de pc’s met de lokale server. De router blijft inactief.", "On the same subnet, the switch connects the PCs to the local server. The router stays idle."], "lan-note lan-local")}
            ${paragraph("lab.internet-detail", ["Pour joindre une adresse extérieure, le poste passe par le switch puis par le routeur, sa passerelle vers Internet.", "Voor een extern adres gaat de pc via de switch naar de router, zijn toegang tot internet.", "For an external address, the PC goes through the switch to the router, its gateway to the internet."], "lan-note lan-internet")}
          </div>
        </section>
        <section class="lab-card screen-card" aria-labelledby="lab-screen-title">
          ${copy("lab.screen", ["La même page, trois écrans.", "Dezelfde pagina, drie schermen.", "One page, three screens."], "h3", ' id="lab-screen-title"')}
          <div class="screen-switch" role="group" aria-labelledby="lab-screen-title">
            ${sizes.map(([key, words, width]) => `<button type="button" data-viewport="${key}" data-width="${width}" aria-controls="responsive-example" aria-pressed="${key === "desktop"}">${label(key, words)}</button>`).join("")}
          </div>
          <div class="device-stage" aria-hidden="true">
            <div id="responsive-example" class="device-preview" data-device="desktop">
              <div class="demo-toolbar">
                <div class="demo-brand"><i></i><i></i></div>
                <div class="demo-nav"><i></i><i></i><i></i></div>
              </div>
              <div class="demo-page">
                <div class="demo-copy"><b></b><b></b><i></i><i></i><em></em></div>
                <div class="demo-media"><i></i><i></i><i></i></div>
              </div>
              <div class="demo-cards"><i></i><i></i><i></i></div>
            </div>
          </div>
          <p class="screen-width"><output data-screen-width>1440 px</output> ${label("width", ["de large", "breed", "wide"])}</p>
          <ul class="performance-list">
            <li>${label("fast", ["Des pages plus rapides à charger", "Pagina’s die sneller laden", "Faster page loads"])}
              <small>${label("fast-detail", ["Des images légères, comme le visuel du globe.", "Lichte afbeeldingen, zoals het beeld van de wereldbol.", "Lightweight images like the globe artwork."])}</small>
              <span class="asset-size"><span>WEBP</span> ${label("asset-weight", [`${globeKilobytes} ko`, `${globeKilobytes} kB`, `${globeKilobytes} kB`])}</span>
            </li>
            <li>${label("adaptive", ["Mise en page responsive", "Responsive lay-out", "Responsive layout"])} <small>${label("adaptive-detail", ["Colonnes, images et boutons s’adaptent à la largeur.", "Kolommen, beelden en knoppen passen zich aan de breedte aan.", "Columns, images and buttons adapt to the screen width."])}</small></li>
            <li>${label("clear", ["Lecture plus claire", "Helder leesbaar", "Easier to read"])} <small>${label("clear-detail", ["Titres lisibles et contenu organisé par priorité.", "Leesbare titels en inhoud op volgorde van belang.", "Readable headings and content ordered by priority."])}</small></li>
          </ul>
        </section>
      </div>
      ${renderWebRoute(copy, paragraph)}
    </div>
  </section>`;
}
