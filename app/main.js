(function() {
  function $(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }

  function findKeywords() {
    $("li.stream-item").forEach(function(el){
        var item_id, text;
        if ( ! el.classList.contains("tw-checked") ) {
            el.classList.add("tw-checked");

            item_id = el.attributes['data-item-id'];
            text = el.querySelector(".tweet-text").innerText;

            console.log(text);

            if ( text.indexOf("of") !== -1 ) {
                el.classList.add("obscure");
            }
        }
    });
  }

  function tick() {
    findKeywords();
    window.setTimeout(tick, 5000);
  }

  tick();
})();