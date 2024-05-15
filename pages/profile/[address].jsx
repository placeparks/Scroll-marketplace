import { useContract, useOwnedNFTs } from "@thirdweb-dev/react"
import React from "react"
import { useRouter } from "next/router"
import NFTGrid from "../../components/NFT/NFTGrid"
import {  MARKETPLACE_ADDRESS, NFT_COLLECTION_ADDRESS } from "../../const/contractAddresses"

export default function ProfilePage() {
  const router = useRouter()
  const { contract: nftCollection } = useContract(NFT_COLLECTION_ADDRESS)

  const { contract: marketplace } = useContract(
    MARKETPLACE_ADDRESS,
    "marketplace-v3"
  )

  const { data: ownedNfts, isLoading: loadingOwnedNfts } = useOwnedNFTs(
    nftCollection,
    router.query.address
  )
  console.log(ownedNfts)
  return (
    <div style={{marginTop:"5%", padding:"4%"}}>
      <h1>{"Owned NFT(s)"}</h1>
      <p>Browse and manage your NFTs from this collection.</p>
      <NFTGrid
        data={ownedNfts}
        isLoading={loadingOwnedNfts}
        emptyText={"You don't own any NFTs yet from this collection."}
      />
    </div>
  )
}
