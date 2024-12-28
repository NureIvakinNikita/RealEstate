// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
};

async function main() {
  // Налаштування акаунтів
  const [buyer, seller, inspector, lender, admin] = await ethers.getSigners();

  // Розгортання контракту Real Estate
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();
  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`);
  console.log(`Minting 3 properties...\n`);

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(seller).mint(
      `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`
    );
    await transaction.wait();
  }

  // Розгортання контракту Escrow
  const Escrow = await ethers.getContractFactory("Escrow");
  console.log('admin address:'+ admin);
  console.log('seller address:'+ seller.address);
  console.log('buyer address:'+ buyer.address);
  const escrow = await Escrow.connect(admin).deploy(realEstate.address, seller.address);
  await escrow.deployed();
  const adminAddress = await escrow.getAdmin();
  console.log(`Admin address: ${adminAddress}`);
  console.log(`Deployed Escrow Contract at: ${escrow.address}`);
  console.log(`Listing 3 properties...\n`);

  // Додавання токенів до Escrow
  for (let i = 0; i < 3; i++) {
    let transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, i + 1);
    await transaction.wait();
  }

  // Лістинг токенів
  let transaction = await escrow
    .connect(seller)
    .list(1, buyer.address, tokens(20), tokens(10));
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(2, buyer.address, tokens(15), tokens(5));
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(3, buyer.address, tokens(10), tokens(5));
  await transaction.wait();

  // Призначення ролей
  await escrow.connect(admin).assignRole(buyer.address, 1); // Buyer
  await escrow.connect(admin).assignRole(seller.address, 2); // Seller
  await escrow.connect(admin).assignSpecialRole(inspector.address, "Inspector");
  await escrow.connect(admin).assignSpecialRole(lender.address, "Lender");

  console.log(`Assigned roles successfully.`);

   // Тестування функції selectRole
   /*console.log("Testing selectRole function:");
   try {
     // Припустимо, ми хочемо призначити роль "buyer" для певного акаунту
     const roleEnum = 1; // 1 - Buyer, 2 - Seller, 3 - Both, 4 - Admin
     const tx = await escrow.selectRole(seller.address, 1);
     await tx.wait();
     const role = await escrow.getUserRole(seller.address);
     console.log(role);
     console.log("Role selected successfully!");
   } catch (error) {
     console.error("Error selecting role:", error);
   }
 
   console.log(`Assigned roles successfully.`);*/
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
