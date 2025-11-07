import React from "react";
import { Button, Select } from "antd";
import type { User } from "../types";

type Props = {
  users: User[];
  selectedUser?: string;
  setSelectedUser: (v?: string) => void;
  onAdd: (userId?: string) => void;
};

export default function ParticipantControls({
  users,
  selectedUser,
  setSelectedUser,
  onAdd,
}: Props) {
  return (
    <div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Select
            showSearch
            placeholder="Chọn người chơi..."
            value={selectedUser}
            onChange={(v) => setSelectedUser(v)}
            options={users.map((u) => ({ label: u.name, value: u.id }))}
            style={{ width: "100%" }}
            allowClear
          />
        </div>
        <div>
          <Button onClick={() => onAdd(selectedUser)} disabled={!selectedUser}>
            Thêm người chơi
          </Button>
        </div>
      </div>
    </div>
  );
}
