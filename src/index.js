import './sass/index.scss';
import PixabayService from './js/pixabay-service';
import ImageGallery from './js/image-gallery';
import utils from './js/utils';
import refs from './js/refs';
import hwData from './js/hw-data';

//
// Init
//

const { defSearchOpts, message } = hwData;
const { clearBtn, searchForm, searchInput, loader, backtop } = refs;
const { error, info, succ, scrollTop, getViewportClientRect, throttle } = utils;

const gallery = new ImageGallery('.gallery');
const pbs = new PixabayService(defSearchOpts);

//
// Event handlers
//

clearBtn.addEventListener('click', handleClearInputClick);
searchForm.addEventListener('submit', handleSearchFormSubmit);
document.addEventListener('scroll', throttle(handleDocumentScroll, 500));
backtop.addEventListener('click', handleBacktopClick);

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

  pbs.queryParams = { page: 1, perPage: 60, q: query };
  gallery.clear();
  // запускаем поиск
  showLoader();
}

function handleDocumentScroll() {
  const action = window.pageYOffset > 1000 ? 'remove' : 'add';
  backtop.classList[action]('backtop--hidden');
}

function handleBacktopClick(e) {
  e.preventDefault();

  scrollTo({
    top: 0,
    behavior: 'smooth',
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
    if (!gallery.length && resp.totalHits) {
      succ(message.SEARCH_RESULTS_FOUND(resp.totalHits));
    }

    // рендерим галлерею
    await gallery.append(resp.hits);

    // скролим при последующих загрузках изображений
    if (pbs.page > 2) {
      scrollBy({
        top: getViewportClientRect().height / 2,
        behavior: 'smooth',
      });
    }

    // больше нет результатов
    if (pbs.isEOSReached) {
      showLoader(false);

      return resp.totalHits === 0
        ? info(message.NO_SEARCH_RESULTS)
        : info(message.END_OF_SEARCH);
    }
  } catch (err) {
    showLoader(false);
    error(err.message);
    console.error(err);
  }
}
