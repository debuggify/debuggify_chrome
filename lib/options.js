console.log('loading options');

function forEachField(func) {
  var fields = ['apikey', 'url'];
  var l = fields.length;
  var i = 0;
  var val;
  var id;

  for (i = 0; i < l; i++) {
    id = fields[i];

    func(id);

  }
}

// Saves options to localStorage.
function save_options() {

  forEachField(function(id){
    localStorage[id] = $('#' + id).val();
  });

  $("#save_text").html('Saving...').fadeIn(300);

  F.getCode(function(){
    $("#save_text").html('Saved').fadeOut(2000);
  });
}

// Restores select box state to saved value from localStorage.
function restore_options() {

  forEachField(function(id){

    val = localStorage[id];
    $('#' + id).val(val);

  });

}

document.querySelector('#save').addEventListener('click', save_options);
restore_options();