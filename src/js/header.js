import utils from './utils/utils';
import refs from './utils/refs';

const { scrollToTop, throttle } = utils;
const { header } = refs;

const SCROLL_THROTTLE_DELAY = 250;
const HEADER_HIDDEN_CLASS = 'header--hidden';

let lastScrollY;

document.addEventListener(
  'scroll',
  throttle(handleDocumentScroll, SCROLL_THROTTLE_DELAY)
);

function handleDocumentScroll(e) {
  const action = lastScrollY > scrollY ? 'remove' : 'add';
  header.classList[action](HEADER_HIDDEN_CLASS);
  lastScrollY = scrollY;
}
