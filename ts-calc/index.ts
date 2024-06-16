import * as rustCalc from "rust-calc";


export const instantiate = async () => {
  const { default: init, initSync: _, ...lib } = rustCalc;

  await init();
  return lib;
};

export default instantiate;
