const IPFS = require('ipfs-api');
const fs = require('fs');
const _ = require('lodash');
const streams = require('memory-streams');

const csv = require('fast-csv');

const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

// Reset this cache file to { } to push fresh data to IPFS
const CACHE_FILE = './data/cache.json';

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

    const stream = fs.createReadStream('data/data.csv');

    const csvStream = csv()
        .on('data', async (data) => {

            const [name, imagePath, description] = data;
            console.log(data);
            const splitImagePath = imagePath.split('.')[0];

            // Check cache as to not upload duplicates
            let cachedImage = getFromCache(`images.${splitImagePath}`);
            if (cachedImage) {
                console.log(`Found cached version of image [${splitImagePath}]: ${cachedImage}`);
            } else {

                let image;
                if (fs.existsSync(`./images/stina/${imagePath}`)) {
                    image = fs.createReadStream(`./images/stina/${imagePath}`);
                }

                wait();
                const ipfsImageResult = await ipfs.add([
                    {
                        path: `${data[1]}`,
                        content: image,
                    }
                ], {recursive: false});

                console.log(ipfsImageResult);
                console.log(`ERC721 IPFS IMAGE HASH: ${ipfsImageResult[0].hash}`);
                cacheIpfsHashes(`images.${splitImagePath}`, ipfsImageResult[0].hash);

                // set cached image for use in ERC721 metadata upload
                cachedImage = ipfsImageResult[0].hash;


            }

            let cachedErc721CompliantMetaData = getFromCache(`metadata.${name}`);
            if (cachedErc721CompliantMetaData) {
                console.log(`Found cached version of [${name}]: ${cachedErc721CompliantMetaData}`);
            } else {

                let erc721CompliantMetaData = {
                    name: `${name}`,
                    description: `${description}`,
                    attributes: [],
                    external_uri: `TODO`,
                    image: `https://ipfs.infura.io/ipfs/${cachedImage}`,
                };

                wait();
                const erc721CompliantMetaDataResult = await ipfs.add([
                    {
                        path: `${erc721CompliantMetaData.name}`,
                        content: new streams.ReadableStream(JSON.stringify(erc721CompliantMetaData)).read(),
                    }
                ]);

                console.log(erc721CompliantMetaDataResult);
                console.log(`ERC721 IPFS HASH: ${erc721CompliantMetaDataResult[0].hash}`);

                cacheIpfsHashes(`metadata.${name}`, erc721CompliantMetaDataResult[0].hash);
            }
        })
        .on('end', function () {
            console.log('\n\nprocessed CSV ;)');
        });

    stream.pipe(csvStream);

};

const cacheIpfsHashes = (key, hash) => {
    let cache = JSON.parse(fs.readFileSync(CACHE_FILE));
    let updatedCache = _.set(cache, key, hash);

    console.log(updatedCache);

    fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedCache, null, 4));
};

const getFromCache = (ipfsPath) => {
    let cache = JSON.parse(fs.readFileSync(CACHE_FILE));
    return _.get(cache, ipfsPath);
};

const wait = () => {
    setTimeout(() => console.log(`waiting...`), Math.floor(Math.random() * 10)  * 1000);
};

module.exports = {
    metaDataToIpfs: metaDataToIpfs
};

// To manually upload fresh IPFS data use this and invoke it on the commandland e.g. node ./scripts/ipfs-uploader.js
// metaDataToIpfs({ipfsPath: 'stina_jones_happy_fox'});

metaDataToIpfs();
