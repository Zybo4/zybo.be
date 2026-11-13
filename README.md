# Zybo.be

Site statique trilingue de Zybo. Les pages présentent la création web, les applications, l’automatisation, les solutions informatiques, la confidentialité et le stockage, ainsi que la gestion personnelle. Le formulaire utilise la configuration Formspree du site existant.

## Prévisualiser

Depuis la racine du dépôt, démarrez un serveur statique et ouvrez [localhost:8000](http://localhost:8000).

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Le globe de l'accueil suit le pointeur et change de réseau au défilement. Des satellites et un vaisseau relaient des signaux entre la Terre et la Lune dans une scène illustrative. « Du réseau à l'écran » montre la différence entre l’accès au serveur du réseau local et la sortie vers Internet via le routeur. Le parcours DNS, TLS et HTTP peut être rejoué en entier ou par étape. L’aperçu responsive présente une page sur trois formats d’écran. Le poids du visuel WebP du globe est calculé à la génération. Les titres se reconstruisent à chaque retour dans le champ de vision. Les scènes, les titres et le logo respectent la préférence de réduction des animations.

Dans VS Code, ouvrez la palette de commandes avec `Ctrl+Maj+P`, sélectionnez **Browser: Open Integrated Browser** et entrez l’adresse locale. L’aperçu HTML direct fonctionne aussi dans un dossier approuvé par VS Code.

## Modifier le site

- Textes des services et de la méthode dans `scripts/content.mjs` et `scripts/page-details.mjs`.
- Gabarits, navigation et autres textes dans `scripts/build.mjs`.
- Styles dans `assets/style.css`, `assets/studio.css` et `assets/pages.css`, interactions dans `assets/site.js` et `assets/experience.js`, globe dans `assets/globe.js`.
- Démonstration de l'accueil dans `scripts/network-lab.mjs`, `assets/network-lab.css` et `assets/network-lab.js`.

Après une modification des textes ou des gabarits, régénérez les pages HTML.

```sh
node scripts/build.mjs
```

Les pages générées sont suivies dans Git. Le workflow GitHub Pages de `main` publie directement le site statique. Le domaine est défini dans `CNAME`.

## Dépôts utilisés

| Dépôt | Utilisation |
| --- | --- |
| [Bootstrap](https://github.com/twbs/bootstrap/tree/v5.3.8) | Reboot pour la base des styles HTML. |
| [Bootstrap Icons](https://github.com/twbs/icons) | Icônes de navigation et de services intégrées au gabarit, avec adaptations pour certaines. |
| [GSAP](https://github.com/greensock/GSAP/tree/3.13.0) | Apparition des contenus au défilement avec ScrollTrigger, interactions au pointeur et transitions de l’aperçu responsive. |
| [Embla Carousel](https://www.embla-carousel.com/docs/v8/examples/predefined#scale) | Exemple « Scale » adapté au carrousel des expertises avec CSS Scroll Snap natif. |
| [Tabler Icons](https://github.com/tabler/tabler-icons) | Icônes vectorielles du routeur, du serveur et des postes, intégrées au gabarit. [Licence MIT](assets/TABLER-LICENSE.txt). |
| [Google Fonts](https://github.com/google/fonts) | Typographies Bricolage Grotesque et DM Sans. |
| [World Atlas](https://github.com/topojson/world-atlas) | Contours des terres issus de Natural Earth, avec un tracé simplifié local si le fichier distant échoue. |

Les bibliothèques et les polices distantes se chargent depuis leurs CDN. La page et la navigation restent utilisables si une ressource distante échoue. Le globe animé est utilisé sur l’accueil et la page Contact.

La composition et le rythme des transitions s’appuient sur le guide [Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) et sur le portfolio de [Locomotive](https://locomotive.ca/en).
Les transitions entre pages utilisent l’API [View Transitions](https://github.com/WICG/view-transitions) lorsque le navigateur la prend en charge.

Le trajet réseau est illustré à partir des explications de [Cisco sur les switches et les routeurs](https://www.cisco.com/site/us/en/learn/topics/networking/what-is-network-switching.html), du [guide MDN sur le Web](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works) et de la [documentation GitHub Pages sur les domaines](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

Le visuel lunaire utilise la carte LROC adaptée par Ernie Wright pour le [CGI Moon Kit de la NASA Scientific Visualization Studio](https://svs.gsfc.nasa.gov/4720/). La carte a été projetée sur une sphère éclairée et exportée en WebP pour l’accueil.

Les icônes dérivées de Bootstrap Icons sont distribuées sous licence MIT. Voir le [texte de la licence du dépôt](https://github.com/twbs/icons/blob/main/LICENSE).
