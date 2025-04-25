import React, { useEffect, useState } from "react";
import { Flip, ToastContainer, toast } from "react-toastify";
import { BuyMeCoffeeAbi, BuyMeCoffeeAbi__factory, NewMemoEvent } from "./types";
import "./App.css";
import {
  BrowserProvider,
  ethers,
  formatEther,
  getAddress,
  JsonRpcSigner,
  parseEther,
} from "ethers";
import WalletButton from "./components/WalletButton/WalletButton";
import TipForm from "./components/TipForm/TipForm";
import Events from "./components/Events/Events";
import WithdrawForm from "./components/WithdrawForm/WithdrawForm";
import { NETWORKS } from "./utils/networks";

function App() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const [account, setAccount] = useState<string>();
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [contract, setContract] = useState<BuyMeCoffeeAbi>();

  const [nativeToken, setNativeToken] = useState<string>();
  const [isOwner, setIsOwner] = useState(false);
  const [contractBalance, setContractBalance] = useState("");
  const [events, setEvents] = useState<NewMemoEvent.OutputTuple[]>();
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [isTipLoading, setIsTipLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setIsWalletLoading(true);
      const { ethereum } = window;

      if (ethereum) {
        const prov = new ethers.BrowserProvider(window.ethereum);
        const sign = await prov.getSigner();
        const contr = BuyMeCoffeeAbi__factory.connect(contractAddress, sign);
        const owner = await contr?.getOwner();

        setProvider(prov);
        setSigner(sign);
        setContract(contr);

        const accounts: string[] = await ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setIsWalletConnected(true);
          const address = getAddress(accounts[0]);
          setAccount(address);

          console.log(owner, address);
          if (owner === address) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        } else {
          setIsWalletConnected(false);
        }
      } else {
        console.log("MetaMask not installed; using read-only defaults");
      }
    } catch (err) {
      console.log("Error", err);
    } finally {
      setIsWalletLoading(false);
    }
  };

  const connectToBlockchain = async () => {
    const prov = new ethers.BrowserProvider(window.ethereum);
    const contr = BuyMeCoffeeAbi__factory.connect(contractAddress, prov);

    setProvider(prov);
    setContract(contr);

    const chainId = await prov.getNetwork();
    const chainIdNum = chainId.chainId.toString();
    const network = NETWORKS[chainIdNum as keyof typeof NETWORKS];

    if (network) {
      setNativeToken(network.nativeToken);
    } else {
      setNativeToken("ETH");
    }

    contr?.on(contr?.filters.NewMemo, (from, timestamp, name, message) => {
      setEvents((prev) => {
        if (prev === undefined) {
          prev = [];
        }

        return [[from, timestamp, name, message], ...prev];
      });
    });
  };

  const disconnectWallet = async () => {
    try {
      setIsWalletConnected(false);
      setAccount("");
      setProvider(undefined);
      setSigner(undefined);
      setContract(undefined);
      setIsOwner(false);
      setContractBalance("");
      setEvents([]);
    } catch (err) {
      console.log("Error", err);
    }
  };

  const checkIsWalletConnected = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const accounts: string[] = await ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          const address = getAddress(accounts[0]);
          setAccount(address);
          connectWallet();
          // setContract(new Contract(contractAddress, contractABI, signer));
        } else {
          setIsWalletConnected(false);
        }
      } else {
        console.log("MetaMask not installed; using read-only defaults");
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  const sendTip = async (event: any) => {
    event.preventDefault();
    setIsTipLoading(true);
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const amount = formData.get("amount")!.toString();
    const memo = formData.get("memo")!.toString();
    const name = formData.get("name")!.toString();

    try {
      if (amount && parseFloat(amount.toString()) > 0) {
        const coffeeTxn = await contract?.buyCoffee(name, memo, {
          value: parseEther(amount),
        });
        const receipt = await coffeeTxn?.wait();
        console.log("Transaction receipt:", receipt);
        form.reset();
        toast.success("Tip sent successfully! Thank you!");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("User denied transaction signature")) {
          toast.error("Transaction rejected. Please try again.");
        } else if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds. Please check your balance.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      } else {
        toast.error("An error occurred. Please try again.");
        console.error("Error during sending tip:", error);
      }
      // Handle other types of errors here
      // For example, network errors or contract errors
      // You can log the error or show a generic error message
    }

    setIsTipLoading(false);
  };

  const getBalance = async () => {
    const bal = (await provider?.getBalance(contractAddress)) || BigInt(0);
    setContractBalance(formatEther(bal));
  };

  const getEvents = async () => {
    const filter = contract?.filters.NewMemo()!;
    // if (!filter) {
    //   console.error("Filter for NewMemo event is undefined");
    //   return;
    // }
    const evs = (await contract?.queryFilter(filter))?.reverse();
    const evArr: NewMemoEvent.OutputTuple[] = [];
    evs?.forEach((event) => {
      evArr.push(event.args as NewMemoEvent.OutputTuple);
    });

    console.log(evArr);

    setEvents([...evArr]);
  };

  const withdraw = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsWithdrawLoading(true);
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const amount = formData.get("amount")!.toString();

    if (amount && parseFloat(amount.toString()) > 0) {
      try {
        const tx = await contract?.withdrawTips(parseEther(amount));
        const receipt = await tx?.wait();
        form.reset();
        console.log(receipt);
        toast.success("Withdrawal successful!");
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("User denied transaction signature")) {
            toast.error("Transaction rejected. Please try again.");
          } else if (error.message.includes("insufficient funds")) {
            toast.error("Insufficient funds. Please check your balance.");
          } else {
            toast.error("An error occurred. Please try again.");
          }
        } else {
          toast.error("An error occurred. Please try again.");
          console.error("Error during withdrawal:", error);
        }
      } finally {
        setIsWithdrawLoading(false);
      }
    }
  };

  useEffect(() => {
    checkIsWalletConnected();
    connectToBlockchain();
  }, []);

  useEffect(() => {
    getEvents();
  }, [contract]);

  useEffect(() => {
    contract?.on(
      contract?.filters.NewMemo,
      (from, timestamp, name, message) => {
        console.log({ from, timestamp, name, message });
      }
    );
  }, [contract]);

  useEffect(() => {
    if (isOwner) {
      getBalance();
    }
  }, [isOwner, getBalance]);

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
