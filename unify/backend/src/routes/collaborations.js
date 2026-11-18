const router = require('express').Router();
const { listDocs, getDoc, createDoc } = require('../lib/firestoreRest');
const { requireAuth } = require('../middleware/auth');

const COLLECTION = 'collaborations';

// GET /api/collaborations
router.get('/', async (req, res, next) => {
  try {
    const docs = await listDocs(COLLECTION, { orderBy: 'createdAt', direction: 'DESCENDING' });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

// GET /api/collaborations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await getDoc(`${COLLECTION}/${req.params.id}`);
    if (!doc) return res.status(404).json({ error: 'Collaboration not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// POST /api/collaborations
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { projectTitle, requiredSkills, budget, sector, partnersNeeded, description } = req.body;
    if (typeof projectTitle !== 'string' || !projectTitle.trim() ||
        typeof sector !== 'string' || !sector.trim() ||
        typeof budget !== 'string' || !budget.trim()) {
      return res.status(400).json({ error: 'Project title, sector, and budget are required' });
    }

    const account = await getDoc(`users/${req.user.uid}`, req.user.idToken);
    const accountCompany = account?.company?.trim();
    const businessProfile = accountCompany ? null : await getDoc('profile/main', req.user.idToken);
    const companyName = accountCompany || businessProfile?.companyName?.trim();
    if (!companyName) {
      return res.status(400).json({ error: 'Add your company name to your profile before posting a collaboration' });
    }

    const doc = await createDoc(COLLECTION, {
      companyName,
      projectTitle: projectTitle.trim(),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills.filter((skill) => typeof skill === 'string' && skill.trim())
        : [],
      budget: budget.trim(),
      sector: sector.trim(),
      partnersNeeded: Number.isInteger(partnersNeeded) && partnersNeeded > 0 ? partnersNeeded : 1,
      description: typeof description === 'string' ? description.trim() : '',
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
    }, req.user.idToken);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
