import React, { useEffect, useState } from "react";
import { BuyMeCoffeeAbi, BuyMeCoffeeAbi__factory, NewMemoEvent } from "./types";
import "./App.css";
import BuyMeCoffeeABI from "./abi/buyMeCoffee.abi.json";
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

function App() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const contractABI = BuyMeCoffeeABI.abi;

  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const [account, setAccount] = useState<string>();
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [contract, setContract] = useState<BuyMeCoffeeAbi>();

  const [owner, setOwner] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const [events, setEvents] = useState<NewMemoEvent.OutputTuple[]>();

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const prov = new ethers.BrowserProvider(window.ethereum);
        const sign = await prov.getSigner();
        const contr = BuyMeCoffeeAbi__factory.connect(contractAddress, sign);
        setProvider(prov);
        setSigner(sign);

        setContract(contr);

        const accounts: string[] = await ethereum.request({
          method: "eth_accounts",
        });
        const network = await prov.getNetwork();
        console.log("Network", network);
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          const address = getAddress(accounts[0]);
          setAccount(address);
          // setContract(new Contract(contractAddress, contractABI, signer));
        } else {
          setIsWalletConnected(false);
        }

        // contr?.on(contr?.filters.NewMemo, (from, timestamp, name, message) => {
        //   setEvents((prev) => {
        //     if (prev === undefined) {
        //       prev = [];
        //     }

        //     return [...prev, [from, timestamp, name, message]];
        //   });
        // });
      } else {
        console.log("MetaMask not installed; using read-only defaults");
        // setProvider(ethers.getDefaultProvider());
      }
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
    const formData = new FormData(event.target as HTMLFormElement);
    const amount = formData.get("amount")!.toString();
    const memo = formData.get("memo")!.toString();
    const name = formData.get("name")!.toString();

    if (amount && parseFloat(amount.toString()) > 0) {
      const coffeeTxn = await contract?.buyCoffee(name, memo, {
        value: parseEther(amount),
      });
    }
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
    const evs = await contract?.queryFilter(filter);
    const evArr: NewMemoEvent.OutputTuple[] = [];
    evs?.forEach((event) => {
      evArr.push(event.args as NewMemoEvent.OutputTuple);
    });

    setEvents([...evArr]);
  };

  const getOwner = async () => {
    const result = await contract?.getOwner();

    if (result) {
      setOwner(getAddress(result));
    }
  };

  const withdraw = async (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const amount = formData.get("amount")!.toString();

    if (amount && parseFloat(amount.toString()) > 0) {
      const coffeeTxn = await contract?.withdrawTips(parseEther(amount));
      console.log(coffeeTxn);
    }
  };

  useEffect(() => {
    checkIsWalletConnected();
  }, []);

  useEffect(() => {
    contract?.on(
      contract?.filters.NewMemo,
      (from, timestamp, name, message) => {
        console.log({ from, timestamp, name, message });
      }
    );
  }, [contract]);

  return (
    <div className="App">
      <div className="card">
        <div className="header">
          <p>Logo</p>
          <WalletButton
            isWalletConnected={isWalletConnected}
            account={account}
            connectWallet={connectWallet}
          />
          {/* <button onClick={getOwner}>{`${
            owner === account ? "Owner" : "Guest"
          }`}</button> */}
          {/* <button onClick={getBalance}>{contractBalance} ETH</button> */}
        </div>

        <div>
          <h1 className="title">Buy Me A Coffee</h1>
          <p className="subtitle">
            If you like my work, you can buy me a coffee. I would really
            appreciate it!
          </p>
        </div>

        <TipForm isWalletConnected={isWalletConnected} sendTip={sendTip} />

        {/* {owner === account && (
          <div className="form_wrapper">
            <form onSubmit={withdraw}>
              <input
                type="number"
                placeholder="Amount to withdraw"
                name="amount"
                step="0.00000001"
                required
              />
              <button type="submit" disabled={!isWalletConnected}>{`${
                isWalletConnected ? "Withdraw" : "Connect Wallet"
              }`}</button>
            </form>
          </div>
        )} */}

        {/* <button onClick={getEvents}>Get Events</button> */}
        {/* <div className="events">
          {events?.map((event, index) => (
            <div key={index} className="event">
              <p>
                <strong>From:</strong> {event}
              </p>
              <p>
                <strong>Timestamp:</strong>{" "}
                {new Date(Number(event[1]) * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Name:</strong> {event[2]}
              </p>
              <p>
                <strong>Message:</strong> {event[3]}
              </p>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}

export default App;
