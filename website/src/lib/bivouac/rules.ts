export const rulesMap: Record<string, {
  bivouac: "allowed" | "restricted" | "forbidden" | "unknown";
  comment: string;
  sources?: string[];
}> = {

    /* =========================
       PARCS NATIONAUX (PN)
       ========================= */

    FR3300001: {
        bivouac: "restricted",
        comment: "Le bivouac est généralement interdit dans le cœur du parc national sauf zones expressément autorisées (souvent à proximité de refuges) et uniquement entre 19h et 9h. En aire d’adhésion, il peut être toléré selon communes.",
        sources: ["https://www.vanoise-parcnational.fr"]
    },

    FR3300002: {
        bivouac: "restricted",
        comment: "Parc national marin + terrestre. Bivouac interdit dans les zones strictes terrestres sauf secteurs réglementés (ex: zones de refuge encadrées), très fortement limité.",
        sources: ["https://www.portcros-parcnational.fr"]
    },

    FR3300003: {
        bivouac: "restricted",
        comment: "Dans le cœur du parc, bivouac uniquement autorisé dans des zones définies (souvent près de refuges) entre 19h et 9h. Hors cœur, règles locales.",
        sources: ["https://www.pyrenees-parcnational.fr"]
    },

    FR3300004: {
        bivouac: "restricted",
        comment: "Bivouac interdit hors zones dédiées dans le cœur du parc. Toléré uniquement dans secteurs aménagés ou près de refuges sous conditions horaires.",
        sources: ["https://www.cevennes-parcnational.fr"]
    },

    FR3300005: {
        bivouac: "restricted",
        comment: "Bivouac très encadré dans le cœur du parc : uniquement zones autorisées, généralement près des refuges, entre 19h et 9h.",
        sources: ["https://www.ecrins-parcnational.fr"]
    },

    FR3300006: {
        bivouac: "restricted",
        comment: "Bivouac interdit en dehors des zones autorisées dans le cœur du parc. Autorisation limitée aux abords de refuges avec horaires réglementés.",
        sources: ["https://www.mercantour-parcnational.fr"]
    },

    FR3300010: {
        bivouac: "restricted",
        comment: "Parc national avec forte pression touristique : bivouac interdit sauf zones réglementées spécifiques (refuges, secteurs autorisés) et horaires stricts.",
        sources: ["https://www.calanques-parcnational.fr"]
    },

    FR3300011: {
        bivouac: "forbidden",
        comment: "Règles dépendant des zones (îles / littoral / forêt). Bivouac globalement interdit hors zones explicitement autorisées.",
        sources: ["https://www.guadeloupe-parcnational.fr"]
    },

    FR3300009: {
        bivouac: "forbidden",
        comment: "Réglementation stricte en zones de cœur amazonien. Bivouac généralement interdit sauf autorisation spécifique scientifique ou encadrée.",
        sources: ["https://www.reunion-parcnational.fr"]
    },

    FR3300008: {
        bivouac: "restricted",
        comment: "Parc amazonien : accès très réglementé. Bivouac uniquement dans cadre autorisé (missions, itinéraires encadrés).",
        sources: ["https://www.parc-amazonien-guyane.fr"]
    },

    FR3300007: {
        bivouac: "restricted",
        comment: "Zones terrestres protégées : bivouac interdit hors zones spécifiques encadrées.",
        sources: ["https://www.guadeloupe-parcnational.fr"]
    },

    FR3500001: {
        bivouac: "forbidden",
        comment: "Réserve intégrale : interdiction totale de bivouac (zone de protection maximale).",
        sources: ["https://www.vanoise-parcnational.fr"]
    },

    FR3500002: {
        bivouac: "forbidden",
        comment: "Îlots protégés en zone stricte : accès et bivouac interdits.",
        sources: ["https://www.portcros-parcnational.fr"]
    },

    FR3500003: {
        bivouac: "forbidden",
        comment: "Zone protégée stricte : bivouac interdit sauf dérogation scientifique.",
        sources: ["https://www.ecrins-parcnational.fr"]
    },

    FR3500004: {
        bivouac: "forbidden",
        comment: "Réserve intégrale : interdiction stricte de toute activité nocturne dont bivouac.",
        sources: ["https://www.parcsnationaux.fr"]
    },

    /* =========================
       RNCF (Réserves nationales chasse/faune)
       ========================= */

    FR5100001: {
        bivouac: "restricted",
        comment: "Réserve orientée gestion faune/chasse. Accès possible mais bivouac généralement interdit ou soumis à autorisation préalable.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100002: {
        bivouac: "restricted",
        comment: "Zone sensible (Bauges). Bivouac encadré voire interdit selon secteurs.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100004: {
        bivouac: "restricted",
        comment: "Réserve de faune : bivouac non autorisé sauf dérogation explicite.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100005: {
        bivouac: "restricted",
        comment: "Zone de protection faunistique : bivouac interdit sauf autorisation spécifique.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100006: {
        bivouac: "restricted",
        comment: "Réserve orientée protection faune : bivouac fortement réglementé.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100008: {
        bivouac: "restricted",
        comment: "Domaine protégé (Chambord) : bivouac interdit hors zones autorisées très spécifiques.",
        sources: ["https://www.chambord.org"]
    },

    FR5100009: {
        bivouac: "restricted",
        comment: "Réserve humide protégée : bivouac interdit pour protection avifaune.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100010: {
        bivouac: "restricted",
        comment: "Zone littorale protégée : bivouac interdit ou strictement encadré.",
        sources: ["https://www.golfe-morbihan.bzh"]
    },

    FR5100011: {
        bivouac: "restricted",
        comment: "Réserve alpine : bivouac soumis à autorisation locale stricte.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100012: {
        bivouac: "restricted",
        comment: "Zone de protection hydraulique et faune : bivouac interdit.",
        sources: ["https://www.ofb.gouv.fr"]
    },

    FR5100013: {
        bivouac: "restricted",
        comment: "Réserve fluviale : bivouac interdit sauf autorisation scientifique.",
        sources: ["https://www.ofb.gouv.fr"]
    },
    RNN1: {
        bivouac: "forbidden",
        comment:
            "Le campement sous tente, véhicule ou abri est interdit sur l’ensemble de la réserve. Interdiction totale de bivouac.",
        sources: [
            "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000352726"
        ]
    },

    RNN2: {
        bivouac: "unknown",
        comment: "Réglementation bivouac non explicitement documentée dans les sources disponibles.",
        sources: []
    },

    RNN7: {
        bivouac: "restricted",
        comment:
            "Bivouac autorisé uniquement dans des zones définies (replat rive gauche du lac de la Sassière). Conditions strictes de localisation.",
        sources: [
            "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000491292"
        ]
    },

    RNN13: {
        bivouac: "allowed",
        comment:
            "Bivouac autorisé sous conditions : de 19h à 9h, à distance des accès routiers et du cœur de parc. Tolérance encadrée sans feu ni nuisances. Zones spécifiques peuvent être restreintes (ex: Lauvitel).",
        sources: [
            "https://www.ecrins-parcnational.fr/bivouac"
        ]
    },

    RNN14: {
        bivouac: "allowed",
        comment:
            "Bivouac autorisé de manière encadrée (19h–9h), à distance des accès et en respectant les règles du cœur de parc (pas de feu, pas de pollution sonore).",
        sources: [
            "https://www.ecrins-parcnational.fr/bivouac"
        ]
    },

    RNN21: {
        bivouac: "forbidden",
        comment:
            "Camping et bivouac interdits sur l’ensemble de la réserve, sauf dérogation (personnel ou scientifiques autorisés).",
        sources: [
            "https://aida.ineris.fr/sites/default/files/gesdoc/79334/DecretCreation_26121974.pdf"
        ]
    },

    RNN36: {
        bivouac: "forbidden",
        comment:
            "Bivouac explicitement interdit sur l’ensemble de la réserve naturelle.",
        sources: [
            "https://www.annecyguidesmontagne.com/blog/les-bonnes-pratiques-pour-un-bivouac-respectueux-au-bord-du-lac-dannecy-1"
        ]
    },

    RNN68: {
        bivouac: "forbidden",
        comment:
            "Camping interdit sur l’ensemble du site. Le bivouac n’est pas autorisé par assimilation à l’interdiction de stationnement nocturne.",
        sources: [
            "https://www.reserve-lavours.com/decouvrir-le-marais/reglementation/"
        ]
    },

    RNN100: {
        bivouac: "forbidden",
        comment:
            "Bivouac interdit sur l’ensemble de la réserve naturelle de Plan de Tuéda.",
        sources: [
            "https://www.plandetueda-reservenaturelle.fr/wp-content/uploads/2021/01/plan-de-gestion.pdf"
        ]
    },

    RNN101: {
        bivouac: "restricted",
        comment:
            "Bivouac autorisé uniquement à proximité des refuges et sous réservation. Usage encadré (logique de refuge/itinérance).",
        sources: [
            "https://www.vanoise-parcnational.fr/fr/des-decouvertes/sejourner-dans-le-parc/lart-du-bivouac-responsable-en-vanoise"
        ]
    },

    RNN112: {
        bivouac: "restricted",
        comment:
            "Bivouac autorisé sous conditions strictes : sans tente (sauf nécessité), à proximité des sentiers, hors zones protégées (APPB) et hors période sensible (15 décembre–30 juin).",
        sources: [
            "https://www.parc-haut-jura.fr/tourisme/le-bivouac/"
        ]
    },

    RNN136: {
        bivouac: "restricted",
        comment:
            "Bivouac à la belle étoile uniquement du 1er juillet au 31 août. Tente interdite sur cette période, autorisée hors saison selon conditions locales.",
        sources: [
            "https://www.chartreuse-tourisme.com/a-voir-a-faire/marcher-courir-rouler/balades-randonnees/bivouac-nos-conseils-pratiques/"
        ]
    },

    RNN150: {
        bivouac: "forbidden",
        comment:
            "Bivouac et campement sous tente interdits sur l’ensemble de la réserve.",
        sources: [
            "https://www.vanoise-parcnational.fr/sites/vanoise-parcnational.fr/files/atoms/files/reserve_bailletaz_pnv.pdf"
        ]
    },

    RNN178: {
        bivouac: "forbidden",
        comment:
            "Interdiction des pratiques incluant bivouac et camping pour préserver la tranquillité de la réserve naturelle.",
        sources: [
            "https://haut-rhone.com/la-reserve-naturelle-nationale-du-haut-rhone-francais/"
        ]
    },
    // PNR
    
    FR8000049: {
        bivouac: "allowed",
        comment:
            "Bivouac autorisé sous conditions strictes : éviter zones pastorales, rivières, grottes, espaces privés. Respect des propriétés et des zones sensibles.",
        sources: ["https://www.parc-prealpesdazur.fr/wp-content/uploads/2020/12/Guide-du-bon-bivouac-1.pdf"]
    },

    FR8000006: {
        bivouac: "restricted",
        comment:
            "Bivouac autorisé hors réserves naturelles et zones protégées. Interdit dans les réserves naturelles nationales et régionales du massif. Toléré ailleurs si respect de la nature.",
        sources: ["https://vosgesquipeut.fr/bivouac-dans-les-vosges-ce-quil-faut-connaitre-avant-dinstaller-sa-tente/"]
    },

    FR8000041: {
        bivouac: "restricted",
        comment:
            "Bivouac interdit dans certains sites classés (Mézenc, Gerbier, Ray Pic, Pont du Diable). Autorisé pour une nuit uniquement, en fin de journée jusqu’au matin.",
        sources: ["https://www.destination-parc-monts-ardeche.fr/a-savoir/le-bivouac/"]
    },

    FR8000004: {
        bivouac: "restricted",
        comment:
            "Bivouac autorisé hors juillet-août, sous tente non debout, pour une nuit. Installation au crépuscule et démontage à l’aube, souvent soumis à autorisation implicite du terrain.",
        sources: ["https://www.parc-chartreuse.net/decouvrir-la-chartreuse/la-chartreuse-en-partage/bivouac/"]
    },

    FR8000027: {
        bivouac: "restricted",
        comment:
            "Bivouac interdit dans de nombreuses zones classées et urbaines sensibles. Interdit dans plusieurs sites protégés, zones patrimoniales et périmètres réglementés.",
        sources: ["https://www.parc-naturel-pilat.fr/wp-content/uploads/2024/09/ParcPilat_FicheBivouac05_2022.pdf"]
    },

    FR8000014: {
        bivouac: "allowed",
        comment:
            "Bivouac autorisé dans les causses, à condition de rester à proximité des sentiers (environ 50 m). Respect du milieu naturel requis.",
        sources: ["https://www.rectoverso.co/itineraires/petite-traversee-causses-randonnee-bivouac"]
    },

    FR8000033: {
        bivouac: "forbidden",
        comment:
            "Bivouac interdit dans l’ensemble du Parc naturel régional du Verdon.",
        sources: ["https://www.verdontourisme.com/dans-les-espaces-proteges/"]
    },

    FR8000015: {
        bivouac: "restricted",
        comment:
            "Bivouac autorisé uniquement sur sentiers balisés, sans abri (sauf sécurité), hors alpages occupés. Interdit dans certaines zones protégées (APPB).",
        sources: ["https://www.parc-haut-jura.fr/tourisme/le-bivouac/"]
    },

    FR8000028: {
        bivouac: "restricted",
        comment:
            "Bivouac toléré hors zones interdites (lacs, réserves naturelles). Nuit uniquement (20h-8h été). Interdit sur sommets, cratères et zones sensibles.",
        sources: ["https://www.auvergnevolcansancy.com/votre-sejour/pratique/bivouac-en-auvergne/"]
    },

    FR8000001: {
        bivouac: "allowed",
        comment:
            "Bivouac toléré entre 19h et 9h. Réglementation souple mais limitée à une nuit.",
        sources: ["https://rando.parc-du-vercors.fr/fr/information/9-A-savoir"]
    },

    FR8000031: {
        bivouac: "restricted",
        comment:
            "Bivouac toléré sous conditions : zones interdites existantes, discrétion obligatoire, éloignement des habitations et refuges.",
        sources: [
            "https://www.chamberymontagnes.com/que-faire/randonnees-balades/bivouac-bauges/",
            "https://www.chamberymontagnes.com/app/uploads/chambery/2025/12/Reglementation-bivouac-bauges-2025.pdf"
        ]
    },

    FR8000002: {
        bivouac: "restricted",
        comment:
            "Bivouac toléré sous conditions : à plus d’1h des villages, une nuit max, horaires stricts. Zones protégées et APPB interdits.",
        sources: ["https://www.pnr-queyras.fr/bivouac/"]
    },

    FR8000016: {
        bivouac: "restricted",
        comment:
            "Réglementation dépendante des zones. Carte interactive des secteurs autorisés/interdits obligatoire avant pratique.",
        sources: ["https://www.parc-haut-languedoc.fr/bivouac"]
    },

    FR8000048: {
        bivouac: "restricted",
        comment:
            "Bivouac interdit en pleine nature libre. Autorisé uniquement dans des aires aménagées spécifiques sur le territoire.",
        sources: ["https://www.parc-naturel-ardennes.fr/decouvrir/les-activites-de-pleine-nature/"]
    },

    FR8000047: {
        bivouac: "allowed",
        comment:
            "Bivouac autorisé sous conditions générales : restrictions classiques (routes, captages, monuments, sites protégés).",
        sources: ["https://www.ariegepyrenees.com/preparer/randonner/lart-de-dormir-en-montagne/"]
    },

    FR8000054: {
        bivouac: "allowed",
        comment:
            "Bivouac toléré sous conditions (autorisation du propriétaire, respect des zones interdites et captages d’eau).",
        sources: ["https://www.parc-naturel-aubrac.fr/territoire/les-grandes-itinerances/"]
    },

    FR8000045: {
        bivouac: "allowed",
        comment:
            "Bivouac toléré sans réglementation spécifique stricte, mais accord du propriétaire requis en pratique.",
        sources: ["https://www.pnr-millevaches.fr/vous-et-le-parc/decouvrir-le-parc/maison-du-parc/bivouac/"]
    },

    FR8000039: {
        bivouac: "restricted",
        comment:
            "Bivouac toléré sauf zones réglementées (réserves, secteurs protégés). Interdiction sur certaines communes comme Cajarc.",
        sources: ["https://www.tourisme-lot.com/sans-voiture/le-lot-en-bivouac/"]
    },

    FR8000058: {
        bivouac: "allowed",
        comment:
            "Aucune restriction spécifique supplémentaire : application de la réglementation nationale uniquement.",
        sources: ["https://www.parcdoubshorloger.fr/tourisme-durable/bivouac/"]
    },

    FR8000044: {
        bivouac: "restricted",
        comment:
            "Bivouac toléré uniquement autour des refuges et sentiers balisés, du coucher au lever du soleil.",
        sources: ["https://www.parc-pyrenees-catalanes.fr/decouvrir/nature/sentiers-et-sites/reserves-naturelles"]
    },

    FR8000056: {
        bivouac: "restricted",
        comment:
            "Interdit en été (15 juin–15 sept) dans massifs forestiers. Hors période : toléré sauf zones protégées (APPB, réserves).",
        sources: ["https://www.parcduventoux.fr/a-voir-a-faire/adopter-les-bons-gestes/"]
    },

    FR8000025: {
        bivouac: "restricted",
        comment:
            "Interdit dans de nombreux sites protégés, réserves, captages d’eau et zones classées. Réglementation très encadrée.",
        sources: ["https://www.morvansommetsetgrandslacs.com/uploads/2024/07/pnr-m-bivouac-descriptif-master-print-vf.pdf"]
    },

    FR3600021: {
        bivouac: "forbidden",
        comment:
            "La réserve est interdite d’accès de 21h à 7h. Elle est également interdite d’accès dans tout le périmètre de protection (zone lacustre).",
        sources: ["https://www.cen-haute-savoie.org/reserves-naturelles/bout-du-lac-annecy/"]
    },
     FR3600101:{
        bivouac: "restricted",
        comment:
            "Camping interdit, pas de spécification claire sur le bivouac. Tolérance possible pour bivouac à la belle étoile hors zones sensibles, mais réglementation floue.",
        sources: ["https://justice.pappers.fr/loi/JORFTEXT000000344100/article/LEGIARTI000006858949"]
    },
    FR3600002:{
        bivouac: "restricted",
        comment:
             "La pratique du bivouac est autorisée à proximité des refuges participants, dans un site identifié à cet effet. Rassurez-vous, pas de zone rubalise pour autant !\n\nLes esprits libres et indépendants pourront communier avec la nature tout en accédant à quelques commodités :\n\nAccès à la salle hors-sac et aux sanitaires du refuge,\nRéservation possible de la demi-pension. Vous marchez le sac et l’esprit légers !\nMise à disposition d’un pack bivouac dans certains refuges, rassemblant tente, couvertures et matelas.\nVrai plus : le gardien du refuge aura plaisir à vous assister, à partager ses connaissances de la montagne et à enrichir votre expérience. Pratique quand on a besoin d’un bilan météo ou d’un conseil rando !",
        sources: ["https://www.tignes.net/activites/ete/bivouac"]
    },
    FR3600007:{
        bivouac: "restricted",
        comment:
             "Camping interdit : pas de camping, pour préserver la beauté des sites et éviter les pollutions. Le bivouac est également interdit, sauf pour la période de juin à août, entre 19h et 7h, sur l’emplacement dédié en rive gauche du barrage (voir carte ci-dessous).",
        sources: ["https://www.vanoise-parcnational.fr/fr/des-actions/gerer-et-proteger-les-patrimoines/les-reserves-naturelles-nationales/la-reserve-0"]
    },
    FR3600150:{
        bivouac: "forbidden",
        comment:
             "Camping interdit : pas de camping ni de bivouac, pour préserver la beauté des sites et éviter les pollutions.",
        sources: ["https://www.vanoise-parcnational.fr/fr/des-actions/gerer-et-proteger-les-patrimoines/les-reserves-naturelles-nationales/la-reserve-1"]
    },
    FR3600100:{
        bivouac: "restricted",
        comment:
             "Seul le bivouac autour du refuge du Saut est autorisé",
        sources: ["https://www.plandetueda-reservenaturelle.fr/les-interdits/"]
    }, 
    FR3600179:{
        bivouac: "forbidden",
        comment:
             "Camping/Bivouac\nLes pratiques sont interdites (même dans un véhicule) pour préserver la tranquillité des lieux",
        sources: ["https://haut-rhone.com/la-reserve-naturelle-nationale-du-haut-rhone-francais/"]
    },
    FR9500179:{
        bivouac: "forbidden",
        comment:
             "Camping/Bivouac\nLes pratiques sont interdites (même dans un véhicule) pour préserver la tranquillité des lieux",
        sources: ["https://haut-rhone.com/la-reserve-naturelle-nationale-du-haut-rhone-francais/"]
    },
    FR8000052:{
        bivouac: "allowed",
        comment:
             "Bivouaquer n’est pas interdit mais toléré. Il convient donc d’être irréprochable et garder en mémoire que la nature dans laquelle on se promène et où on voudrait planter sa tente est toujours la propriété de quelqu’un, qu’il s’agisse de parcelles communales (domaine privé de la commune) ou de propriétés privées (particulier, ONF, Département, État). Le bon sens s’impose, la discrétion est de mise : ne laisser aucune trace de son passage et ramener ses déchets. Reste que le propriétaire peut légitimement demander à une personne de partir si elle se trouve installée sur son terrain. Le plus souvent, les horaires tolérés sont de 19h00 à 09h00.",
        sources: ["https://www.baronnies-provencales.fr/actualite/carnet-de-bord-dun-bivouac/"]
    },
    FR3600112:{
        bivouac: "forbidden",
        comment:
             "Bivouac: Sans abri quel qu’il soit (sauf en cas de nécessité absolue : conditions météorologiques et sécurité de la personne notamment) pendant les créneaux horaires de 19h00 le soir à 9h00 le matin, pour une seule et unique nuitée par site, à une distance maximale de vingt mètres des sentiers balisés autorisés, en dehors des alpages occupés par le bétail, toute forme d’aménagement ou d’atteinte aux milieux naturels est également interdite : dégagement de la végétation, saignée pour drainer le ruissellement, appareillement de pierres, etc.il est interdit de bivouaquer dans les Zones de quiétude de la faune sauvage (ZQFS) lorsque celles-ci sont actives. Se référer à l’arrêté préfectoral du 23 janvier 2017 fixant les zones de quiétude de la faune sauvage de la Réserve naturelle nationale de la Haute Chaîne du Jura et à ses annexes cartographiques.",
        sources: ["https://www.rnn-hautechainedujura.fr/info-bivouac/"]
    },
    FR36xxxx4:{
        bivouac: "forbidden",
        comment:
             "",
        sources: [""]
    },


   
};