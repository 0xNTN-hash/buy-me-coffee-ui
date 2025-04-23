import "./WalletButton.css";

type WalletButtonProps = {
  isWalletConnected: boolean;
  account?: string;
  connectWallet: () => void;
};

const WalletButton = ({
  isWalletConnected,
  account,
  connectWallet,
}: WalletButtonProps) => {
  const formattedAccount = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "Connect Wallet";

  return (
    <button className="wallet_connect_button" onClick={connectWallet}>
      {formattedAccount}
    </button>
  );
};

export default WalletButton;
