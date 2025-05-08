import React from "react";
import { Flip, ToastContainer } from "react-toastify";
import "./App.css";

import WalletButton from "./components/WalletButton/WalletButton";
import TipForm from "./components/TipForm/TipForm";
import Events from "./components/Events/Events";
import WithdrawForm from "./components/WithdrawForm/WithdrawForm";
import { NETWORKS } from "./utils/networks";
import { useBlockchain } from "./hooks/useBlockchain";

function App() {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS as string;
  const {
    isWalletConnected,
    isWalletLoading,
    account,
    connectWallet,
    disconnectWallet,
    isOwner,
    contractBalance,
    nativeToken,
    events,
    isWithdrawLoading,
    isTipLoading,
    sendTip,
    withdraw,
  } = useBlockchain(contractAddress);

  return (
    <div className="App">
      <div className="card">
        <div className="header">
          <p>Logo</p>
          <div>
            <WalletButton
              isWalletConnected={isWalletConnected}
              isLoading={isWalletLoading}
              account={account}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
            />
          </div>
        </div>

        {isOwner ? (
          <div className="owner_balance">
            <h2>Contract Balance</h2>
            <p>
              {contractBalance} {nativeToken}
            </p>
          </div>
        ) : (
          <div>
            <h1 className="title">Buy Me A Coffee</h1>
            <p className="subtitle">
              If you like my work, you can buy me a coffee. I would really
              appreciate it!
            </p>
          </div>
        )}

        {isOwner ? (
          <WithdrawForm onWithdraw={withdraw} isLoading={isWithdrawLoading} />
        ) : (
          <TipForm
            isWalletConnected={isWalletConnected}
            sendTip={sendTip}
            isLoading={isTipLoading}
          />
        )}

        {events && events.length > 0 && <Events events={events} />}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Flip}
      />
    </div>
  );
}

export default App;
