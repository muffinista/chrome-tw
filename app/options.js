const DEFAULT_SETTINGS = {
  common: true,
  prefixes: "",
  anywhere: ""
};

function save_options() {
  var prefixes = document.getElementById('prefixes').value;
  var anywhere = document.getElementById('anywhere').value;
  var common = document.getElementById('common').checked;
    
  //cw, tw, trigger warning, content warning
  
  chrome.storage.sync.set({
    common: common,
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
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(items) {
    console.log(items);
    if ( items.common === true ) {
      document.getElementById('common').checked = true;
    }
    
    document.getElementById('prefixes').value = items.prefixes;
    document.getElementById('anywhere').value = items.anywhere;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
