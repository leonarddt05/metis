//const { singletons, BN, expectEvent } = require('@openzeppelin/test-helpers');

const MIS = artifacts.require("MToken");

const PREFIX = "Returned error: VM Exception while processing transaction: ";

async function tryCatch(promise, message) {
            try {
                            await promise;
                            throw null;
                        }
            catch (error) {
                            assert(error, "Expected an error but did not get one");
                            assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
                        }
};

catchRevert = async function(promise) {await tryCatch(promise, "revert")};

contract("MToken Test", async accounts => {
        it("mint", async() => {
                let token = await MIS.deployed();
                await token.addMinter(accounts[2]);
                let result = await token.proposeMint(accounts[1], 100000, { from: accounts[0]});

                let pos = result.logs[0].args.proposalNo;
                assert.equal(await token.balanceOf.call(accounts[1]), 0, "Account 1 should still have 0 balance");
                await token.signMint(pos, {from: accounts[0]});
                assert.equal(await token.balanceOf.call(accounts[1]), 0, "Account 1 should still have 0 balance");
                await token.signMint(pos, {from: accounts[1]});
                assert.equal(await token.balanceOf.call(accounts[1]), 0, "Account 1 should still have 0 balance");
                await token.signMint(pos, {from: accounts[2]});
                assert.equal(await token.balanceOf.call(accounts[1]), 100000, "Account 1 should still have 100000 balance");
        });

        it("mint2", async() => {
                let token = await MIS.deployed();
                await token.removeMinter(accounts[2]);
                await catchRevert(token.proposeMint(accounts[1], 100000, { from: accounts[2]}));
                await catchRevert(token.signMint(0, {from: accounts[2]}));
        });

        it("burn", async() => {
                let token = await MIS.deployed();
                let result = await token.proposeBurn(accounts[1], 100000, { from: accounts[0]});
                let pos = result.logs[0].args.proposalNo;
                assert.equal(await token.balanceOf.call(accounts[1]), 100000, "Account 1 should still have 100000 balance");
                await token.signBurn(pos, {from: accounts[0]});
                assert.equal(await token.balanceOf.call(accounts[1]), 100000, "Account 1 should still have 100000 balance");
                await token.signBurn(pos, {from: accounts[1]});
                assert.equal(await token.balanceOf.call(accounts[1]), 0, "Account 1 should still have 0 balance");
        });

        it("burn2", async() => {
                let token = await MIS.deployed();
                await catchRevert(token.proposeBurn(accounts[1], 100000, { from: accounts[2]}));
                await catchRevert(token.signBurn(0, {from: accounts[2]}));
        });


});
