import React, { useEffect, useState } from "react";
import { BuyMeCoffeeAbi, BuyMeCoffeeAbi__factory, NewMemoEvent } from "./types";
import "./App.css";
import BuyMeCoffeeABI from "./abi/buyMeCoffee.abi.json";
import {
  BrowserProvider,
  ethers,
  formatEther,
  JsonRpcSigner,
  parseEther,
} from "ethers";

function App() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const contractABI = BuyMeCoffeeABI.abi;

  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const [account, setAccount] = useState();
  const [provider, setProvider] = useState<BrowserProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [contract, setContract] = useState<BuyMeCoffeeAbi>();

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

        contr?.on(contr?.filters.NewMemo, (from, timestamp, name, message) => {
          setEvents((prev) => {
            if (prev === undefined) {
              prev = [];
            }

            return [...prev, [from, timestamp, name, message]];
          });
        });
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
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setAccount(accounts[0]);
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

  useEffect(() => {
    connectWallet();
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
      <div className="header">
        <button onClick={connectWallet}>{`${
          isWalletConnected ? account : "Connect Wallet"
        }`}</button>
        <button onClick={getBalance}>{contractBalance} ETH</button>
      </div>

      <div className="form_wrapper">
        <form onSubmit={sendTip}>
          <input type="string" placeholder="Name" name="name" required />
          <input
            type="number"
            placeholder="Amount you want to tip"
            name="amount"
            step="0.00000001"
            required
          />
          <textarea name="memo" placeholder="Say something" required />
          <button type="submit" disabled={!isWalletConnected}>{`${
            isWalletConnected ? "TIP" : "Connect Wallet"
          }`}</button>
        </form>
      </div>

      <button onClick={getEvents}>Get Events</button>
      <div className="events">
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
      </div>
    </div>
  );
}

export default App;
