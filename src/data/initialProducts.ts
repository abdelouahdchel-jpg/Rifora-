import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'rifora-001',
    name: {
      en: 'Amphora Terracotta Vase with Berber Etching',
      fr: 'Vase amphore en terre cuite aux gravures berbères'
    },
    category: 'vases',
    priceEUR: 89,
    dimensions: 'H 38 cm × Ø 22 cm',
    weight: '2.8 kg',
    material: {
      en: 'Natural red terracotta clay, hand-burnished, unglazed porous surface',
      fr: 'Argile rouge naturelle de terre cuite, polie à la main, finition brute'
    },
    availability: {
      en: 'Pilot Specimen (Available on Request)',
      fr: 'Modèle pilote (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'Sculpted on a traditional manual wheel with twin arch handles and hand-carved geometric tribal motifs inspired by traditional North Moroccan ceramics. Perfect as a standalone sculptural vessel or dried floral display.',
      fr: 'Façonné au tour manuel traditionnel avec doubles anses et motifs géométriques gravés à la main inspirés de la céramique du nord marocain. Parfait comme pièce sculpturale ou pour fleurs séchées.'
    },
    details: {
      en: [
        'Sample specimen specifications; actual handcrafted piece measurements may vary slightly',
        'Not recommended for standing water without internal glass liner',
        'Artisan workshop profile: Family pottery workshops in Northern Morocco (in curation)'
      ],
      fr: [
        'Spécifications d’échantillon ; légères variations naturelles de mesure possibles',
        'Non recommandé pour l’eau stagnante sans récipient protecteur interne',
        'Atelier d’origine : Ateliers familiaux du nord marocain (en cours de référencement)'
      ]
    },
    imageUrl: '/src/assets/images/product_terracotta_vase_1792840915221.jpg',
    featured: true
  },
  {
    id: 'rifora-002',
    name: {
      en: 'Authentic Tamegroute Emerald Glazed Pedestal Bowl',
      fr: 'Grand bol sur pied en céramique émaillée de Tamegroute'
    },
    category: 'bowls',
    priceEUR: 74,
    dimensions: 'H 14 cm × Ø 26 cm',
    weight: '1.9 kg',
    material: {
      en: 'High-fire Draa valley clay, signature copper & magnesium green mineral glaze',
      fr: 'Argile de la vallée du Drâa, émail minéral vert signature à base de cuivre et manganèse'
    },
    availability: {
      en: 'Pilot Specimen (Inquire to reserve batch)',
      fr: 'Modèle pilote (Sur réservation)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'World-renowned rustic Tamegroute pottery from the Sahara gateway. Fired in underground wood kilns that produce distinctive drips, crackles, and rich olive-emerald mineral crusts.',
      fr: 'Célèbre poterie rustique de Tamegroute aux portes du Sahara. Cuite dans des fours traditionnels en terre produisant des coulures d’émail et des reflets vert olive uniques.'
    },
    details: {
      en: [
        'Sample piece measurements; kiln firing marks and glaze drips vary individually',
        'Hand-wash with mild soap recommended; avoid microwave and dishwasher',
        'Artisan origin: Historic Tamegroute cooperative network (profiling in progress)'
      ],
      fr: [
        'Mesures indicatives d’échantillon ; coulures et cuisson au bois uniques pour chaque bol',
        'Lavage doux à la main conseillé ; éviter micro-ondes et lave-vaisselle',
        'Origine : Ateliers potiers de Tamegroute (partenariats en cours de formalisation)'
      ]
    },
    imageUrl: '/src/assets/images/product_tamegroute_bowl_1792840928842.jpg',
    featured: true
  },
  {
    id: 'rifora-003',
    name: {
      en: 'Hand-Pierced Andalusian Moorish Brass Lantern',
      fr: 'Lanterne andalouse mauresque en laiton ciselé à la main'
    },
    category: 'lanterns',
    priceEUR: 125,
    dimensions: 'H 42 cm × L 19 cm × P 19 cm',
    weight: '1.6 kg',
    material: {
      en: 'Solid chiseled brass with antique patinated finish and amber glass accents',
      fr: 'Laiton massif ciselé avec patine vieillie et détails en verre ambré'
    },
    availability: {
      en: 'Craft Specimen (Available on Request)',
      fr: 'Modèle artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'Masterfully hand-pierced by brass metalworkers using micro chisels and saws. Casts mesmerizing intricate floral and geometric arabesque shadow patterns onto surrounding walls when lit.',
      fr: 'Ciselée à la main par des maîtres dinandiers au burin et à la scie miniature. Projette des motifs d’ombres géométriques et floraux saisissants sur les murs à la lueur d’une bougie.'
    },
    details: {
      en: [
        'Top carry loop for hanging or tabletop placement',
        'Hinged side access panel for easy candle placement or LED puck light',
        'Metal workshop profile: Fez / Marrakech brass quarters (documentation pending)'
      ],
      fr: [
        'Anneau supérieur pour suspension ou pose sur table',
        'Porte latérale à charnière pour installer bougies ou veilleuses LED',
        'Atelier dinanderie : Quartiers dinandiers de Fès / Marrakech (référencement en cours)'
      ]
    },
    imageUrl: '/src/assets/images/product_moroccan_lantern_1792840943847.jpg',
    featured: true
  },
  {
    id: 'rifora-004',
    name: {
      en: 'Safi Ribbed Terracotta Pitcher & Serving Urn',
      fr: 'Pichet & urne côtelée en terre cuite de Safi'
    },
    category: 'pottery',
    priceEUR: 68,
    dimensions: 'H 30 cm × Ø 20 cm',
    weight: '2.2 kg',
    material: {
      en: 'Safi red clay, porous natural terracotta, hand-smoothed handle',
      fr: 'Argile rouge de Safi, terre cuite naturelle poreuse, anse façonnée à la main'
    },
    availability: {
      en: 'Pilot Specimen (Available on Request)',
      fr: 'Modèle pilote (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'A quintessential Mediterranean silhouette with subtle circumferential throwing rings showing the touch of the potter’s fingers. Natural evaporative cooling properties when kept shaded.',
      fr: 'Silhouette méditerranéenne intemporelle arborant les sillons fins laissés par les doigts du potier. Propriétés thermiques naturelles de fraîcheur à l’ombre.'
    },
    details: {
      en: [
        'Traditional Mediterranean water vessel shape',
        'Natural unglazed clay texture with warm terracotta hues',
        'Atelier status: Safi ceramic master potter network (pre-production testing)'
      ],
      fr: [
        'Forme de cruche méditerranéenne ancestrale',
        'Texture brute non émaillée aux reflets chauds de terre cuite',
        'Statut atelier : Réseau des potiers de Safi (phase de test préalable)'
      ]
    },
    imageUrl: '/src/assets/images/hero_moroccan_pottery_1792840896413.jpg',
    featured: true
  },
  {
    id: 'rifora-005',
    name: {
      en: 'Fez Patterned Ceramic Serving Bowl (Bleu de Fès)',
      fr: 'Grand plat de service en céramique de Fès'
    },
    category: 'bowls',
    priceEUR: 82,
    dimensions: 'H 9 cm × Ø 32 cm',
    weight: '2.4 kg',
    material: {
      en: 'White clay stoneware, hand-painted cobalt & ochre mineral pigments, lead-free food glaze',
      fr: 'Grès d’argile blanche, pigments minéraux peints à la main au pinceau fin, émail sans plomb'
    },
    availability: {
      en: 'Pilot Specimen (Workshop inquiry)',
      fr: 'Modèle pilote (Sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'Painstakingly decorated by master calligraphers and ceramicists in Fez. Features classical octagonal medallion geometry and foliage scrolls that have adorned Moroccan dining tables for centuries.',
      fr: 'Méticuleusement peint à main levée par les maîtres céramistes de Fès. Arbore des arabesques traditionnelles et médaillons géométriques ornant les tables marocaines.'
    },
    details: {
      en: [
        'Lead-free and food-safe certified glazing tested on sample batch',
        'Reinforced rounded lip for durability during dining service',
        'Atelier status: Historic Fez medina cooperative (validation in progress)'
      ],
      fr: [
        'Émaillage sans plomb testé sur échantillon',
        'Bord arrondi renforcé pour résister au service de table',
        'Statut atelier : Coopérative historique de Fès (validation en cours)'
      ]
    },
    imageUrl: '/src/assets/images/hero_moroccan_pottery_1792840896413.jpg',
    featured: false
  },
  {
    id: 'rifora-006',
    name: {
      en: 'Sculpted Terracotta Sphere Vessel',
      fr: 'Vase sphérique sculpté en terre cuite brute'
    },
    category: 'vases',
    priceEUR: 58,
    dimensions: 'H 21 cm × Ø 20 cm',
    weight: '1.7 kg',
    material: {
      en: 'Sand-washed earthenware clay, matte tactile finish',
      fr: 'Terre cuite chamottée couleur sable, finition mate et texturée'
    },
    availability: {
      en: 'Pilot Specimen (Batch reservation)',
      fr: 'Modèle pilote (Sur réservation)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'A balanced orb silhouette with a narrow tapered neck, celebrating raw mineral simplicity. Harmonizes naturally with contemporary Scandinavian, Japandi, and Mediterranean interior styles.',
      fr: 'Une silhouette sphérique équilibrée au col resserré, célébrant la pureté minérale brute. S’harmonise avec les intérieurs contemporains, méditerranéens ou wabi-sabi.'
    },
    details: {
      en: [
        'Hand-thrown circular form with stable weighted base',
        'Organic earthy sand-ochre tone without artificial pigments',
        'Prototype piece: measurements measured from initial workshop sample'
      ],
      fr: [
        'Forme ronde tournée à la main avec base lestée stable',
        'Teinte naturelle sable-ocre sans colorant de synthèse',
        'Pièce prototype : mesures prises sur le premier échantillon'
      ]
    },
    imageUrl: '/src/assets/images/product_terracotta_vase_1792840915221.jpg',
    featured: false
  },
  {
    id: 'rifora-007',
    name: {
      en: 'Hand-Engraved Moroccan Brass Tea Tray Tabletop',
      fr: 'Plateau marocain en laiton gravé à la main'
    },
    category: 'decor',
    priceEUR: 145,
    dimensions: 'Ø 50 cm × Épaisseur 2.5 cm',
    weight: '3.1 kg',
    material: {
      en: 'Heavy-gauge solid brass, hammer-chiseled rosette centerpiece',
      fr: 'Laiton massif épais, médaillon central ciselé au marteau'
    },
    availability: {
      en: 'Artisan Specimen (Made to order)',
      fr: 'Modèle artisanal (Sur commande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'Hand-chiseled brass tray created for the traditional Moroccan tea ceremony or as a tabletop tray. Features a deep raised lip and floral arabesques created entirely by manual punch and hammer work.',
      fr: 'Plateau en laiton épais ciselé pour la cérémonie traditionnelle du thé ou en plateau de table. Rebord relevé et arabesques martelées entièrement au poinçon.'
    },
    details: {
      en: [
        'Substantial weight prevents warping over decades of use',
        'Artisan workshop profile: Marrakech Medina brass quarter (contract pending)'
      ],
      fr: [
        'Épaisseur robuste évitant toute déformation au fil des décennies',
        'Atelier : Dinanderie de la médina de Marrakech (contrat en formalisation)'
      ]
    },
    imageUrl: '/src/assets/images/product_moroccan_lantern_1792840943847.jpg',
    featured: false
  },
  {
    id: 'rifora-008',
    name: {
      en: 'Rif Mountain Clay Bread Plate & Olive Dish',
      fr: 'Plat à pain & coupelle à olives en terre du Rif'
    },
    category: 'pottery',
    priceEUR: 42,
    dimensions: 'H 5 cm × Ø 24 cm',
    weight: '1.2 kg',
    material: {
      en: 'Mountain riverbed clay, wild mastic tree glaze streaks, pit-fired',
      fr: 'Argile de montagne, marbrures végétales au lentisque, cuisson en fosse'
    },
    availability: {
      en: 'Pilot Specimen (Small batch pilot)',
      fr: 'Modèle pilote (Sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    description: {
      en: 'Made by women potters in the Rif mountains using Neolithic coil techniques without a wheel, decorated with natural mineral resin pigments from the lentisk bush and open pit-fired.',
      fr: 'Réalisé par les femmes potières du Rif selon des techniques néolithiques de colombins sans tour, décoré d’oxydes naturels de lentisque et cuit à ciel ouvert.'
    },
    details: {
      en: [
        'Coil-built by hand without a mechanical potter’s wheel',
        'Each bowl holds distinctive smoked firing patterns from wood embers',
        'Artisan profile: Rif mountain women pottery cooperatives (in curation)'
      ],
      fr: [
        'Montage manuel aux colombins sans tour mécanique',
        'Chaque pièce conserve les nuances fumées des braises de bois',
        'Coopérative : Femmes potières des montagnes du Rif (en référencement)'
      ]
    },
    imageUrl: '/src/assets/images/product_tamegroute_bowl_1792840928842.jpg',
    featured: false
  }
];
