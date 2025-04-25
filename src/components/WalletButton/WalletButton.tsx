import { useState } from "react";
import "./WalletButton.css";

type WalletButtonProps = {
  isWalletConnected: boolean;

  isLoading: boolean;
  account?: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
};

const WalletButton = ({
  isWalletConnected,
  isLoading,
  account,
  connectWallet,
  disconnectWallet,
}: WalletButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formattedAccount = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "Connect Wallet";

  return (
    <button
      className="wallet_connect_button"
      onClick={isWalletConnected ? disconnectWallet : connectWallet}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading ? (
        <div className="loader"></div>
      ) : isWalletConnected && isHovered ? (
        "Disconnect"
      ) : (
        formattedAccount
      )}
    </button>
  );
};

export default WalletButton;
