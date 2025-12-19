import https from 'https';

const urls = [
  'https://models.readyplayer.me/63c59a35d72bffc6fa179c78.glb',
  'https://raw.githubusercontent.com/readyplayerme/visage/master/Models/Female.glb',
  'https://threejs.org/examples/models/gltf/Michelle.glb'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${url}: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`${url}: Error ${e.message}`);
  });
});
