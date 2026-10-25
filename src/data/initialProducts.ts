import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'rifora-001',
    name: {
      en: 'Handcrafted Striped Ceramic Pitchers & Cups',
      fr: 'Carafes et gobelets artisanaux en céramique rayée'
    },
    category: 'pottery',
    priceMAD: null, // Selling price left empty for owner to enter manually
    purchaseCostMAD: null, // Private supplier cost (only visible in owner view)
    shippingCostMAD: null, // Separate shipping cost
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Natural Moroccan earthenware, glazed interior and exterior',
      fr: 'Terre cuite marocaine naturelle, émaillage intérieur et extérieur'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Authentic hand-thrown Moroccan pottery carafes and drinking bowls with clean geometric cobalt and terracotta stripe accents, shaped on traditional manual wheels.',
      fr: 'Carafes et bols en céramique marocaine façonnés à la main sur tour manuel traditionnel, ornés de rayures cobalt et terre cuite émaillées.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Physical dimensions and weights to be verified prior to freight quotation'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Dimensions et poids réels à mesurer avant devis de transport'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_111600_f22b7ef1.jpg',
    featured: true
  },
  {
    id: 'rifora-002',
    name: {
      en: 'Miniature Heart-Motif Glazed Spice Tagines',
      fr: 'Mini-tajines à épices émaillés aux motifs cœurs'
    },
    category: 'decor',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Glazed earthenware clay with ceramic lid',
      fr: 'Argile émaillée artisanale avec couvercle conique'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Charming mini ceramic tagines finished in pastel pink, yellow, and cream glazes with hand-applied heart motifs, ideal for condiments, saffron, spices, or decorative accents.',
      fr: 'Délicats mini-tajines en céramique émaillée aux tons pastel rose, jaune et crème, avec motifs cœurs pour le safran, les épices ou la décoration de table.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Hand-wash recommended for glazed artisanal miniatures'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Lavage doux à la main conseillé pour les miniatures émaillées'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_112202_1afa7b56.jpg',
    featured: false
  },
  {
    id: 'rifora-003',
    name: {
      en: 'Carved Turquoise & Cobalt Ceramic Conical Tagine',
      fr: 'Grand plat à tajine sculpté turquoise et cobalt'
    },
    category: 'pottery',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'High-fire Moroccan ceramic with hand-chiseled glaze',
      fr: 'Céramique marocaine haute température, émail ciselé'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Masterfully carved Moroccan conical presentation tagine with intricate fan and arabesque engravings in vivid turquoise and deep blue mineral glaze.',
      fr: 'Tajine conique marocain gravé à la main avec motifs d’arabesques et palmettes en émail minéral turquoise et cobalt.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Hand-carved relief texture with deep mineral glaze pigmentation'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Relief gravé à la main avec pigmentation minérale profonde'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_111942_1b5b032c.jpg',
    featured: true
  },
  {
    id: 'rifora-004',
    name: {
      en: 'Rustic Terracotta Pottery Cups with Handle',
      fr: 'Tasses rustiques en terre cuite brute avec anse'
    },
    category: 'pottery',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Natural unglazed red terracotta clay with mineral pigment rim',
      fr: 'Argile rouge naturelle de terre cuite avec liseré minéral'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Hand-thrown terracotta pottery mugs with hand-painted dark brushwork accents along the rim, captured drying naturally on wooden planks under the Moroccan sun.',
      fr: 'Tasses en terre cuite naturelle avec bordure noire peinte à la main, photographiées lors du séchage naturel au soleil sur les planches de l’atelier.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Porous natural terracotta earthenware'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Terre cuite poreuse naturelle authentique'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_111421_728c64cc.jpg',
    featured: false
  },
  {
    id: 'rifora-005',
    name: {
      en: 'Vibrant Multi-Color Glazed Ceramic Mugs',
      fr: 'Mugs artisanaux émaillés multicolores'
    },
    category: 'pottery',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Glazed terracotta earthenware with speckled finish',
      fr: 'Terre cuite émaillée finition mouchetée'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Artisanal mugs in lively Moroccan colors including saffron yellow, rose, sky blue, crimson, and olive with speckled artisan glaze texture.',
      fr: 'Mugs artisanaux aux couleurs vives du Maroc : jaune safran, rose, bleu ciel, carmin et vert olive avec texture émaillée mouchetée.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Comfortable curved handle and high-gloss protective glaze'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Anse ergonomique et glaçure protectrice brillante'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_112054_2780b48b.jpg',
    featured: false
  },
  {
    id: 'rifora-006',
    name: {
      en: 'Hand-Painted Divided Serving Platter Set',
      fr: 'Plateau apéritif compartimenté peint à la main'
    },
    category: 'bowls',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Hand-painted glazed ceramic platter with divided compartments',
      fr: 'Céramique émaillée peinte à la main avec compartiments séparés'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Traditional Moroccan ceramic appetizer tray featuring 6 individual square compartments painted with classic geometric and arabesque linework for olives, dips, and tapas.',
      fr: 'Service apéritif traditionnel en céramique à 6 compartiments carrés, orné de motifs géométriques et arabesques pour olives, sauces et tapas.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Multi-compartment tray with built-in side grip handles'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Plateau multi-compartiments avec poignées latérales intégrées'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_111813_80507d89.jpg',
    featured: false
  },
  {
    id: 'rifora-007',
    name: {
      en: 'Moroccan Kasbah Decorative Ceramic Wall Plate',
      fr: 'Plat mural décoratif peint motif Kasbah'
    },
    category: 'decor',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Hand-painted decorative ceramic with wall-hanging loop hole',
      fr: 'Céramique décorative peinte à la main avec attache murale'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Ornamental ceramic wall plate painted by hand with a southern Moroccan desert Kasbah and palm silhouettes against a peaceful twilight lavender background.',
      fr: 'Assiette murale décorative peinte à la main représentant une kasbah du sud marocain et des palmiers sous un ciel lavande au crépuscule.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Pre-drilled foot ring for secure wall mounting'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Perforation arrière prévue pour accroche murale sécurisée'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_111714_4e689cf1.jpg',
    featured: false
  },
  {
    id: 'rifora-008',
    name: {
      en: 'Traditional Berber Motif Conical Presentation Tagines',
      fr: 'Tajines de présentation aux motifs berbères traditionnels'
    },
    category: 'pottery',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Handcrafted clay with natural mineral pigment glaze',
      fr: 'Argile artisanale émaillée aux pigments minéraux naturels'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Conical presentation tagines decorated with authentic Berber geometric symbols and tribal motifs in amber yellow, deep green, and monochrome black/white.',
      fr: 'Tajines de présentation ornés de symboles géométriques berbères authentiques en jaune ambré, vert profond et noir et blanc.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Ideal for authentic dining presentation or cultural home decor'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Idéal pour le service traditionnel ou la décoration d’intérieur'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_112125_136b20d5.jpg',
    featured: true
  },
  {
    id: 'rifora-009',
    name: {
      en: 'Pierced Celestial Ceramic Lantern / Photophore',
      fr: 'Photophore en céramique ajourée motifs célestes'
    },
    category: 'lanterns',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Hand-pierced glazed terracotta with cutouts',
      fr: 'Terre cuite ajourée et émaillée à la main'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Spherical ceramic mood candle lantern pierced by hand with crescent moon and star patterns to project warm shadow silhouettes when lit with a candle or tea light.',
      fr: 'Photophore sphérique en terre cuite ajourée à la main avec motifs croissants de lune et étoiles, projetant de chaleureux jeux d’ombres à la lueur d’une bougie.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Hand-pierced openings cast starry patterns across room surfaces'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Perforations artisanales projetant des étoiles sur les murs'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_111354_5aa6467d.jpg',
    featured: false
  },
  {
    id: 'rifora-010',
    name: {
      en: 'Artisanal Speckled Glaze Ceramic Cups',
      fr: 'Tasses en céramique émaillée mouchetée'
    },
    category: 'bowls',
    priceMAD: null,
    purchaseCostMAD: null,
    shippingCostMAD: null,
    priceEUR: null,
    dimensions: 'To be measured',
    weight: 'To be measured',
    material: {
      en: 'Wheel-thrown earthenware with speckled mineral glaze',
      fr: 'Terre cuite tournée à la main, émail minéral moucheté'
    },
    availability: {
      en: 'Artisan Workshop Specimen (Inquire for availability)',
      fr: 'Pièce d’atelier artisanal (Disponible sur demande)'
    },
    artisanPlaceholder: true,
    isSampleData: true,
    needsReview: true,
    description: {
      en: 'Rustic wheel-thrown ceramic cups and small bowls featuring a crisp white enamel finish with emerald and olive mineral speckling, resting on natural workshop gravel.',
      fr: 'Tasses et petits bols rustiques tournés au tour de potier, émaillés en blanc avec mouchetures minérales vert émeraude et olive.'
    },
    details: {
      en: [
        'Real workshop specimen photograph from Moroccan artisan atelier',
        'Selling price to be added by store owner in admin portal',
        'Each cup exhibits unique glaze splatter and handcrafted organic contours'
      ],
      fr: [
        'Photographie réelle prise en atelier de poterie au Maroc',
        'Prix de vente à renseigner par le propriétaire dans l’espace gestion',
        'Chaque tasse présente une répartition de mouchetures unique'
      ]
    },
    imageUrl: '/assets/aistudio/20261025_111512_2d8baff4.jpg',
    featured: false
  }
];
