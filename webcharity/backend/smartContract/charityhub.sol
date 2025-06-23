// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityHub {
    // Structs
    struct Project {
        uint256 id;
        string name;
        uint256 goal;
        address creator;
        uint256 totalDonated;
        bool completed;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Donation[]) public donations;
    uint256 public projectCount;
    address public owner;

    // Events
    event ProjectCreated(
        uint256 indexed id,
        string name,
        uint256 goal,
        address creator
    );

    event DonationReceived(
        uint256 indexed projectId,
        address donor,
        uint256 amount,
        uint256 timestamp
    );

    event FundsWithdrawn(
        uint256 indexed projectId,
        address creator,
        uint256 amount
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier projectExists(uint256 _projectId) {
        require(_projectId > 0 && _projectId <= projectCount, "Project does not exist");
        _;
    }

    modifier onlyCreator(uint256 _projectId) {
        require(projects[_projectId].creator == msg.sender, "Only creator can call this function");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Functions
    function createProject(string memory _name, uint256 _goal) public {
        require(_goal > 0, "Goal must be greater than 0");
        
        projectCount++;
        projects[projectCount] = Project({
            id: projectCount,
            name: _name,
            goal: _goal,
            creator: msg.sender,
            totalDonated: 0,
            completed: false
        });

        emit ProjectCreated(projectCount, _name, _goal, msg.sender);
    }

    function donate(uint256 _projectId) public payable projectExists(_projectId) {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Project storage project = projects[_projectId];
        require(!project.completed, "Project is already completed");

        // Add donation
        donations[_projectId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        // Update project total
        project.totalDonated += msg.value;

        // Check if goal is reached
        if (project.totalDonated >= project.goal) {
            project.completed = true;
        }

        emit DonationReceived(_projectId, msg.sender, msg.value, block.timestamp);
    }

    function withdraw(uint256 _projectId) public projectExists(_projectId) onlyCreator(_projectId) {
        Project storage project = projects[_projectId];
        require(project.completed, "Project is not completed yet");
        require(project.totalDonated > 0, "No funds to withdraw");

        uint256 amount = project.totalDonated;
        project.totalDonated = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_projectId, msg.sender, amount);
    }

    // View functions
    function getProject(uint256 _projectId) public view projectExists(_projectId) returns (Project memory) {
        return projects[_projectId];
    }

    function getDonations(uint256 _projectId) public view projectExists(_projectId) returns (Donation[] memory) {
        return donations[_projectId];
    }

    // Additional safety features
    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }

    fallback() external payable {
        revert("Direct ETH transfers not allowed");
    }
}