const contract = web3.eth
  .contract(abi)
  .at("0x079EAB76597CeF3b835EB2952985E41F7149734B");

function login(username, password, secret) {
  const address = contract.getUserAddress.call(username);
  personal.unlockAccount(address, password, 0);
  const authenticated = contract.authenticateUser.call(secret, {
    from: address,
  });
  if (!authenticated) return console.log("Error: Wrong secret!");
  console.log("Authenticated as " + username);

  web3.eth.defaultAccount = address;
}

function signup(username, password, secret) {
  const address = personal.newAccount(password);
  personal.unlockAccount(address, password, 0);
  web3.eth.defaultAccount = address;
  setTimeout(function () {
    web3.eth.sendTransaction({
      from: eth.accounts[0],
      to: address,
      value: web3.toWei(1500),
    });
    console.log("Created wallet, waiting 15 secs to finish transaction...");
  }, 2000);
  setTimeout(function () {
    try {
      contract.registerUser.sendTransaction(username, web3.sha3(secret));
      console.log(`Registered and authenticated as ${username}`);
    } catch (e) {
      console.log(e);
    }
  }, 15000);
}

function createTransfer(toUsername, value, passphrase, categoryId) {
  contract.createTransfer.sendTransaction(
    toUsername,
    web3.sha3(passphrase),
    categoryId - 1,
    { value: web3.toWei(value) },
    function (error) {
      if (error) return console.error(error);
      console.log("Created transfer to " + toUsername);
    }
  );
}

function dashboard() {
  if (!web3.eth.defaultAccount)
    return console.error("Error: You're not authenticated!");
  console.log(`Welcome to Transfer DApp!\nHere's your dashboard:\n`);

  const user = contract.getUser.call(web3.eth.defaultAccount);
  const balance = eth.getBalance(web3.eth.defaultAccount);
  let role = user[1] == 0 ? "USER" : "ADMIN";

  console.log(`Username: ${user[0]}`);
  console.log(`Balance: ${web3.fromWei(balance)} eth`);
  console.log(`Role: ${role}`);
  console.log(`Transfers: Use getTransfers()`);
}

function getTransfers() {
  const ids = contract.getTransferIds.call();
  console.log(`ID\tFrom\tTo\tValue\tDate\tCategory\tFinished`);
  for (let i = 0; i < ids.length; i++) {
    try {
      const transfer = contract.getTransfer.call(i);
      console.log(
        `${i}\t${transfer[0]}\t${transfer[1]}\t${web3.fromWei(
          transfer[2]
        )}\t${new Date(transfer[3] * 1000).toString()}\t${transfer[4]}\t${
          transfer[5] ? "Yes" : "No"
        }`
      );
    } catch (e) {
      continue;
    }
  }
}

function acceptTransfer(id, passphrase) {
  const transfer = contract.getTransfer.call(id);
  contract.acceptTransfer(id, web3.sha3(passphrase));
  console.log(
    `Successfully accepted transfer ${id} and got ${web3.fromWei(
      transfer[2]
    )} eth`
  );
}

function createCategory(name) {
  contract.createCategory(name);
  console.log(`Successfullt create category ${name}`);
}

function cancelTransfer(id) {
  const transfer = contract.getTransfer.call(id);
  contract.cancelTransfer(id);
  console.log(
    `Successfully cancelled transfer ${id} and got back ${web3.fromWei(
      transfer[2]
    )} eth`
  );
}

function getTemplates() {
  const ids = contract.getTemplateIds.call();
  console.log(`ID\tName\tAcceptable counts of eth\tCategory`);
  for (let i = 0; i < ids.length; i++) {
    const template = contract.getTemplate.call(i);

    console.log(
      `${i}\t${template[0]}\t${template[2]
        .map((count) => web3.fromWei(count))
        .join(", ")}\t${contract.getCategory.call(template[1])}`
    );
  }
}

function createTemplate(name, categoryId) {
  contract.createTemplate(name, categoryId - 1);
  console.log(`Created template ${name}`);
}

function addAcceptableCountsToTemplate(templateId, ...acceptableCounts) {
  const template = contract.getTemplate.call(templateId);
  for (const count of acceptableCounts) {
    contract.addAcceptableCountToTemplate(templateId, web3.toWei(count));
  }
  console.log(
    `Added ${acceptableCounts.join(", ")} to acceptable counts of template "${
      template[0]
    }"`
  );
}

function upgradeUserToAdmin(username) {
  contract.upgradeUserToAdmin(username);
  console.log(`Successfully upgraded user ${username} to admin`);
}

function getMyBalance() {
  console.log(
    "Your balance is: " +
      web3.fromWei(eth.getBalance(web3.eth.defaultAccount)) +
      " eth"
  );
}

function getCategories() {
  const ids = contract.getCategoryIds.call();
  for (let i = 0; i < ids.length; i++) {
    const categoryName = contract.getCategory.call(i);
    console.log(`${i + 1}. ${categoryName}`);
  }
}
