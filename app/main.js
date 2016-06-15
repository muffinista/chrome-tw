(function() {
  var tmpl = "{{text}} <a href='#' class='reveal-tweet'>[show]</a>";

  var check_prefix = false;
  var check_anywhere = false;

  var prefix_regexp;
  var anywhere_regexp;

  const OBSCURE_CLASS = "obscure";
  const CHECKED_CLASS = "tw-checked";
  const TARGET_NODE = "html";

  const COMMON = [
    "cw ", "tw ", "trigger warning", "content warning"
  ];
  
  const DEFAULT_SETTINGS = {
    common: true,
    prefixes: '',
    anywhere: ''
  };
  
  
  // add iterators to nodelist so we can use a for loop
  // @see https://jakearchibald.com/2014/iterators-gonna-iterate/
  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

  function toggleObscure(el) {
    var toggle_parent = false;
    if ( el.parentNode.classList.contains("js-tweet-text-container") ) {
      toggle_parent = true;
    }
    
    if ( el.classList.contains(OBSCURE_CLASS) ) {
      el.classList.remove(OBSCURE_CLASS);
      if ( toggle_parent ) {
        el.parentNode.classList.remove(OBSCURE_CLASS);
      }
    }
    else {
      el.classList.add(OBSCURE_CLASS);
      if ( toggle_parent ) {
        el.parentNode.classList.add(OBSCURE_CLASS);
      }
    }
  }
  
  function findKeywords() {
    var data = document.querySelectorAll(".tweet-text:not(." + CHECKED_CLASS + ")");
    for (var holder of data) {
      var item_id, text, matched, match;
      if ( ! holder.classList.contains(CHECKED_CLASS) ) {
        holder.classList.add(CHECKED_CLASS);
        if ( holder ) {
          text = holder.innerText.replace(/^[.,\/!$%\^&\*;:{}=\-_`~()\[]/g,"");


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

          toggleObscure(holder);

          text = match[0];
            
          var snippet = Mustache.to_html(tmpl, {text:text, id:item_id});
            
          var div = document.createElement('p');
          div.innerHTML = snippet;

          holder.parentNode.insertBefore(div, holder);
            
          var link = holder.parentNode.querySelector(".reveal-tweet");
          link.addEventListener("click", function(x) {
            var holder = x.target.parentNode.parentNode;
            var toggleMe = holder.querySelector("." + CHECKED_CLASS);
            
            if ( typeof(toggleMe) !== "undefined" ) {
              x.preventDefault();
              toggleObscure(toggleMe);
              if ( x.target.innerHTML.indexOf("show") !== -1 ) {
                x.target.innerHTML = "[ hide ]";
              }
              else {
                x.target.innerHTML = "[ show ]";
              }
            }
          });
        }
      }
    };
  }
  
  
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(data) {
    var clean;

    // super hacky
    if ( data.common == true ) {
      data.prefixes = (data.prefixes.split(",").concat(COMMON)).join(",");
    }

    if ( data.prefixes.length > 0 ) {
      check_prefix = true;
      clean = data.prefixes.split(",").filter(function(val) {
        return ( val.replace(/^\s+|\s+$/g, '') !== "" );
      });

      // note - swap ' ' with \s to catch a few more tweet cases
      prefix_regexp = new RegExp("^(" + clean.join("|").replace(/ /g, '\\s')  + ")", "gim");
      //console.log(prefix_regexp);
    }
    if ( data.anywhere.length > 0 ) {
      check_anywhere = true;
      clean = data.anywhere.split(",").filter(function(val) {
        return ( val.replace(/^\s+|\s+$/g, '') !== "" );
      });

      anywhere_regexp = new RegExp("(" + clean.join("|") + ")", "gim");
    }
    
    if ( check_prefix || check_anywhere ) {
      findKeywords();
     
      // select the target node
      var target = document.querySelector(TARGET_NODE);
      
      // create an observer instance
      var observer = new MutationObserver(findKeywords);
    
      // configuration of the observer:
      var config = { attributes: true, childList: true, subtree:true, characterData: true };
    
      // pass in the target node, as well as the observer options
      observer.observe(target, config);
    }
    
  });
})();
