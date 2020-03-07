const express = require('express');

function buildSubmissionRoutes(config) {
  const router = express.Router();

  router.get('/submissions', async function(req, res) {
    const isAdmin = req.session.role === 'admin';
    if (!isAdmin) {
      return res.render('401', { unauthorized: true });
    }

    // Get all of the submissions
    let assignments = await req.store.get();
    res.render('submissions', {
      uid: req.session.uid,
      isAdmin,
      assignments,
      adminNavText: 'View My Submissions',
      adminNavLink: '/'
    });
  });

  return router;
}

module.exports = buildSubmissionRoutes;
