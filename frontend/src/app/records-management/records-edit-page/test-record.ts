export const record = {
  chosenImage: 0,
  images: [],
  date: '1993-12-31',
  genres: ['African', 'Asian', 'Country', 'Test genre 1', 'Test genre 2'],
  styles: [
    'Test style 1',
    'Test style 2',
    'Alternative country',
    'Traditional country music',
  ],
  descriptions: ['Album', 'Special Edition', 'Test Pressing'],
  speed: '8 ⅓ RPM',
  size: 'LP',
  country: 'Sri Lanka',
  tracks: [
    {
      index: '1',
      artists: [
        {
          index: 1,
          name: 'Artist name 1',
        },
      ],
      title: 'Song 1',
      credits: [
        {
          index: 1,
          text: 'Credits 1',
        },
        {
          index: 2,
          text: 'Credits 2',
        },
      ],
      duration: '5:00',
    },
    {
      index: '2',
      artists: [
        {
          index: 1,
          name: 'Artist name 2',
        },
      ],
      title: 'Song 2',
      credits: [
        {
          index: 1,
          text: 'Credits 1',
        },
        {
          index: 2,
          text: 'Credits 2',
        },
      ],
      duration: '4:00',
    },
  ],
  notes: 'Notes test text',
  commonCredits: [
    {
      index: 1,
      text: 'Record Credits 1',
    },
    {
      index: 2,
      text: 'Record Credits 2',
    },
  ],
  songUrls: [
    {
      index: 1,
      text: 'https://test.com/test/1',
    },
    {
      index: 2,
      text: 'https://test.com/test/2',
    },
  ],
  name: 'Test Title',
  label: 'Sakura',
  mainArtist: 'Test Artist',
  catalogNo: 'CAT_4569:123',
  format: 'Shellac',
  channelCoding: 'Stereo',
};
