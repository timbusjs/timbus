const express = require('express');
const path = require('path');
const nfs = require('fs');
const util = require('util');
const multer = require('multer');
const logger = require('../util/logger');

const fs = {
  exists: util.promisify(nfs.exists),
  mkdir: util.promisify(nfs.mkdir)
};

function buildApiRoutes(config) {
  const router = express.Router();

  const upload = multer({
    storage: multer.diskStorage({
      destination: async function(req, file, cb) {
        const dest = path.join(config.webroot, 'data', 'uploads', req.session.uid);
        const exists = await fs.exists(dest);

        if (exists) return cb(null, dest);

        try {
          await fs.mkdir(dest, { recursive: true });
          cb(null, dest);
        } catch (err) {
          cb(new Error(`Failed to create upload directory for "${req.session.uid}: ${err.message}`));
        }
      },
      filename: function(req, file, cb) {
        cb(null, req.body.aid);
      }
    })
  });

  /**
   * Handle uploading an assignment.
   */
  router.post('/uploads', upload.single('assignment'), async function(req, res) {
    const { uid } = req.session;
    const { aid } = req.body;

    logger.info('Uploading assignment ', aid, 'for user ', uid);

    const entry = {
      uid,
      aid,
      fileName: req.body.key + path.extname(req.file.originalname),
      submissionDate: moment().format('YYYY-MM-DD'),
      isVerified: false
    };

    await req.store.put(entry);

    res.status(200).json({ message: 'Success' });
  });

  /**
   * Handle request to download an assignment.
   */
  router.get('/uploads/:uid/:aid', async function(req, res) {
    const { uid, aid } = request.params;

    if (uid !== req.session.uid && req.session.role !== 'admin') {
      logger.warn('Unauthorized request by', req.session.uid, 'to download the file for', aid, 'belonging to', uid);
      return res.render('401', { unauthorized: true });
    }

    logger.info('Downloading file for assignment', aid, 'submitted by', uid);

    const files = await req.store.get({ uid, aid });
    if (files.length === 0) {
      logger.info('No assignment', aid, 'submitted by', uid);
      return res.status(404).end();
    }

    const file = files[0];
    const filepath = path.join(config.webRoot, 'data', 'uploads', uid, aid);
    res.download(filepath, uid + '.' + file.name);
  });

  /**
   * Handle a request by an administrator to verify a submission.
   */
  router.post('/submissions/:uid/:aid/verify', async function(req, res) {
    const { uid, aid } = request.params;
    const isAdmin = req.session.role === 'admin';

    if (!isAdmin) {
      res.status(401).json({ message: 'You are not authorized to make this request' });
    }

    const files = await req.store.get({ uid, aid });
    if (files.length === 0) {
      logger.info('No assignment', aid, 'submitted by', uid, 'to verify');
      return res.status(404).json({ message: 'No assignment with ID ' + aid + ' submitted by ' + uid });
    }

    const file = files[0];
    file.isVerified = true;

    await req.store.put(file);

    res.status(200).end();
  });

  return router;
}

module.exports = buildApiRoutes;
