var Ga = Ga || (function(){

  function install() {
    window._gaq = window._gaq || [];
    window._gaq.push(['_setAccount', 'UA-33559087-1']);
    window._gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script');
      ga.type = 'text/javascript';
      ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(ga, s);
    })();
  }

  function init() {
    install();
  }

  function trackPageview(url) {
    var ts = Math.round((new Date()).getTime() / 1000);
    window._gaq.push(['_trackEvent', F.getLocalStorage('apikey'), 'pageview',  url, null, true]);
  }

  return {
    init: init,
    install: install,
    trackPageview: trackPageview
  };

})();
