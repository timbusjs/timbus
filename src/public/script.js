function onNewSubmissionSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  let form = new FormData(document.getElementById('formNewSubmission'));
  api
    .post('/uploads', form, true)
    .then(function() {
      window.location.reload();
    })
    .catch(function(err) {
      console.log(err);
    });

  return false;
}
let eNewSubmissionForm = document.getElementById('formNewSubmission');
if (eNewSubmissionForm) {
  eNewSubmissionForm.addEventListener('submit', onNewSubmissionSubmit);
}

function onVerifyLinkClick(event) {
  event.preventDefault();
  event.stopPropagation();

  api
    .post(`/uploads/${this.dataset.uid}/${this.dataset.aid}/verify`)
    .then(function(response) {
      window.location.reload();
    })
    .catch(function(err) {
      console.error(err);
    });

  return false;
}
let cVerifyLinks = document.getElementsByClassName('submission-verify-link');
if (cVerifyLinks) {
  for (let eVerifyLink of cVerifyLinks) {
    eVerifyLink.addEventListener('click', onVerifyLinkClick);
  }
}
