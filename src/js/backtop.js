import utils from './utils';
import refs from './refs';

const { scrollToTop, throttle } = utils;

const SCROLL_THROTTLE_DELAY = 500;
const BACKTOP_SCROLL_OFFSET = 1000;
const BACKTOP_HIDDEN_CLASS = 'backtop--hidden';

refs.backtop.addEventListener('click', handleBacktopClick);

document.addEventListener(
  'scroll',
  throttle(handleDocumentScroll, SCROLL_THROTTLE_DELAY)
);

function handleDocumentScroll() {
  showBacktop(window.pageYOffset > BACKTOP_SCROLL_OFFSET);
}

function handleBacktopClick(e) {
  e.preventDefault();
  scrollToTop(0);
}

function showBacktop(show = true) {
  const action = show ? 'remove' : 'add';
  refs.backtop.classList[action](BACKTOP_HIDDEN_CLASS);
}
