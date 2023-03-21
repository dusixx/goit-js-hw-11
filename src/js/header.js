import utils from './utils';
import refs from './refs';

const { scrollToTop, throttle } = utils;
const { header } = refs;

const SCROLL_THROTTLE_DELAY = 250;
const HEADER_HIDDEN_CLASS = 'header--hidden';

let lastScrollY;

document.addEventListener(
  'scroll',
  throttle(handleDocumentScroll, SCROLL_THROTTLE_DELAY)
);

// TODO: восходящий-нисходящий тренд...
// то бишь если скролим вверх, а потом вниз - тоже прятать
// На уровне высоты хедера показать его при любых раскладах
function handleDocumentScroll(e) {
  const action = lastScrollY > scrollY ? 'remove' : 'add';
  header.classList[action](HEADER_HIDDEN_CLASS);
  lastScrollY = scrollY;
}
