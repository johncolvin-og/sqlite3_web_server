function on_hover(bn) {
  console.info("gay");
  bn.setAttribute('src', '/icons/times-circle-solid-hover.svg');
}

class AutoComplete {
  constructor(document, input, options, option_view_factory) {
    this.document = document;
    this.input = input;
    this.options = options;
    this.currentFocus = -1;
    this.deleting = false;
    this.option_view_factory = option_view_factory;
    this.dropdown = document.getElementById('autocomplete-dropdown');
    this.input.addEventListener('input', this.on_text_changed);
    this.input.addEventListener('keydown', this.on_key_down);
    this.document.addEventListener('click', this.on_click);
  }

  is_shift_down() {
    return window.event && !!window.event.shiftKey;
  }

  close_dropdown = (elmnt) => {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = this.document.getElementsByClassName('autocomplete-items');
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != this.input) {
        x[i].innerHTML = '';
      }
    }
  };

  delete_option = (option_view) => {
    console.info("deleting bling");
    this.deleting = true;
    this.options.remove(option_view.parentNode.value);
    this.on_text_changed();
  };

  on_option_click = (event) => {
    if (this.deleting) {
      this.deleting = false;
      return;
    }
    let option_in = event.target.getElementsByTagName('input')[0];
    if (option_in) {
      this.input.value = event.target.getElementsByTagName('input')[0].value;
    } else {
      this.delete_option(event.target);
    }
  };

  is_option_match = (option, value = this.input.value) => {
    let opt_upper = option.toUpperCase();
    let val_upper = value.toUpperCase();
    return opt_upper.indexOf(val_upper) >= 0;
  };

  static createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
  }

  on_text_changed = () => {
    this.close_dropdown();
    if (!this.input.value) {
      return;
    }
    console.info(`ON INPUT: ${this.input.value}`);
    this.currentFocus = -1;
    this.dropdown.innerHTML = '';
    console.info('Appending child to pnode');
    let self = this;
    for (let opt of this.options) {
      console.info(`process autocomp opt: ${opt}`);
      if (!this.is_option_match(opt)) {
        continue;
      }
      if (opt.substr(0, this.input.value.length).toUpperCase() ==
        this.input.value.toUpperCase()) {
        let opt_view_html = this.option_view_factory({
          'match_head': opt.substr(0, this.input.value.length),
          'tail': opt.substr(this.input.value.length),
          'value': opt
        });
        let opt_view = AutoComplete.createElementFromHTML(opt_view_html);
        opt_view.addEventListener('click', this.on_option_click);
        this.dropdown.appendChild(opt_view);
      }
    }
  };

  on_key_down = (e) => {
    console.info('on key down: ' + e.keyCode);
    switch (e.keyCode) {
      case KeyEvent.DOM_VK_ESC:
        break;
      case 27:
        console.info('On esc key press');
        e.preventDefault();
        this.close_dropdown();
        break;
      case KeyEvent.DOM_VK_TAB:
        e.preventDefault();
        if (is_shift_down()) {
          this.move_up();
        } else {
          this.move_down();
        }
        break;
      case KeyEvent.DOM_VK_DOWN:
        this.move_down();
        break;
      case KeyEvent.DOM_VK_UP:
        this.move_up();
        break;
      case KeyEvent.DOM_VK_RETURN:
        // Prevent submission of query req to server
        e.preventDefault();
        if (this.currentFocus > -1 && this.dropdown) {
          // Let click handler update input text w/ the selected option
          this.dropdown[this.currentFocus].click();
        }
        break;
    }
  };

  on_click = (e) => {
    this.close_dropdown();
  };

  move_up = () => {
    this.currentFocus--;
    this.activate_item();
  };

  move_down = () => {
    this.currentFocus++;
    this.activate_item();
  };

  deactivate_all = () => {
    for (var i = 0; i < this.dropdown.length; i++) {
      this.dropdown[i].classList.remove('autocomplete-active');
    }
  };

  activate_item = () => {
    deactivate_all();
    if (self.currentFocus >= this.dropdown.length) {
      self.currentFocus = 0;
    } else if (self.currentFocus < 0) {
      self.currentFocus = this.dropdown.length - 1;
    }
    this.dropdown[self.currentFocus].classList.add('autocomplete-active');
  };

  any_active() {
    return this.document
      .getElementsByClassName('autocomplete-active').length > 0;
  }
}
