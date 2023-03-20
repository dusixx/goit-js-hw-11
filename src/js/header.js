import utils from './utils';
import refs from './refs';

const SCROLL_THROTTLE_DELAY = 250;
const HEADER_TRANSLUCENT_CLASS = 'header--translucent';

const { scrollToTop, throttle } = utils;
const { header } = refs;

// document.addEventListener(
//   'scroll',
//   throttle(handleDocumentScroll, SCROLL_THROTTLE_DELAY)
// );

function handleDocumentScroll() {
  //const action = window.pageYOffset > header.offsetHeight ? 'add' : 'remove';
  //header.classList[action](HEADER_TRANSLUCENT_CLASS);
  //header.classList.add(HEADER_TRANSLUCENT_CLASS);
  //header.style.opacity = '0.8';
}
