'use strict';

const {FileSystemWallet, Gateway, X509WalletMixin} = require('fabric-network');
const fs = require('fs');
const path = require('path');

// capture network variables from config.json
const configPath = path.join(process.cwd(), '/config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var userName = config.userName;
var gatewayDiscovery = config.gatewayDiscovery;

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

/**
     *
     * This method will create the business after validating that the email provided by the user is not already exisiting
     *
     * This will also generate the draft business with the given details on the register page
     *
     * @param email
     * @param name
     * @param country
     * @param password
     * @param phone
     * @return business details
     *
     */
exports.createBusiness = async function (businessId, name, email, country, password, phone) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists("admin");
        if (!userExists) {
            console.log('An identity for the user admin does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('createBusiness', businessId, name, email, country, password, phone);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Business Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

/**
     *
     * This method will query all the existing businesses and this method is only accessible to the admin
     *

     * @return all business details
     *
     */

exports.queryAllBusiness = async function () {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists("admin");
        if (!userExists) {
            console.log('An identity for the user admin does not exist in the wallet');
            response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Evaluate the transaction to get all the businessses.
        const result = await contract.evaluateTransaction('queryAllBusinesses');

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

/**
     *
     * This method will query for the user
     *
     * @param email
     * @return user details
     *
     */
exports.queryUser = async function (email) {
    try {
        console.log(email)
        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists("admin");
        if (!userExists) {
            console.log('An identity for the user admin does not exist in the wallet');
            response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to get the user details using the email
        const result = await contract.submitTransaction('queryUser', email);
        // console.log(`Transaction has been evaluated, result is:
        // ${result.toString()}`);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.queryAllCategories = async function (email, businessId) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log(email)
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user ' + email + ' does not exist in the wallet');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Evaluate the transaction to get all the businessses.
        const result = await contract.evaluateTransaction('queryAllCategories', businessId);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.createCategory = async function (key, name, email, number, image) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('addCategories', number, key, name, image);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.updateTheme = async function (key, email, background, logo, starterscreen, colorDark, colorLight) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('updateBusinessTheme', key, background, logo, starterscreen, colorDark, colorLight);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.queryBusiness = async function (businessId) {
    try {
        console.log(businessId)
        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists("admin");
        if (!userExists) {
            console.log('An identity for the user admin does not exist in the wallet');
            response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to get the user details using the email
        const result = await contract.submitTransaction('queryBusiness', businessId);
        // console.log(`Transaction has been evaluated, result is:
        // ${result.toString()}`);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.updateBusiness = async function (email, businessid, businessDetails) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('updateBusiness', businessid, email, JSON.stringify(businessDetails));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.createProduct = async function (businessId, email, product) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('addProduct', businessId, JSON.stringify(product));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.queryAllProducts = async function (email, businessId) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log(email)
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user ' + email + ' does not exist in the wallet');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Evaluate the transaction to get all the businessses.
        const result = await contract.evaluateTransaction('queryAllProducts', businessId);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.queryAllCategoryProducts = async function (email, businessId, categoryId) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log(email)
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user ' + email + ' does not exist in the wallet');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Evaluate the transaction to get all the businessses.
        const result = await contract.evaluateTransaction('queryAllCategoryProducts', businessId, categoryId);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.removeProduct = async function (businessId, email, product) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('removeProduct', product, businessId);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.updateProduct = async function (businessId, email, product) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('updateProduct', businessId, JSON.stringify(product));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.queryCategory = async function (email, categoryId) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log(email)
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user ' + email + ' does not exist in the wallet');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Evaluate the transaction to get all the businessses.
        const result = await contract.submitTransaction('getCategories', categoryId);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.updateCategory = async function (businessId, email, categoryId, image, name) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('updateCategory', businessId, categoryId, image, name);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.updatePickupHours = async function (email, businessid, pickUpHours) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('updatePickupHours', businessid, pickUpHours);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.queryProduct = async function (email, productId) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log(email)
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user ' + email + ' does not exist in the wallet');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Evaluate the transaction to get all the businessses.
        const result = await contract.submitTransaction('getProduct', productId);

        return result;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.createBusinessUser = async function (businessUser) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists("admin");
        if (!userExists) {
            console.log('An identity for the user admin does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('createBusinessUser', JSON.stringify(businessUser));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Business Creation Transaction has been submitted';
        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.loginBusinessUser = async function (businessUser) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(businessUser.email);
        if (!userExists) {
            console.log('An identity for the user admin does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: businessUser.email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('getBusinessUser', JSON.stringify(businessUser));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }



}

exports.createBusinessUserCart = async function (cart) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(cart.customerEmail);
        if (!userExists) {
            console.log('An identity for the user '+cart.customerEmail+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user '+cart.customerEmail+' does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: cart.customerEmail,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('createBusinessUserCart', JSON.stringify(cart));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Business Creation Transaction has been submitted';
        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

// exports.getBusinessUserCart = async function (cart) {
//     try {

//         var response = {};

//         // Create a new file system based wallet for managing identities.
//         const walletPath = path.join(process.cwd(), '/wallet');
//         const wallet = new FileSystemWallet(walletPath);
//         console.log(`Wallet path: ${walletPath}`);

//         // Checking wether the user exists in the wallet
//         const userExists = await wallet.exists(cart.email);
//         if (!userExists) {
//             console.log('An identity for the user admin does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
//                     't';
//             return response;
//         }

//         // Create a new gateway for connecting to our peer node.
//         const gateway = new Gateway();
//         await gateway.connect(ccp, {
//             wallet,
//             identity: cart.email,
//             discovery: gatewayDiscovery
//         });

//         // Get the network (channel) our contract is deployed to.
//         const network = await gateway.getNetwork('mychannel');

//         // Get the contract from the network.
//         const contract = network.getContract('appezite');

//         // Submit the transaction to create the Business with the provided details.
//         const result = await contract.submitTransaction('createBusinessUserCart', JSON.stringify(cart));
//         console.log('Transaction has been submitted');

//         // Disconnect from the gateway.
//         await gateway.disconnect();

//         response.msg = 'Business Creation Transaction has been submitted';
//         return result;

//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         response.error = error.message;
//         return response;
//     }
// }


exports.getBusinessUserCart = async function (businessUser) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists("admin");
        if (!userExists) {
            console.log('An identity for the user admin does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('getBusinessUserCart', JSON.stringify(businessUser));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }



}


exports.createPurchaseOrder = async function (cart) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(cart.customerEmail);
        if (!userExists) {
            console.log('An identity for the user '+cart.customerEmail+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user '+cart.customerEmail+' does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: cart.customerEmail,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('createBusinessUserOrder', JSON.stringify(cart));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Business Creation Transaction has been submitted';
        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.getUserOrders = async function (businessId, email) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user '+email+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user '+email+' does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('getCustomerOrder', businessId,email);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Business Creation Transaction has been submitted';
        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}


exports.getBusinessOrders = async function (businessId,email,startDate,endDate,status) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user '+email+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user '+email+' does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('getBusinessOrder', businessId, startDate, endDate, status);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Business Creation Transaction has been submitted';
        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}



exports.updatePurchaseOrderStatus = async function (email, status, businessId,orderId) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user '+email+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user '+email+' does not exist in the wallet. Register admin firs' +
                    't';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        const result = await contract.submitTransaction('updateOrderStatus', businessId,status,orderId);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Business Creation Transaction has been submitted';
        return result;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}


exports.updateAPKURL = async function (email, businessid, apkUrl) {
    try {

        var response = {};

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);
        // Checking wether the user exists in the wallet
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user' + email + 'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            response.error = 'An identity for the user ' + email + ' does not exist in the wallet. Register admin first';
            return response;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`Holeee shet`);

        await gateway.connect(ccp, {
            wallet,
            identity: email,
            discovery: gatewayDiscovery
        });
        console.log(`Holeee shet1`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('appezite');

        // Submit the transaction to create the Business with the provided details.
        await contract.submitTransaction('addApkURL', businessid, apkUrl);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        response.msg = 'Category Creation Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}
