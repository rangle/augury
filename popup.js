
function subVersionNumbers() {

  var versionInstances = document.getElementsByClassName("version_number");

  for(var i = 0; i < versionInstances.length; i++){

    var version = chrome.runtime.getManifest().version || "1.1.0";
    versionInstances[i].innerHTML = "(" + version + ")";

  }
}


document.addEventListener('DOMContentLoaded', function () {
  subVersionNumbers();
});
