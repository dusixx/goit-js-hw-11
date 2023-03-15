export default {
  message: {
    SEARCH_RESULTS_FOUND(totalHits) {
      return `Hooray! We found ${totalHits} images.`;
    },

    NO_SEARCH_QUERY: 'Please, enter a search query',
    END_OF_SEARCH: "We're sorry, but you've reached the end of search results.",
    NO_SEARCH_RESULTS: 'Sorry, there are no images matching your search query.',
  },

  defSearchOpts: {
    page: 1,
    perPage: 40,
    imageType: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  },
};
