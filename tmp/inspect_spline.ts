import Loader from '@splinetool/loader';

const SCENE_URL = 'https://prod.spline.design/3q2YZdPHxar5ZDvu/scene.splinecode';

async function main() {
  const loader = new Loader();
  const splineData = await loader.loadAsync(SCENE_URL);
  
  console.log('Spline Data Structure:');
  console.log(JSON.stringify(splineData, (key, value) => {
    if (key === 'geometry' || key === 'material' || key === 'children') return undefined; // simplify
    return value;
  }, 2));
}

main().catch(console.error);
