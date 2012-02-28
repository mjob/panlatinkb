/*
LICENSE AND COPYRIGHT

Copyright (c) 2012, Marty O'Brien.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


// panlatinkb.js - multilingual keyboard class. 
// 
// Allows en_US keyboard to type latin letters with diacritical
// marks by typing the regular latin letter followed by a digit 0-9.
// When enabled in a textarea element or other input field,
// typing a digit can apply (or clear) a diacritical mark to 
// the previous character. In a pan-Latin enabled textarea or
// other text input box, the meaning for each digit is:
//
//   1:  acute - applies to: {aceilnosuwyzACEILNOSUWYZ}
//
//           e + 1  ==>  é
//
//       special case: [ouOU]
//
//           o + 1 + 1  ==>  ő  (Hungarian o with double acute)
//
//   2:  grave    - applies to: {aeiouwyAEIOUWY}
//
//           o + 2  ==>  ò
//
//       special case: [aeiouAEIOU]
//
//           e + 2 + 2  ==> ē   (e with macron)
//
//   3:  diaeresis - {aeiouwyAEIOUWY}
//       horizontal stroke - {dhlDHL}
//
//           u + 3  ==> ü
//           h + 3  ==> ħ
//
//   4:  circumflex - {aceghijouswyACEGHIJOUSWY}
// 
//           a + 4  ==> â
//           j + 4  ==> ĵ
//
//   5:  breve - {augAUG}
//       caron - {cdelnrstzCDELNRSTZ}
//       diagonal stroke - {oO}
//
//           u + 5  ==>  ŭ
//           e + 5  ==>  ě
//           o + 5  ==>  ø
//
//   6:  tilde - {ainouAINOU}
//       comma below - {stST}
// 
//           a + 6  ==>  ã
//           n + 6  ==>  ñ
//           s + 6  ==>  ș
//
//   7:  ring above - {auAU}
//       dot above  - {cegnzCEGINZ}
//
//           a + 7  ==>  å
//           z + 7  ==>  ż
//           I + 7  ==>  İ  (Turkish capital I with dot)
//
//   8:  ogonek  - {aeiuAEIU}
//       cedilla - {cgklnsCGKLNS}
//
//           u + 8  ==>  ų
//           c + 8  ==>  ç
//
//   9:  special - {adostADOST?!<>}
//
//           a + 9  ==>  æ   (latin ae ligature)
//           d + 9  ==>  ð   (Icelandic ETH)
//           s + 9  ==>  ß   (German sharp S)
//           ? + 9  ==>  ¿   (Spanish inverted question mark)
//
//   0:  clear
//       used to clear marks or restore a character to its orignal form.
//       Use it like the backspace key to delete a diacritical mark on
//       a character but without deleting the character
//
//           e + 3  ==>  ë
//           ë + 0  ==>  e
//
//       as a special case,
//
//           i + 0  ==>  ı   (Turkish dotless i)
//
//   \:  use backslash to combine letters and digits that would otherwise
//       be converted to a special character.
//
//           a + 6          ==>  ã
//           a + \ + 6      ==>  a6
//           a + \ + \ + 6  ==>  a\6
//   
//
//
//
// TODO:
// - make it smaller, faster
// - test on FF, IE
// - test on <input type="text" .../> elements
// - develop help pages in different languages
// - develop inline cheat sheet
// - fix IE issue where 
//
// ACKNOWLEDGEMENTS:
//
// It was the Vietnamese JavaScript Input editor, by "nthachus"
// (www.codeproject.com/KB/scripting/VietUni2.aspx?display=Print)
// that opened my eyes to the possibility of a script like this.
// I also borrowed heavily from that project for the implementation
// of this project.
//
// FEEDBACK:
//   Any tips on the programming, or any suggestions on how the
//   key configuration (the  plkb_map  variable, see 
//   panlatinkb-map.js) could make this program more usable for
//   you are appreciated.
//   -- mobrule at gmail.com
//
// Version 0.03



// make sure you include  panlatinkb-map.js  here,
// or at least something that defines  plkb_map .

new function($) {
    $.fn.getCursorPosition = function () {
	var pos = 0;
	var el = $(this).get(0);

	if (document.selection) {  // IE
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
	}
	
	// Firefox support
	else if (el.selectionStart || el.selectionStart == '0') {
	    if (el.selectionEnd != el.selectionStart)
		return -1;
	    return el.selectionStart;
	}

	return pos;
    }
}(jQuery);

// cribbed from http://stackoverflow.com/questions/499126/
new function($) {
    $.fn.setCursorPosition = function(pos) {
	if ($(this).get(0).setSelectionRange) {
	    $(this).get(0).setSelectionRange(pos, pos);
	} else if ($(this).get(0).createTextRange) {
	    var range = $(this).get(0).createTextRange();
	    range.collapse(true);
	    range.moveEnd('character', pos);
	    range.moveStart('character', pos);
	    range.select();
	}
    }
}(jQuery);

new function($) {
    $.fn.setLastChar = function(pos,newcharcode) {
	var el = $(this).get(0);
	if (document.selection && el.curWord) {
	    el.curWord.text = String.fromCharCode(newcharcode);
	    el.curWord.collapse(false);
	} else if (el.setSelectionRange) {
	    txt = el.value;
	    el.value = txt.substr(0,pos) + String.fromCharCode(newcharcode) + txt.substr(pos+1);
	    el.setSelectionRange(pos+1,pos+1);
	} // else ...
    }
}(jQuery);

new function($) {
    $.fn.getLastChar = function() {
	var el = $(this).get(0);
	if (document.selection) { // IE
	    var caret = el.selection
		? el.selection.createRange()
		: el.document.selection.createRange();
	    if (caret.text) return null;
	    var caret2 = caret.duplicate();
	    caret2.moveStart("character", -1);
	    el.curWord = caret2.duplicate();
	    return caret2.text;
	} else if (el.setSelectionRange) { // FF
	    var p1 = el.selectionStart;
	    return el.value.substr(p1-1,1);

	} else {
	    return "";
	}
    }
}(jQuery);

function plkb_keypress( element, event ) {
    var currentChar = event.keyCode - 48;
    if (currentChar < 0 || currentChar > 9) return false;

    var mode = element.attr("plkb-mode");
    if (mode == "off") return false;

    var p = element.getCursorPosition();
    if (p <= 0) return false;

    var newCharCode = plkb_combine_keys(mode, element.getLastChar().charCodeAt(0), currentChar);
    if (newCharCode <= 0) return true;

    element.setLastChar(p-1, newCharCode);
    event.preventDefault();
    return false;
}

function plkb_combine_keys( mode, c1, c2 ) {
    if (c2<0 || c2>9) return 0;
    var modemap = plkb_map[mode];
    var keylist = modemap[c1];
    if (typeof keylist !== 'undefined') {
	return keylist[c2];
    }
    return 0;
}

function init_plkeyboard( elem ) {
    if (!elem) elem = $(this);
    if (!$(elem).attr("plkb-mode")) {
	$(elem).attr("plkb-mode", "all");
    }

    if (elem.attachEvent) {
	elem.attachEvent("onkeypress", function(event) {
	    return plkb_keypress(elem, event);
	} );
    } 
    else if (elem.keypress) {
	elem.keypress( function(event) { plkb_keypress(elem, event); } );
    }
    else if (elem.addEventListener) {
	elem.addEventListener("keypress", function(event) {
	    return plkb_keypress(elem, event);
	}, true );
    }
    else if (elem.onkeypress) {
	var oldFunc = elem.onkeypress;
	if (typeof oldFunc !== "function") {
	    elem.onkeypress = function(event) {
		return plkb_keypress(elem, event);
	    };
	}
	else {
	    elem.onkeypress = function(event) {
		return oldFunc(event)
		    ? plkb_keypress(elem, event)
		    : false;
	    };
	}
    }
}
