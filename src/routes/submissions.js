const express = require('express');

function buildSubmissionRoutes(config) {
  const router = express.Router();

  router.get('/submissions', async function(req, res, next) {
    try {
      const isAdmin = req.session.role === 'admin';
      if (!isAdmin) {
        return res.render('401', { unauthorized: true });
      }

      // Get all of the submissions
      let assignments = await req.store.get();
      res.render('submissions', {
        user: {
          uid: req.session.uid,
          name: req.session.name,
          isAdmin: req.session.role === 'admin'
        },
        admin: {
          navText: 'View My Submissions',
          navLink: '/'
        },
        body: {
          assignments
        }
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = buildSubmissionRoutes;
