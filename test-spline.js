import { SplineLoader } from '@splinetool/loader';

const loader = new SplineLoader();
loader.load('https://prod.spline.design/3q2YZdPHxar5ZDvu/scene.splinecode', (splineScene) => {
  console.log("Loaded spline scene:", splineScene);
  splineScene.traverse((child) => {
    if (child.isMesh) {
      console.log("Mesh:", child.name, child.material?.name, child.material?.type);
    }
  });
});
