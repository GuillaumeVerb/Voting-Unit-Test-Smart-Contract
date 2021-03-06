# Voting-Unit-Test-Smart-Contract

# Main scripts
✔️ Voting.sol (contracts/Voting.sol): voting smart contract

✔️ testVoting.js (test/testVoting.js): Unit tests 

# Purpose of Voting Smart Contract

A smart contract vote can be simple or complex, depending on the requirements of the elections you wish to support. Voting can be on a small number of pre-selected proposals (or candidates), or on a potentially large number of proposals suggested dynamically by the voters themselves.

In this framework, you will write a smart contract for a small organisation. Voters, who are all known to the organisation, are whitelisted using their Ethereum address, can submit new proposals in a proposal registration session, and can vote on the proposals in the voting session.

✔️ Voting is not secret 

✔️ Each voter can see the votes of others

✔️ The winner is determined by a simple majority

✔️ The proposal with the most votes wins.


## 👉 The voting process: 

The entire voting process is as follows:

- The voting administrator registers a blank list of voters identified by their Ethereum address.
- The voting administrator starts the proposal registration session.
- Registered voters are allowed to register their proposals while the registration session is active.
- The voting administrator ends the proposal registration session.
- Voting administrator starts the voting session.
- Registered voters vote for their preferred proposal.
- The voting administrator ends the voting session.
- The voting administrator counts the votes.
- Everyone can check the final details of the winning proposal.


# Details about Unit tests

## 5 main phases: 

### - tests about getter fonctions:

- tests about fonction getVoter:

We want to know if the getter fonction getVoter works and the return is correct

- tests about fonction getProposal:

We want to know if the getter fonction getVoter works and the return is correct

### - tests about the registration voter (via addVote):

We want to check if the registration voter function works and if each voter is well registred (according to voting rules)

### - test about the proposal registration (via addProposal):

We want to check if the registration proposal function works and if each proposal is well registred (according to voting rules)

### - tests about the vote session (via setVote):

We want to check if the vote session function works and if each vote is well registred and for example if a voter can't vote twice

### - tests about Status and the modification of status 
- tests about status in order to verify there is the right caller:

We want to check it's only the owner who can change the status

- tests about status with wrong order call: 

We want to check if each status can be change only when it can change according to the voting rules (for example, you cannot pass from proposal registration session to the closing of voting session 




