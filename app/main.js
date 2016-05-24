(function() {
  var tmpl = "{{text}} <a href='#' class='reveal-tweet'>[show]</a>";

  var check_prefix = false;
  var check_anywhere = false;

  var prefix_regexp;
  var anywhere_regexp;

  const OBSCURE_CLASS = "obscure";
  const CHECKED_CLASS = "tw-checked";
  const TARGET_NODE = "html";

  const DEFAULT_SETTINGS = {
    prefixes: '',
    anywhere: ''
  };
  
  
  // add iterators to nodelist so we can use a for loop
  // @see https://jakearchibald.com/2014/iterators-gonna-iterate/
  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
  
  function findKeywords() {
    var data = document.querySelectorAll(".tweet-text");

    for (var el of data) {
      var item_id, text, holder, matched, match;
      if ( ! el.classList.contains(CHECKED_CLASS) ) {
        el.classList.add(CHECKED_CLASS);
        holder = el;
        if ( holder ) {
          text = holder.innerText;

          matched = false;
          if ( check_prefix === true && ( match = text.match(prefix_regexp) ) ) {
            matched = true;
          }
            
          if ( matched === false && check_anywhere === true && (match = text.match(anywhere_regexp)) ) {
            matched = true;
          }
            
          if ( matched == false ) {
            continue;
          }
            
          el.classList.add(OBSCURE_CLASS);
          text = match[0];
            
          var snippet = Mustache.to_html(tmpl, {text:text, id:item_id});
            
          var div = document.createElement('p');
          div.innerHTML = snippet;

          holder.parentNode.insertBefore(div, holder);
            
          var link = el.parentNode.querySelector(".reveal-tweet");
          link.addEventListener("click", function(x) {
            var holder = x.target.parentNode.parentNode;
            var toggleMe = holder.querySelector("." + CHECKED_CLASS);
            
            if ( typeof(toggleMe) !== "undefined" ) {
              x.preventDefault();
              
              if ( toggleMe.classList.contains(OBSCURE_CLASS) ) {
                toggleMe.classList.remove(OBSCURE_CLASS);
                x.target.innerHTML = "[ hide ]";
              }
              else {
                toggleMe.classList.add(OBSCURE_CLASS);
                x.target.innerHTML = "[ show ]";
              }
            }
          });
        }
      }
    };
  }
  
  
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(data) {
    if ( data.prefixes.length > 0 ) {
      check_prefix = true;
      prefix_regexp = new RegExp("^(" + data.prefixes.split(",").join("|") + ")", "gim");
    }
    if ( data.anywhere.length > 0 ) {
      check_anywhere = true;
      anywhere_regexp = new RegExp("(" + data.anywhere.split(",").join("|") + ")", "gim");
    }
    
    if ( check_prefix || check_anywhere ) {
      findKeywords();
     
      // select the target node
      var target = document.querySelector(TARGET_NODE);
      
      // create an observer instance
      var observer = new MutationObserver(findKeywords);
    
      // configuration of the observer:
      var config = { attributes: true, childList: true, characterData: false };
    
      // pass in the target node, as well as the observer options
      observer.observe(target, config);
    }
    
  });
})();
