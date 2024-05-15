import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import NFTCard2 from "../components/NFTCard2";

import styles from "../styles/Home.module.css";
import { editionDropContractAddress, stakingContractAddress, tokenContractAddress } from "../const/contractAddresses";

const Stake = () => {
  const address = useAddress();
  const { contract: nftDropContract } = useContract(
    editionDropContractAddress,
    "edition-drop"
  );
  const { contract: tokenContract } = useContract(tokenContractAddress, "token");
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const [claimableRewards, setClaimableRewards] = useState();
  const [totalNftCount, setTotalNftCount] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(1); // State for input amount
  const { data: stakedTokens } = useContractRead(
    contract,
    "getStakeInfo",
    [address]
  );
  const tokenId = 0;

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfoForToken", [0, address]);
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  useEffect(() => {
    if (!nftDropContract || !address) return;
  
    async function checkOwnership() {
      const balance = await nftDropContract.call("balanceOf", [address, tokenId]);
      console.log(`Balance of token ID ${tokenId} for address ${address}: ${balance.toNumber()}`);
    }

    async function fetchTotalNftCount() {
      let totalCount = 0;
      const maxTokenId = 10; // Adjust this range based on your contract's token IDs

      for (let i = 0; i <= maxTokenId; i++) {
        try {
          const balance = await nftDropContract.call("balanceOf", [address, i]);
          if (balance.gt(0)) {
            totalCount += balance.toNumber();
          }
        } catch (error) {
          console.error(`Error fetching data for token ID ${i}:`, error);
        }
      }

      setTotalNftCount(totalCount);
    }

    fetchTotalNftCount();
      
    checkOwnership();
  }, [address, nftDropContract]);

  async function stakeNft(id, amount) {
    if (!address) return;
  
    const isApproved = await nftDropContract?.isApproved(address, stakingContractAddress);
    console.log(`Approval status for staking contract: ${isApproved}`);
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    await contract?.call("stake", [id, amount]);
  }

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Stake Your NFTs</h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <ConnectWallet />
      ) : (
        <>
          <h2>Your Tokens</h2>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "No rewards"
                    : parseFloat(ethers.utils.formatUnits(claimableRewards, 18)).toFixed(2)}
                </b>
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b>{parseFloat(tokenBalance?.displayValue).toFixed(2)}</b> {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Owned NFTs</h3>
              <p className={styles.tokenValue}>
                <b>{totalNftCount}</b> NFTs
              </p>
            </div>
          </div>

          <Web3Button
            contractAddress="0x639E33a37E791f7D1Ce6EB7776479a2caB5f2af2"
            action={(contract) => {
              contract.call("claimRewards", [0]);
            }}
          >
            Claim Rewards
          </Web3Button>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Staked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map(stakedToken => (
                <NFTCard2
                  tokenId={stakedToken.toNumber()}
                  key={stakedToken.toString()}
                />
              ))}
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Your Unstaked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map(nft => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <div className={styles.stakeInputContainer}>
                  <input
                    type="number"
                    min="1"
                    max={nft.metadata.quantity}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    className={styles.stakeInput}
                  />
                  <Web3Button
                    contractAddress="0x639E33a37E791f7D1Ce6EB7776479a2caB5f2af2"
                    action={() => {
                      stakeNft(nft.metadata.id.toString(), stakeAmount);
                    }}
                  >
                    Stake
                  </Web3Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Stake;

