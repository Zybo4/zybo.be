# Zybo.be

Site statique trilingue de Zybo. Les pages présentent la création web, la visibilité digitale, les solutions informatiques et la présentation immobilière. Le formulaire utilise la configuration Formspree du site existant.

## Prévisualiser

Depuis la racine du dépôt, démarrez un serveur statique et ouvrez [localhost:8000](http://localhost:8000).

```sh
python -m http.server 8000
```

Le bouton **Vue 3D** apparaît sur l’accueil lorsque le navigateur peut charger Three.js et créer un contexte WebGL 2. Le visuel fixe prend le relais sur les autres navigateurs et lorsque la réduction des animations est activée.

## Modifier le site

- Textes des services et de la méthode dans `scripts/content.mjs`.
- Gabarits, navigation et autres textes dans `scripts/build.mjs`.
- Styles dans `assets/style.css`, interactions dans `assets/site.js` et scène dans `assets/hero-3d.mjs`.

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
| [Three.js](https://github.com/mrdoob/three.js/tree/r180) | Géométrie, éclairage et rendu WebGL de la sculpture interactive. |
| [Motion](https://github.com/motiondivision/motion) | Animations d’apparition des sections au défilement. |
| [Google Fonts](https://github.com/google/fonts) | Typographies Bricolage Grotesque et DM Sans. |

Les bibliothèques et les polices distantes se chargent depuis leurs CDN. La page et la navigation restent utilisables si une ressource distante échoue. La sculpture fixe et le visuel immobilier sont des illustrations créées pour la refonte.

Les icônes dérivées de Bootstrap Icons sont distribuées sous licence MIT. Voir le [texte de la licence du dépôt](https://github.com/twbs/icons/blob/main/LICENSE).
