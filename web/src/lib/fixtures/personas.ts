/*
 * The three fictional applicants from the challenge brief. Their packs show
 * the full range of statuses: licence-backed facts, spoken claims, gaps and
 * self-contradictions.
 */

import { EXPECTED_RESULTS as R, PRODUCT_UNIQUENESS as U } from "../types";
import { established, missing, quickPack, unverified } from "./build";

export const almaz = quickPack({
  id: "almaz",
  language: "om",
  persona: {
    name: "Almaz Wolde",
    age: 54,
    role: "Spice mill owner",
    place: "Bekoji Tera, Arsi · Tier-2 town",
    device: "Feature phone · her son forwards WhatsApp voice notes",
    story: "Eight employees, six of them women, packing berbere for shops in two towns. Paper licence, no email. Has never seen an organogram.",
  },
  voiceNote: {
    language: "om",
    duration: "3:12",
    excerpt:
      "We grind berbere and shiro for shops in Bekoji and Asella. Eight people work with me, six are women. The grinder gets too hot and stops, and the Asella shops wait.",
  },
  name: "Almaz Wolde Spice Mill",
  town: "Bekoji Tera",
  region: "Oromia",
  address: "Kebele 02, Bekoji Tera, Arsi Zone, Oromia",
  category: "agro_processing",
  typeOfBusiness: "Spice milling and packing (berbere, shiro)",
  licence: {
    number: "OR/ARS/BT/0417/2016",
    registered: "2016-03-14",
    validUntil: "2027-07-07",
    activity: "Grain and spice milling",
  },
  form: "Sole Proprietorship",
  years: 11,
  phone: "+251 91 234 5678",
  email: null,
  ownership: [100, 0],
  description:
    "Buys dried chillies from farmers around Bekoji, grinds and blends berbere and shiro, and packs them in 500 g and 1 kg bags for about forty shops.",
  growth: [
    [2023, 380_000, 6, 5, 1],
    [2024, 470_000, 7, 5, 2],
    [2025, 560_000, 8, 6, 2],
  ],
  motivation:
    "Shops in Asella ask for more than the mill can grind. She wants to stop turning orders away and give steady work to the women who pack.",
  goals: "Supply every shop in Bekoji and Asella every week, and start selling in Shashemene within two years.",
  market:
    "About forty small shops in Bekoji and Asella buy weekly. Two other mills in Bekoji sell loose spice; none pack in sealed bags.",
  products: [
    ["Berbere (500 g and 1 kg bags)", "Shops in Bekoji", "Her son delivers by bajaj"],
    ["Shiro powder", "Shops in Asella", "A wholesale buyer collects weekly"],
  ],
  uniqueness: U.DIFFERENT_FROM_COMPETITORS,
  localPct: 95,
  team: [
    ["Almaz Wolde", "Owner and manager", "Female"],
    ["Dawit Tesfaye", "Sales and deliveries (her son)", "Male"],
  ],
  organogram: null,
  problem:
    "The single hand-fed grinder overheats and stops for about two hours a day, so the mill cannot meet orders from the Asella shops.",
  equipment: [
    ["Hammer mill with dust cyclone (5.5 kW)", 1, 380_000, "Double grinding capacity with less dust in the air"],
    ["Semi-automatic pouch sealer", 1, 70_000, "Sealed 500 g packs that keep longer on the shelf"],
  ],
  results: [R.ENHANCING_PRODUCTION_CAPACITY, R.REACHING_NEW_MARKETS, R.IMPROVING_PRODUCT_SERVICE_QUALITY],
  resultsExplanation:
    "A bigger mill removes the daily stoppage; sealed bags let shops further away keep the spice longer.",
  jobs: [
    ["Packer", 2],
    ["Delivery helper", 1],
  ],
  jobsExplanation: "Two more women to pack once the new mill runs a full day, and a helper for deliveries to Asella.",
  social: "Most workers are women from the town. The new mill's cyclone takes chilli dust out of the air.",
  osh: null,
  priorFunding: false,
  impact: {
    title: "More berbere, cleaner air: doubling Almaz's spice mill in Bekoji",
    sdgs: [5, 8, 3],
    beneficiaries: [
      "8 current workers, 6 of them women",
      "3 new workers, 2 of them women",
      "About 40 shops in Bekoji and Asella",
    ],
    milestones: [
      ["New mill installed and workers trained", "Month 2"],
      ["Sealed 500 g packs on shelves in Asella", "Month 4"],
      ["Two new packers hired", "Month 6"],
    ],
    sector: "Agro-processing (spices)",
  },
  provenance: {
    "company_profile.address": established("licence", "Address printed on the licence matches what she said."),
    "company_profile.type_of_business": established("licence", "Matches the licensed activity: grain and spice milling."),
    "company_profile.mobile_number": unverified(
      "applicant_voice",
      undefined,
      "This is her son Dawit's number; he forwards the voice notes. Confirm the programme may call it.",
    ),
    "company_profile.email": missing(
      "Almaz has no email. Ask whether Dawit's email may be used, with her consent.",
    ),
    "company_profile.number_of_years_in_operation": unverified(
      "applicant_voice",
      "“I started grinding for neighbours eleven years ago.”",
    ),
    "company_profile.ownership": unverified("applicant_voice", "“The mill is mine alone.”"),
    "company_overview.growth_indicators": unverified(
      "applicant_voice",
      undefined,
      "Almaz recalled 2023–2025 from memory. There is no sales book, and 2021–2022 are not known.",
    ),
    products_services: unverified(
      "workshop_photo",
      "Packed 1 kg berbere bags are visible in the workshop photo.",
      "The products are visible; the markets are her word.",
    ),
    product_uniqueness: unverified("applicant_voice", "“Our chillies are sun-dried, never machine-dried.”"),
    local_raw_material_percentage: unverified(
      "applicant_voice",
      "“All the chillies come from farmers around Bekoji and Asella; only the bags come from Addis.”",
    ),
    "management.organogram": missing(
      "Almaz has never drawn an organogram. FundFlow can draft one from the team list for her to confirm; it will not invent one.",
    ),
    "intervention.problem_description": unverified(
      "workshop_photo",
      "The workshop photo shows one hand-fed grinder.",
    ),
    "intervention.equipment": unverified(
      "applicant_voice",
      undefined,
      "Prices are what a supplier in Adama told her son. No pro-forma invoice yet.",
    ),
    "intervention.consultants": missing("Almaz did not ask for advice. Optional section."),
    "intervention.expected_results": unverified(
      "applicant_voice",
      undefined,
      "Mapped from her description. She confirms each result before submission.",
    ),
    "intervention.osh_commitment": missing(
      "Chilli dust is a known hazard. Ask what protection the workers have today: masks, ventilation.",
    ),
  },
});

export const nahom = quickPack({
  id: "nahom",
  language: "en",
  statedVia: "applicant_typed",
  persona: {
    name: "Nahom Tadesse",
    age: 28,
    role: "Electronics repair shop owner",
    place: "Addis Ketema, Addis Ababa",
    device: "Android phone · fills in forms himself, in English",
    story: "Three staff. Wants a second rework station for board-level repairs. Guesses at his sales growth, and cannot know one grid variant rewards a unique feature twice as heavily.",
  },
  voiceNote: {
    language: "en",
    duration: "1:48",
    excerpt:
      "I want a second rework station. Right now board-level jobs wait four to six days and I send people away. We grow maybe forty percent a year, I think.",
  },
  name: "Nahom Electronics Repair",
  town: "Addis Ababa",
  region: "Addis Ababa",
  address: "Addis Ketema sub-city, Woreda 06, Addis Ababa",
  category: "services",
  typeOfBusiness: "Phone and laptop repair, board-level (micro-soldering) repair",
  licence: {
    number: "AA/AK/14/098762",
    registered: "2023-10-12",
    validUntil: "2027-07-07",
    activity: "Repair of electronic and communication equipment",
  },
  form: "Sole Proprietorship",
  years: 5,
  phone: "+251 92 876 5432",
  email: "nahom.tadesse@example.com",
  ownership: [0, 100],
  description:
    "Repairs phones and laptops for walk-in customers and does board-level repairs for other shops that lack the equipment.",
  growth: [
    [2023, 420_000, 2, 1, 1],
    [2024, 590_000, 3, 1, 2],
    [2025, 830_000, 3, 1, 2],
  ],
  motivation: "Board-level jobs queue for four to six days and about a third are turned away.",
  goals: "Become the go-to board-level repair shop for other repair shops across Addis Ababa.",
  market: "Walk-in customers in Addis Ketema, plus about twelve repair shops that send him boards they cannot fix.",
  products: [
    ["Phone and laptop repair", "Walk-in customers in Addis Ketema", "Shop front"],
    ["Board-level repair for other shops", "Repair shops across Addis Ababa", "Motorbike courier pick-up"],
    ["Refurbished phones", "Buyers on Telegram", "Telegram channel"],
  ],
  uniqueness: U.DIFFERENT_FROM_COMPETITORS,
  localPct: 10,
  team: [
    ["Nahom Tadesse", "Owner and lead technician", "Male"],
    ["Selam Girma", "Front desk and bookkeeping", "Female"],
    ["Yonas Bekele", "Technician", "Male"],
  ],
  organogram: "Nahom (owner, lead technician) → Selam (front desk, bookkeeping); Nahom → Yonas (technician)",
  problem:
    "Only one hot-air rework station: board-level jobs queue for four to six days and about 30% are turned away.",
  equipment: [
    ["BGA rework station", 1, 185_000, "Run two board-level jobs in parallel"],
    ["Trinocular inspection microscope", 1, 65_000, "Fewer failed repairs on fine-pitch chips"],
  ],
  consultants: [
    [
      "Jobs and spare parts are tracked on paper and parts go missing",
      "Simple job-card and stock system, with bookkeeping coaching",
    ],
  ],
  results: [
    R.ENHANCING_PRODUCTION_CAPACITY,
    R.REACHING_NEW_CLIENTS,
    R.IMPROVING_PRODUCT_SERVICE_QUALITY,
    R.FINANCIAL_SUSTAINABILITY,
  ],
  resultsExplanation: "A second station halves the queue; the microscope cuts rework; a job-card system stops lost parts.",
  jobs: [["Junior technician (trainee)", 2]],
  jobsExplanation: "Two trainees from the TVET college once the second station is running.",
  social: "Repairs keep about 2,000 phones and laptops a year in use instead of in landfill, and train young technicians.",
  osh: "Anti-static mats, a fume extractor at each soldering station and a fire extinguisher.",
  priorFunding: null,
  impact: {
    title: "A second rework station for board-level repairs in Addis Ketema",
    sdgs: [8, 12, 4],
    beneficiaries: [
      "3 current staff",
      "2 trainee technicians",
      "About 12 partner repair shops",
      "About 2,000 device owners a year",
    ],
    milestones: [
      ["Rework station and microscope installed", "Month 1"],
      ["Two trainees hired", "Month 2"],
      ["Board-level queue under two days", "Month 4"],
      ["Job-card system in daily use", "Month 6"],
    ],
    sector: "Electronics repair services",
  },
  provenance: {
    "company_profile.address": established("licence", "Sub-city and woreda printed on the licence."),
    "company_profile.number_of_years_in_operation": unverified(
      "applicant_typed",
      "“I have been fixing phones here for five years.”",
    ),
    "company_overview.growth_indicators": unverified(
      "applicant_typed",
      "“We grow maybe forty percent a year, I think.”",
      "Nahom rebuilt these figures from his estimate of 40% a year. They are not from books, so the grid scores them provisionally.",
    ),
    "intervention.problem_description": unverified(
      "workshop_photo",
      "The workshop photo shows one hot-air station and a queue of boards.",
    ),
    "intervention.equipment": unverified(
      "applicant_typed",
      undefined,
      "Prices typed from an online listing. No pro-forma invoice yet.",
    ),
    product_uniqueness: unverified(
      "applicant_typed",
      "“The only shop in the area doing BGA reballing.”",
      "His claim; compare with nearby shops on the site visit.",
    ),
  },
});

export const hiwot = quickPack({
  id: "hiwot",
  language: "am",
  persona: {
    name: "Hiwot Alemu",
    age: 26,
    role: "Founder, training & job-placement initiative",
    place: "Hawassa, Sidama",
    device: "Smartphone · prefers voice to forms",
    story: "Trains young people for free and earns when a graduate is placed. Wants a project on ImpactProtocol. SDGs and milestones are foreign; her sector is missing from the list.",
  },
  voiceNote: {
    language: "am",
    duration: "2:35",
    excerpt:
      "I train young people for free and I get paid when one of them is hired and stays. Employers want computer skills, and I have no computers.",
  },
  name: "Hiwot Skills & Placement",
  town: "Hawassa",
  region: "Sidama",
  address: "Tabor sub-city, Hawassa, Sidama",
  category: null,
  typeOfBusiness: "Skills training and job placement",
  licence: {
    number: "SID/HAW/2024/00311",
    registered: "2024-01-20",
    validUntil: "2027-07-07",
    activity: "Training and employment agency services",
  },
  form: "Sole Proprietorship",
  years: 2,
  phone: "+251 94 555 0199",
  email: "hiwot.skills@example.com",
  ownership: [60, 50],
  description:
    "Runs free eight-week job-readiness courses for unemployed young people and earns a fee from employers for each graduate who stays three months.",
  growth: [
    [2024, 95_000, 3, 2, 2],
    [2025, 210_000, 4, 3, 3],
  ],
  motivation: "Employers ask for computer skills that her trainees cannot practise; she turns away half the applicants.",
  goals: "Train 120 young people a year and cover all costs from placement fees within a year.",
  market: "Hotels and factories in Hawassa Industrial Park hire her graduates; youth offices refer trainees.",
  products: [
    ["Free 8-week job-readiness training", "Unemployed youth aged 18–29 in Hawassa", "Kebele youth offices and Telegram"],
    ["Placement service (fee per hire)", "Hotels and factories in Hawassa Industrial Park", "Direct agreements with employers"],
  ],
  uniqueness: U.DIFFERENT_FROM_COMPETITORS,
  localPct: null,
  team: [
    ["Hiwot Alemu", "Founder and lead trainer", "Female"],
    ["Meron Kassa", "Trainer", "Female"],
    ["Samuel Alemu", "Employer relations", "Male"],
  ],
  organogram: null,
  problem: "She rents a room by the hour and has no computers, so trainees cannot practise the digital skills employers test for.",
  equipment: [
    ["Laptops for a training lab", 10, 420_000, "Hands-on practice for digital skills tests"],
    ["Projector and training furniture", 1, 60_000, "A room she can use every day"],
  ],
  results: [R.REACHING_NEW_CLIENTS, R.ENHANCING_PRODUCTION_CAPACITY, R.FINANCIAL_SUSTAINABILITY],
  resultsExplanation: "A lab doubles the size of each cohort, and more placements bring more fees.",
  jobs: [
    ["Trainer", 1],
    ["Placement officer", 1],
  ],
  jobsExplanation: "A second trainer for parallel cohorts and an officer to follow up with employers.",
  social: "About 120 young people a year, 60% of them young women. Trainees pay nothing.",
  osh: null,
  priorFunding: false,
  impact: {
    title: "Job-ready in eight weeks: free training that pays for itself through placements",
    sdgs: [4, 8, 5],
    beneficiaries: [
      "About 120 young people a year, 60% women",
      "About 15 employers in Hawassa",
      "2 new staff",
    ],
    milestones: [
      ["Training lab set up", "Month 1"],
      ["First cohort of 30 trained", "Month 3"],
      ["20 graduates placed and still employed after 3 months", "Month 6"],
      ["Placement fees cover running costs", "Month 12"],
    ],
    sector: null,
  },
  provenance: {
    "company_profile.address": established("licence", "Sub-city printed on the licence."),
    "company_profile.ownership": unverified(
      "applicant_voice",
      "“I hold sixty percent, and my cousin Samuel holds half.”",
    ),
    "company_overview.growth_indicators": unverified(
      "applicant_voice",
      undefined,
      "Placement fees read out from her notebook in the voice note.",
    ),
    local_raw_material_percentage: missing(
      "A training business uses few raw materials. Ask whether this applies; if not, the programme team marks it not applicable. FundFlow will not enter 0%.",
    ),
    "management.organogram": missing("Not described yet. FundFlow can draft one from the team list for her to confirm."),
    "intervention.consultants": missing("Hiwot did not ask for advice. Optional section."),
    "intervention.osh_commitment": missing("Ask what safety rules apply in the training room: fire exit, electrical safety."),
    "impact.sector": missing(
      "Her sector, skills training and job placement, is not in the ImpactProtocol sector list. Flagged for the programme team to add; FundFlow did not force it into the nearest category.",
    ),
  },
});

export const PERSONA_PACKS = [almaz, nahom, hiwot];
