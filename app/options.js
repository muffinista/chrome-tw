    console.log("hey");
// Saves options to chrome.storage.sync.
    function save_options() {
  var prefixes = document.getElementById('prefixes').value;
  var anywhere = document.getElementById('anywhere').value;

  chrome.storage.sync.set({
      prefixes: prefixes,
      anywhere: anywhere
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
      prefixes: 'cw , tw',
      anywhere: 'rape'
  }, function(items) {
      document.getElementById('prefixes').value = items.prefixes;
      document.getElementById('anywhere').value = items.anywhere;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
