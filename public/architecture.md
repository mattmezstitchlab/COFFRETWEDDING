# World Wedding Magazine — France
## Audit et architecture additive — édition active 2026

### 1. Source auditée
Le fichier utilisateur 1790113740726_rxvb9f.html est conservé intégralement dans archive/world-wedding-original.html. Son empreinte SHA-256 figure dans archive/source-integrity.json.

L’entrée comporte 12 mariages fictifs de 2025, 12 lieux, 10 professionnels référencés par ID, 24 positions horaires par mariage, des scènes et trois types de blocs (texte, image, citation), une grille annuelle, une scène 3D, une carte, une timeline, un graphe, une vue magazine et l’éditeur intérieur. Certaines heures n’avaient pas de scène. Le bouton Sauvegarder n’effectuait aucune persistance. Les attributs onchange des champs contenaient des guillemets mal imbriqués.

### 2. Principe d’extension
Le fichier editor.html reprend le document d’origine et ajoute editor-bridge.js. La bibliothèque Three.js d’origine est servie localement. Les méthodes d’édition originales sont conservées, appelées par le pont de compatibilité, puis complétées par des gestionnaires de champs sûrs, une prévisualisation synchronisée et une sauvegarde réelle sur l’appareil. L’archive reste inchangée.

Le pont échange exclusivement avec le parent de même origine. Les valeurs textuelles sont échappées avant d’entrer dans les modèles HTML historiques. Le pont reçoit un instantané de la source lors de l’ouverture et remonte des mutations ciblées. Il n’est pas une seconde source persistante.

### 3. Source canonique — MagazineData, schemaVersion 2
- year : 2026.
- coffrets : 365 Coffret, chacun correspondant à une date unique de l’année.
- places : dictionnaire d’entités Place par ID, villes et régions géographiques, fiches démonstratrices.
- professionals : dictionnaire d’entités Professional par ID ; les 10 originaux sont conservés.
- media : fichiers, crédits, provenance, légende, type et références de coffrets.
- tours : collections éditoriales ordonnées de coffretIds, sans duplication des coffrets.
- favorites : identifiants de coffrets favoris.
- updatedAt : horodatage de modification.

### 4. Coffret
Identifiant stable, numéro d’édition (1 à 365), titre, sous-titre, surtitre, date, année, jour, mois, saison, couples, ambiance, lieu principal (ID), lieux secondaires (IDs), professionnels (IDs), couverture (ID média), récit, statut éditorial, source DEMO, relations typées et 24 moments.

Les 15 rubriques sont : identité ; territoire ; histoire ; lieu principal ; lieux secondaires ; professionnels ; activités ; transport ; hébergement ; gastronomie ; musique ; médias ; documents ; timeline ; relations. La couverture, la date et la saison sont des champs de premier niveau. Chaque rubrique est éditable.

### 5. Moment, scène, bloc
hours[0] à hours[23] existent pour tous les coffrets. Chaque moment possède son ID, son heure, son libellé, son titre et au moins une scène. Une scène conserve l’interface originale : titre, surtitre, sous-titre, chapô, blocs, médias, relations et statut. Un bloc conserve type, contenu, position, taille, métadonnées de provenance/vérification et relations.

Les scènes existantes sont préservées. Les heures auparavant vides reçoivent une proposition de récit ; les 353 nouvelles journées reçoivent 24 scènes contextualisées par ville, saison, identité et date. Les textes sont des intentions éditoriales et non des événements avérés.

### 6. Projections
- Grille : 12 mois, 365 jours, décalages de semaine corrects pour 2026, filtres territoriaux/temporels/de statut.
- Carte : contours GeoJSON des 13 régions métropolitaines, repères par ville et sélecteurs pour les 5 régions ultramarines.
- Fil du temps : chronologie annuelle, 24 moments ouvrant l’éditeur.
- Magazine : couvertures, récits et lecture des coffrets.
- Relations : références vers lieux, professionnels, médias, moments et tournées.
- Éditeur : interface historique intégrée ; son arbre donne accès à tous les coffrets et toutes les heures.
- Atelier 3D : 365 x 24 cellules adressables, caméra et contrôles de l’atelier original.
- Tournées : sélection, ajout, suppression de références, ordre d’étapes, export et distances géodésiques indicatives à vol d’oiseau.

### 7. Persistance et portabilité
IndexedDB : base world-wedding-magazine-france, version 1, object store source-commune, clé magazine. La sauvegarde différée est déclenchée après les mutations. Le bouton Sauvegarder force l’écriture et attend son résultat. Les échecs de stockage sont signalés. Le JSON complet est exportable/importable, avec validation des invariants. Un export de coffret inclut ses entités liées pour lecture hors ligne. Un export de tournée reste une liste ordonnée de références.

Les fichiers de médias importés sont conservés localement en Data URL (5 Mo maximum par fichier). Aucun stockage de données personnelles sur un serveur tiers. Pas de courrier envoyé.

### 8. Revendication et vérification
États démonstrateurs : available, claimed, verified. Une revendication saisit nom, email, organisation, rôle et consentement explicite au mode local. Une demande de vérification enregistre référence de justificatif et note de revue. La validation locale nécessite trois cases de contrôle ; elle est expressément un exercice de démonstration, sans certification indépendante. Aucune identité réelle n’est attestée.

### 9. Extension vers une exploitation collective
L’adaptateur de persistance peut être remplacé par une API transactionnelle sans changer les projections ni les IDs. Prévoir authentification, rôles (visiteur, contributeur, éditeur, vérificateur), politiques d’accès aux données de revendication, fichiers privés/signés, contrôle documentaire, journal d’événements append-only, contrôle de concurrence par révision, validation humaine et publication séparée des brouillons. Le prototype local ne prétend pas fournir ces fonctions serveur.

### 10. Provenance des visuels et carte
- Bastide provençale : illustration générée par IA, non documentaire.
- Château de Chenonceau : Sipal Photography, Pexels ; image illustrative.
- Patrimonio, Corse : SlimMars 13, Pexels ; paysage d’inspiration.
- Chalets enneigés : Ollie Craig, Pexels ; image illustrative.
- Contours régionaux simplifiés : jeu france-geojson de Grégoire David, servi localement.

Les noms, récits, disponibilités, prestataires et statuts du magazine ne doivent pas être pris pour des réservations ou des partenariats réels.
