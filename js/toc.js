(function () {
  var $toc = $('.bs-docs-sidenav');

  function format (title) {
    var $title = $(title),
        txt = $title.text(),
        id = $title.attr('id');
    return "<li> <a href=#" + id + ">" + txt + "</a></li>";
  }
  // return;
  if($toc.length) {
    var $h3s = $('.span9 h3');
    var titles = $h3s.map(function () {
      return format(this);
    }).get().join('');
    $toc.html(titles);
  }

  // $('[data-spy="scroll"]').each(function () {
    // var $spy = $(this).scrollspy('refresh');
  // });

})();