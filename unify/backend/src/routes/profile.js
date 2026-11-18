const router = require('express').Router();
const { getDoc, createDoc, updateDoc } = require('../lib/firestoreRest');
const { requireAuth } = require('../middleware/auth');

// Single shared company profile document (matches original single-tenant design).
const DOC_PATH = 'profile/main';

// GET /api/profile
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let doc = await getDoc(DOC_PATH, req.user.idToken);
    if (!doc) {
      const account = await getDoc(`users/${req.user.uid}`, req.user.idToken);
      const profile = {
        companyName: account?.company || '',
        industry: '',
        employees: 0,
        location: '',
        capabilities: [],
        certifications: [],
        bio: '',
        pastProjects: [],
      };

      try {
        doc = await createDoc('profile', profile, req.user.idToken, { documentId: 'main' });
      } catch (createError) {
        if (createError.status !== 409) throw createError;
        doc = await getDoc(DOC_PATH, req.user.idToken);
        if (!doc) throw createError;
      }
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile
router.put('/', requireAuth, async (req, res, next) => {
  try {
    const { companyName, industry, employees, location, capabilities, certifications, bio, pastProjects } = req.body;
    if (typeof companyName !== 'string' || typeof industry !== 'string' ||
        typeof location !== 'string' || typeof bio !== 'string' ||
        !Array.isArray(capabilities) || !Array.isArray(certifications) ||
        !Array.isArray(pastProjects)) {
      return res.status(400).json({ error: 'Profile fields are invalid' });
    }
    const data = {
      companyName, industry, employees, location,
      capabilities, certifications,
      bio, pastProjects,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(DOC_PATH, data, req.user.idToken);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
