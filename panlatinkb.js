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


// plkb.js - multilingual keyboard class. 
// 
// Allows en_US keyboard to type latin letters with diacritical
// marks by typing the regular latin letter followed by a digit 0-9.
// When enabled in a textarea element or other input field,
// typing a digit can apply (or clear) a diacritical mark to 
// the previous character. The meaning for each digit is:
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
//       used to clear marks or restore a character to its orignal form
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
// - create individual language modes
// - test on FF, IE
// - test on <input type="text" .../> elements
// - develop help pages in different languages
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
//   key configuration (the  plkb_map  variable, below) could
//   make this program more usable for you are welcome.
//   -- mobrule at gmail.com
//
// Version 0.01


var plkb_map = {
    "test" : { 97 : [ 0,0xE1,0xE0,0xE4,0xE2,0x103,0xE3,0xE5,0x105,0xE6 ],
	       98 : [ 97, 0, 99, 100, 101, 102, 103, 104, 105 ] },
    "off"  : { },
    "all"  : {
	33 : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 161 ],
	60 : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 171 ],
	62 : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 187 ],
	63 : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 191 ],
	65 : [ 0, 193, 192, 196, 194, 258, 195, 197, 260, 198 ],
	67 : [ 0, 262, 0, 0, 264, 268, 0, 266, 199, 0 ],
	68 : [ 0, 0, 0, 272, 0, 270, 0, 0, 0, 208 ],
	69 : [ 0, 201, 200, 203, 202, 282, 0, 278, 280, 0 ],
	71 : [ 0, 0, 0, 0, 284, 286, 0, 288, 290, 0 ],
	72 : [ 0, 0, 0, 294, 292, 0, 0, 0, 0, 0 ],
	73 : [ 0, 205, 204, 207, 206, 0, 296, 304, 302, 0 ],
	74 : [ 0, 0, 0, 0, 308, 0, 0, 0, 0, 0 ],
	75 : [ 0, 0, 0, 0, 0, 0, 0, 0, 310, 0 ],
	76 : [ 0, 313, 0, 321, 0, 317, 0, 319, 315, 0 ],
	78 : [ 0, 323, 0, 0, 0, 327, 209, 7748, 325, 0 ],
	79 : [ 0, 211, 210, 214, 212, 216, 213, 0, 0, 338 ],
	82 : [ 0, 340, 0, 0, 0, 344, 0, 0, 0, 0 ],
	83 : [ 0, 346, 0, 0, 348, 352, 536, 0, 350, 7838 ],
	84 : [ 0, 0, 0, 0, 0, 356, 538, 0, 0, 222 ],
	85 : [ 0, 218, 217, 220, 219, 364, 360, 366, 370, 0 ],
	87 : [ 0, 7810, 7808, 7812, 372, 0, 0, 0, 0, 0 ],
	89 : [ 0, 221, 7922, 376, 374, 0, 0, 0, 0, 0 ],
	90 : [ 0, 377, 0, 0, 0, 381, 0, 379, 0, 0 ],
	92 : [ 48, 49, 50, 51, 52, 53, 54, 55, 56, 57 ],
	97 : [ 0, 225, 224, 228, 226, 259, 227, 229, 261, 230 ],
	99 : [ 0, 263, 0, 0, 265, 269, 0, 267, 231, 0 ],
	100 : [ 0, 0, 0, 273, 0, 271, 0, 0, 0, 240 ],
	101 : [ 0, 233, 232, 235, 234, 283, 0, 279, 281, 0 ],
	103 : [ 0, 0, 0, 0, 285, 287, 0, 289, 291, 0 ],
	104 : [ 0, 0, 0, 295, 293, 0, 0, 0, 0, 0 ],
	105 : [ 305, 237, 236, 239, 238, 0, 297, 0, 303, 0 ],
	106 : [ 0, 0, 0, 0, 309, 0, 0, 0, 0, 0 ],
	107 : [ 0, 0, 0, 0, 0, 0, 0, 0, 311, 0 ],
	108 : [ 0, 314, 0, 322, 0, 318, 0, 320, 316, 0 ],
	110 : [ 0, 324, 0, 0, 0, 328, 241, 7749, 326, 0 ],
	111 : [ 0, 243, 242, 246, 244, 248, 245, 0, 0, 339 ],
	114 : [ 0, 341, 0, 0, 0, 345, 0, 0, 0, 0 ],
	115 : [ 0, 347, 0, 0, 349, 353, 537, 0, 351, 223 ],
	116 : [ 0, 0, 0, 0, 0, 357, 539, 0, 0, 254 ],
	117 : [ 0, 250, 249, 252, 251, 365, 361, 367, 371, 0 ],
	119 : [ 0, 7811, 7809, 7813, 373, 0, 0, 0, 0, 0 ],
	121 : [ 0, 253, 7923, 255, 375, 0, 0, 0, 0, 0 ],
	122 : [ 0, 378, 0, 0, 0, 382, 0, 380, 0, 0 ],
	192 : [ 65, 193, 256, 196, 194, 258, 195, 197, 260, 198 ],
	193 : [ 65, 0, 192, 196, 194, 258, 195, 197, 260, 198 ],
	194 : [ 65, 193, 192, 196, 0, 258, 195, 197, 260, 198 ],
	195 : [ 65, 193, 192, 196, 194, 258, 0, 197, 260, 198 ],
	196 : [ 65, 193, 192, 0, 194, 258, 195, 197, 260, 198 ],
	197 : [ 65, 193, 192, 196, 194, 258, 195, 0, 260, 198 ],
	198 : [ 0, 193, 192, 196, 194, 258, 195, 197, 260, 0 ],
	199 : [ 67, 262, 0, 0, 264, 268, 0, 266, 0, 0 ],
	200 : [ 69, 201, 274, 203, 202, 282, 0, 278, 280, 0 ],
	201 : [ 69, 0, 200, 203, 202, 282, 0, 278, 280, 0 ],
	202 : [ 69, 201, 200, 203, 0, 282, 0, 278, 280, 0 ],
	203 : [ 69, 201, 200, 0, 202, 282, 0, 278, 280, 0 ],
	204 : [ 73, 205, 298, 207, 206, 0, 296, 304, 302, 0 ],
	205 : [ 73, 0, 204, 207, 206, 0, 296, 304, 302, 0 ],
	206 : [ 73, 205, 204, 207, 0, 0, 296, 304, 302, 0 ],
	207 : [ 73, 205, 204, 0, 206, 0, 296, 304, 302, 0 ],
	208 : [ 0, 0, 0, 272, 0, 270, 0, 0, 0, 0 ],
	209 : [ 78, 323, 0, 0, 0, 327, 0, 7748, 325, 0 ],
	210 : [ 79, 211, 332, 214, 212, 216, 213, 0, 0, 338 ],
	211 : [ 79, 336, 210, 214, 212, 216, 213, 0, 0, 338 ],
	212 : [ 79, 211, 210, 214, 0, 216, 213, 0, 0, 338 ],
	213 : [ 79, 211, 210, 214, 212, 216, 0, 0, 0, 338 ],
	214 : [ 79, 211, 210, 0, 212, 216, 213, 0, 0, 338 ],
	216 : [ 79, 211, 210, 214, 212, 0, 213, 0, 0, 338 ],
	217 : [ 85, 218, 362, 220, 219, 364, 360, 366, 370, 0 ],
	218 : [ 85, 368, 217, 220, 219, 364, 360, 366, 370, 0 ],
	219 : [ 85, 218, 217, 220, 0, 364, 360, 366, 370, 0 ],
	220 : [ 85, 218, 217, 0, 219, 364, 360, 366, 370, 0 ],
	221 : [ 89, 0, 7922, 376, 374, 0, 0, 0, 0, 0 ],
	222 : [ 0, 0, 0, 0, 0, 356, 538, 0, 0, 0 ],
	223 : [ 0, 347, 0, 0, 349, 353, 537, 0, 351, 0 ],
	224 : [ 97, 225, 257, 228, 226, 259, 227, 229, 261, 230 ],
	225 : [ 97, 0, 224, 228, 226, 259, 227, 229, 261, 230 ],
	226 : [ 97, 225, 224, 228, 0, 259, 227, 229, 261, 230 ],
	227 : [ 97, 225, 224, 228, 226, 259, 0, 229, 261, 230 ],
	228 : [ 97, 225, 224, 0, 226, 259, 227, 229, 261, 230 ],
	229 : [ 97, 225, 224, 228, 226, 259, 227, 0, 261, 230 ],
	230 : [ 0, 225, 224, 228, 226, 259, 227, 229, 261, 0 ],
	231 : [ 99, 263, 0, 0, 265, 269, 0, 267, 0, 0 ],
	232 : [ 101, 233, 275, 235, 234, 283, 0, 279, 281, 0 ],
	233 : [ 101, 0, 232, 235, 234, 283, 0, 279, 281, 0 ],
	234 : [ 101, 233, 232, 235, 0, 283, 0, 279, 281, 0 ],
	235 : [ 101, 233, 232, 0, 234, 283, 0, 279, 281, 0 ],
	236 : [ 105, 237, 299, 239, 238, 0, 297, 0, 303, 0 ],
	237 : [ 105, 0, 236, 239, 238, 0, 297, 0, 303, 0 ],
	238 : [ 105, 237, 236, 239, 0, 0, 297, 0, 303, 0 ],
	239 : [ 105, 237, 236, 0, 238, 0, 297, 0, 303, 0 ],
	240 : [ 0, 0, 0, 273, 0, 271, 0, 0, 0, 0 ],
	241 : [ 110, 324, 0, 0, 0, 328, 0, 7749, 326, 0 ],
	242 : [ 111, 243, 333, 246, 244, 248, 245, 0, 0, 339 ],
	243 : [ 111, 337, 242, 246, 244, 248, 245, 0, 0, 339 ],
	244 : [ 111, 243, 242, 246, 0, 248, 245, 0, 0, 339 ],
	245 : [ 111, 243, 242, 246, 244, 248, 0, 0, 0, 339 ],
	246 : [ 111, 243, 242, 0, 244, 248, 245, 0, 0, 339 ],
	248 : [ 111, 243, 242, 246, 244, 0, 245, 0, 0, 339 ],
	249 : [ 117, 250, 363, 252, 251, 365, 361, 367, 371, 0 ],
	250 : [ 117, 369, 249, 252, 251, 365, 361, 367, 371, 0 ],
	251 : [ 117, 250, 249, 252, 0, 365, 361, 367, 371, 0 ],
	252 : [ 117, 250, 249, 0, 251, 365, 361, 367, 371, 0 ],
	253 : [ 121, 0, 7923, 255, 375, 0, 0, 0, 0, 0 ],
	254 : [ 0, 0, 0, 0, 0, 357, 539, 0, 0, 0 ],
	255 : [ 121, 253, 7923, 0, 375, 0, 0, 0, 0, 0 ],
	256 : [ 65, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	257 : [ 97, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	258 : [ 65, 193, 192, 196, 194, 0, 195, 197, 260, 198 ],
	259 : [ 97, 225, 224, 228, 226, 0, 227, 229, 261, 230 ],
	260 : [ 65, 193, 192, 196, 194, 258, 195, 197, 0, 198 ],
	261 : [ 97, 225, 224, 228, 226, 259, 227, 229, 0, 230 ],
	262 : [ 67, 0, 0, 0, 264, 268, 0, 266, 199, 0 ],
	263 : [ 99, 0, 0, 0, 265, 269, 0, 267, 231, 0 ],
	264 : [ 67, 262, 0, 0, 0, 268, 0, 266, 199, 0 ],
	265 : [ 99, 263, 0, 0, 0, 269, 0, 267, 231, 0 ],
	266 : [ 67, 262, 0, 0, 264, 268, 0, 0, 199, 0 ],
	267 : [ 99, 263, 0, 0, 265, 269, 0, 0, 231, 0 ],
	268 : [ 67, 262, 0, 0, 264, 0, 0, 266, 199, 0 ],
	269 : [ 99, 263, 0, 0, 265, 0, 0, 267, 231, 0 ],
	270 : [ 68, 0, 0, 272, 0, 0, 0, 0, 0, 208 ],
	271 : [ 100, 0, 0, 273, 0, 0, 0, 0, 0, 240 ],
	272 : [ 68, 0, 0, 0, 0, 270, 0, 0, 0, 208 ],
	273 : [ 100, 0, 0, 0, 0, 271, 0, 0, 0, 240 ],
	274 : [ 69, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	275 : [ 101, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	278 : [ 69, 201, 200, 203, 202, 282, 0, 0, 280, 0 ],
	279 : [ 101, 233, 232, 235, 234, 283, 0, 0, 281, 0 ],
	280 : [ 69, 201, 200, 203, 202, 282, 0, 278, 0, 0 ],
	281 : [ 101, 233, 232, 235, 234, 283, 0, 279, 0, 0 ],
	282 : [ 69, 201, 200, 203, 202, 0, 0, 278, 280, 0 ],
	283 : [ 101, 233, 232, 235, 234, 0, 0, 279, 281, 0 ],
	284 : [ 71, 0, 0, 0, 0, 286, 0, 288, 290, 0 ],
	285 : [ 103, 0, 0, 0, 0, 287, 0, 289, 291, 0 ],
	286 : [ 71, 0, 0, 0, 284, 0, 0, 288, 290, 0 ],
	287 : [ 103, 0, 0, 0, 285, 0, 0, 289, 291, 0 ],
	288 : [ 71, 0, 0, 0, 284, 286, 0, 0, 290, 0 ],
	289 : [ 103, 0, 0, 0, 285, 287, 0, 0, 291, 0 ],
	290 : [ 71, 0, 0, 0, 284, 286, 0, 288, 0, 0 ],
	291 : [ 103, 0, 0, 0, 285, 287, 0, 289, 0, 0 ],
	292 : [ 72, 0, 0, 294, 0, 0, 0, 0, 0, 0 ],
	293 : [ 104, 0, 0, 295, 0, 0, 0, 0, 0, 0 ],
	294 : [ 72, 0, 0, 0, 292, 0, 0, 0, 0, 0 ],
	295 : [ 104, 0, 0, 0, 293, 0, 0, 0, 0, 0 ],
	296 : [ 73, 205, 204, 207, 206, 0, 0, 304, 302, 0 ],
	297 : [ 105, 237, 236, 239, 238, 0, 0, 0, 303, 0 ],
	298 : [ 73, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	299 : [ 105, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	302 : [ 73, 205, 204, 207, 206, 0, 296, 304, 0, 0 ],
	303 : [ 105, 237, 236, 239, 238, 0, 297, 0, 0, 0 ],
	304 : [ 0, 205, 204, 207, 206, 0, 296, 0, 302, 0 ],
	308 : [ 74, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	309 : [ 106, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	310 : [ 75, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	311 : [ 107, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	313 : [ 76, 0, 0, 321, 0, 317, 0, 319, 315, 0 ],
	314 : [ 108, 0, 0, 322, 0, 318, 0, 320, 316, 0 ],
	315 : [ 76, 313, 0, 321, 0, 317, 0, 319, 0, 0 ],
	316 : [ 108, 314, 0, 322, 0, 318, 0, 320, 0, 0 ],
	317 : [ 76, 313, 0, 321, 0, 0, 0, 319, 315, 0 ],
	318 : [ 108, 314, 0, 322, 0, 0, 0, 320, 316, 0 ],
	319 : [ 76, 313, 0, 321, 0, 317, 0, 0, 315, 0 ],
	320 : [ 108, 314, 0, 322, 0, 318, 0, 0, 316, 0 ],
	321 : [ 76, 313, 0, 0, 0, 317, 0, 319, 315, 0 ],
	322 : [ 108, 314, 0, 0, 0, 318, 0, 320, 316, 0 ],
	323 : [ 78, 0, 0, 0, 0, 327, 209, 7748, 325, 0 ],
	324 : [ 110, 0, 0, 0, 0, 328, 241, 7749, 326, 0 ],
	325 : [ 78, 323, 0, 0, 0, 327, 209, 7748, 0, 0 ],
	326 : [ 110, 324, 0, 0, 0, 328, 241, 7749, 0, 0 ],
	327 : [ 78, 323, 0, 0, 0, 0, 209, 7748, 325, 0 ],
	328 : [ 110, 324, 0, 0, 0, 0, 241, 7749, 326, 0 ],
	332 : [ 79, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	333 : [ 111, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	336 : [ 79, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	337 : [ 111, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	338 : [ 0, 211, 210, 214, 212, 216, 213, 0, 0, 0 ],
	339 : [ 0, 243, 242, 246, 244, 248, 245, 0, 0, 0 ],
	340 : [ 82, 0, 0, 0, 0, 344, 0, 0, 0, 0 ],
	341 : [ 114, 0, 0, 0, 0, 345, 0, 0, 0, 0 ],
	344 : [ 82, 340, 0, 0, 0, 0, 0, 0, 0, 0 ],
	345 : [ 114, 341, 0, 0, 0, 0, 0, 0, 0, 0 ],
	346 : [ 83, 0, 0, 0, 348, 352, 536, 0, 350, 7838 ],
	347 : [ 115, 0, 0, 0, 349, 353, 537, 0, 351, 223 ],
	348 : [ 83, 346, 0, 0, 0, 352, 536, 0, 350, 7838 ],
	349 : [ 115, 347, 0, 0, 0, 353, 537, 0, 351, 223 ],
	350 : [ 83, 346, 0, 0, 348, 352, 536, 0, 0, 7838 ],
	351 : [ 115, 347, 0, 0, 349, 353, 537, 0, 0, 223 ],
	352 : [ 83, 346, 0, 0, 348, 0, 536, 0, 350, 7838 ],
	353 : [ 115, 347, 0, 0, 349, 0, 537, 0, 351, 223 ],
	356 : [ 84, 0, 0, 0, 0, 0, 538, 0, 0, 222 ],
	357 : [ 116, 0, 0, 0, 0, 0, 539, 0, 0, 254 ],
	360 : [ 85, 218, 217, 220, 219, 364, 0, 366, 370, 0 ],
	361 : [ 117, 250, 249, 252, 251, 365, 0, 367, 371, 0 ],
	362 : [ 85, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	363 : [ 117, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	364 : [ 85, 218, 217, 220, 219, 0, 360, 366, 370, 0 ],
	365 : [ 117, 250, 249, 252, 251, 0, 361, 367, 371, 0 ],
	366 : [ 85, 218, 217, 220, 219, 364, 360, 0, 370, 0 ],
	367 : [ 117, 250, 249, 252, 251, 365, 361, 0, 371, 0 ],
	368 : [ 85, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	369 : [ 117, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	370 : [ 85, 218, 217, 220, 219, 364, 360, 366, 0, 0 ],
	371 : [ 117, 250, 249, 252, 251, 365, 361, 367, 0, 0 ],
	372 : [ 87, 7810, 7808, 7812, 0, 0, 0, 0, 0, 0 ],
	373 : [ 119, 7811, 7809, 7813, 0, 0, 0, 0, 0, 0 ],
	374 : [ 89, 221, 7922, 376, 0, 0, 0, 0, 0, 0 ],
	375 : [ 121, 253, 7923, 255, 0, 0, 0, 0, 0, 0 ],
	376 : [ 89, 221, 7922, 0, 374, 0, 0, 0, 0, 0 ],
	377 : [ 90, 0, 0, 0, 0, 381, 0, 379, 0, 0 ],
	378 : [ 122, 0, 0, 0, 0, 382, 0, 380, 0, 0 ],
	379 : [ 90, 377, 0, 0, 0, 381, 0, 0, 0, 0 ],
	380 : [ 122, 378, 0, 0, 0, 382, 0, 0, 0, 0 ],
	381 : [ 90, 377, 0, 0, 0, 0, 0, 379, 0, 0 ],
	382 : [ 122, 378, 0, 0, 0, 0, 0, 380, 0, 0 ],
	536 : [ 83, 346, 0, 0, 348, 352, 0, 0, 350, 7838 ],
	537 : [ 115, 347, 0, 0, 349, 353, 0, 0, 351, 223 ],
	538 : [ 84, 0, 0, 0, 0, 356, 0, 0, 0, 222 ],
	539 : [ 116, 0, 0, 0, 0, 357, 0, 0, 0, 254 ],
	7748 : [ 78, 323, 0, 0, 0, 327, 209, 0, 325, 0 ],
	7749 : [ 110, 324, 0, 0, 0, 328, 241, 0, 326, 0 ],
	7808 : [ 87, 7810, 0, 7812, 372, 0, 0, 0, 0, 0 ],
	7809 : [ 119, 7811, 0, 7813, 373, 0, 0, 0, 0, 0 ],
	7810 : [ 87, 0, 7808, 7812, 372, 0, 0, 0, 0, 0 ],
	7811 : [ 119, 0, 7809, 7813, 373, 0, 0, 0, 0, 0 ],
	7812 : [ 87, 7810, 7808, 0, 372, 0, 0, 0, 0, 0 ],
	7813 : [ 119, 7811, 7809, 0, 373, 0, 0, 0, 0, 0 ],
	7838 : [ 0, 346, 0, 0, 348, 352, 536, 0, 350, 0 ],
	7922 : [ 89, 221, 0, 376, 374, 0, 0, 0, 0, 0 ],
	7923 : [ 121, 253, 0, 255, 375, 0, 0, 0, 0, 0 ]
    }
};

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
//    alert("char code is " + event.charCode + "/" + event.keyCode);
    var currentChar = event.keyCode - 48;
//    if (typeof currentChar === 'undefined') {
//	currentChar = event.keyCode - 48;
//    }
    if (currentChar < 0 || currentChar > 9) return false;

    var mode = element.attr("plkb-mode");
    if (mode == "off") return false;

    var p = element.getCursorPosition();
    if (p <= 0) return false;
//    alert("currentChar is " + currentChar + ", mode is " + mode + ", p is " + p);

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
    if (!elem.attr("plkb-mode")) {
	elem.attr("plkb-mode", "all");
    }
    elem.keypress( function(event) { plkb_keypress( elem, event ); } );
    elem.onkeypress( function(event) { plkb_keypress( elem, event ); } ); // IE
}

$(document).ready( function() {
    $(".plkb").each( init_plkeyboard );
} );
