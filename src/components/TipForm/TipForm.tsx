import React from "react";
import "./TipForm.css";

const TipForm = ({
  isWalletConnected,
  sendTip,
}: {
  isWalletConnected: boolean;
  sendTip: (event: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <div>
      <form className="form_wrapper" onSubmit={sendTip}>
        <input type="string" placeholder="Name" name="name" required />
        <div className="amount_wrapper">
          <input
            type="number"
            placeholder="Amount you want to tip"
            name="amount"
            step="0.00000001"
            required
          />
          <span className="currency">ETH</span>
        </div>
        <textarea name="memo" placeholder="Say something" rows={1} />
        <button
          className="tip-button"
          type="submit"
          disabled={!isWalletConnected}
        >
          Send a Tip
        </button>
      </form>
    </div>
  );
};

export default TipForm;
