const image = {
  type: ['all', 'photo', 'illustration', 'vector'],
  order: ['most relevant', "editor's choice", 'trending', 'latest'],
  orientation: ['all', 'horizontal', 'vertical'],

  colors: [
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

  category: [
    'backgrounds',
    'fashion',
    'nature',
    'science',
    'education',
    'feelings',
    'health',
    'people',
    'religion',
    'places',
    'animals',
    'industry',
    'computer',
    'food',
    'sports',
    'transportation',
    'travel',
    'buildings',
    'business',
    'music',
  ],
};

const searchParams = (
  'q key lang id image_type orientation category min_width min_height ' +
  'colors editors_choice safesearch order page per_page'
).split(' ');

export { image, searchParams };
