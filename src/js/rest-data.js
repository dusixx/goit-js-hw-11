export default queryParams = {
  image_type: {
    // value[?alias]
    // defValueIdx: 0
    value: ['?all images', 'photo', 'illustration', 'vector'],
  },

  order: {
    value: ['?most relevant', "ec?editor's choice", 'trending', 'latest'],
  },

  orientation: {
    value: ['?any orientation', 'horizontal', 'vertical'],
  },

  colors: {
    caption: 'Colors',
    colorPalette: true,
    value: [
      'transparent',
      'grayscale',
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
    type: 'checkbox',
    checked: true,
    value: 'true',
  },

  per_page: {
    type: 'number',
    // min: 3,
    min: 20,
    max: 200,
    value: 20,
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
