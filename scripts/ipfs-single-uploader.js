const IPFS = require('ipfs-api');
const fs = require('fs');
const _ = require('lodash');
const streams = require('memory-streams');

// const ipfsHost = 'http://localhost:5001';
// const ipfs = IPFS('localhost', '5001', {protocol: 'http'});

const ipfsHost = 'https://ipfs.infura.io';
const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

// IPFS meta contract based on https://github.com/ethereum/eips/issues/721

/*
- meta upload should return full IPFS hash with corresponding subpaths in this format https://github.com/multiformats/multiaddr
- e.g. /ipfs/127.0.0.1/udp/1234
- example of specification

/             -> (required) - root path  - full IPFS hash
/name         -> (required) - A name SHOULD be 50 characters or less, and unique amongst all NFTs tracked by this contract
/image        -> (optional) - it MUST contain a PNG, JPEG, or SVG image with at least 300 pixels of detail in each dimension
/description  -> (optional) - The description SHOULD be 1500 characters or less.
/other meta   -> (optional) - A contract MAY choose to include any number of additional subpaths
 */

const metaDataToIpfs = async () => {
    try {
        const [name, imagePath, description] = [
            'WSC Season One Pass',
            './images/mf/SeasonOnePass.png',
            'This pass can be redeemed for a membership in Wicked Sunday Club for Summer 2020. Must be redeemed before the end of the season.',
        ];

        let image;
        if (fs.existsSync(imagePath)) {
            image = fs.createReadStream(imagePath);
        }

        wait();

        const ipfsImageResult = await ipfs.add([
            {
                path: imagePath,
                content: image,
            }
        ], {recursive: false});

        console.log(ipfsImageResult);
        console.log(`ERC721 IPFS IMAGE HASH: ${ipfsImageResult[0].hash}`);

        // set cached image for use in ERC721 metadata upload
        let cachedImage = ipfsImageResult[0].hash;

        let erc721CompliantMetaData = {
            name: `${name}`,
            description: `${description}`,
            attributes: [{trait_type: 'Size', value: 'Extra Large'}],
                // external_uri: 'TODO',
            image: `${ipfsHost}/ipfs/${cachedImage}`,
        };

        wait();
        const erc721CompliantMetaDataResult = await ipfs.add([
            {
                path: `${erc721CompliantMetaData.name}`,
                content: new streams.ReadableStream(JSON.stringify(erc721CompliantMetaData)).read(),
            }
        ]);

        console.log(erc721CompliantMetaDataResult);
        console.log(`ERC721 IPFS HASH: ${ipfsHost}/ipfs/${erc721CompliantMetaDataResult[0].hash}`);

        wait();
    } catch (e) {
        console.error(e);
    }
};

const wait = () => {
    setTimeout(() => console.log(`waiting...`), Math.floor(Math.random() * 10) * 1000);
};

module.exports = {
    metaDataToIpfs: metaDataToIpfs
};

metaDataToIpfs();
