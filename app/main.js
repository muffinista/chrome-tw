(function() {
  var tmpl = "{{text}} <a href='#' data-tweet-id='{{id}}' class='reveal-tweet'>[show]</a>";
  function $(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }

  function findKeywords() {
    $("li.stream-item").forEach(function(el){
        var item_id, text, holder;
        if ( ! el.classList.contains("tw-checked") ) {
            el.classList.add("tw-checked");

          item_id = el.attributes['data-item-id'].value;
          holder = el.querySelector(".tweet-text")
          if ( holder ) {
            text = holder.innerText;
            
            if ( true || text.indexOf("of") !== -1 ) {
              el.classList.add("obscure");
            }

            text = "cw food";
            var snippet = Mustache.to_html(tmpl, {text:text, id:item_id});
            
            var div = document.createElement('p');
            div.attributes['data-reveal-id'] = item_id;
            div.innerHTML = snippet;


            holder.parentNode.insertBefore(div, holder);
            
            //console.log(el, el.childNodes[0]);
            //            el.insertBefore(div, el.childNodes[0]);
            
            var link = el.querySelector(".reveal-tweet");
            link.addEventListener("click", function(x) {
              var tweet_id = x.target.attributes["data-tweet-id"].value;
              var revealMe = document.querySelector("[data-item-id='" + tweet_id + "']");
              
              el.classList.remove("obscure");
              x.target.parentNode.remove();
              
              x.preventDefault();
              
            });
          }
        }
    });
  }

  function tick() {
    findKeywords();
    window.setTimeout(tick, 5000);
  }

  
  chrome.storage.sync.get({
    prefixes: 'cw , tw',
    anywhere: 'rape'
  }, function(data) {
    console.log(data);
    tick();
    
  });
})();
