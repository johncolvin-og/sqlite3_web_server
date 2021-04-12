class AutoComplete {
  constructor(document, input, options) {
    this.document = document;
    this.input = input;
    this.options = options;
    this.init(); 
  }

  is_shift_down() {
    return window.event && !!window.event.shiftKey;
  }

  closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName('autocomplete-items');
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != this.input) {
        x[i].innerHTML = '';
      }
    }
  }

  init() {
    // document.window.keydown(function(e) {
    //   // ESCAPE key pressed
    //   if (e.keyCode == 27) {
    //     closeAllLists();
    //   }
    // });
    let options = this.options;
    let input = this.input;
    let document = this.document;
    let self = this;
    console.info('We have options: ' + options.length);
    console.info(`Entering autocomplete: ${options}`);
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    input.addEventListener('input', function(e) {
      var val = this.value;
      /*close any already open lists of autocompleted values*/
      self.closeAllLists();
      if (!val) {
        console.info(`No input: ${val}`);
        return false;
      }
      console.info(`ON INPUT: ${val}`);
      currentFocus = -1;
      var dropdown = document.getElementById('autocomplete-dropdown');
      dropdown.innerHTML = '';
      /*append the DIV element as a child of the autocomplete container:*/
      console.info('Appending child to pnode');
      // this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (let i = 0; i < options.length; i++) {
        /*check if the item starts with the same letters as the text field
         * value:*/
        console.info(`process autocomp opt: ${options[i]}`);
        if (options[i].substr(0, val.length).toUpperCase() ==
            val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          let opt = document.createElement('div');
          /*make the matching letters bold:*/
          opt.innerHTML =
              '<strong>' + options[i].substr(0, val.length) + '</strong>';
          opt.innerHTML += options[i].substr(val.length);
          /*insert a input field that will hold the current array item's
           * value:*/
          opt.innerHTML +=
              '<input type=\'hidden\' value=\'' + options[i] + '\'>';
          /*execute a function when someone clicks on the item value (DIV
           * element):*/
          opt.addEventListener('click', function(e) {
            /*insert the value for the autocomplete text field:*/
            input.value = opt.getElementsByTagName('input')[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            self.closeAllLists();
          });
          dropdown.appendChild(opt);
        }
      }
    });
    /*execute a function presses a key on the keyboard:*/
    input.addEventListener('keydown', function(e) {
      let x = document.getElementById('autocomplete-dropdown');
      console.info('on key down: ' + e.keyCode);
      if (x) x = x.getElementsByTagName('div');
      function move_up() {
        currentFocus--;
        addActive(x);
      }
      function move_down() {
        currentFocus++;
        addActive(x);
      }
      switch (e.keyCode) {
        case KeyEvent.DOM_VK_ESC:
          break;
        case 27:
          console.info('On esc key press');
          e.preventDefault();
          self.closeAllLists();
          break;
        case KeyEvent.DOM_VK_TAB:
          e.preventDefault();
          if (is_shift_down()) {
            move_up();
          } else {
            move_down();
          }
          break;
        case KeyEvent.DOM_VK_DOWN:
          move_down();
          break;
        case KeyEvent.DOM_VK_UP:
          move_up();
          break;
        case KeyEvent.DOM_VK_RETURN:
          // Prevent submission of query req to server
          e.preventDefault();
          if (currentFocus > -1 && x) {
            // Let click handler update input text w/ the selected option
            x[currentFocus].click();
          }
          break;
      }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add('autocomplete-active');
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove('autocomplete-active');
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener('click', function(e) {
      self.closeAllLists(e.target);
    });
  }
}
