const express = require('express');

function buildHomeRoute(config) {
  const router = express.Router();

  router.get('/', async function(req, res) {
    // Get all of the assigments
    const assignments = await req.store.assignments();

    // Get all of the file submission for the user
    const uploads = await req.store.get({ uid: req.session.uid });

    // Create our submissions to render
    const submissions = assignments.value.map(assignment => {
      let uploadedAssignment = uploads.value.filter(upload => upload.aid === assignment.aid);
      let isSubmitted = uploadedAssignment.length !== 0;
      if (isSubmitted) uploadedAssignment = uploadedAssignment[0];
      return {
        aid: assignment.aid,
        name: assignment.name,
        submissionDate: isSubmitted ? uploadedAssignment.submissionDate : '',
        isVerified: isSubmitted ? (uploadedAssignment.isVerified ? 'Yes' : 'No') : '',
        isSubmitted,
        downloadLink: isSubmitted ? '/api/uploads/' + req.session.uid + '/' + assignment.aid : ''
      };
    });

    let isAdmin = req.session.role === 'admin';

    const context = {
      user: {
        uid,
        name: req.session.name,
        isAdmin
      },
      admin: {
        navText: isAdmin ? 'View All Submissions' : '',
        navLink: isAdmin ? '/submissions' : ''
      },
      header: {
        subtext: config.view.subtext
      },
      body: {
        assignments,
        submissions
      }
    };

    res.render('home', context);
  });

  return router;
}

module.exports = buildHomeRoute;
