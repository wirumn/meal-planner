export const mealTemplates = [
  // ── CINĂ — PUI ──────────────────────────────────────────
  {
    id: 'wrap-pui-salata',
    name: '🌯 Wrap cu pui & salată',
    type: 'cina',
    proteinType: ['pui'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'tortilla-wraps-integrale', serving: 60 },
      { productId: 'chef-select-piept-pui-gratar', serving: 150 },
      { productId: 'salata-verde', serving: 50 },
      { productId: 'rosii', serving: 80 },
    ],
  },
  {
    id: 'paste-pui',
    name: '🍝 Paste cu pui',
    type: 'cina',
    proteinType: ['pui'],
    location: ['acasa'],
    items: [
      { productId: 'paste-penne-fusilli', serving: 80 },
      { productId: 'piept-pui-crud', serving: 150 },
      { productId: 'sos-paste-bio', serving: 150 },
      { productId: 'parmezan-ras', serving: 15 },
    ],
  },
  {
    id: 'lipie-pui-branzica',
    name: '🫓 Lipie cu pui & brânzică',
    type: 'cina',
    proteinType: ['pui'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'lipii-simple', serving: 80 },
      { productId: 'chef-select-piept-pui-gratar', serving: 120 },
      { productId: 'pilos-branzica-proaspata', serving: 80 },
      { productId: 'castraveti', serving: 100 },
    ],
  },

  // ── CINĂ — VITĂ ─────────────────────────────────────────
  {
    id: 'burger-clasic',
    name: '🍔 Burger clasic',
    type: 'cina',
    proteinType: ['vita'],
    location: ['acasa'],
    items: [
      { productId: 'chifle-brioche-hamburger', serving: 65 },
      { productId: 'irish-angus-burger', serving: 150 },
      { productId: 'milbona-cheddar-felii', serving: 30 },
      { productId: 'ketchup-dulce', serving: 25 },
      { productId: 'salata-verde', serving: 30 },
    ],
  },
  {
    id: 'paste-bolognese',
    name: '🍝 Paste bolognese',
    type: 'cina',
    proteinType: ['vita'],
    location: ['acasa'],
    items: [
      { productId: 'paste-penne-fusilli', serving: 80 },
      { productId: 'carne-tocata-vita-mix', serving: 120 },
      { productId: 'rosii-pasate', serving: 200 },
      { productId: 'parmezan-ras', serving: 15 },
    ],
  },
  {
    id: 'wrap-vita',
    name: '🌯 Wrap cu vită',
    type: 'cina',
    proteinType: ['vita'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'tortilla-wraps-integrale', serving: 60 },
      { productId: 'carne-tocata-vita-mix', serving: 120 },
      { productId: 'salata-verde', serving: 50 },
      { productId: 'pilos-branzica-proaspata', serving: 60 },
    ],
  },

  // ── CINĂ — PEȘTE ────────────────────────────────────────
  {
    id: 'paste-ton',
    name: '🍝 Paste cu ton',
    type: 'cina',
    proteinType: ['peste'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'paste-penne-fusilli', serving: 80 },
      { productId: 'ton-conserva-suc-propriu', serving: 160 },
      { productId: 'rosii-pasate', serving: 150 },
      { productId: 'parmezan-ras', serving: 15 },
    ],
  },
  {
    id: 'wrap-ton',
    name: '🌯 Wrap cu ton',
    type: 'cina',
    proteinType: ['peste'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'tortilla-wraps-integrale', serving: 60 },
      { productId: 'ton-conserva-suc-propriu', serving: 120 },
      { productId: 'salata-verde', serving: 50 },
      { productId: 'rosii', serving: 80 },
    ],
  },
  {
    id: 'salata-ton',
    name: '🥗 Salată cu ton',
    type: 'cina',
    proteinType: ['peste'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'salata-verde', serving: 100 },
      { productId: 'ton-conserva-suc-propriu', serving: 160 },
      { productId: 'rosii', serving: 120 },
      { productId: 'castraveti', serving: 100 },
      { productId: 'ulei-masline', serving: 10 },
    ],
  },

  // ── CINĂ — VEGGIE ───────────────────────────────────────
  {
    id: 'wrap-falafel',
    name: '🌯 Wrap cu falafel',
    type: 'cina',
    proteinType: ['veggie'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'tortilla-wraps-integrale', serving: 60 },
      { productId: 'falafel-congelat', serving: 150 },
      { productId: 'salata-verde', serving: 50 },
      { productId: 'rosii', serving: 80 },
      { productId: 'pilos-iaurt-grecesc-2', serving: 80 },
    ],
  },
  {
    id: 'paste-sos',
    name: '🍝 Paste cu sos',
    type: 'cina',
    proteinType: ['veggie'],
    location: ['acasa'],
    items: [
      { productId: 'paste-penne-fusilli', serving: 100 },
      { productId: 'sos-paste-bio', serving: 200 },
      { productId: 'parmezan-ras', serving: 20 },
    ],
  },

  // ── PRÂNZ — BIROU ───────────────────────────────────────
  {
    id: 'birou-pranz-iaurturi',
    name: '🍶 Iaurturi proteice',
    type: 'pranz',
    proteinType: ['any'],
    location: ['birou'],
    items: [
      { productId: 'milbona-iaurt-proteic-piersica', serving: 200 },
      { productId: 'milbona-iaurt-proteic-piersica', serving: 200 },
      { productId: 'pilos-iaurt-grecesc-2', serving: 150 },
      { productId: 'banane', serving: 120 },
    ],
  },

  // ── PRÂNZ — ACASĂ ───────────────────────────────────────
  {
    id: 'skyr-fructe',
    name: '🫙 Skyr cu banană',
    type: 'pranz',
    proteinType: ['any'],
    location: ['acasa'],
    items: [
      { productId: 'pilos-skyr-natur', serving: 250 },
      { productId: 'banane', serving: 120 },
    ],
  },
  {
    id: 'iaurt-fructe-branzica',
    name: '🍶 Iaurt cu fructe & brânzică',
    type: 'pranz',
    proteinType: ['any'],
    location: ['acasa'],
    items: [
      { productId: 'pilos-iaurt-grecesc-2', serving: 200 },
      { productId: 'afine', serving: 80 },
      { productId: 'pilos-branzica-proaspata', serving: 100 },
    ],
  },
  {
    id: 'skyr-fructe-banana',
    name: '🫙 Skyr cu fructe',
    type: 'pranz',
    proteinType: ['any'],
    location: ['acasa'],
    items: [
      { productId: 'pilos-skyr-fructe', serving: 200 },
      { productId: 'banane', serving: 120 },
    ],
  },

  // ── SNACK ────────────────────────────────────────────────
  {
    id: 'snack-bautura-proteica',
    name: '🥤 Băutură proteică',
    type: 'snack',
    proteinType: ['any'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'lidl-bautura-proteica-ciocolata', serving: 300 },
    ],
  },
  {
    id: 'snack-skyr',
    name: '🫙 Skyr natur',
    type: 'snack',
    proteinType: ['any'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'pilos-skyr-natur', serving: 150 },
    ],
  },
  {
    id: 'snack-branzica',
    name: '🧀 Brânzică proaspătă',
    type: 'snack',
    proteinType: ['any'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'pilos-branzica-proaspata', serving: 200 },
    ],
  },
  {
    id: 'snack-iaurt-proteic',
    name: '🍶 Iaurt proteic',
    type: 'snack',
    proteinType: ['any'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'milbona-iaurt-proteic-piersica', serving: 200 },
    ],
  },
  {
    id: 'snack-skyr-afine',
    name: '🫙 Skyr cu afine',
    type: 'snack',
    proteinType: ['any'],
    location: ['acasa', 'birou'],
    items: [
      { productId: 'pilos-skyr-natur', serving: 200 },
      { productId: 'afine', serving: 80 },
    ],
  },

]
