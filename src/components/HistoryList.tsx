import React from "react";
import { List } from "antd";

type Props = {
  history: string[];
};

export default function HistoryList({ history }: Props) {
  return (
    <List
      dataSource={history.slice().reverse()}
      renderItem={(h) => {
        // Expect history entries in the shape: "<timestamp> | <message>"
        const parts = h.split("|").map((p) => p.trim());
        let timePart = "";
        let messagePart = h;

        if (parts.length >= 2) {
          timePart = parts[0];
          // join the rest as message in case message contains '|'
          messagePart = parts.slice(1).join(" | ");
        } else {
          // If there is no separator, try to treat whole string as message
          messagePart = h;
        }

        // Try to parse timePart into a Date and format it for Vietnamese locale.
        let formattedTime = "";
        if (timePart) {
          const d = new Date(timePart);
          if (!isNaN(d.getTime())) {
            try {
              formattedTime = new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(d);
            } catch (e) {
              // fallback to toLocaleString
              formattedTime = d.toLocaleString("vi-VN");
            }
          }
        }

        return (
          <List.Item className="mb-3">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600">{formattedTime}</div>
              <div>{messagePart}</div>
            </div>
          </List.Item>
        );
      }}
    />
  );
}
