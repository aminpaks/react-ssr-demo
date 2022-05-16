import {buildResource} from './resource';

export const resource = buildResource(async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const rnd = Math.floor(Math.random() * Date.now()).toString(16);
  return {value: `This is coming from server! -- RNG: ${rnd}`};
}, 'message');
