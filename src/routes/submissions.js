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
      const submissions = await req.store.get();

      // Organize them by assignment
      let assignments = await req.store.assignments();
      assignments = assignments.map(a => {
        a.submissions = [];
        for (const s of submissions) {
          if (s.aid === a.aid) {
            s.downloadLink = '/api/uploads/' + s.uid + '/' + s.aid;
            a.submissions.push(s);
          }
        }
        return a;
      });

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
