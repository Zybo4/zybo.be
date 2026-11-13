export const serviceDetails = {
  web: {
    heading: ["Ce que votre site doit permettre de faire.", "Wat uw website mogelijk moet maken.", "What your website should help people do."],
    handoff: ["Pages et navigation", "Pagina’s en navigatie", "Pages and navigation"],
    items: [
      [["Présenter vos services", "Uw diensten voorstellen", "Present your services"], ["Une page par offre lorsque les besoins des visiteurs diffèrent.", "Een pagina per dienst wanneer bezoekers andere behoeften hebben.", "A page for each service when visitors have different needs."]],
      [["Recevoir des demandes", "Aanvragen ontvangen", "Receive enquiries"], ["Un accès direct au formulaire et des champs adaptés à la demande.", "Directe toegang tot het formulier met velden die bij de aanvraag passen.", "Direct access to the form with fields suited to the enquiry."]],
      [["Garder des pages légères", "Pagina’s licht houden", "Keep pages lightweight"], ["Des images dimensionnées à l’écran et un contrôle sur mobile avant la mise en ligne.", "Afbeeldingen op maat van het scherm en een mobiele controle vóór publicatie.", "Images sized for the screen and a mobile check before launch."]],
    ],
    questions: [
      [["Puis-je conserver mon nom de domaine ?", "Kan ik mijn domeinnaam behouden?", "Can I keep my domain name?"], ["Oui. Lors d’une refonte, le domaine peut rester chez son fournisseur actuel. On prépare la bascule vers le nouvel hébergement et on vérifie les réglages liés à la messagerie.", "Ja. Bij een redesign kan het domein bij de huidige provider blijven. We bereiden de overstap naar de nieuwe hosting voor en controleren de e-mailinstellingen.", "Yes. Your domain can stay with its current provider. We prepare the move to the new host and check the settings that affect email."]],
      [["Que préparer avant de commencer ?", "Wat bereid ik vooraf voor?", "What should I prepare?"], ["Une liste de vos services, vos coordonnées et, si vous en avez, votre logo, vos photos et l’adresse du site actuel.", "Een lijst van uw diensten, uw contactgegevens en eventueel uw logo, foto’s en huidige webadres.", "A list of your services and contact details, plus your logo, photos and current website address if you have them."]],
    ],
    related: "it",
  },
  apps: {
    heading: ["Du premier écran à l’usage quotidien.", "Van het eerste scherm tot dagelijks gebruik.", "From the first screen to everyday use."],
    handoff: ["Des applications qui répondent à un besoin", "Apps voor een concrete behoefte", "Apps for a practical need"],
    items: [
      [["Parcours et écrans", "Schermen en stappen", "Screens and journeys"], ["Définissez les actions à accomplir et testez leur enchaînement dans un prototype.", "Bepaal welke acties nodig zijn en test de volgorde in een prototype.", "Define the actions people need to take and test their sequence in a prototype."]],
      [["Rôles utilisateurs", "Gebruikersrollen", "User roles"], ["Identifiez qui saisit, consulte ou valide les informations.", "Bepaal wie gegevens invoert, bekijkt of goedkeurt.", "Identify who enters, views or approves information."]],
      [["Données existantes", "Bestaande gegevens", "Existing data"], ["Repérez les données à importer et les outils à connecter.", "Bepaal welke gegevens u importeert en welke tools u koppelt.", "Identify which data to import and which tools to connect."]],
    ],
    questions: [
      [["Peut-on partir d’un fichier Excel ?", "Kunnen we vertrekken van een Excel-bestand?", "Can we start from a spreadsheet?"], ["Oui. Un fichier existant aide à comprendre les champs, les calculs et les étapes à reprendre dans l’application.", "Ja. Een bestaand bestand toont welke velden, berekeningen en stappen de app nodig heeft.", "Yes. An existing spreadsheet helps identify the fields, calculations and steps the app needs."]],
    ],
    related: "automation",
  },
  automation: {
    heading: ["Déclenchement, traitement et suivi.", "Trigger, verwerking en opvolging.", "Trigger, processing and follow-up."],
    handoff: ["Des tâches à automatiser", "Taken om te automatiseren", "Tasks you can automate"],
    items: [
      [["Déclencheur", "Trigger", "Trigger"], ["Une nouvelle demande, une date ou un changement de statut démarre le traitement.", "Een aanvraag, datum of statuswijziging start de verwerking.", "An enquiry, a date or a status change starts the workflow."]],
      [["Étapes", "Stappen", "Steps"], ["Le processus récupère les informations utiles et les envoie vers les bons outils.", "De workflow haalt de nodige informatie op en stuurt die naar de juiste tools.", "The workflow collects relevant information and sends it to the right tools."]],
      [["Exceptions", "Uitzonderingen", "Exceptions"], ["Prévoyez quoi faire si une donnée manque ou si un service ne répond pas.", "Bepaal wat er gebeurt als gegevens ontbreken of een dienst niet reageert.", "Decide what happens when data is missing or a service fails to respond."]],
    ],
    questions: [
      [["Puis-je garder une validation manuelle ?", "Kan ik een handmatige goedkeuring behouden?", "Can I keep a manual approval step?"], ["Oui. Une étape peut attendre votre accord avant de reprendre le traitement.", "Ja. Een stap kan wachten op uw goedkeuring voordat de verwerking verdergaat.", "Yes. A step can wait for your approval before the workflow continues."]],
    ],
    related: "apps",
  },
  it: {
    heading: ["Les réglages qui font fonctionner votre site.", "De instellingen die uw site laten werken.", "The settings that keep your site working."],
    handoff: ["Configuration et accès", "Configuratie en toegang", "Configuration and access"],
    items: [
      [["Domaine et DNS", "Domein en DNS", "Domain and DNS"], ["Repérez le fournisseur du domaine et la zone DNS à modifier pour relier le site.", "Zoek de domeinprovider en de DNS-zone waarmee u de site koppelt.", "Identify the domain provider and the DNS zone that connects the site."]],
      [["Hébergement et HTTPS", "Hosting en HTTPS", "Hosting and HTTPS"], ["Associez le domaine à l’hébergement, puis vérifiez le certificat et l’ouverture du site.", "Koppel het domein aan de hosting en controleer het certificaat en de site.", "Connect the domain to the host, then check the certificate and confirm the site opens."]],
      [["Formulaires et accès", "Formulieren en toegang", "Forms and access"], ["Identifiez les comptes utiles et vérifiez où arrivent les demandes de contact.", "Breng de nodige accounts in kaart en controleer waar contactaanvragen aankomen.", "Identify the accounts you need and verify where contact enquiries arrive."]],
    ],
    questions: [
      [["Le domaine et l’hébergement doivent-ils être chez le même fournisseur ?", "Moeten domein en hosting bij dezelfde provider zitten?", "Do my domain and hosting need the same provider?"], ["Vous pouvez garder le domaine chez un fournisseur et héberger le site ailleurs. Les réglages DNS relient les deux.", "U kunt uw domein bij één provider houden en uw site elders hosten. DNS koppelt beide.", "You can keep the domain with one provider and host the site elsewhere. DNS connects the two."]],
      [["Que vérifier si le site ne répond plus ?", "Wat controleer ik als de site niet meer reageert?", "What should I check if the site stops responding?"], ["Commencez par tester l’adresse et le certificat, puis vérifiez la réponse de l’hébergement. Un test depuis une autre connexion aide à situer le problème.", "Test eerst het adres en het certificaat en controleer daarna het antwoord van de hosting. Een test via een andere verbinding helpt de oorzaak te vinden.", "Check the address and certificate first, then test the host’s response. Trying another connection can help locate the problem."]],
    ],
    related: "web",
  },
  privacy: {
    heading: ["Des fichiers organisés et des accès clairs.", "Geordende bestanden en duidelijke toegang.", "Organised files and clear access."],
    handoff: ["Stockage, partage et sauvegarde", "Opslag, delen en back-up", "Storage, sharing and backup"],
    items: [
      [["Faire l’inventaire", "Inventaris maken", "Take inventory"], ["Repérez les dossiers, leurs emplacements et les personnes qui les utilisent.", "Breng mappen, locaties en gebruikers in kaart.", "Identify your folders, their locations and who uses them."]],
      [["Structurer le partage", "Delen organiseren", "Organise sharing"], ["Distinguez les dossiers personnels, partagés et destinés aux invités.", "Maak onderscheid tussen persoonlijke, gedeelde en gastmappen.", "Separate personal, shared and guest folders."]],
      [["Préparer une restauration", "Herstel voorbereiden", "Plan a restore"], ["Définissez quoi récupérer en priorité si un fichier est perdu.", "Bepaal wat u eerst wilt herstellen als een bestand verloren gaat.", "Decide what to recover first if a file is lost."]],
    ],
    questions: [
      [["Puis-je garder mon espace de stockage actuel ?", "Kan ik mijn huidige opslagruimte behouden?", "Can I keep my current storage service?"], ["On commence par examiner vos outils et vos besoins. L’espace actuel peut être conservé s’il permet le partage et les sauvegardes dont vous avez besoin.", "We bekijken eerst uw tools en behoeften. U kunt uw huidige opslag behouden als die het nodige delen en back-uppen ondersteunt.", "We review your tools and needs first. You can keep your current storage if it supports the sharing and backups you need."]],
    ],
    related: "it",
  },
  management: {
    heading: ["Un espace adapté à votre quotidien.", "Een ruimte die bij uw dagelijkse werk past.", "A workspace for your daily routine."],
    handoff: ["Tâches, agenda et documents", "Taken, agenda en documenten", "Tasks, calendar and documents"],
    items: [
      [["Voir les prochaines actions", "Volgende stappen zien", "See what’s next"], ["Présentez les tâches à venir par projet ou par échéance.", "Bekijk komende taken per project of deadline.", "See upcoming tasks by project or deadline."]],
      [["Préparer la semaine", "De week voorbereiden", "Plan the week"], ["Regroupez les rendez-vous, les rappels et les échéances importantes.", "Bundel afspraken, herinneringen en belangrijke deadlines.", "Bring appointments, reminders and important deadlines together."]],
      [["Retrouver ses informations", "Informatie terugvinden", "Find your information"], ["Reliez les notes et fichiers utiles aux projets auxquels ils appartiennent.", "Koppel notities en bestanden aan de juiste projecten.", "Link useful notes and files to the projects they belong to."]],
    ],
    questions: [
      [["Dois-je changer d’agenda ou de liste de tâches ?", "Moet ik van agenda of takenlijst veranderen?", "Do I need a new calendar or task list?"], ["On part des outils que vous utilisez déjà et des habitudes qui vous conviennent.", "We vertrekken van de tools die u al gebruikt en de gewoontes die voor u werken.", "We start with the tools you already use and the habits that work for you."]],
    ],
    related: "automation",
  },
};

export const serviceExamples = {
  web: {
    title: ["Site d’un électricien", "Website van een elektricien", "An electrician’s website"],
    rows: [
      [["Prestations", "Diensten", "Services"], ["Dépannage, installation et entretien", "Herstellingen, installatie en onderhoud", "Repairs, installation and maintenance"]],
      [["Zone d’intervention", "Werkgebied", "Service area"], ["Les communes où l’électricien se déplace", "De gemeenten waar de elektricien werkt", "The areas the electrician covers"]],
      [["Demande de devis", "Offerte aanvragen", "Request a quote"], ["Un formulaire pour décrire les travaux", "Een formulier om de werken te beschrijven", "A form to describe the job"]],
    ],
  },
  apps: {
    title: ["Suivi des interventions", "Interventies opvolgen", "Job tracker"],
    rows: [
      [["Nouvelle demande", "Nieuwe aanvraag", "New request"], ["Le client décrit la panne", "De klant beschrijft de storing", "The customer describes the fault"]],
      [["Intervention planifiée", "Interventie gepland", "Job scheduled"], ["L’équipe assigne un technicien", "Het team wijst een technicus toe", "The team assigns a technician"]],
      [["Intervention terminée", "Interventie afgerond", "Job complete"], ["Le compte rendu est ajouté au dossier", "Het verslag komt in het dossier", "The report is added to the record"]],
    ],
  },
  automation: {
    title: ["Du formulaire au suivi client", "Van formulier naar klantopvolging", "From form to customer follow-up"],
    rows: [
      [["Déclencheur", "Trigger", "Trigger"], ["Un client envoie une demande", "Een klant verstuurt een aanvraag", "A customer submits a request"]],
      [["Action automatique", "Automatische actie", "Automated action"], ["Une fiche est créée et l’équipe est avertie", "De tool maakt een fiche en meldt dit aan het team", "The tool creates a record and alerts the team"]],
      [["Validation", "Goedkeuring", "Approval"], ["Vous relisez le devis avant l’envoi", "U kijkt de offerte na vóór verzending", "You review the quote before sending it"]],
    ],
  },
  it: {
    title: ["Mise en service d’un site", "Een website in gebruik nemen", "Getting a website online"],
    rows: [
      [["Domaine", "Domein", "Domain"], ["Relier l’adresse à l’hébergement", "Het adres koppelen aan de hosting", "Connect the address to the hosting service"]],
      [["Accès", "Toegang", "Access"], ["Identifier les comptes et leurs responsables", "De accounts en hun beheerders vastleggen", "Identify the accounts and who manages them"]],
      [["Formulaire", "Formulier", "Form"], ["Vérifier où arrivent les demandes", "Controleren waar aanvragen aankomen", "Check where enquiries are delivered"]],
    ],
  },
  privacy: {
    title: ["Dossiers partagés avec des clients", "Mappen delen met klanten", "Folders shared with clients"],
    rows: [
      [["Dossier interne", "Interne map", "Internal folder"], ["Accès réservé à l’équipe", "Alleen toegankelijk voor het team", "Access for the team only"]],
      [["Dossier client", "Klantmap", "Client folder"], ["Les fichiers que le client peut consulter", "De bestanden die de klant kan bekijken", "Files the client can view"]],
      [["Sauvegarde", "Back-up", "Backup"], ["Une copie et une méthode pour la restaurer", "Een kopie en een manier om die terug te zetten", "A copy and a way to restore it"]],
    ],
  },
  management: {
    title: ["Organisation d’un indépendant", "Planning voor een zelfstandige", "A freelancer’s workspace"],
    rows: [
      [["Aujourd’hui", "Vandaag", "Today"], ["Préparer les devis à envoyer", "Te versturen offertes voorbereiden", "Prepare the quotes to send"]],
      [["Cette semaine", "Deze week", "This week"], ["Voir les rendez-vous et échéances", "Afspraken en deadlines bekijken", "See appointments and deadlines"]],
      [["Par projet", "Per project", "By project"], ["Retrouver les notes et les documents", "Notities en documenten terugvinden", "Find notes and documents"]],
    ],
  },
};

export const methodDetails = [
  [["Un périmètre clair", "Een duidelijke scope", "A clear scope"], ["Rassemblez les services à présenter, les coordonnées et les contenus déjà disponibles. Nous déterminons ensemble les pages prioritaires.", "Verzamel diensten, contactgegevens en bestaande inhoud. Samen bepalen we welke pagina’s prioriteit krijgen.", "Gather the services, contact details and existing content. Together we decide which pages come first."]],
  [["Une version à parcourir", "Een versie om te bekijken", "A version you can browse"], ["Vous pouvez parcourir la première version et signaler les changements utiles avant les derniers ajustements.", "U kunt de eerste versie bekijken en nuttige wijzigingen doorgeven vóór de afwerking.", "Browse the first version and flag any changes before the finishing touches."]],
  [["Une vérification avant publication", "Een controle vóór publicatie", "A pre-launch check"], ["On teste les liens, l’envoi du formulaire, la navigation au clavier et l’affichage aux tailles d’écran courantes.", "We testen links, het formulier, toetsenbordnavigatie en de weergave op gangbare schermformaten.", "We test links, the form, keyboard navigation and the layout at common screen sizes."]],
  [["Les accès pour la suite", "Toegang voor later", "Access for what comes next"], ["Nous faisons le point sur le domaine, l’hébergement et les accès dont vous aurez besoin pour suivre le site.", "We overlopen domein, hosting en de toegang die u nodig hebt om de site op te volgen.", "We review the domain, hosting and access you’ll need to look after the site."]],
];
