"use client";

import {
  ConnectButton,
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  claimTo,
  getActiveClaimCondition,
  getTotalClaimedSupply,
  nextTokenIdToMint,
} from "thirdweb/extensions/erc721";

import { useState } from "react";
import useSepoliaBalance from "@/hooks/useSepoliaBalance";

export default function Home() {
  const account = useActiveAccount();
  const balance = useSepoliaBalance();

  const chain = defineChain(sepolia);

  const [quantity, setQuantity] = useState(1);

  const contract = getContract({
    client: client,
    chain: chain,
    address: "0xc34492e969B4681a432913726A84AA494B55B1Df",
  });

  const { data: contractMetadata, isLoading: isContractMetadataLaoding } =
    useReadContract(getContractMetadata, { contract: contract });

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } =
    useReadContract(getTotalClaimedSupply, { contract: contract });

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
    useReadContract(nextTokenIdToMint, { contract: contract });

  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract: contract,
  });

  const getPrice = (quantity: number) => {
    const total =
      quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  };

  console.log(balance);
  const hasEnoughFunds =
    balance && parseFloat(balance) >= parseFloat(getPrice(quantity));

  return (
    <main className="font-sans p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">
        <Header />
        <ConnectButton client={client} chain={chain} />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLaoding ? (
            <p>Loading...</p>
          ) : (
            <>
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl"
              />
              <h2 className="text-2xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">{contractMetadata?.description}</p>
            </>
          )}
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total NFT Supply: {claimedSupply?.toString()}/
              {totalNFTSupply?.toString()}
            </p>
          )}
          <div className="flex flex-row items-center justify-center my-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>

          {hasEnoughFunds ? (
            <TransactionButton
              transaction={() =>
                claimTo({
                  contract: contract,
                  to: account?.address || "",
                  quantity: BigInt(quantity),
                })
              }
              onTransactionConfirmed={async () => {
                alert("NFT Claimed!");
                setQuantity(1);
              }}
            >
              {`Claim NFT (${getPrice(quantity)} ETH)`}
            </TransactionButton>
          ) : (
            <span className="font-mono underline">
              Please connect your wallet and make sure you have enough funds
              available to mint the NFT.
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header>
      <h1 className="font-sans text-center text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        NFT Mint Dapp
      </h1>
    </header>
  );
}
