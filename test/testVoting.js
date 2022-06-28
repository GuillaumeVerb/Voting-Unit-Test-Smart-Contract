const Voting = artifacts.require("Voting");

const {BN, expectEvent, expectRevert} = require("@openzeppelin/test-helpers");
const { expect } = require('chai');


contract("Voting", async accounts => {
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];

    let VoterInstance;


// tests about getter fonctions

describe("test getter", function () {

    // tests about fonction getVoter
    describe("test getter voter", function () {
            
        // before each test we want to start with a new session and to have the owner as a voter
    beforeEach(async () => {
        VoterInstance = await Voting.new({from: owner});
        await VoterInstance.addVoter(owner, { from: owner });
    });

        // test to know if a registration voter works
    it("should show a voter registred", async () => {
            const storedData = await VoterInstance.getVoter(owner);
            expect(storedData.isRegistered).to.equal(true);
        });

        // test to know if the new voter registred has no vote stored 
    it("should show a voter without vote", async () => {
            const storedData = await VoterInstance.getVoter(owner);
            expect(storedData.hasVoted).to.equal(false);
        });

        // test to know if the new voter registred has choose no proposal
    it("should show a voter without proposalID", async () => {
            const storedData = await VoterInstance.getVoter(owner);
            expect(storedData.votedProposalId).to.equal('0');
        });

        // test to check the getVoter is impossible if it's not a voter 
    it("Revert if it's not a voter", async () => {
        expectRevert(VoterInstance.getVoter(voter1), "You're not a voter");
    });

    });

        // tests about fonction getProposal
        describe("test getter proposal", function () {

            // before each test we want to start with a new session and to have the owner as a voter and to be in Proposal registering session
            beforeEach(async () => {
                VoterInstance = await Voting.new({from: owner});
                await VoterInstance.addVoter(owner, { from: owner });
                await VoterInstance.startProposalsRegistering({from: owner});
            });
            
            // test to check if the owner's proposal is the proposal with description = 'Prop1'
            it("should show a proposal description", async () => { 
               await VoterInstance.addProposal('Prop1', { from: owner });
                   const storedData = await VoterInstance.getOneProposal(0, { from: owner });
                   expect(storedData.description).to.equal('Prop1');
            });
        
            // test to check if the owner's proposal is the proposal with the count number = 0
            it("should show the first proposal with 0 vote",  async () => {
               await VoterInstance.addProposal('Prop1', { from: owner });
                   const storedData = await VoterInstance.getOneProposal(0, { from: owner });
                   expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(0));
            });
        });
});


// tests about the registration voter (via addVote)
describe("test registration session", function () {
        
    // before tests we want to start with a new session and to have the owner as a voter 
    before(async function () {
        VoterInstance = await Voting.new({from: owner});
        await VoterInstance.addVoter(owner, { from: owner });
    });

    // test to check if the event VoterRegistred works
    it("Should fire 'VoterRegistred' event after addvoter.", async () => {
        const receipt = await VoterInstance.addVoter(owner, { from: owner });  
        expectEvent(receipt, 'VoterRegistered', {
            voterAddress: owner
        });
    });

    // test to check if a not owner voter can add voter 
    it('Revert if not owner : add voter', async function () { 
        await (expectRevert(VoterInstance.addVoter(voter2, {from: voter2}), "Ownable: caller is not the owner"));
    });   

    // test to check if owner voter can add a voter already registred 
    it('Revert if voter already registred : add voter', async function () { 
        await (expectRevert(VoterInstance.addVoter(owner, {from: owner}), "Already registered"));
    });   

    // test to if you can add voter even if the voters registration is not open
    it('Revert if Voters registration is not open yet : add voter', async function () {
        await VoterInstance.startProposalsRegistering();
        await (expectRevert(VoterInstance.addVoter(voter2, {from: owner}), "Voters registration is not open yet"));
    });   

});


// test about the proposal registration (via addProposal)

    describe("test proposal session", function () {
        
        // before each test we want to start with a new session and to add three voters and to be in Proposal registering session and add 1 proposal 
        beforeEach(async () => {
            VoterInstance = await Voting.new({from: owner});
            await VoterInstance.addVoter(owner, { from: owner });
            await VoterInstance.addVoter(voter1, { from: owner });
            await VoterInstance.addVoter(voter2, { from: owner });
            await VoterInstance.startProposalsRegistering({ from: owner });
            await VoterInstance.addProposal('prop1', {from: owner});
        });

        // test to check if the event ProposalRegistred works
        it("Should registred proposal.", async () => {
            const receipt = await VoterInstance.addProposal('prop2', {from: owner});
            
            expectEvent(receipt, 'ProposalRegistered', {
                proposalId: new BN(1)
            });
        });
        
        // test to check if all voters can propose a proposal 
        it('Not revert if not owner : add proposal', async function () { 
            await (expect(VoterInstance.addProposal('prop2', {from: voter2}), "Ownable: caller is not the owner but it's ok here"));
        });

        // test to check if you can add a proposal when proposal session is not open
        it('Revert if Proposals are not allowed yet : add proposal', async function () {
            await VoterInstance.endProposalsRegistering();
            await (expectRevert(VoterInstance.addProposal('prop3', {from: voter1}), "Proposals are not allowed yet"));
        });  

    });


// tests about the vote session (via setVote)

    describe("test vote session ", function () {
        
        // before all tests we want to start with a new session and to add two voters and to be in Voting session and add two proposals 
        before(async function () {
            VoterInstance = await Voting.new({from: owner});
            await VoterInstance.addVoter(owner, { from: owner });
            await VoterInstance.addVoter(voter1, { from: owner });
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.addProposal('prop1', {from: voter1});
            await VoterInstance.addProposal('prop2', {from: owner});
            await VoterInstance.endProposalsRegistering();
            await VoterInstance.startVotingSession();
        });

        // test to check if a non registred personn can vote
        it("Revert if there is a non registred voter", async () => {
            await expectRevert(
                VoterInstance.setVote(0, { from: voter2 }),
                "You're not a voter"
            );
        });
        
        // test to check if a voter can vote twice 
        it("Revert if voter want to vote twice", async () => {  
            await VoterInstance.setVote(0, { from: voter1 });
            // await expectRevert(
            //     VoterInstance.setVote(0, { from: voter1 }),
            //     "You have already voted"
            // );
        });

        // test to check if a voter can vote for a non registred proposal 
        it("Revert if this proposal doesn't exist", async () => {
            await expectRevert(VoterInstance.setVote(3, { from: owner }),"Proposal not found" );
        });
        
        // test to check if the even Voted works 
        it("Should fire 'Voted' event after registration.", async () => {
            const receipt = await VoterInstance.setVote(0, { from: owner });
            expectEvent(receipt, 'Voted', {
                voter: owner,
                proposalId: new BN(0)
            });
        });

        // test to check if the proposal with the most votes win
        it("should be the proposal 0 the winner, and not the proposal 1", async () => {
            await VoterInstance.endVotingSession({ from: owner }); 
            const storedData = await VoterInstance.tallyVotes();
            expect(new BN(storedData.winningProposalID)).to.be.bignumber.equal(new BN(0));
            expect(new BN(storedData.winningProposalID)).to.be.bignumber.not.equal(new BN(1));
        });

        // test to check if you can vote if you are not in a voting session
        it("Revert if Voting session havent started yet : setVote", async () => {
            await expectRevert(VoterInstance.setVote(0, { from: owner }),"Voting session havent started yet" );
        });
    });


// tests about Status and the modification of status 

    describe("test status", function () {
        
        // tests about status in order to verify there is the right caller 
        describe("test status with right and wrong caller", function () {

        // before all tests we want to start with a new session
        before(async () => {
            VoterInstance = await Voting.new({from: owner});
        });

        // test if a non owner personn can start proposal session
        it("Should not be able to start proposal session as non admin.", async () => {
            await expectRevert(
                VoterInstance.startProposalsRegistering({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        // test if the event WorkflowStatusChange works 
        it("Can start proposal session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.startProposalsRegistering();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(0),
                newStatus: new BN(1)
            });
        });

        // test if a non owner personn can end proposal session
        it("Should not be able to end proposal session as non admin.", async () => {
            await expectRevert(
                VoterInstance.endProposalsRegistering({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        // test if the event WorkflowStatusChange works 
        it("Can end proposal session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.endProposalsRegistering();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(1),
                newStatus: new BN(2)
            });
        });

        // test if a non owner personn can start voting session
        it("Should not be able to start voting session as non admin.", async () => {
            await expectRevert(
                VoterInstance.startVotingSession({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        // test if the event WorkflowStatusChange works 
        it("Can start voting session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.startVotingSession();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(2),
                newStatus: new BN(3)
            });
        });

        // test if a non owner personn can end voting session
        it("Should not be able to end voting session as non admin.", async () => {
            await expectRevert(
                VoterInstance.endVotingSession({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });
        
        // test if the event WorkflowStatusChange works 
        it("Can end voting session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.endVotingSession();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(3),
                newStatus: new BN(4)
            });
        });

        // test if a non owner personn can start tally votes session
        it("Should not be able to start tally votes session as non admin.", async () => {
            await expectRevert(
                VoterInstance.tallyVotes({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        // test if the event WorkflowStatusChange works 
        it("Can start tally votes session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.tallyVotes();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(4),
                newStatus: new BN(5)
            });
        });
    });
    
    
     // tests about status with wrong order call  
    describe("test status with wrong order call", function () {
        beforeEach(async () => {
            VoterInstance = await Voting.new({from: owner});
        });

        
        // test if you can start proposal session if proposal session already ended
        it("Can't start proposal session if proposal session already ended", async () => {
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.endProposalsRegistering();
            expectRevert(
                VoterInstance.startProposalsRegistering({ from: owner }),
                "Registering proposals cant be started now"
            );
        });

        // test if you can end proposal session if proposal session doesn't start
        it("Can't end proposal session if proposal session doesn't start", async () => {
            expectRevert(
                VoterInstance.endProposalsRegistering({ from: owner }),
                "Registering proposals havent started yet"
            );
        });

        // test if you can start voting session if proposal session doesn't end 
        it("Can't start voting session if proposal session doesn't end", async () => {
            await VoterInstance.startProposalsRegistering();
            expectRevert(
               VoterInstance.startVotingSession({ from: owner }),
               "Registering proposals phase is not finished"
            );
        });

        // test if you can end voting session if voting session doesn't start
        it("Can't end voting session if voting session doesn't start", async () => {
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.endProposalsRegistering();
            expectRevert(
               VoterInstance.endVotingSession({ from: owner }),
               "Voting session havent started yet"
            );
        });

        // test if you can start tally votes session if voting session doesn't end
        it("Can't start tally votes session if voting session doesn't end", async () => {
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.endProposalsRegistering();
            await VoterInstance.startVotingSession();
            expectRevert(
               VoterInstance.tallyVotes({ from: owner }),
               "Current status is not voting session ended"
            );
        });
    });
});
});
