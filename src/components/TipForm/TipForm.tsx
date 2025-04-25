import React from "react";
import "./TipForm.css";
import Loader from "../Loader/Loader";

const TipForm = ({
  isLoading,
  isWalletConnected,
  sendTip,
}: {
  isLoading: boolean;
  isWalletConnected: boolean;
  sendTip: (event: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <div>
      <form className="form_wrapper" onSubmit={sendTip}>
        <input
          type="string"
          placeholder="Name"
          name="name"
          required
          disabled={isLoading}
        />
        <div className="amount_wrapper">
          <input
            disabled={isLoading}
            type="number"
            placeholder="Amount you want to tip"
            name="amount"
            step="0.00000001"
            required
          />
          <span className="currency">ETH</span>
        </div>
        <textarea
          name="memo"
          placeholder="Say something"
          rows={1}
          disabled={isLoading}
        />
        <button
          className="tip-button"
          type="submit"
          disabled={!isWalletConnected || isLoading}
        >
          {isLoading ? <Loader /> : "Send Tip"}
        </button>
      </form>
    </div>
  );
};

export default TipForm;
