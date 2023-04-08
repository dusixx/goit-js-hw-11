import './sass/index.scss';
import PixabayService from './js/pixabay-service';
import ImageGallery from './js/image-gallery';
import utils from './js/utils';
import refs from './js/refs';
import hwData from './js/hw-data';
import Filter from './js/filter';
import _ from './js/backtop';
import _ from './js/header';

//
// Init
//

const { defSearchOpts, message } = hwData;
const { clearBtn, searchForm, searchInput, loader, backtop } = refs;
const { error, info, succ, getViewportClientRect, scrollByTop } = utils;

const gallery = new ImageGallery('.gallery');
const pbs = new PixabayService();

const filter = new Filter({
  toggler: refs.toggleFilterList,
  onChange: handleFilterChange,
  data: defSearchOpts,
});

filter.show();

//
// Event handlers
//

gallery.ref.addEventListener('click', handleGalleryClick);
clearBtn.addEventListener('click', handleClearInputClick);
searchForm.addEventListener('submit', handleSearchFormSubmit);

function handleGalleryClick({ target }) {
  if (target.classList.contains('img-tags__item')) {
    searchForm.searchQuery.value = target.textContent;
    startSearching(filter.getData());
  }
}

function handleClearInputClick(e) {
  searchInput.value = '';
  // чтобы не слетал outline
  searchInput.focus();
  gallery.clear();
  showLoader(false);
}

function handleSearchFormSubmit(e) {
  e.preventDefault();
  startSearching(filter.getData());
}

function handleFilterChange(queryData) {
  startSearching(queryData, true);
}

//
// Helpers
//

function showLoader(show = true) {
  loader.style.display = show ? 'flex' : 'none';
}

function startSearching(queryData, silentMode) {
  const query = searchForm.searchQuery.value.trim();
  if (!query) {
    if (!silentMode) info(message.EMPTY_SEARCH_QUERY);
    return;
  }

  pbs.queryParams = {
    ...queryData,
    q: query,
    page: 1,
  };

  gallery.clear();
  showLoader();
}

//
// Infinite scroll
//

const observer = new IntersectionObserver(handleGalleryScroll, {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
});

observer.observe(loader);

async function handleGalleryScroll([entry], observer) {
  if (!entry.isIntersecting) return;

  // первый запрос
  const isInitialQuery = gallery.isEmpty;

  try {
    const { data } = await pbs.fetch();

    // первый запрос - показываем кол-во результатов
    if (isInitialQuery && data.totalHits) {
      succ(message.SEARCH_RESULTS_FOUND(data.totalHits));
    }

    // рендерим галлерею
    gallery.append(data.hits);

    // скролим начиная со следующей страницы
    // Начальная страница может быть любой, не всегда 1-ой
    if (!isInitialQuery) scrollByTop(getViewportClientRect().height / 2);

    // нет результатов
    if (pbs.isEOSReached) {
      showLoader(false);

      return data.totalHits === 0
        ? error(message.NO_SEARCH_RESULTS)
        : info(message.END_OF_SEARCH_REACHED, { timeout: 1500 });
    }
  } catch (err) {
    showLoader(false);
    error(err.message);
    console.error(err);
  }
}
