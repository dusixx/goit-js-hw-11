export default {
  message: {
    SEARCH_RESULTS_FOUND(totalHits) {
      return `Hooray! We found (${totalHits}) images`;
    },
    EMPTY_SEARCH_QUERY: 'Please, input your search query',
    END_OF_SEARCH_REACHED: "Sorry, you've reached the end of search results",
    NO_SEARCH_RESULTS: 'No search results matching your query',
  },

  defSearchOpts: {
    page: 1,
    perPage: 40,
    imageType: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  },
};
