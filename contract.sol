// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum Role {
    USER,
    ADMIN
}

contract TransfersV1 {
    struct User {
        string username;
        Role role;
        bytes32 secretHash;
        uint256[] transfers;
        bool exists;
    }
    mapping(address => User) users;
    mapping(string => address) userLogins;
    string[] userLoginsArray;

    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.ADMIN, "Access denied");
        _;
    }

    modifier onlyExistingUsers() {
        require(users[msg.sender].exists, "You're not registered");
        _;
    }

    function authenticateUser(string memory secret)
        external
        view
        onlyExistingUsers
        returns (bool)
    {
        require(
            users[msg.sender].secretHash == keccak256(abi.encodePacked(secret)),
            "Wrong secret"
        );
        return true;
    }

    function registerUser(string memory username, bytes32 secretHash) external {
        require(
            userLogins[username] == address(0),
            "User with this username already exists"
        );
        require(
            !users[msg.sender].exists,
            "You're already registered yourself"
        );

        uint256[] memory emptyTransfers;
        users[msg.sender] = User(
            username,
            Role.USER,
            secretHash,
            emptyTransfers,
            true
        );
        userLogins[username] = msg.sender;
        userLoginsArray.push(username);
    }

    function getUserAddress(string memory username)
        external
        view
        returns (address)
    {
        require(userLogins[username] != address(0), "Wrong username");
        return userLogins[username];
    }

    constructor() {
        bytes32 defaultPassword = keccak256(abi.encodePacked("12345"));
        uint256[] memory emptyTransfers;

        users[0x034f8BEf70c534491218200638224900D84A7272] = User(
            "admin",
            Role.ADMIN,
            defaultPassword,
            emptyTransfers,
            true
        );
        userLogins["admin"] = 0x034f8BEf70c534491218200638224900D84A7272;
        userLoginsArray.push("admin");

        users[0xBa385ca63bf96E52E961CbC976074460A8063DdC] = User(
            "ivan",
            Role.ADMIN,
            defaultPassword,
            emptyTransfers,
            true
        );
        userLogins["ivan"] = 0xBa385ca63bf96E52E961CbC976074460A8063DdC;
        userLoginsArray.push("ivan");

        users[0xf70A30A5cBc60aA60bAf289630c04f498360fe29] = User(
            "tanya",
            Role.USER,
            defaultPassword,
            emptyTransfers,
            true
        );
        userLogins["tanya"] = 0xf70A30A5cBc60aA60bAf289630c04f498360fe29;
        userLoginsArray.push("tanya");

        users[0x1CC97aAbCdFE64AAc7B9180e38Bd70C3826350D7] = User(
            "nadya",
            Role.USER,
            defaultPassword,
            emptyTransfers,
            true
        );
        userLogins["nadya"] = 0x1CC97aAbCdFE64AAc7B9180e38Bd70C3826350D7;
        userLoginsArray.push("nadya");

        users[0xC9e53A87673beb129E13BEb6c35aD1dBD25b1308] = User(
            "danil",
            Role.USER,
            defaultPassword,
            emptyTransfers,
            true
        );
        userLogins["danil"] = 0xC9e53A87673beb129E13BEb6c35aD1dBD25b1308;
        userLoginsArray.push("danil");

        users[0xB4d7C71899D820f72008DdA571e91D702b89A5f3] = User(
            "maksim",
            Role.USER,
            defaultPassword,
            emptyTransfers,
            true
        );
        userLogins["maksim"] = 0xB4d7C71899D820f72008DdA571e91D702b89A5f3;
        userLoginsArray.push("maksim");
    }
}

contract TransfersV2 is TransfersV1 {
    struct Transfer {
        address sender;
        address receiver;
        uint256 count;
        uint256 timestamp;
        bytes32 secretHash;
        uint256 category;
        bool finished;
        bool exists;
    }
    mapping(uint256 => Transfer) transfers;
    uint256[] transferIds;

    mapping(uint256 => string) categories;
    uint256[] categoryIds;

    function createTransfer(
        string memory receiverUsername,
        bytes32 secretHash,
        uint256 category
    ) external payable onlyExistingUsers {
        require(
            msg.value >= 1000000000000000000,
            "You need to send at least 1 eth"
        );
        require(
            users[userLogins[receiverUsername]].exists,
            "User does not exist"
        );
        require(
            userLogins[receiverUsername] != msg.sender,
            "You can't send transfer to yourself"
        );

        transfers[transferIds.length] = Transfer(
            msg.sender,
            userLogins[receiverUsername],
            msg.value,
            block.timestamp,
            secretHash,
            category,
            false,
            true
        );

        users[msg.sender].transfers.push(transferIds.length);
        users[userLogins[receiverUsername]].transfers.push(transferIds.length);

        transferIds.push(transferIds.length);
    }

    function acceptTransfer(uint256 transferId, bytes32 secretHash)
        external
        onlyExistingUsers
    {
        require(transfers[transferId].exists, "Transfer does not exist");
        require(
            !transfers[transferId].finished,
            "Transfer is already finished"
        );
        require(transfers[transferId].receiver == msg.sender, "Access denied");
        require(
            transfers[transferId].secretHash == secretHash,
            "Wrong passphrase"
        );

        payable(transfers[transferId].receiver).transfer(
            transfers[transferId].count
        );
        transfers[transferId].finished = true;
    }

    function cancelTransfer(uint256 transferId) external onlyExistingUsers {
        require(
            !transfers[transferId].finished,
            "Transfer is already finished"
        );
        require(transfers[transferId].exists, "Transfer does not exist");
        require(transfers[transferId].sender == msg.sender, "Access denied");

        payable(msg.sender).transfer(transfers[transferId].count);
        transfers[transferId].exists = false;
    }

    function getTransferIds() external view returns (uint256[] memory) {
        return transferIds;
    }

    function getTransfer(uint256 transferId)
        external
        view
        returns (
            address sender,
            address receiver,
            uint256 count,
            uint256 timestamp,
            string memory category,
            bool finished,
            bool exists
        )
    {
        Transfer memory transfer = transfers[transferId];
        require(transfer.exists, "Transfer does not exist");
        require(
            transfer.sender == msg.sender || transfer.receiver == msg.sender,
            "Access denied"
        );

        return (
            transfer.sender,
            transfer.receiver,
            transfer.count,
            transfer.timestamp,
            categories[transfer.category],
            transfer.finished,
            transfer.exists
        );
    }

    function getCategoryIds() external view returns (uint256[] memory) {
        return categoryIds;
    }

    function getCategory(uint256 categoryId)
        external
        view
        returns (string memory name)
    {
        return categories[categoryId];
    }

    function createCategory(string memory name) external onlyAdmin {
        categories[categoryIds.length] = name;
        categoryIds.push(categoryIds.length);
    }

    constructor() {
        categories[0] = "Personal transfers";
        categoryIds.push(categoryIds.length);

        categories[1] = "Rent pay";
        categoryIds.push(categoryIds.length);

        categories[2] = "Personal settlements";
        categoryIds.push(categoryIds.length);
    }
}

contract TransfersV3 is TransfersV2 {
    struct Template {
        string name;
        uint256 category;
        uint256[] acceptableCounts;
        bool exists;
    }
    mapping(uint256 => Template) templates;
    mapping(string => uint256) templateNames;
    uint256[] templateIds;

    function createTemplate(string memory name, uint256 categoryId)
        external
        onlyAdmin
    {
        require(
            !templates[templateNames[name]].exists,
            "Template with this name already exists"
        );

        uint256[] memory emptyAcceptableCounts;
        templates[templateIds.length] = Template(
            name,
            categoryId,
            emptyAcceptableCounts,
            true
        );
        templateNames[name] = templateIds.length;
        templateIds.push(templateIds.length);
    }

    function addAcceptableCountToTemplate(
        uint256 templateId,
        uint256 acceptableCount
    ) external onlyAdmin {
        require(templates[templateId].exists, "Template does not exist");
        templates[templateId].acceptableCounts.push(acceptableCount);
    }

    function getTemplateIds() external view returns (uint256[] memory) {
        return templateIds;
    }

    function getTemplate(uint256 templateId)
        external
        view
        returns (
            string memory name,
            uint256 categoryId,
            uint256[] memory acceptableCounts,
            bool exists
        )
    {
        Template memory template = templates[templateId];
        require(template.exists, "Template does not exist");
        return (
            template.name,
            template.category,
            template.acceptableCounts,
            template.exists
        );
    }
}

contract TransfersV4 is TransfersV3 {
    function upgradeUserToAdmin(string memory username) external onlyAdmin {
        require(users[userLogins[username]].exists, "User does not exist");
        users[userLogins[username]].role = Role.ADMIN;
    }
}