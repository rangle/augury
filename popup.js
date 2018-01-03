function initialize() {
  subVersionNumbers();
  document.getElementById("create_issue").addEventListener("click", generateGithubIssuesBodyText);
}

function subVersionNumbers() {
  var versionInstances = document.getElementsByClassName("version_number");
  var version = chrome.runtime.getManifest().version || "1.1.0";

  for(var i = 0; i < versionInstances.length; i++){
    versionInstances[i].innerHTML = "(" + version + ")";
  }
}

function generateGithubIssuesBodyText() {
  const date = (new Date()).toUTCString();
  const body = `Augury: ${chrome.runtime.getManifest().version}
Date: ${date}
OS: ${navigator.platform}

Demo test application:
-- Git repository for demo app showing the issue (optional but very helpful for difficult issues).
-- If a code snippet will completely show the issue, please include it.

Description of issue:
-- Include (clipped) screenshot images if possible.

Angular version (required): ???

Steps to reproduce:

1.
2.
3.

Additional details:

`;

  window.open(`https://github.com/rangle/augury/issues/new?body=${window.encodeURI(body)}`);
}

document.addEventListener("DOMContentLoaded", initialize);

