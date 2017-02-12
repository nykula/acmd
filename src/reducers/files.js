const sampleFiles = [
  {
    icon: 'level-up',
    name: '[..]',
    ext: '',
    size: '<DIR>',
    date: '02/08/2017 00:10',
    mode: '0755'
  },
  {
    icon: 'file-text',
    name: 'clan in da front',
    ext: 'txt',
    size: '4,110',
    date: '02/01/2017 00:07',
    mode: '0644'
  }
]

export default (state = { 0: sampleFiles, 1: sampleFiles }, payload) => {
  return state
}
