
const Voting = artifacts.require("Voting");

// Lorsqu'on veut faire des fonction pour interagire avec une BC
// on fait ça avec une fonction async
module.exports = async (deployer) => {
  // On vient donc utiliser await pour executer en async
 // await deployer.deploy(SimpleStorage, 420, {value: 3});
//  const instance = await SimpleStorage.deployed();
//  const value = await instance.get();
//  console.log(value);
//  await instance.set(33);
//  const value2 = await instance.get();
//  console.log(value2);

await deployer.deploy(Voting);
};

