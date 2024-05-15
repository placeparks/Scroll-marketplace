import { ThirdwebNftMedia, useContract, useNFT, Web3Button } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import { editionDropContractAddress } from "../const/contractAddresses";

const NFTCard2 = ({ initialTokenId }) => {
  const [tokenId, setTokenId] = useState(initialTokenId || "0"); // Initialize state with prop or "0"
  const { contract } = useContract(editionDropContractAddress, "edition-drop");
  const { data: nft } = useNFT(contract, tokenId);

  const _amount = "1"; 

  return (
    <>
      {nft && (
        <div className={styles.nftBox}>
          {nft.metadata && (
            <ThirdwebNftMedia
              metadata={nft.metadata}
              className={styles.nftMedia}
            />
          )}
          <h3>{nft.metadata.name}</h3>
          <Web3Button
            contractAddress="0x639E33a37E791f7D1Ce6EB7776479a2caB5f2af2"
            action={(contract) => {
              contract.call("withdraw", [tokenId, _amount])
            }}
          >
            withdraw
          </Web3Button>
        </div>
      )}
    </>
  );
};

export default NFTCard2;