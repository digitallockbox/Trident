// --- Wallet connect: save pubkey and fetch profile ---
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useUser } from "../state/userContext";
import { apiPost } from "../logic/trident-sdk";

const WalletProfileConnector: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { setPubkey, setProfile } = useUser();

  useEffect(() => {
    if (connected && publicKey) {
      const pubkeyStr = publicKey.toBase58();
      setPubkey(pubkeyStr);
      apiPost("/api/user/login", { pubkey: pubkeyStr }).then((res) => {
        if (res.success && res.data) setProfile(res.data);
      });
    }
  }, [connected, publicKey, setPubkey, setProfile]);
  return null;
};

export default WalletProfileConnector;
