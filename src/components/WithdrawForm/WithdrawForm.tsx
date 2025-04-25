import React from "react";
import "./WithdrawForm.css";
import Loader from "../Loader/Loader";

const WithdrawForm = ({
  onWithdraw,

  isLoading,
}: {
  onWithdraw: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}) => {
  return (
    <div className="withdraw_form_wrapper">
      <form onSubmit={onWithdraw}>
        <div className="amount_wrapper">
          <input
            disabled={isLoading}
            type="number"
            placeholder="Amount to withdraw"
            name="amount"
            step="0.00000001"
            required
          />
          <span className="currency">ETH</span>
        </div>
        <button className="withdraw-button" type="submit" disabled={isLoading}>
          {isLoading ? <Loader /> : "Withdraw"}
        </button>
      </form>
    </div>
  );
};

export default WithdrawForm;
