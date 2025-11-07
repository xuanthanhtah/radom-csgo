import React from "react";
import { List } from "antd";

type Props = {
  history: string[];
};

export default function HistoryList({ history }: Props) {
  return (
    <List
      dataSource={history.slice().reverse()}
      renderItem={(h) => <List.Item>{h}</List.Item>}
    />
  );
}
