
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
        beforeEach(async () => {
            VoterInstance = await Voting.new({from: owner});
            await VoterInstance.addVoter(owner, { from: owner });
        });

        it("should show a voter registred", async () => {
                const storedData = await VoterInstance.getVoter(owner);
                expect(storedData.isRegistered).to.equal(true);
            });

        it("should show a voter without vote", async () => {
                const storedData = await VoterInstance.getVoter(owner);
                expect(storedData.hasVoted).to.equal(false);
            });

        it("should show a voter without proposalID", async () => {
                const storedData = await VoterInstance.getVoter(owner);
                expect(storedData.votedProposalId).to.equal('0');
            });

        it("Revert if it's not a voter", async () => {
            expectRevert(VoterInstance.getVoter(voter1), "You're not a voter");
        });
        });

    // tests about fonction getProposal

        describe("test getter proposal", function () {

            beforeEach(async () => {
                VoterInstance = await Voting.new({from: owner});
                await VoterInstance.addVoter(owner, { from: owner });
                await VoterInstance.startProposalsRegistering({from: owner});
            });
            
            it("should show a proposal description", async () => {
                await VoterInstance.addProposal('Prop1', { from: owner });
                    const storedData = await VoterInstance.getOneProposal(0);
                    expect(storedData.description).to.equal('Prop1');
                });

            it("should show the first proposal with 0 vote", async () => {
                await VoterInstance.addProposal('Prop1', { from: owner });
                    const storedData = await VoterInstance.getOneProposal(0);
                    expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(0));
                });
        });
    });

// tests about the registration voter (via addVote)

    describe("test registration session", function () {
        before(async () => {
            VoterInstance = await Voting.new({from: owner});
            await VoterInstance.addVoter(owner, { from: owner });
            
        });
        it("Should fire 'VoterRegistred' event after addvoter.", async () => {
            const receipt = await VoterInstance.addVoter(voter1, { from: owner });  
            expectEvent(receipt, 'VoterRegistered', {
                voterAddress: voter1
            });

        it('Revert if not owner : add voter', async function () { 
            await (expectRevert(VoterInstance.addVoter(voter2, {from: voter2}), "Ownable: caller is not the owner"));
        });   

        it('Revert if voter already registred : add voter', async function () { 
            await (expectRevert(VoterInstance.addVoter(owner, {from: owner}), "Already registered"));
        });   

        it('Revert if Voters registration is not open yet : add voter', async function () {
            await VoterInstance.startProposalsRegistering();
            await (expectRevert(VoterInstance.addVoter(voter2, {from: owner}), "Voters registration is not open yet"));
        });   

    });

// test about the proposal registration (via addProposal)

    describe("test proposal session", function () {
        beforeEach(async () => {
            VoterInstance = await Voting.new({from: owner});
            await VoterInstance.addVoter(owner, { from: owner });
            await VoterInstance.addVoter(voter1, { from: owner });
            await VoterInstance.addVoter(voter2, { from: owner });
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.addProposal('prop1', {from: owner});

        });

        it("Should registred proposal.", async () => {
            const receipt = await VoterInstance.addProposal('prop2', {from: owner});
            
            expectEvent(receipt, 'ProposalRegistered', {
                proposalId: new BN(1)
            });
        });

        it('Not revert if not owner : add proposal', async function () { 
            await (expect(VoterInstance.addProposal('prop2', {from: voter2}), "Ownable: caller is not the owner but it's ok here"));
        });

        it('Revert if Proposals are not allowed yet : add proposal', async function () {
            await VoterInstance.endProposalsRegistering();
            await (expectRevert(VoterInstance.addProposal('prop3', {from: voter1}), "Proposals are not allowed yet"));
        });  

    });


// tests about the vote session (via setVote)

    describe("test vote session ", function () {
        before(async () => {
            VoterInstance = await Voting.new({from: owner});
            await VoterInstance.addVoter(owner, { from: owner });
            await VoterInstance.addVoter(voter1, { from: owner });
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.addProposal('prop1', {from: voter1});
            await VoterInstance.addProposal('prop2', {from: owner});
            await VoterInstance.endProposalsRegistering();
            await VoterInstance.startVotingSession();
        });

        it("Revert if there is a non registred voter", async () => {
            await expectRevert(
                VoterInstance.setVote(0, { from: voter2 }),
                "You're not a voter"
            );
        });

        it("Revert if voter want to vote twice", async () => {  
            await VoterInstance.setVote(0, { from: voter1 });
            await expectRevert(
                VoterInstance.setVote(0, { from: voter1 }),
                "You have already voted"
            );
        });


        it("Revert if this proposal doesn't exist", async () => {
            await expectRevert(VoterInstance.setVote(3, { from: owner }),"Proposal not found" );

        });

        it("Should fire 'Voted' event after registration.", async () => {
            const receipt = await VoterInstance.setVote(0, { from: owner });
            expectEvent(receipt, 'Voted', {
                voter: owner,
                proposalId: new BN(0)
            });

        });

        it("should be the proposal 0 the winner, and not the proposal 1", async () => {
            await VoterInstance.endVotingSession({ from: owner });
           
            const storedData = await VoterInstance.tallyVotes();
            expect(new BN(storedData.winningProposalID)).to.be.bignumber.equal(new BN(0));
            expect(new BN(storedData.winningProposalID)).to.be.bignumber.not.equal(new BN(1));
        });

        it("Revert if Voting session havent started yet : setVote", async () => {
            await expectRevert(VoterInstance.setVote(0, { from: owner }),"Voting session havent started yet" );
        });
    });


// Tests about Status and the modification of status 

    describe("test status", function () {
        describe("test status with good and bad caller", function () {

        before(async () => {
            VoterInstance = await Voting.new({from: owner});
        });

        it("Should not be able to start proposal session as non admin.", async () => {
            await expectRevert(
                VoterInstance.startProposalsRegistering({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });


        it("Can start proposal session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.startProposalsRegistering();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(0),
                newStatus: new BN(1)
            });
        });

        it("Should not be able to end proposal session as non admin.", async () => {
            await expectRevert(
                VoterInstance.endProposalsRegistering({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        it("Can end proposal session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.endProposalsRegistering();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(1),
                newStatus: new BN(2)
            });
        });

        it("Should not be able to start voting session as non admin.", async () => {
            await expectRevert(
                VoterInstance.startVotingSession({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        it("Can start voting session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.startVotingSession();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(2),
                newStatus: new BN(3)
            });
        });

        it("Should not be able to end proposal session as non admin.", async () => {
            await expectRevert(
                VoterInstance.endVotingSession({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });
        

        it("Can end voting session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.endVotingSession();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(3),
                newStatus: new BN(4)
            });
        });

        it("Should not be able to start tally votes session as non admin.", async () => {
            await expectRevert(
                VoterInstance.tallyVotes({ from: voter1 }),
                "Ownable: caller is not the owner"
            );
        });

        it("Can start tally votes session only by admin (owner of contract).", async () => {
            const receipt = await VoterInstance.tallyVotes();
    
            expectEvent(receipt, 'WorkflowStatusChange', {
                previousStatus: new BN(4),
                newStatus: new BN(5)
            });
        });
    });
    });
    describe("test status with wrong order call", function () {
        beforeEach(async () => {
            VoterInstance = await Voting.new({from: owner});
        });

        it("Can't start proposal session if proposal session already ended", async () => {
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.endProposalsRegistering();
            expectRevert(
                VoterInstance.startProposalsRegistering({ from: owner }),
                "Registering proposals cant be started now"
            );
        });

        it("Can't end proposal session if proposal session doesn't start", async () => {
            expectRevert(
                VoterInstance.endProposalsRegistering({ from: owner }),
                "Registering proposals havent started yet"
            );
        });

        it("Can't start voting session if proposal session doesn't end", async () => {
            await VoterInstance.startProposalsRegistering();
            expectRevert(
               VoterInstance.startVotingSession({ from: owner }),
               "Registering proposals phase is not finished"
            );
        });


        it("Can't end voting session if voting session doesn't start", async () => {
            await VoterInstance.startProposalsRegistering();
            await VoterInstance.endProposalsRegistering();
            expectRevert(
               VoterInstance.endVotingSession({ from: owner }),
               "Voting session havent started yet"
            );
        });


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

