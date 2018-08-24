# erc721-ipfs-uploader

## Install

`npm install`

## Run

Requires a CSV file of data and related `images` folder

`npm run start`

## ERC721 Metadata JSON Schema

[From EIP-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md)

```json
{
    "title": "Asset Metadata",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this NFT represents",
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this NFT represents",
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.",
        }
    }
}
```

For example:

```json
{
    "name": "number 1",
    "description": "one specimen",
    "image": "https://ipfs.infura.io/ipfs/QmV1kPDRbVLabA1MNHVdFjTAfwzgebcpNY1od5exPCALEu"
}
```
