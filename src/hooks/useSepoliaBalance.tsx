import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

export default function useSepoliaBalance() {
  const account = useActiveAccount();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!account?.address || !window.ethereum) return;

    const fetchBalance = async () => {
      try {
        // Cast to the type BrowserProvider expects
        const provider = new ethers.BrowserProvider(window.ethereum as never);
        const bal = await provider.getBalance(account.address);
        setBalance(ethers.formatEther(bal));
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
  }, [account]);

  return balance;
}
