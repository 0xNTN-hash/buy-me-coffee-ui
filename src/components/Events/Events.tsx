import React from "react";
import { AiFillClockCircle } from "react-icons/ai";

import { NewMemoEvent } from "../../types";
import "./Events.css";

const Events = ({ events }: { events: NewMemoEvent.OutputTuple[] }) => {
  const getFormatedTimestamp = (event: NewMemoEvent.OutputTuple) => {
    const timeAgo = Math.floor((Date.now() - Number(event[1]) * 1000) / 1000);
    if (timeAgo < 60) {
      return `${timeAgo} sec ago`;
    } else if (timeAgo < 3600) {
      const minutes = Math.floor(timeAgo / 60);
      return `${minutes} min ago`;
    } else if (timeAgo < 86400) {
      const hours = Math.floor(timeAgo / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(timeAgo / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };
  return (
    <div className="events_wrapper">
      <h2 className="events_title">Tips:</h2>
      <div className="events">
        {events?.map((event, index) => (
          <div key={index} className="event">
            <div className="event_details">
              <p>
                <strong>Name:</strong> {event[2]}
              </p>
              <p>
                <strong>Message:</strong> {event[3]}
              </p>
            </div>
            <p className="timestamp">
              <span className="timestamp_icon">
                <AiFillClockCircle />
              </span>

              {(() => {
                return getFormatedTimestamp(event);
              })()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
