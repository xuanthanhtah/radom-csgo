import React from "react";
import { Modal } from "antd";
import type { Item } from "../types";

type Props = {
  result: Item | null;
  onClose: () => void;
};

export default function ResultModal({ result, onClose }: Props) {
  return (
    <Modal
      open={!!result}
      onCancel={onClose}
      footer={null}
      title={result?.name || ""}
    >
      {result && (
        <div className="flex flex-col items-center gap-4">
          {result.image ? (
            <img
              src={result.image}
              alt={result.name}
              className="w-64 h-64 object-cover rounded"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100" />
          )}
          <div className="text-lg">
            Người chơi <strong>{result.name}</strong> được chọn
          </div>
        </div>
      )}
    </Modal>
  );
}
