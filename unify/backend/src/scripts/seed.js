require('dotenv').config();
const { API_KEY, PROJECT_ID } = require('../config/firebase');
const { listDocs, getDoc, createDoc, updateDoc, deleteDoc } = require('../lib/firestoreRest');

const TENDER_PORTAL = 'https://eprocure.gov.in/eprocure/app?page=FrontEndAdvancedSearch&service=page';
const AWARD_PORTAL = 'https://eprocure.gov.in/eprocure/app?page=ResultOfTenders&service=page';
const SOURCE_NAME = 'Central Public Procurement Portal (Government of India)';

const demoRecords = {
  opportunities: [
    ['1', 'Smart City Infrastructure Development'],
    ['2', 'Agricultural Supply Chain Digitization'],
    ['3', 'Renewable Energy Component Supply'],
    ['4', 'Healthcare Data Analytics Platform'],
    ['5', 'E-Commerce Logistics Integration'],
    ['6', 'Financial Inclusion Mobile Platform'],
    ['7', 'National Road Safety Management System'],
    ['8', 'Water Treatment Facility Modernization'],
    ['9', 'Renewable Energy Grid Integration'],
    ['10', 'Education Technology Platform Development'],
    ['11', 'Cybersecurity Infrastructure Enhancement'],
    ['12', 'Manufacturing Excellence Program - Automation'],
  ],
  governmentTenders: [
    ['t1', 'Smart City Infrastructure Development'],
    ['t2', 'Healthcare Data Analytics Platform'],
    ['t3', 'National Road Safety Management System'],
  ],
  governmentContracts: [
    ['1', 'National Highway Smart Tolling System'],
    ['2', 'Digital Health Records Platform'],
    ['3', 'Agricultural Commodity Exchange Portal'],
    ['4', 'Smart Water Management System'],
    ['5', 'Renewable Energy Grid Integration'],
  ],
};

const configuredTenders = [
  {
    id: 'cppt-54-ee-eld-3-dda-2026-27',
    title: 'Maintenance of Various Sports Complexes',
    referenceNumber: '54/EE/ELD-3/DDA/2026-27',
    deadline: '2026-11-26T15:00:00+05:30',
    bidOpeningDate: '2026-11-27T15:30:00+05:30',
    sector: 'Facilities maintenance',
  },
  {
    id: 'cppt-ss-c050-1p39a-wc-mr-3112-80',
    title: 'SS/C050-1P39A-WC-MR-3112/80 - FLANGES-CS, AS AND SS for Polypropylene Unit (PPU) Project at Numaligarh Refinery, Assam',
    referenceNumber: 'SS/C050-1P39A-WC-MR-3112/80',
    deadline: '2026-12-09T12:00:00+05:30',
    bidOpeningDate: '2026-12-10T14:00:00+05:30',
    sector: 'Industrial supplies',
  },
  {
    id: 'cppt-nh-ccw-cc-ii-co-495-pr-004',
    title: 'Construction of Power house and Associated Works for 640 MW ISP OSP Pumped Storage Project Package I Civil Works',
    referenceNumber: 'NH/CCW/CC-II/CO-495/PR-004',
    deadline: '2027-01-02T17:30:00+05:30',
    bidOpeningDate: '2027-01-05T11:00:00+05:30',
    sector: 'Construction and energy',
  },
  {
    id: 'cppt-53-ee-eld-3-dda-2026-27',
    title: 'Maintenance of Various Sports Complexes',
    referenceNumber: '53/EE/ELD-3/DDA/2026-27',
    deadline: '2026-11-25T15:00:00+05:30',
    bidOpeningDate: '2026-11-26T15:30:00+05:30',
    sector: 'Facilities maintenance',
  },
  {
    id: 'cppt-nh-dg-contract-1105-2026-27-57',
    title: 'Refilling and hydraulic pressure testing of fire extinguishers installed at various places of Dhauliganga Power Station',
    referenceNumber: 'NH/DG/Contract/1105/2026-27/57',
    deadline: '2026-12-09T18:55:00+05:30',
    bidOpeningDate: '2026-12-16T15:00:00+05:30',
    sector: 'Fire safety',
  },
  {
    id: 'cppt-rebit-cpo-26-27-pr1241-848-308',
    title: 'Group Term Insurance Policy for ReBIT Employees',
    referenceNumber: 'ReBIT/CPO/26-27/PR1241/848/308',
    deadline: '2026-12-02T16:00:00+05:30',
    bidOpeningDate: '2026-12-03T16:00:00+05:30',
    sector: 'Insurance',
  },
  {
    id: 'cppt-mnit-nit-e-2026-27-17',
    title: 'MNIT/NIT/E/2026-27/17',
    referenceNumber: 'MNIT/NIT/E/2026-27/17',
    deadline: '2026-12-10T16:00:00+05:30',
    bidOpeningDate: '2026-12-11T16:00:00+05:30',
    sector: 'Education',
  },
  {
    id: 'cppt-17-stc-pf-2026-27',
    title: 'Improvement of wet canteen at BSF Campus Yelahanka Under STC BSF Bangalore',
    referenceNumber: '17/STC/PF/2026-27',
    deadline: '2026-11-27T18:00:00+05:30',
    bidOpeningDate: '2026-11-30T11:00:00+05:30',
    sector: 'Facilities and catering',
  },
  {
    id: 'cppt-2026270571-mm-6-mm-549',
    title: 'Empanelment of Firm for Providing Various Cartridges to the Institute',
    referenceNumber: '2026270571/MM-6/MM/549',
    deadline: '2026-12-09T15:00:00+05:30',
    bidOpeningDate: '2026-12-09T15:30:00+05:30',
    sector: 'Office supplies',
  },
  {
    id: 'cppt-iimj-nit-print-2026-27-22',
    title: 'Paper Based Printing Services',
    referenceNumber: 'IIMJ/NIT/Print/2026-27/22',
    deadline: '2026-12-10T15:00:00+05:30',
    bidOpeningDate: '2026-12-11T15:00:00+05:30',
    sector: 'Printing services',
  },
];

async function authenticateAdmin() {
  const email = (process.env.ADMIN_EMAILS || '').split(',')[0].trim();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!API_KEY || !email || !password) {
    throw new Error('FIREBASE_API_KEY, ADMIN_EMAILS, and ADMIN_SEED_PASSWORD are required to sync government data.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Firebase admin sign-in failed: ${body?.error?.message || response.status}`);
  }
  return body.idToken;
}

async function removeDemoRecords(collection, signatures, idToken) {
  let removed = 0;
  for (const [id, title] of signatures) {
    const record = await getDoc(`${collection}/${id}`, idToken);
    if (record?.title === title) {
      await deleteDoc(`${collection}/${id}`, idToken);
      removed += 1;
    }
  }
  console.log(`Removed ${removed} known demo ${collection} record(s).`);
}

async function upsertTender(tender, idToken, seededAt) {
  const closesAt = new Date(tender.deadline);
  const status = closesAt.getTime() > Date.now() ? 'active' : 'closed';
  const description =
    `Reference: ${tender.referenceNumber}. ` +
    `Closing date: ${closesAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST. ` +
    `Bid opening: ${new Date(tender.bidOpeningDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.`;
  const data = {
    title: tender.title,
    referenceNumber: tender.referenceNumber,
    department: 'See the official tender notice',
    location: 'See the official tender notice',
    budget: 'Not stated in the portal summary',
    deadline: tender.deadline,
    bidOpeningDate: tender.bidOpeningDate,
    sector: tender.sector,
    verified: false,
    description,
    fullDescription: description,
    applyLink: TENDER_PORTAL,
    sourceName: SOURCE_NAME,
    sourceUrl: TENDER_PORTAL,
    sourceCheckedAt: null,
    status,
    createdAt: seededAt,
  };
  const path = `governmentTenders/${tender.id}`;
  if (await getDoc(path, idToken)) {
    await updateDoc(path, data, idToken);
  } else {
    await createDoc('governmentTenders', data, idToken, { documentId: tender.id });
  }
}

async function main() {
  if (!PROJECT_ID) throw new Error('FIREBASE_PROJECT_ID is required.');
  const idToken = await authenticateAdmin();
  const seededAt = new Date().toISOString();

  for (const [collection, records] of Object.entries(demoRecords)) {
    await removeDemoRecords(collection, records, idToken);
  }

  for (const tender of configuredTenders) {
    await upsertTender(tender, idToken, seededAt);
  }
  console.log(
    `Added or updated ${configuredTenders.length} configured tender notices. ` +
    `This script does not fetch or verify live listings; confirm every notice on ${TENDER_PORTAL}.`
  );

  const contracts = await listDocs('governmentContracts', {}, idToken);
  console.log(
    `${contracts.length} government contract record(s) remain. ` +
    `The official bid-awards portal is ${AWARD_PORTAL}; no award records were available in the checked public listing.`
  );
}

main().catch((err) => {
  console.error(`Government data sync failed: ${err.message}`);
  process.exitCode = 1;
});
