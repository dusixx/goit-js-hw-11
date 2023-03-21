//
// default value index == 1
// button[:button]
//

export default queryParams = {
  image_type: {
    caption: 'type',
    value: ['all', 'photo', 'illustration', 'vector'],
  },

  order: {
    value: ['', 'ec', 'trending', 'latest'],
    alias: ['Most relevant', "Editor's choice"],
  },

  orientation: {
    value: ['all', 'horizontal', 'vertical'],
  },

  colors: {
    value: [
      'grayscale',
      'transparent',
      'red',
      'orange',
      'yellow',
      'green',
      'turquoise',
      'blue',
      'lilac',
      'pink',
      'white',
      'gray',
      'black',
      'brown',
    ],
  },

  safesearch: {
    value: ['false', 'true'],
  },

  // order: {
  //   value: ['popular', 'latest'],
  // },

  // editorsChoice: {
  //   caption: "Editor's choice",
  //   value: ['false', 'true'],
  // },

  // category: [
  //   'backgrounds',
  //   'fashion',
  //   'nature',
  //   'science',
  //   'education',
  //   'feelings',
  //   'health',
  //   'people',
  //   'religion',
  //   'places',
  //   'animals',
  //   'industry',
  //   'computer',
  //   'food',
  //   'sports',
  //   'transportation',
  //   'travel',
  //   'buildings',
  //   'business',
  //   'music',
  // ],
};

// const searchParams = (
//   'q key lang id image_type orientation category min_width min_height ' +
//   'colors editors_choice safesearch order page per_page'
// ).split(' ');
