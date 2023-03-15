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
const { clearBtn, searchForm, searchInput, loader } = refs;
const { error, info, succ, warn } = utils;

const gallery = new ImageGallery('.gallery');
const pbs = new PixabayService(defSearchOpts);

//
// Event handlers
//

clearBtn.addEventListener('click', handleClearInputClick);
searchForm.addEventListener('submit', handleSearchFormSubmit);

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

  pbs.queryParams = { page: 1, q: query };
  gallery.clear();
  // показываем loader, чтобы запустить поиск
  showLoader();
}

//
// Helpers
//

function showLoader(show = true) {
  loader.style.display = show ? 'block' : 'none';
}

//
// Infinity scroll
//

const observer = new IntersectionObserver(handleGalleryScroll, {
  root: null,
  rootMargin: '0px',
  threshold: 1,
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
    gallery.append(resp.hits);

    // больше нет результатов
    if (pbs.isEOSReached) {
      showLoader(false);

      return resp.totalHits > 0
        ? info(message.END_OF_SEARCH)
        : info(message.NO_SEARCH_RESULTS);
    }
  } catch (err) {
    showLoader(false);
    error(err.message);
    console.error(err);
  }
}
