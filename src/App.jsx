import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  BookOpen, Package, ArrowRightLeft, Inbox, Users, History, LayoutGrid,
  Plus, X, Camera, Upload, Search, Filter, TrendingUp, TrendingDown,
  Wallet, HandCoins, Gift, ShieldCheck, Eye, Trash2, Edit3, Check, Copy, CheckSquare, Square,
  AlertTriangle, ChevronDown, ChevronRight, Lock, Unlock, Sparkles,
  Loader2, ExternalLink, DollarSign
} from "lucide-react";

/* ============================================================
   CONSTANTES
============================================================ */
const ORIGINES = {
  personnel: { label: "Achat personnel", color: "#2563eb", bg: "#eff6ff" },
  don: { label: "Don reçu", color: "#059669", bg: "#ecfdf5" },
  maasser: { label: "Ma'asser", color: "#7c3aed", bg: "#f5f3ff" },
  depot: { label: "Dépôt-vente", color: "#d97706", bg: "#fffbeb" },
};

const PAIEMENTS = {
  espece: "Espèces",
  bit: "Bit",
  virement: "Virement",
  paybox: "Paybox",
};

const SOURCES = {
  "breslev.fr": "Impression Rav Ifrah (breslev.fr)",
  "breslever.com": "Breslever.com (traductions Kéren Rabbi Israël France)",
  "aech-cheli.com": "Keren Rabbi Israël en français (aech-cheli.com)",
  "haesh-sheli.co.il": "Keren Rabbi Israël (haesh-sheli.co.il)",
  "malevegadish.com": "Malé véGadish (malevegadish.com)",
  "tikoun-aolam.com": "Tikoun Haolam (tikoun-aolam.com)",
  "manuel": "Ajout manuel / autre",
};

const LANGUES = { FR: "Français", EN: "Anglais", HE: "Hébreu", AUTRE: "Autre" };
const DEVISES = { ILS: "₪", EUR: "€", USD: "$" };
const formatPrice = (n, devise) => `${(Number(n) || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${DEVISES[devise] || "₪"}`;

const STORAGE_KEY = "hafatza-data-v1";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const money = (n) => (Number(n) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " ₪";
const todayISO = () => new Date().toISOString().slice(0, 10);

const SEED_PRODUCTS = [
  // --- breslev.fr (Keren Rabbi Israël France) ---
  { titre: "Les cahiers du Coeur", langue: "FR", source: "breslev.fr", prixCoutant: 23, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/69.png" },
  { titre: "La vie d'un Breslever", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/65.png" },
  { titre: "Rabbi Nahman", langue: "FR", source: "breslev.fr", prixCoutant: 20, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/53.png" },
  { titre: "Chemot Hatsadikim", langue: "FR", source: "breslev.fr", prixCoutant: 18, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/57.png" },
  { titre: "Conversation avec les anges (Deux parties)", langue: "FR", source: "breslev.fr", prixCoutant: 36, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2023/11/Conversation-avec-les-anges.png" },
  { titre: "Likouté Tefilot", langue: "FR", source: "breslev.fr", prixCoutant: 20, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/5.png" },
  { titre: "Le Voyage de Rabbi Nahman", langue: "FR", source: "breslev.fr", prixCoutant: 16, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/85.png" },
  { titre: "Likoutey Moharane grand - Tome 1", langue: "FR", source: "breslev.fr", prixCoutant: 35, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2023/11/1.png" },
  { titre: "Likoutey Moharane", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2025/01/25.png" },
  { titre: "Likoutey Moharane - Tome 2", langue: "FR", source: "breslev.fr", prixCoutant: 15, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2023/11/29.png" },
  { titre: "Likoutey Moharan - Tome 3", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/33.png" },
  { titre: "Likoutey Moharan - Tome 4", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/37.png" },
  { titre: "Likoutey Moharan - Tome 6", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/41.png" },
  { titre: "Likoutey Moharan - Tome 7", langue: "FR", source: "breslev.fr", prixCoutant: 18, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/45.png" },
  { titre: "Likoutey Moharan - Tome 8", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2024/01/49.png" },
  { titre: "Bonheur & Joie", langue: "FR", source: "breslev.fr", prixCoutant: 8, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2025/01/21.png" },
  { titre: "Le Français Fou!", langue: "FR", source: "breslev.fr", prixCoutant: 8, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2025/01/17.png" },
  { titre: "Likoutey Halakhot - Tome 1", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2025/01/62.png" },
  { titre: "L'Âge d'or de Breslev", langue: "FR", source: "breslev.fr", prixCoutant: 19, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2025/01/9.png" },
  { titre: "Méchouné Freileikh", langue: "FR", source: "breslev.fr", prixCoutant: 8, devise: "EUR", photo: "https://breslev.fr/wp-content/uploads/2025/02/Design-sans-titre-5.png" },
  // --- aech-cheli.com (Keren Rabbi Israël en français) ---
  { titre: "'Hok Breslev - Otsrot Rabbi Na'hman (coffret)", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 85, devise: "EUR", photo: "https://aech-cheli.com/wp-content/uploads/2022/06/hok-breslev--thegem-blog-timeline-large.png" },
  { titre: "Kitvé Rabbi Na'hman de Breslev - Résumé Likouté Moharan & Likouté Téfilot (intégral)", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 85, devise: "EUR", photo: "https://aech-cheli.com/wp-content/uploads/2022/06/SIMILI-CUIR-KITVE-transparent-thegem-blog-timeline-large.png" },
  { titre: "Set 'Houmachim - Likouté Halakhot sur la Paracha", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 75, devise: "EUR", photo: "https://aech-cheli.com/wp-content/uploads/2022/06/coffret-houmash-blc-vers-2-thegem-blog-timeline-large.png" },
  { titre: "Likouté Téfilot - Coffret", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 60, devise: "EUR", photo: "" },
  { titre: "Likouté Téfilot - Version intégrale", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 55, devise: "EUR", photo: "" },
  { titre: "'Hayé Moharan (set)", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 35, devise: "EUR", photo: "" },
  { titre: "Alim Litroufa - Des feuilles pour guérir", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 35, devise: "EUR", photo: "https://aech-cheli.com/wp-content/uploads/2025/05/ALIM-LITROUFA-thegem-blog-timeline-large.jpeg" },
  { titre: "Kitsour Likouté Moharan Hachalem", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 35, devise: "EUR", photo: "" },
  { titre: "Ibé Hana'hal - Les fruits du fleuve", langue: "FR", source: "aech-cheli.com", prixCoutant: 20, devise: "EUR", photo: "" },
  { titre: "'Hayé Moharan (petit format)", langue: "FR", source: "aech-cheli.com", prixCoutant: 20, devise: "EUR", photo: "" },
  { titre: "Kitvé Rabbi Na'hman (adaptation, petit format)", langue: "FR", source: "aech-cheli.com", prixCoutant: 20, devise: "EUR", photo: "" },
  { titre: "Yémé Moharanat - Les jours de Rabbi Nathan", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 15, devise: "EUR", photo: "" },
  { titre: "Si'hot Haran & Chiv'hé Haran", langue: "AUTRE", source: "aech-cheli.com", prixCoutant: 15, devise: "EUR", photo: "https://aech-cheli.com/wp-content/uploads/2023/06/CHIVHE-ET-SIHOT-HARAN-LIVRE-3D-thegem-blog-timeline-large.png" },
  // --- malevegadish.com (prix Kéren, quelques exemples) ---
  { titre: "'Hayé Moharan - format poche", langue: "HE", source: "malevegadish.com", prixCoutant: 6.5, devise: "ILS", photo: "" },
  { titre: "Etsot Hamevoarot (Kitvé Hanahal)", langue: "HE", source: "malevegadish.com", prixCoutant: 16, devise: "ILS", photo: "" },
  { titre: "'Hayé Moharan (Kitvé Hanahal)", langue: "HE", source: "malevegadish.com", prixCoutant: 16, devise: "ILS", photo: "" },
  { titre: "Etsot Hamevoarot", langue: "HE", source: "malevegadish.com", prixCoutant: 5.5, devise: "ILS", photo: "" },
  { titre: "Sipouré Maassiot (édition hébraïque)", langue: "HE", source: "malevegadish.com", prixCoutant: 5, devise: "ILS", photo: "" },
  { titre: "Likouté Etsot", langue: "HE", source: "malevegadish.com", prixCoutant: 6, devise: "ILS", photo: "" },
  { titre: "Sefer Hamidot (hébreu)", langue: "HE", source: "malevegadish.com", prixCoutant: 5, devise: "ILS", photo: "" },
  { titre: "Likouté Moharan (hébreu, poche)", langue: "HE", source: "malevegadish.com", prixCoutant: 15, devise: "ILS", photo: "" },
  { titre: "Kitvé Rabbi Na'hman (format poche, hébreu)", langue: "HE", source: "malevegadish.com", prixCoutant: 25, devise: "ILS", photo: "" },
  { titre: "Kitsour Likouté Moharan (édition Tak'a)", langue: "HE", source: "malevegadish.com", prixCoutant: 7, devise: "ILS", photo: "" },
  { titre: "Coffret Likouté Téfilot & Likouté Moharan (poche)", langue: "HE", source: "malevegadish.com", prixCoutant: 27, devise: "ILS", photo: "" },
  { titre: "Kountrass Or Haemouna", langue: "HE", source: "malevegadish.com", prixCoutant: 1.5, devise: "ILS", photo: "" },
  { titre: "Si'hot Haran (hébreu)", langue: "HE", source: "malevegadish.com", prixCoutant: 5.5, devise: "ILS", photo: "" },
  { titre: "Likouté Halakhot - 8 volumes (grand format)", langue: "HE", source: "malevegadish.com", prixCoutant: 135, devise: "ILS", photo: "" },
  { titre: "Téhilim - Chémot Hatsadikim", langue: "HE", source: "malevegadish.com", prixCoutant: 6, devise: "ILS", photo: "" },
  { titre: "Likouté Téfilot (hébreu)", langue: "HE", source: "malevegadish.com", prixCoutant: 12, devise: "ILS", photo: "" },
  { titre: "Yémé Moharanat (hébreu)", langue: "HE", source: "malevegadish.com", prixCoutant: 6, devise: "ILS", photo: "" },
  { titre: "Kountrass Chiv'hé Haran", langue: "HE", source: "malevegadish.com", prixCoutant: 2, devise: "ILS", photo: "" },
  { titre: "Alim Litroufa (hébreu, grand format)", langue: "HE", source: "malevegadish.com", prixCoutant: 23, devise: "ILS", photo: "" },
  // --- haesh-sheli.co.il ---
  { titre: "Ibé Hanahal (Rabbi Israël Dov Odesser)", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 10, devise: "ILS", photo: "" },
  { titre: "Otsar Hayira", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 200, devise: "ILS", photo: "" },
  { titre: "Mémalé Makom Emounat 'Hakhamim", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 35, devise: "ILS", photo: "" },
  { titre: "Emounat Itékha", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 20, devise: "ILS", photo: "" },
  { titre: "Mémalé Makom Bihour Haliqoutim", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 75, devise: "ILS", photo: "" },
  { titre: "Béikvot Habaal Chem Tov", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 115, devise: "ILS", photo: "" },
  { titre: "Harosh Hachana Cheli", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Hichtapkhout Hanéfech - format poche", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 10, devise: "ILS", photo: "" },
  { titre: "Hitgalout Hadaat - Pessah", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 148, devise: "ILS", photo: "" },
  { titre: "Hatkhalat Hahatkhalot - Pourim", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Hatalmid Hagadol", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 75, devise: "ILS", photo: "" },
  { titre: "Zimrat Haaretz", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 35, devise: "ILS", photo: "" },
  { titre: "Likouté Moharan - grandes lettres", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 35, devise: "ILS", photo: "" },
  { titre: "Zémirot Chabbat Breslev", langue: "HE", source: "haesh-sheli.co.il", prixCoutant: 35, devise: "ILS", photo: "" },
// --- breslever.com / Catalogue Breslev 2025 — prix coûtants en EUR ---

{ titre: "Des Mots qui Guérissent - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2024/12/LIVRE-DES-MOTS-QUI-GUERISSENT-MD.png" },
{ titre: "Des Mots qui Guérissent - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2024/12/LIVRE-DES-MOTS-QUI-GUERISSENT-MD.png" },

{ titre: "Vers la Terre Sainte - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/vers-la-terre-sainte-face-150-crop-u297325_2x.png" },
{ titre: "Vers la Terre Sainte - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/vers-la-terre-sainte-face-150-crop-u297325_2x.png" },

{ titre: "L'Alphabet Lumineux - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/alphabet-lumineux-face-150c_2x.png" },
{ titre: "L'Alphabet Lumineux - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/alphabet-lumineux-face-150c_2x.png" },

{ titre: "Les Ailes du Cœur - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/les-ailes-face-150-u111643_2x.png" },
{ titre: "Les Ailes du Cœur - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/les-ailes-face-150-u111643_2x.png" },

{ titre: "Le Solfège de l'Âme & Régénération - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2024/12/LIVRE-SOLFEGE-DE-LAME-MD.png" },
{ titre: "Le Solfège de l'Âme & Régénération - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2024/12/LIVRE-SOLFEGE-DE-LAME-MD.png" },

{ titre: "Contes & Merveilles - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/contes-face-150-u111592_2x.png" },
{ titre: "Contes & Merveilles - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/contes-face-150-u111592_2x.png" },

{ titre: "Lettres à un ami - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/letrres-a-un-ami-face-150-u297356_2x.png" },

{ titre: "Les Conseils - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2025/09/CONSEILS-attente-2025.png" },
{ titre: "Les Conseils - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2025/09/CONSEILS-attente-2025.png" },

{ titre: "Les Chemins de Lumière - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2025/11/LIVRE-LES-CHEMINS.png" },
{ titre: "Les Chemins de Lumière - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 8, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2025/11/LIVRE-LES-CHEMINS.png" },

{ titre: "Les Sources du Salut - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 12, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/les-sources-du-saluts-face-150-crop-u297365_2x.png" },

{ titre: "Le Tikoune Haklali - Petit format", langue: "FR", source: "breslever.com", prixCoutant: 1, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/tikoune-face-125_2x.png" },
{ titre: "Le Tikoune Haklali - Format moyen", langue: "FR", source: "breslever.com", prixCoutant: 1.5, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/tikoune-face-125_2x.png" },
{ titre: "Le Tikoune Haklali - Grand format", langue: "FR", source: "breslever.com", prixCoutant: 2.5, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2023/11/tikoune-face-125_2x.png" },

{ titre: "Le Tikoune Haklali et Réparation de Minuit - Couverture rigide", langue: "FR", source: "breslever.com", prixCoutant: 6, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2024/12/LIVRE-TIKOUNE-HAKLALI-HATSOTH.png" },
{ titre: "Le Tikoune Haklali et Réparation de Minuit - Couverture souple", langue: "FR", source: "breslever.com", prixCoutant: 4, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2024/12/LIVRE-TIKOUNE-HAKLALI-HATSOTH.png" },

{ titre: "Les Noms des Justes", langue: "FR", source: "breslever.com", prixCoutant: 4, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2024/12/LIVRE-SERIE-MOU-FACE-MD.png" },

{ titre: "Coffret Essentiel", langue: "FR", source: "breslever.com", prixCoutant: 50, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-COFFRET-ESSENTIEL-BD.jpg" },
{ titre: "Coffret Collection Breslev - 11 livres", langue: "FR", source: "breslever.com", prixCoutant: 80, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-GRAND-COFFRET-BD.jpg" },

// Non trouvé exactement dans le catalogue 2025 sous ce nom
{ titre: "Coffret II (5 œuvres de Rabbi Nathan)", langue: "FR", source: "breslever.com", prixCoutant: 0, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-COFFRET-2-BD.jpg" },

{ titre: "L'Arbre de Vie", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-ABRE-DE-VIE-BD.jpg" },
{ titre: "Vive la Vie !", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-VIVE-LA-VIE-BD.jpg" },
{ titre: "En Chemin - Vers l'Éveil", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-EN-CHEMIN-BD.jpg" },

{ titre: "Courage ! / Renouveau / Bonheur & Joie - Tome 1", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-TOME-I-BD.jpg" },
{ titre: "La Porte du Ciel / Il est Temps de Chanter / Le Chant Nouveau - Tome 2", langue: "FR", source: "breslever.com", prixCoutant: 10, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-TOME-II-BD.jpg" },

{ titre: "La Porte du Ciel - Hitbodédouth", langue: "FR", source: "breslever.com", prixCoutant: 4, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-MINI-LA-PORTE-DU-CIEL-BD.jpg" },
{ titre: "Courage ! - Le désespoir n'existe pas", langue: "FR", source: "breslever.com", prixCoutant: 4, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-MINI-COURAGE-BD.jpg" },
{ titre: "Bonheur & Joie - Dans la Torah", langue: "FR", source: "breslever.com", prixCoutant: 4, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-MINI-BONHEUR-BD.jpg" },
{ titre: "Ouman", langue: "FR", source: "breslever.com", prixCoutant: 4, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-MINI-OUMAN-BD.jpg" },
{ titre: "Il est Temps de Chanter (sur les Psaumes)", langue: "FR", source: "breslever.com", prixCoutant: 4, devise: "EUR", photo: "https://breslever.com/wp-content/uploads/2026/03/LIVRE-MINI-IL-EST-TEMPS-BD.jpg" },
  // --- tikoun-aolam.com ---
  { titre: "Téhilim de Rabénou Hébreu-Phonétique - Format Moyen", langue: "HE", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "https://tikoun-aolam.com/wp-content/uploads/2026/03/Tehilim-Phonetique-Double-1.jpg" },
  { titre: "Likouté Halakhot - Ora'h 'Haim 2 (Grand Format)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 200, devise: "ILS", photo: "https://tikoun-aolam.com/wp-content/uploads/2026/03/LH-Orah-Haim-2-Double-1.jpg" },
  { titre: "Rabénou - La vie de Rabbi Nahman de Breslev", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "https://tikoun-aolam.com/wp-content/uploads/2023/11/Rabenou-Recto.jpg" },
  { titre: "Otsar Hayira - Le Guide pratique Breslev", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 180, devise: "ILS", photo: "" },
  { titre: "Likouté Moharan Complet (Format Compact)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 100, devise: "ILS", photo: "" },
  { titre: "Likouté Halakhot - Ora'h 'Haim 1 (Grand Format)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 150, devise: "ILS", photo: "" },
  { titre: "Les Contes des Temps Anciens (Les 13 Contes)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 200, devise: "ILS", photo: "https://tikoun-aolam.com/wp-content/uploads/2025/01/Les-Contes-des-Temps-Anciens-Double001.jpg" },
  { titre: "Likouté Moharan - 3 Tomes (Hébreu-Français)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 220, devise: "ILS", photo: "" },
  { titre: "Kitsour Likouté Halakhot (Hébreu-Français)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 320, devise: "ILS", photo: "" },
  { titre: "Likouté Moharan (Grand Format)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 150, devise: "ILS", photo: "" },
  { titre: "Chavouot de Rabénou (Ma'hzor)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Roch Hachana de Rabénou (Ma'hzor)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Kippour de Rabénou (Ma'hzor)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Souccot de Rabénou (Ma'hzor)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Hanouca de Rabénou", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 70, devise: "ILS", photo: "" },
  { titre: "Pourim de Rabénou", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 80, devise: "ILS", photo: "" },
  { titre: "Pessah de Rabénou", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Pack 3 Fêtes (Tikoun Aolam)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 300, devise: "ILS", photo: "" },
  { titre: "Pack 5 Fêtes (Tikoun Aolam)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 480, devise: "ILS", photo: "" },
  { titre: "Pack Pessa'h / Chavouot", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 200, devise: "ILS", photo: "" },
  { titre: "Pack Tishri - Roch Hachana / Kippour / Souccot", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 300, devise: "ILS", photo: "" },
  { titre: "Le Chabat de Rabénou - Hébreu-Français", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 80, devise: "ILS", photo: "" },
  { titre: "Sidour Échet Hayïl de Rabénou (Pour Femmes)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 100, devise: "ILS", photo: "" },
  { titre: "Le Sidour de Rabénou - Édition Bilingue", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 120, devise: "ILS", photo: "" },
  { titre: "Le Sidour de Rabénou - Commenté", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 100, devise: "ILS", photo: "" },
  { titre: "Tikoun Haklali - Hébreu-Français & Phonétique", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 40, devise: "ILS", photo: "" },
  { titre: "Téhilim de Rabénou (Grand Format)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 150, devise: "ILS", photo: "" },
  { titre: "Kitsour Likouté Téfilot (Tikoun Aolam)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 100, devise: "ILS", photo: "" },
  { titre: "Biographie de Rabbi Na'hman (Tikoun Aolam)", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 100, devise: "ILS", photo: "" },
  { titre: "Biographie de Rabbi Nathan", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 100, devise: "ILS", photo: "" },
  { titre: "Pack Rabbi Na'hman + Rabbi Nathan", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 180, devise: "ILS", photo: "" },
  { titre: "Pack Téhilim / Kitsour Likouté Téfilot", langue: "FR", source: "tikoun-aolam.com", prixCoutant: 220, devise: "ILS", photo: "" },
];

const emptyData = () => ({
  products: SEED_PRODUCTS.map((p) => ({ id: uid(), ...p })),
  stock: [],
  fournisseurs: [],
  movements: [],
  settings: { seuilRouge: 2, seuilOrange: 5, adminPin: "1234" },
});

/* ============================================================
   PERSISTANCE
============================================================ */
function useHafatzaData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        const parsed = res ? JSON.parse(res.value) : emptyData();
        // Si un ancien état vide a été sauvegardé avant l'ajout du catalogue de départ, on le réinjecte.
        if (!parsed.products || parsed.products.length === 0) {
          parsed.products = SEED_PRODUCTS.map((p) => ({ id: uid(), ...p }));
        } else {
          // Complète les photos manquantes en comparant les titres avec le catalogue de référence (sans changer les id existants).
          parsed.products = parsed.products.map((p) => {
            if (p.photo) return p;
            const ref = SEED_PRODUCTS.find((s) => s.titre === p.titre);
            return ref ? { ...p, photo: ref.photo || p.photo, devise: p.devise || ref.devise } : p;
          });
          // Ajoute les nouveaux titres du catalogue de référence qui ne sont pas encore présents (par titre + source).
          const existants = new Set(parsed.products.map((p) => `${p.titre}__${p.source}`));
          const nouveaux = SEED_PRODUCTS.filter((s) => !existants.has(`${s.titre}__${s.source}`));
          parsed.products = [...parsed.products, ...nouveaux.map((p) => ({ id: uid(), ...p }))];
        }
        setData({ ...emptyData(), ...parsed, settings: { ...emptyData().settings, ...(parsed.settings || {}) } });
      } catch (e) {
        setData(emptyData());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!data) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(data), true);
      } catch (e) {
        console.error("Erreur de sauvegarde", e);
      }
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  return [data, setData, loading];
}

/* ============================================================
   CALCULS
============================================================ */
function computeBalances(movements) {
  let caisse = 0, maasser = 0, personnel = 0;
  for (const m of movements) {
    caisse += m.caisseDelta || 0;
    maasser += m.maasserDelta || 0;
    personnel += m.personnelDelta || 0;
  }
  return { caisse, maasser, personnel };
}

function computeStockCounts(stock) {
  const map = {};
  for (const s of stock) {
    if (s.statut !== "stock") continue;
    map[s.productId] = (map[s.productId] || 0) + 1;
  }
  return map;
}

function fournisseurDu(fournisseurId, stock) {
  return stock
    .filter((s) => s.origine === "depot" && s.fournisseurId === fournisseurId && s.statut === "sorti_vente" && !s.fournisseurPaye)
    .reduce((sum, s) => sum + (s.prixDuFournisseur || s.prixAchat || 0), 0);
}

/* ============================================================
   UI PRIMITIVES
============================================================ */
function Badge({ children, color, bg }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: color || "#374151", backgroundColor: bg || "#f3f4f6" }}
    >
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone = "slate" }) {
  const tones = {
    slate: "bg-white border-slate-200 text-slate-900",
    green: "bg-emerald-50 border-emerald-200 text-emerald-900",
    purple: "bg-violet-50 border-violet-200 text-violet-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
  };
  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3 ${tones[tone]}`}>
      <div className="p-2 rounded-xl bg-white/70 shadow-sm">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium opacity-70">{label}</div>
        <div className="text-xl font-bold leading-tight truncate">{value}</div>
        {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400";

function Btn({ children, onClick, variant = "primary", type = "button", size = "md", disabled, className = "" }) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium inline-flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   EXTRACTION IA D'UNE CAPTURE D'ÉCRAN
============================================================ */
async function extractFromScreenshot(base64, mediaType) {
  const promptText =
    "Cette image est une capture d'écran d'une page produit d'un site vendant des livres de Rabbi Nahman de Breslev (ex: breslever.fr, aech-cheli.com, haesh-sheli.co.il, malevegadish.com, tikoun-aolam.com). " +
    "Extrais le titre du livre, la langue (Français, Anglais, Hébreu ou Autre) et le prix affiché (nombre seul, sans devise). " +
    "Réponds UNIQUEMENT avec un JSON strict, sans aucun texte autour, sans balises markdown, au format exact: " +
    '{"titre":"...","langue":"FR|EN|HE|AUTRE","prix":0}. Si une info est introuvable, mets une chaîne vide ou 0.';

  function parseResponseContent(data) {
    const text = (data.content || []).map((b) => b.text || "").join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }

  // 1) Essaie la route serverless Vercel (/api/extract) — nécessaire pour le site déployé.
  try {
    const r = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, mediaType }),
    });
    if (r.ok) {
      const data = await r.json();
      return parseResponseContent(data);
    }
  } catch (e) {
    // route absente (ex: aperçu Claude.ai) → on tente le repli ci-dessous
  }

  // 2) Repli : appel direct (fonctionne dans l'aperçu Artifacts de Claude.ai, qui gère l'auth automatiquement).
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: promptText },
          ],
        },
      ],
    }),
  });
  const data = await response.json();
  return parseResponseContent(data);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("Lecture du fichier impossible"));
    r.readAsDataURL(file);
  });
}

/* ============================================================
   APP
============================================================ */
export default function HafatzaApp() {
  const [data, setData, loading] = useHafatzaData();
  const [tab, setTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [receptionPreselectIds, setReceptionPreselectIds] = useState([]);
  const [distribuerPreselect, setDistribuerPreselect] = useState(null);

  useEffect(() => {
    if (!isAdmin && tab !== "catalogue") setTab("catalogue");
  }, [isAdmin]); // eslint-disable-line

  if (loading || !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={18} /> Chargement de Hafatza…
      </div>
    );
  }

  const patch = (fn) => setData((prev) => fn(structuredCloneSafe(prev)));

  const balances = computeBalances(data.movements);
  const stockCounts = computeStockCounts(data.stock);

  const tabs = isAdmin
    ? [
        { id: "dashboard", label: "Tableau de bord", icon: LayoutGrid },
        { id: "stock", label: "Stock", icon: Package },
        { id: "distribuer", label: "Distribuer", icon: ArrowRightLeft },
        { id: "reception", label: "Réception", icon: Inbox },
        { id: "fournisseurs", label: "Fournisseurs", icon: Users },
        { id: "historique", label: "Historique", icon: History },
        { id: "catalogue", label: "Catalogue", icon: BookOpen },
      ]
    : [{ id: "catalogue", label: "Catalogue", icon: BookOpen }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight">Hafatza</div>
              <div className="text-indigo-200 text-xs">Diffusion des livres de Rabbi Nahman — au prix coûtant</div>
            </div>
          </div>
          <button
            onClick={() => (isAdmin ? setIsAdmin(false) : setPinModal(true))}
            className="flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
            {isAdmin ? "Mode admin" : "Espace admin"}
          </button>
        </div>
        {/* TABS */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap ${
                tab === t.id ? "bg-slate-50 text-indigo-700" : "text-indigo-100 hover:bg-white/10"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {tab === "dashboard" && isAdmin && (
          <Dashboard data={data} patch={patch} balances={balances} stockCounts={stockCounts} />
        )}
        {tab === "stock" && isAdmin && <StockTab data={data} patch={patch} stockCounts={stockCounts} />}
        {tab === "distribuer" && isAdmin && (
          <DistribuerTab data={data} patch={patch} preselectId={distribuerPreselect} stockCounts={stockCounts} />
        )}
        {tab === "reception" && isAdmin && (
          <ReceptionTab data={data} patch={patch} preselectIds={receptionPreselectIds} stockCounts={stockCounts} />
        )}
        {tab === "fournisseurs" && isAdmin && <FournisseursTab data={data} patch={patch} />}
        {tab === "historique" && isAdmin && <HistoriqueTab data={data} />}
        {tab === "catalogue" && (
          <CatalogueTab
            data={data}
            patch={patch}
            isAdmin={isAdmin}
            stockCounts={stockCounts}
            onAddToStock={
              isAdmin
                ? (productIds) => {
                    setReceptionPreselectIds(Array.isArray(productIds) ? productIds : [productIds]);
                    setTab("reception");
                  }
                : undefined
            }
            onDistribute={
              isAdmin
                ? (productId) => {
                    setDistribuerPreselect(productId);
                    setTab("distribuer");
                  }
                : undefined
            }
          />
        )}
      </div>

      <PinModal
        open={pinModal}
        onClose={() => setPinModal(false)}
        pin={data.settings.adminPin}
        onSuccess={() => {
          setIsAdmin(true);
          setPinModal(false);
          setTab("dashboard");
        }}
      />
    </div>
  );
}

function structuredCloneSafe(obj) {
  return typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
}

/* ============================================================
   PIN MODAL
============================================================ */
function PinModal({ open, onClose, pin, onSuccess }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (open) { setVal(""); setErr(false); }
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Accès administrateur">
      <p className="text-sm text-slate-500 mb-3">Entre le code admin pour gérer le stock, la caisse et le ma'asser.</p>
      <input
        type="password"
        value={val}
        onChange={(e) => { setVal(e.target.value); setErr(false); }}
        onKeyDown={(e) => e.key === "Enter" && (val === pin ? onSuccess() : setErr(true))}
        className={inputCls}
        placeholder="Code PIN"
        autoFocus
      />
      {err && <p className="text-xs text-rose-500 mt-1.5">Code incorrect.</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={() => (val === pin ? onSuccess() : setErr(true))}>Entrer</Btn>
      </div>
      <p className="text-[11px] text-slate-400 mt-3">Code par défaut : 1234 (modifiable dans le tableau de bord une fois connecté).</p>
    </Modal>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */
function HelpBox() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-indigo-700">
        <span className="flex items-center gap-2"><Sparkles size={14} /> Comment fonctionne l'argent ici ?</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-700 space-y-2">
          <p>Il y a <strong>3 tirelires</strong> séparées :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Caisse Hafatza</strong> — l'argent de l'activité elle-même. Une vente y ajoute de l'argent, un achat en retire.</li>
            <li><strong>Ma'asser</strong> — de l'argent mis à part pour la charité. Tu peux le transférer vers la caisse quand tu veux <em>offrir</em> un livre (le transfert finance le don).</li>
            <li><strong>Dû à toi</strong> — si un jour tu paies un livre de ta poche plutôt qu'avec la caisse, ce compteur note ce qu'on te doit. Il redescend quand une vente te rembourse.</li>
          </ul>
          <p className="text-slate-500">Pour chaque livre, tu choisis juste son <strong>origine</strong> (perso / don / ma'asser / dépôt-vente) à la réception, et qui a payé quoi. Le reste se calcule seul.</p>
        </div>
      )}
    </div>
  );
}

function Dashboard({ data, patch, balances, stockCounts }) {
  const [transferOpen, setTransferOpen] = useState(false);
  const [pinEditOpen, setPinEditOpen] = useState(false);

  const totalLivresStock = data.stock.filter((s) => s.statut === "stock").length;
  const totalDepotDu = useMemo(() => {
    return data.fournisseurs.reduce((sum, f) => sum + fournisseurDu(f.id, data.stock), 0);
  }, [data]);

  const alerts = data.products
    .map((p) => ({ p, count: stockCounts[p.id] || 0 }))
    .filter((x) => x.count <= data.settings.seuilRouge)
    .sort((a, b) => a.count - b.count);

  const recent = [...data.movements].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 8);

  return (
    <div className="space-y-6">
      <HelpBox />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Wallet} label="Caisse Hafatza" value={money(balances.caisse)} tone="green" />
        <StatCard icon={HandCoins} label="Ma'asser disponible" value={money(balances.maasser)} tone="purple" sub="Peut être transféré → caisse pour offrir" />
        <StatCard icon={DollarSign} label="Dû à toi (avances perso)" value={money(balances.personnel)} tone="amber" sub="Achats payés de ta poche, non remboursés" />
        <StatCard icon={Package} label="Livres en stock" value={totalLivresStock} tone="slate" />
        <StatCard icon={Users} label="Dû aux fournisseurs" value={money(totalDepotDu)} tone="amber" sub="Dépôt-vente non réglé" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => setTransferOpen(true)}>
          <HandCoins size={15} /> Transférer du ma'asser vers la caisse
        </Btn>
        <Btn variant="secondary" onClick={() => setPinEditOpen(true)}>
          <Lock size={15} /> Modifier le code admin
        </Btn>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
            <AlertTriangle size={16} className="text-rose-500" /> À recommander
          </div>
          {alerts.length === 0 && <p className="text-sm text-slate-400">Tout est en stock suffisant 🎉</p>}
          <div className="space-y-1.5">
            {alerts.slice(0, 8).map(({ p, count }) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1">
                <span className="truncate flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: count === 0 ? "#dc2626" : count <= data.settings.seuilRouge ? "#f59e0b" : "#16a34a" }}
                  />
                  {p.titre}
                </span>
                <Badge color="#991b1b" bg="#fee2e2">{count} en stock</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
            <History size={16} /> Derniers mouvements
          </div>
          {recent.length === 0 && <p className="text-sm text-slate-400">Aucun mouvement pour l'instant.</p>}
          <div className="space-y-2">
            {recent.map((m) => (
              <div key={m.id} className="text-sm flex items-center justify-between border-b border-slate-50 pb-1.5 last:border-0">
                <div className="truncate">
                  <span className="text-slate-700">{m.label}</span>
                  <span className="text-slate-400 text-xs ml-2">{m.date}</span>
                </div>
                <span className={`font-medium shrink-0 ${(m.caisseDelta || 0) + (m.maasserDelta || 0) + (m.personnelDelta || 0) >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {(m.caisseDelta || 0) + (m.maasserDelta || 0) + (m.personnelDelta || 0) >= 0 ? "+" : ""}
                  {money((m.caisseDelta || 0) + (m.maasserDelta || 0) + (m.personnelDelta || 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TransferMaasserModal open={transferOpen} onClose={() => setTransferOpen(false)} data={data} patch={patch} />
      <EditPinModal open={pinEditOpen} onClose={() => setPinEditOpen(false)} patch={patch} />
    </div>
  );
}

function EditPinModal({ open, onClose, patch }) {
  const [val, setVal] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Nouveau code admin">
      <Field label="Nouveau code PIN">
        <input className={inputCls} value={val} onChange={(e) => setVal(e.target.value)} placeholder="ex: 4821" />
      </Field>
      <div className="flex justify-end gap-2">
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn
          onClick={() => {
            if (!val) return;
            patch((d) => { d.settings.adminPin = val; return d; });
            onClose();
          }}
        >
          Enregistrer
        </Btn>
      </div>
    </Modal>
  );
}

function TransferMaasserModal({ open, onClose, data, patch }) {
  const [montant, setMontant] = useState("");
  const [note, setNote] = useState("");
  const balances = computeBalances(data.movements);

  const submit = () => {
    const m = Number(montant);
    if (!m || m <= 0) return;
    patch((d) => {
      d.movements.push({
        id: uid(),
        date: todayISO(),
        type: "transfert_maasser_caisse",
        label: `Transfert ma'asser → caisse${note ? " (" + note + ")" : ""}`,
        caisseDelta: m,
        maasserDelta: -m,
        note,
      });
      return d;
    });
    setMontant(""); setNote(""); onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Transférer du ma'asser vers la caisse">
      <p className="text-sm text-slate-500 mb-3">
        Ma'asser disponible : <strong>{money(balances.maasser)}</strong>. Ce transfert alimente la caisse Hafatza afin de pouvoir offrir un ou plusieurs livres.
      </p>
      <Field label="Montant à transférer (₪)">
        <input type="number" className={inputCls} value={montant} onChange={(e) => setMontant(e.target.value)} />
      </Field>
      <Field label="Note (optionnel)">
        <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex: pour offrir un Likoutei Moharan" />
      </Field>
      <div className="flex justify-end gap-2">
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={submit}>Transférer</Btn>
      </div>
    </Modal>
  );
}

/* ============================================================
   STOCK
============================================================ */
function StockTab({ data, patch, stockCounts }) {
  const [filterOrigine, setFilterOrigine] = useState("");
  const [filterLangue, setFilterLangue] = useState("");
  const [search, setSearch] = useState("");

  const productsById = Object.fromEntries(data.products.map((p) => [p.id, p]));

  const grouped = useMemo(() => {
    const map = {};
    for (const s of data.stock) {
      if (s.statut !== "stock") continue;
      const p = productsById[s.productId];
      if (!p) continue;
      if (filterLangue && p.langue !== filterLangue) continue;
      if (search && !p.titre.toLowerCase().includes(search.toLowerCase())) continue;
      if (!map[s.productId]) map[s.productId] = [];
      map[s.productId].push(s);
    }
    return map;
  }, [data.stock, filterLangue, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input className={inputCls + " pl-8"} placeholder="Rechercher un titre…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={inputCls + " w-auto"} value={filterLangue} onChange={(e) => setFilterLangue(e.target.value)}>
          <option value="">Toutes langues</option>
          {Object.entries(LANGUES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={inputCls + " w-auto"} value={filterOrigine} onChange={(e) => setFilterOrigine(e.target.value)}>
          <option value="">Toutes origines</option>
          {Object.entries(ORIGINES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="grid gap-3">
        {Object.entries(grouped).length === 0 && (
          <p className="text-sm text-slate-400 py-8 text-center">Aucun livre en stock pour ces critères. Ajoute une entrée via l'onglet Réception.</p>
        )}
        {Object.entries(grouped).map(([productId, items]) => {
          const p = productsById[productId];
          const byOrigine = {};
          items.forEach((s) => {
            if (filterOrigine && s.origine !== filterOrigine) return;
            byOrigine[s.origine] = (byOrigine[s.origine] || 0) + 1;
          });
          const total = Object.values(byOrigine).reduce((a, b) => a + b, 0);
          if (filterOrigine && total === 0) return null;
          const status = total === 0 ? "#dc2626" : total <= data.settings.seuilRouge ? "#f59e0b" : "#16a34a";
          return (
            <div key={productId} className="bg-white rounded-xl border border-slate-200 p-3.5 flex gap-3 items-center">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <BookOpen size={18} className="text-slate-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-800 truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: status }} />
                  {p.titre}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(byOrigine).map(([o, n]) => (
                    <Badge key={o} color={ORIGINES[o].color} bg={ORIGINES[o].bg}>{ORIGINES[o].label} × {n}</Badge>
                  ))}
                  <Badge>{LANGUES[p.langue] || p.langue}</Badge>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-slate-700">{total}</div>
                <div className="text-[11px] text-slate-400">en stock</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   SÉLECTEUR VISUEL DE LIVRE (BookPicker)
============================================================ */
function BookPickerModal({ open, onClose, products, onSelect, stockCounts }) {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const sourcesPresentes = [...new Set(products.map((p) => p.source))];

  const filtered = products.filter((p) => {
    if (search && !p.titre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSource && p.source !== filterSource) return false;
    return true;
  });

  return (
    <Modal open={open} onClose={onClose} title="Choisir un livre du catalogue" wide>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input className={inputCls + " pl-8"} placeholder="Rechercher un titre…" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        </div>
        <select className={inputCls + " w-auto"} value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
          <option value="">Toutes sources</option>
          {sourcesPresentes.map((s) => <option key={s} value={s}>{SOURCES[s] || s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.length === 0 && <p className="text-sm text-slate-400 col-span-full py-6 text-center">Aucun livre trouvé.</p>}
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => { onSelect(p.id); onClose(); }}
            className="text-left rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-md transition group"
          >
            <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center overflow-hidden">
              {p.photo ? (
                <img src={p.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <BookOpen size={22} className="text-slate-300" />
              )}
            </div>
            <div className="p-2">
              <div className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 min-h-[2.2em]">{p.titre}</div>
              <div className="text-xs font-bold text-indigo-700 mt-1">{formatPrice(p.prixCoutant, p.devise)}</div>
              {stockCounts && (
                <div className="text-[10px] text-slate-400 mt-0.5">{stockCounts[p.id] || 0} en stock</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function BookPickerField({ label, products, value, onChange, stockCounts }) {
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === value);
  return (
    <Field label={label}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-left hover:border-indigo-400"
      >
        {selected ? (
          <>
            <div className="w-9 h-12 rounded overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
              {selected.photo ? <img src={selected.photo} className="w-full h-full object-cover" /> : <BookOpen size={14} className="text-slate-300" />}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-800">{selected.titre}</div>
              <div className="text-xs text-slate-400">{formatPrice(selected.prixCoutant, selected.devise)} · {LANGUES[selected.langue]}</div>
            </div>
          </>
        ) : (
          <span className="text-slate-400 flex items-center gap-2"><BookOpen size={16} /> Choisir un livre dans le catalogue…</span>
        )}
        <span className="ml-auto text-xs text-indigo-600 shrink-0">{selected ? "Changer" : "Parcourir"}</span>
      </button>
      <BookPickerModal open={open} onClose={() => setOpen(false)} products={products} onSelect={onChange} stockCounts={stockCounts} />
    </Field>
  );
}

/* ============================================================
   RÉCEPTION (entrée de stock)
============================================================ */
function ReceptionTab({ data, patch, preselectIds = [], stockCounts }) {
  const makeRow = (productId = "") => {
    const product = data.products.find((p) => p.id === productId);
    return {
      rowId: uid(),
      productId,
      origine: "personnel",
      fournisseurId: "",
      qte: 1,
      prixAchat: product?.prixCoutant || "",
      modePaiement: "espece",
      sourcePaiement: "caisse", // caisse | personnel_avance | aucun
    };
  };

  const [lignes, setLignes] = useState(
    preselectIds.length > 0 ? preselectIds.map((id) => makeRow(id)) : [makeRow()]
  );
  const [date, setDate] = useState(todayISO());
  const [msg, setMsg] = useState("");
  const [pickerForRow, setPickerForRow] = useState(null); // rowId en cours d'ajout via BookPicker

  const updateRow = (rowId, patchObj) => {
    setLignes((prev) => prev.map((l) => (l.rowId === rowId ? { ...l, ...patchObj } : l)));
  };
  const removeRow = (rowId) => setLignes((prev) => prev.filter((l) => l.rowId !== rowId));
  const addRow = () => setLignes((prev) => [...prev, makeRow()]);

  const submit = () => {
    const valides = lignes.filter((l) => l.productId);
    if (valides.length === 0) { setMsg("Choisis au moins un livre."); return; }
    const manqueFournisseur = valides.find((l) => l.origine === "depot" && !l.fournisseurId);
    if (manqueFournisseur) { setMsg("Un livre en dépôt-vente n'a pas de fournisseur choisi."); return; }

    patch((d) => {
      valides.forEach((l) => {
        const product = data.products.find((p) => p.id === l.productId);
        const n = Math.max(1, Number(l.qte) || 1);
        const prix = Number(l.prixAchat) || 0;

        for (let i = 0; i < n; i++) {
          d.stock.push({
            id: uid(),
            productId: l.productId,
            origine: l.origine,
            fournisseurId: l.origine === "depot" ? l.fournisseurId : null,
            prixAchat: prix,
            modePaiementAchat: l.origine === "depot" ? null : l.modePaiement,
            dateAcquisition: date,
            statut: "stock",
          });
        }

        if ((l.origine === "personnel" || l.origine === "maasser") && prix > 0) {
          if (l.sourcePaiement === "personnel_avance" && l.origine === "personnel") {
            d.movements.push({
              id: uid(), date, type: "achat",
              label: `Achat: ${n} × ${product?.titre || ""} (payé de ta poche)`,
              caisseDelta: 0, maasserDelta: 0, personnelDelta: prix * n,
              note: `Avance personnelle — ${PAIEMENTS[l.modePaiement]}`,
            });
          } else if (l.sourcePaiement === "caisse") {
            d.movements.push({
              id: uid(), date, type: "achat",
              label: `Achat: ${n} × ${product?.titre || ""} (${ORIGINES[l.origine].label})`,
              caisseDelta: -(prix * n), maasserDelta: 0,
              note: `Payé via caisse — ${PAIEMENTS[l.modePaiement]}`,
            });
          }
        }
      });
      return d;
    });

    setMsg(`${valides.length} livre${valides.length > 1 ? "s" : ""} ajouté${valides.length > 1 ? "s" : ""} au stock ✔`);
    setLignes([makeRow()]);
    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Nouvelle réception de stock</h2>
        <Field label="">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Date</span>
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </Field>
      </div>

      <div className="space-y-3">
        {lignes.map((l, idx) => {
          const product = data.products.find((p) => p.id === l.productId);
          return (
            <div key={l.rowId} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 relative">
              {lignes.length > 1 && (
                <button onClick={() => removeRow(l.rowId)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500">
                  <X size={16} />
                </button>
              )}
              <BookPickerField label={`Livre ${idx + 1}`} products={data.products} value={l.productId} onChange={(id) => {
                const p = data.products.find((x) => x.id === id);
                updateRow(l.rowId, { productId: id, prixAchat: p?.prixCoutant || l.prixAchat });
              }} stockCounts={stockCounts} />

              <div className="flex flex-wrap gap-2">
                {Object.entries(ORIGINES).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => updateRow(l.rowId, { origine: k })}
                    className="text-xs font-medium rounded-lg px-2.5 py-1.5 border"
                    style={{ borderColor: v.color, background: l.origine === k ? v.color : v.bg, color: l.origine === k ? "#fff" : v.color }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {l.origine === "depot" && (
                <select className={inputCls} value={l.fournisseurId} onChange={(e) => updateRow(l.rowId, { fournisseurId: e.target.value })}>
                  <option value="">— Choisir un fournisseur —</option>
                  {data.fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">Quantité</span>
                  <input type="number" min="1" className={inputCls} value={l.qte} onChange={(e) => updateRow(l.rowId, { qte: e.target.value })} />
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">{l.origine === "depot" ? "Prix dû (₪)" : "Prix d'achat (₪)"}</span>
                  <input type="number" className={inputCls} value={l.prixAchat} onChange={(e) => updateRow(l.rowId, { prixAchat: e.target.value })} />
                </div>
                {l.origine !== "depot" && (
                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">Paiement</span>
                    <select className={inputCls} value={l.modePaiement} onChange={(e) => updateRow(l.rowId, { modePaiement: e.target.value })}>
                      {Object.entries(PAIEMENTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )}
                {l.origine === "personnel" && (
                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">Payé par</span>
                    <select className={inputCls} value={l.sourcePaiement} onChange={(e) => updateRow(l.rowId, { sourcePaiement: e.target.value })}>
                      <option value="caisse">La caisse</option>
                      <option value="personnel_avance">Toi (à rembourser)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Btn variant="secondary" onClick={addRow}><Plus size={15} /> Ajouter un autre livre</Btn>

      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      <Btn onClick={submit}><Inbox size={15} /> Valider la réception ({lignes.filter((l) => l.productId).length})</Btn>
    </div>
  );
}

/* ============================================================
   DISTRIBUER (vente / don)
============================================================ */
function DistribuerTab({ data, patch, preselectId, stockCounts }) {
  const [productId, setProductId] = useState(preselectId || "");
  const [mode, setMode] = useState("vente"); // vente | don
  const [modePaiement, setModePaiement] = useState("espece");
  const [prixVente, setPrixVente] = useState("");
  const [destinationArgent, setDestinationArgent] = useState("rembourser"); // rembourser | caisse
  const [msg, setMsg] = useState("");

  const availableForProduct = data.stock.filter((s) => s.productId === productId && s.statut === "stock");
  // priorité de sortie : don > maasser > depot > personnel (les livres "offerts" en premier si on distribue un don)
  const priorite = { don: 0, maasser: 1, depot: 2, personnel: 3 };
  const sorted = [...availableForProduct].sort((a, b) => priorite[a.origine] - priorite[b.origine]);
  const chosen = sorted[0];

  const product = data.products.find((p) => p.id === productId);

  const submit = () => {
    if (!chosen) { setMsg("Aucun exemplaire disponible en stock pour ce livre."); return; }
    const prix = mode === "don" ? 0 : Number(prixVente) || 0;

    patch((d) => {
      const stockItem = d.stock.find((s) => s.id === chosen.id);
      stockItem.statut = mode === "don" ? "sorti_don" : "sorti_vente";
      stockItem.dateSortie = todayISO();
      stockItem.prixVente = prix;
      stockItem.fournisseurPaye = false;

      const rembourse = mode === "vente" && stockItem.origine === "personnel" && destinationArgent === "rembourser";
      d.movements.push({
        id: uid(),
        date: todayISO(),
        type: mode,
        label: `${mode === "don" ? "Don" : "Vente"}: ${product?.titre || ""} (${ORIGINES[stockItem.origine].label})${rembourse ? " — remboursement" : ""}`,
        caisseDelta: mode === "don" ? 0 : rembourse ? 0 : prix,
        maasserDelta: 0,
        personnelDelta: rembourse ? -prix : 0,
        note: mode === "vente" ? PAIEMENTS[modePaiement] : "",
        stockItemId: stockItem.id,
      });
      return d;
    });
    setMsg(`${mode === "don" ? "Don" : "Vente"} enregistré ✔`);
    setPrixVente("");
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div className="max-w-lg space-y-3">
      <h2 className="font-semibold text-slate-700 mb-1">Distribuer un livre</h2>
      <BookPickerField label="Livre" products={data.products} value={productId} onChange={setProductId} stockCounts={stockCounts} />

      {productId && (
        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5">
          {availableForProduct.length === 0 && <span className="text-rose-500">Plus aucun exemplaire en stock.</span>}
          {chosen && (
            <>Exemplaire retenu automatiquement : <Badge color={ORIGINES[chosen.origine].color} bg={ORIGINES[chosen.origine].bg}>{ORIGINES[chosen.origine].label}</Badge> ({availableForProduct.length} disponible{availableForProduct.length > 1 ? "s" : ""})</>
          )}
        </div>
      )}

      <Field label="Type de sortie">
        <div className="flex gap-2">
          <button onClick={() => setMode("vente")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border ${mode === "vente" ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-300 text-slate-600"}`}>
            Vente (au prix coûtant)
          </button>
          <button onClick={() => setMode("don")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border ${mode === "don" ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-slate-600"}`}>
            <Gift size={14} className="inline mr-1" /> Don gratuit
          </button>
        </div>
      </Field>

      {mode === "vente" && (
        <>
          <Field label="Prix reçu (₪)">
            <input type="number" className={inputCls} value={prixVente} onChange={(e) => setPrixVente(e.target.value)} placeholder={product?.prixCoutant ? String(product.prixCoutant) : ""} />
          </Field>
          <Field label="Mode de paiement">
            <select className={inputCls} value={modePaiement} onChange={(e) => setModePaiement(e.target.value)}>
              {Object.entries(PAIEMENTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          {chosen?.origine === "personnel" && (
            <Field label="Où va l'argent ?">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDestinationArgent("rembourser")} className={`text-xs font-medium rounded-lg px-3 py-2 border ${destinationArgent === "rembourser" ? "bg-amber-500 text-white border-amber-500" : "border-slate-300 text-slate-600"}`}>
                  Te rembourser (frais avancés)
                </button>
                <button type="button" onClick={() => setDestinationArgent("caisse")} className={`text-xs font-medium rounded-lg px-3 py-2 border ${destinationArgent === "caisse" ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-300 text-slate-600"}`}>
                  Caisse Hafatza
                </button>
              </div>
            </Field>
          )}
        </>
      )}

      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      <Btn onClick={submit} disabled={!chosen}><ArrowRightLeft size={15} /> Enregistrer</Btn>
    </div>
  );
}

/* ============================================================
   FOURNISSEURS
============================================================ */
function FournisseursTab({ data, patch }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");

  const openAdd = () => { setNom(""); setContact(""); setEditing(null); setAddOpen(true); };
  const openEdit = (f) => { setNom(f.nom); setContact(f.contact || ""); setEditing(f); setAddOpen(true); };

  const submit = () => {
    if (!nom) return;
    patch((d) => {
      if (editing) {
        const f = d.fournisseurs.find((x) => x.id === editing.id);
        if (f) { f.nom = nom; f.contact = contact; }
      } else {
        d.fournisseurs.push({ id: uid(), nom, contact });
      }
      return d;
    });
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-slate-700">Fournisseurs (dépôt-vente)</h2>
        <Btn onClick={openAdd}><Plus size={15} /> Ajouter</Btn>
      </div>

      <div className="grid gap-3">
        {data.fournisseurs.length === 0 && <p className="text-sm text-slate-400">Aucun fournisseur pour l'instant.</p>}
        {data.fournisseurs.map((f) => {
          const du = fournisseurDu(f.id, data.stock);
          const enDepot = data.stock.filter((s) => s.origine === "depot" && s.fournisseurId === f.id && s.statut === "stock").length;
          return (
            <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-800 flex items-center gap-2">
                  {f.nom}
                  <button onClick={() => openEdit(f)} className="text-slate-300 hover:text-indigo-600"><Edit3 size={13} /></button>
                </div>
                <div className="text-xs text-slate-400">{f.contact}</div>
                <div className="text-xs text-slate-500 mt-1">{enDepot} livre(s) en dépôt actuellement</div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${du > 0 ? "text-amber-600" : "text-emerald-600"}`}>{money(du)}</div>
                <div className="text-[11px] text-slate-400 mb-1.5">dû</div>
                {du > 0 && (
                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      patch((d) => {
                        d.stock.filter((s) => s.origine === "depot" && s.fournisseurId === f.id && s.statut === "sorti_vente" && !s.fournisseurPaye)
                          .forEach((s) => (s.fournisseurPaye = true));
                        d.movements.push({
                          id: uid(), date: todayISO(), type: "paiement_fournisseur",
                          label: `Paiement fournisseur: ${f.nom}`, caisseDelta: -du, maasserDelta: 0,
                        });
                        return d;
                      })
                    }
                  >
                    Marquer payé
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}>
        <Field label="Nom"><input className={inputCls} value={nom} onChange={(e) => setNom(e.target.value)} /></Field>
        <Field label="Contact (téléphone / email)"><input className={inputCls} value={contact} onChange={(e) => setContact(e.target.value)} /></Field>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => setAddOpen(false)}>Annuler</Btn>
          <Btn onClick={submit}>{editing ? "Enregistrer" : "Ajouter"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   HISTORIQUE
============================================================ */
function HistoriqueTab({ data }) {
  const [filterType, setFilterType] = useState("");
  const sorted = [...data.movements].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  const filtered = filterType ? sorted.filter((m) => m.type === filterType) : sorted;
  const types = [...new Set(data.movements.map((m) => m.type))];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-slate-700">Journal des mouvements</h2>
        <select className={inputCls + " w-auto"} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tous les types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
        {filtered.length === 0 && <p className="text-sm text-slate-400 p-6 text-center">Aucun mouvement.</p>}
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <div className="min-w-0">
              <div className="text-slate-700 truncate">{m.label}</div>
              <div className="text-xs text-slate-400">{m.date}{m.note ? " · " + m.note : ""}</div>
            </div>
            <div className="text-right shrink-0 ml-3">
              {m.caisseDelta ? (
                <div className={m.caisseDelta > 0 ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"}>
                  Caisse {m.caisseDelta > 0 ? "+" : ""}{money(m.caisseDelta)}
                </div>
              ) : null}
              {m.maasserDelta ? (
                <div className={m.maasserDelta > 0 ? "text-violet-600 font-medium" : "text-rose-500 font-medium"}>
                  Ma'asser {m.maasserDelta > 0 ? "+" : ""}{money(m.maasserDelta)}
                </div>
              ) : null}
              {m.personnelDelta ? (
                <div className={m.personnelDelta > 0 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                  {m.personnelDelta > 0 ? "Dû à toi +" : "Remboursé "}{money(Math.abs(m.personnelDelta))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   CATALOGUE (produits) — admin: gestion / user: lecture seule
============================================================ */
function CatalogueTab({ data, patch, isAdmin, stockCounts, onAddToStock, onDistribute }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterLangue, setFilterLangue] = useState("");
  const [filterSource, setFilterSource] = useState("");

  const filtered = data.products.filter((p) => {
    if (search && !p.titre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterLangue && p.langue !== filterLangue) return false;
    if (filterSource && p.source !== filterSource) return false;
    return true;
  });

  const sourcesPresentes = [...new Set(data.products.map((p) => p.source))];
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-1 min-w-[240px] flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input className={inputCls + " pl-8"} placeholder="Rechercher un titre…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={inputCls + " w-auto"} value={filterLangue} onChange={(e) => setFilterLangue(e.target.value)}>
            <option value="">Toutes langues</option>
            {Object.entries(LANGUES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className={inputCls + " w-auto"} value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
            <option value="">Toutes sources</option>
            {sourcesPresentes.map((s) => <option key={s} value={s}>{SOURCES[s] || s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {isAdmin && onAddToStock && (
            <Btn variant={selectMode ? "primary" : "secondary"} onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}>
              <CheckSquare size={15} /> {selectMode ? "Annuler la sélection" : "Sélection multiple"}
            </Btn>
          )}
          {isAdmin && <Btn onClick={() => setAddOpen(true)}><Plus size={15} /> Ajouter un livre</Btn>}
        </div>
      </div>

      <div className="text-xs text-slate-400">{filtered.length} livre{filtered.length > 1 ? "s" : ""}</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.length === 0 && <p className="text-sm text-slate-400 py-8 col-span-full text-center">Aucun livre. {isAdmin && "Ajoute-en un ou importe une capture d'écran."}</p>}
        {filtered.map((p) => {
          const count = stockCounts[p.id] || 0;
          const isSelected = selected.has(p.id);
          return (
            <div
              key={p.id}
              onClick={selectMode ? () => toggleSelect(p.id) : undefined}
              className={`bg-white rounded-2xl border overflow-hidden group hover:shadow-md transition-shadow flex flex-col relative ${selectMode ? "cursor-pointer" : ""} ${isSelected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200"}`}
            >
              {selectMode && (
                <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-md flex items-center justify-center ${isSelected ? "bg-indigo-600 text-white" : "bg-white/90 text-slate-300 border border-slate-300"}`}>
                  {isSelected ? <Check size={14} /> : null}
                </div>
              )}
              <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center overflow-hidden">
                {p.photo ? (
                  <img src={p.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <BookOpen size={28} className="text-slate-300" />
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="font-medium text-slate-800 text-sm leading-snug line-clamp-2 min-h-[2.5em]">{p.titre}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <Badge>{LANGUES[p.langue] || p.langue}</Badge>
                  {isAdmin && <Badge color={count === 0 ? "#dc2626" : "#166534"} bg={count === 0 ? "#fee2e2" : "#dcfce7"}>{count} en stock</Badge>}
                </div>
                <div className="text-base font-bold text-indigo-700 mt-1.5">{formatPrice(p.prixCoutant, p.devise)}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                  <ExternalLink size={10} className="shrink-0" /> <span className="truncate">{SOURCES[p.source] || p.source}</span>
                </div>
                {!selectMode && isAdmin && (onAddToStock || onDistribute) && (
                  <div className="flex gap-1.5 mt-2">
                    {onAddToStock && (
                      <button
                        onClick={() => onAddToStock([p.id])}
                        className="flex-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg py-1.5 flex items-center justify-center gap-1"
                      >
                        <Inbox size={12} /> Stock
                      </button>
                    )}
                    {onDistribute && (
                      <button
                        onClick={() => onDistribute(p.id)}
                        disabled={!count}
                        className="flex-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-1.5 flex items-center justify-center gap-1"
                      >
                        <ArrowRightLeft size={12} /> Distribuer
                      </button>
                    )}
                  </div>
                )}
                {!selectMode && isAdmin && (
                  <div className="flex gap-3 mt-2 pt-2 border-t border-slate-50 flex-wrap">
                    <button onClick={() => setEditing(p)} className="text-xs text-indigo-600 flex items-center gap-1"><Edit3 size={12} /> Modifier</button>
                    <button
                      onClick={() => {
                        patch((d) => {
                          const { id, ...rest } = p;
                          d.products.push({ id: uid(), ...rest, titre: `${p.titre} (copie)` });
                          return d;
                        });
                      }}
                      className="text-xs text-slate-500 flex items-center gap-1"
                    >
                      <Copy size={12} /> Dupliquer
                    </button>
                    <button
                      onClick={() => { if (confirm("Supprimer ce livre du catalogue ?")) patch((d) => { d.products = d.products.filter((x) => x.id !== p.id); return d; }); }}
                      className="text-xs text-rose-500 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4 z-40">
          <span className="text-sm font-medium">{selected.size} livre{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <Btn
            onClick={() => { onAddToStock([...selected]); exitSelectMode(); }}
            className="!bg-white !text-slate-900 hover:!bg-slate-100"
          >
            <Inbox size={15} /> Ajouter au stock
          </Btn>
          <button onClick={exitSelectMode} className="text-slate-300 hover:text-white"><X size={18} /></button>
        </div>
      )}

      {isAdmin && <ProductFormModal open={addOpen} onClose={() => setAddOpen(false)} patch={patch} allTitles={data.products.map((p) => p.titre)} />}
      {isAdmin && editing && <ProductFormModal open={!!editing} onClose={() => setEditing(null)} patch={patch} product={editing} allTitles={data.products.map((p) => p.titre)} />}
    </div>
  );
}

function ProductFormModal({ open, onClose, patch, product, allTitles = [] }) {
  const isEdit = !!product;
  const [titre, setTitre] = useState(product?.titre || "");
  const [langue, setLangue] = useState(product?.langue || "FR");
  const [source, setSource] = useState(product?.source || "manuel");
  const [prixCoutant, setPrixCoutant] = useState(product?.prixCoutant || "");
  const [devise, setDevise] = useState(product?.devise || "ILS");
  const [photo, setPhoto] = useState(product?.photo || "");
  const [extracting, setExtracting] = useState(false);
  const [extractErr, setExtractErr] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitre(product?.titre || ""); setLangue(product?.langue || "FR");
      setSource(product?.source || "manuel"); setPrixCoutant(product?.prixCoutant || "");
      setDevise(product?.devise || "ILS");
      setPhoto(product?.photo || ""); setExtractErr("");
    }
  }, [open, product]);

  const handleFile = async (file, autoExtract) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    const dataUrl = `data:${file.type};base64,${base64}`;
    setPhoto(dataUrl);
    if (autoExtract) {
      setExtracting(true); setExtractErr("");
      try {
        const info = await extractFromScreenshot(base64, file.type);
        if (info.titre) setTitre(info.titre);
        if (info.langue) setLangue(info.langue);
        if (info.prix) setPrixCoutant(info.prix);
      } catch (e) {
        setExtractErr("Extraction IA impossible — remplis les champs manuellement.");
      } finally {
        setExtracting(false);
      }
    }
  };

  const submit = () => {
    if (!titre) return;
    patch((d) => {
      if (isEdit) {
        const p = d.products.find((x) => x.id === product.id);
        Object.assign(p, { titre, langue, source, prixCoutant: Number(prixCoutant) || 0, devise, photo });
      } else {
        d.products.push({ id: uid(), titre, langue, source, prixCoutant: Number(prixCoutant) || 0, devise, photo });
      }
      return d;
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Modifier le livre" : "Ajouter un livre au catalogue"} wide>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="rounded-xl border-2 border-dashed border-slate-300 aspect-[3/4] flex flex-col items-center justify-center overflow-hidden relative">
            {photo ? <img src={photo} className="w-full h-full object-cover" /> : (
              <div className="text-center p-4 text-slate-400 text-xs">
                <Camera size={22} className="mx-auto mb-1" /> Photo ou capture d'écran
              </div>
            )}
            {extracting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs gap-2">
                <Loader2 className="animate-spin" size={16} /> Extraction IA…
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0], true)} />
          <div className="flex gap-2 mt-2">
            <Btn size="sm" variant="secondary" onClick={() => fileRef.current?.click()} className="flex-1 justify-center">
              <Sparkles size={13} /> Capture d'écran (auto-remplir)
            </Btn>
          </div>
          {extractErr && <p className="text-[11px] text-rose-500 mt-1">{extractErr}</p>}
          <p className="text-[11px] text-slate-400 mt-1">L'IA lit la capture pour proposer titre, langue et prix — vérifie avant d'enregistrer.</p>
        </div>

        <div>
          <Field label="Titre">
            <input className={inputCls} value={titre} onChange={(e) => setTitre(e.target.value)} list="titres-catalogue-existants" autoComplete="off" />
            <datalist id="titres-catalogue-existants">
              {[...new Set(allTitles)].map((t) => <option key={t} value={t} />)}
            </datalist>
            <span className="text-[11px] text-slate-400">L'autocomplétion te montre les titres déjà présents, pour éviter les doublons.</span>
          </Field>
          <Field label="Langue">
            <select className={inputCls} value={langue} onChange={(e) => setLangue(e.target.value)}>
              {Object.entries(LANGUES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Source / Kern">
            <select className={inputCls} value={source} onChange={(e) => setSource(e.target.value)}>
              {Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prix coûtant">
              <input type="number" className={inputCls} value={prixCoutant} onChange={(e) => setPrixCoutant(e.target.value)} />
            </Field>
            <Field label="Devise">
              <select className={inputCls} value={devise} onChange={(e) => setDevise(e.target.value)}>
                {Object.entries(DEVISES).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
              </select>
            </Field>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn onClick={submit}><Check size={15} /> {isEdit ? "Enregistrer" : "Ajouter au catalogue"}</Btn>
      </div>
    </Modal>
  );
}
