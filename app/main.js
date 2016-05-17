(function() {
  var tmpl = "{{text}} <a href='#' data-tweet-id='{{id}}' class='reveal-tweet'>[show]</a>";

  var check_prefix = false;
  var check_anywhere = false;

  var prefix_regexp;
  var anywhere_regexp;

  // add iterators to nodelist so we can use a for loop
  // @see https://jakearchibald.com/2014/iterators-gonna-iterate/
  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
  
  function findKeywords() {
    var data = document.querySelectorAll("li.stream-item");
    for (var el of data) {
        var item_id, text, holder, matched, match;
        if ( ! el.classList.contains("tw-checked") ) {
            el.classList.add("tw-checked");

          item_id = el.attributes['data-item-id'].value;
          holder = el.querySelector(".tweet-text")
          if ( holder ) {
            text = holder.innerText;

            matched = false;
            if ( check_prefix === true && ( match = text.match(prefix_regexp) ) ) {
              matched = true
            }

            if ( matched === false && check_anywhere === true && (match = text.match(anywhere_regexp)) ) {
              matched = true;
            }

            if ( matched == false ) {
              continue;
            }
                       
            el.classList.add("obscure");
            text = match[0];

            var snippet = Mustache.to_html(tmpl, {text:text, id:item_id});
            
            var div = document.createElement('p');
            div.attributes['data-reveal-id'] = item_id;
            div.innerHTML = snippet;

            holder.parentNode.insertBefore(div, holder);
            
            var link = el.querySelector(".reveal-tweet");
            link.addEventListener("click", function(x) {
              var tweet_id = x.target.attributes["data-tweet-id"].value;
              var revealMe = document.querySelector("[data-item-id='" + tweet_id + "']");
              
              revealMe.classList.remove("obscure");
              x.target.parentNode.remove();
              
              x.preventDefault();
              
            });
          }
        }
    };
  }
  
  chrome.storage.sync.get({
    prefixes: '',
    anywhere: ''
  }, function(data) {
    if ( data.prefixes.length > 0 ) {
      check_prefix = true;
      prefix_regexp = new RegExp("^(" + data.prefixes.split(",").join("|") + ")", "gim");
    }
    if ( data.anywhere.length > 0 ) {
      check_anywhere = true;
      //console.log("**** " + data.anywhere);
      anywhere_regexp = new RegExp("(" + data.anywhere.split(",").join("|") + ")", "gim");
    }

    //console.log(prefix_regexp);
    //console.log(anywhere_regexp);    

    if ( check_prefix || check_anywhere ) {
      findKeywords();
    
      // select the target node
      var target = document.querySelector('#stream-items-id');

      // create an observer instance
      var observer = new MutationObserver(function(mutations) {  
        //console.log("here");
        findKeywords();
      });
    
      // configuration of the observer:
      var config = { attributes: true, childList: true, characterData: false };
    
      // pass in the target node, as well as the observer options
      observer.observe(target, config);
    }
    
  });
})();
