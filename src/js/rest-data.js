//
// default value index == 1
//

export default queryParams = {
  image_type: {
    caption: 'type',
    value: ['all', 'photo', 'illustration', 'vector'],
  },

  order: {
    value: ['?Most relevant', "ec?Editor's choice", 'trending', 'latest'],
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
      'lilac?mediumorchid',
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
