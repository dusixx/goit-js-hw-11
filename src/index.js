import './sass/index.scss';
import PixabayService from './js/pixabay-service';
import ImageGallery from './js/image-gallery';
import utils from './js/utils';
import refs from './js/refs';
import hwData from './js/hw-data';
import _ from './js/backtop';

//
// Init
//

const { defSearchOpts, message } = hwData;
const { clearBtn, searchForm, searchInput, loader, backtop } = refs;
const { error, info, succ, getViewportClientRect, scrollByTop } = utils;

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
  if (!query) return info(message.EMPTY_SEARCH_QUERY);

  pbs.queryParams = { page: 0, q: query };
  gallery.clear();
  // запускаем поиск
  showLoader();
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

  // первая порция изображений
  const isInitialPage = gallery.isEmpty;

  try {
    const { data } = await pbs.fetch();

    // первый запрос - показываем кол-во результатов
    if (isInitialPage && data.totalHits) {
      succ(message.SEARCH_RESULTS_FOUND(data.totalHits));
    }

    // рендерим галлерею
    await gallery.append(data.hits);

    // скролим начиная со следующей страницы
    // Начальная страница может быть любой, не всегда 1-ой
    if (!isInitialPage) scrollByTop(getViewportClientRect().height / 2);

    // нет результатов
    if (pbs.isEOSReached) {
      showLoader(false);

      return data.totalHits === 0
        ? info(message.NO_SEARCH_RESULTS)
        : info(message.END_OF_SEARCH_REACHED);
    }
  } catch (err) {
    showLoader(false);
    error(err.message);
    console.error(err);
  }
}
