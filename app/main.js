(function() {
  var tmpl = "{{text}} <a href='#' data-tweet-id='{{id}}' class='reveal-tweet'>[show]</a>";

  var check_prefix = false;
  var check_anywhere = false;

  var prefix_regexp;
  var anywhere_regexp;

  // add iterators to nodelist so we can use a for loop
  // @see https://jakearchibald.com/2014/iterators-gonna-iterate/
  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

  
  function findKeywords(klass) {
    var data = document.querySelectorAll(klass);
    //console.log(klass);

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

            el.classList.add("tw-checked");  
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
              
              x.preventDefault();

              revealMe.classList.remove("obscure");
              x.target.parentNode.remove();
            });
          }
        }
    };
  }

  function checkForTweets(klass) {
    findKeywords(klass);
    findKeywords(".QuoteTweet-innerContainer[data-item-type='tweet']");
    findKeywords(".permalink-tweet[data-tweet-id]");
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
      var klass;
      if ( document.querySelectorAll("li.stream-item").length > 0 ) {
        klass = "li.stream-item";
      }
      else {
        klass = "div.original-permalink-page div.tweet";
      }

      checkForTweets(klass);
      
      // select the target node
      var target = document.querySelector('body');

      // create an observer instance
      var observer = new MutationObserver(function(mutations) {  
        //console.log("here");
        var klass;
        if ( document.querySelectorAll("li.stream-item").length > 0 ) {
          klass = "li.stream-item";
        }
        else {
          klass = "div.original-permalink-page div.tweet";
        }

        checkForTweets(klass);
      });
    
      // configuration of the observer:
      var config = { attributes: true, childList: true, characterData: false };
    
      // pass in the target node, as well as the observer options
      observer.observe(target, config);
    }
    
  });
})();
