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

Demo Test Application
Git repository for demo app showing issues (optional but very helpful for difficult issues).

Description of issue:
(Include images if possible)

Angular Version: ???

Steps to Reproduce:

1.
2.
3.`;

  window.open(`https://github.com/rangle/augury/issues/new?body=${window.encodeURI(body)}`);
}

document.addEventListener("DOMContentLoaded", initialize);

