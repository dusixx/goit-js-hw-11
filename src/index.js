import './sass/index.scss';
import PixabayService from './js/pixabay-service';
import ImageGallery from './js/image-gallery';
import utils from './js/utils';
import refs from './js/refs';
import hwData from './js/hw-data';

//
// Init
//

const opts = {
  scrollThrottleDelay: 500,
  backtopScrollOffset: 1000,
  backtopHiddenClass: 'backtop--hidden',
  scrollBehavior: 'smooth',
};

const { defSearchOpts, message } = hwData;
const { clearBtn, searchForm, searchInput, loader, backtop } = refs;
const { error, info, succ, getViewportClientRect, throttle } = utils;

const gallery = new ImageGallery('.gallery');
const pbs = new PixabayService(defSearchOpts);

//
// Event handlers
//

clearBtn.addEventListener('click', handleClearInputClick);
searchForm.addEventListener('submit', handleSearchFormSubmit);
backtop.addEventListener('click', handleBacktopClick);
document.addEventListener(
  'scroll',
  throttle(handleDocumentScroll, opts.scrollThrottleDelay)
);

function handleClearInputClick(e) {
  searchInput.value = '';
  // чтобы не слетал outline
  searchInput.focus();
  gallery.clear();
  showLoader(false);
}

function handleSearchFormSubmit(e) {
  e.preventDefault();

  const query = e.currentTarget.searchQuery.value.trim();
  if (!query) return info(message.NO_SEARCH_QUERY);

  pbs.queryParams = { page: 0, q: query };
  gallery.clear();
  // запускаем поиск
  showLoader();
}

function handleDocumentScroll() {
  const action =
    window.pageYOffset > opts.backtopScrollOffset ? 'remove' : 'add';
  backtop.classList[action](opts.backtopHiddenClass);
}

function handleBacktopClick(e) {
  e.preventDefault();

  scrollTo({
    top: 0,
    behavior: opts.scrollBehavior,
  });
}

//
// Helpers
//

function showLoader(show = true) {
  loader.style.display = show ? 'flex' : 'none';
}

//
// Infinity scroll
//

const observer = new IntersectionObserver(handleGalleryScroll, {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
});

observer.observe(loader);

async function handleGalleryScroll([entry], observer) {
  if (!entry.isIntersecting) return;

  try {
    const resp = await pbs.fetch();

    // это первый запрос - показываем кол-во результатов
    if (gallery.isEmpty && resp.totalHits) {
      succ(message.SEARCH_RESULTS_FOUND(resp.totalHits));
    }

    // рендерим галлерею
    await gallery.append(resp.hits);

    // скролим начиная со следующей страницы
    // note: Начальная страница может быть любой, не всегда 1-ой
    if (gallery.length !== pbs.perPage) {
      scrollBy({
        top: getViewportClientRect().height / 2,
        behavior: opts.scrollBehavior,
      });
    }

    // больше нет результатов
    if (pbs.isEOSReached) {
      showLoader(false);

      return resp.totalHits === 0
        ? error(message.NO_SEARCH_RESULTS)
        : info(message.END_OF_SEARCH);
    }
  } catch (err) {
    showLoader(false);
    error(err.message);
    console.error(err);
  }
}
