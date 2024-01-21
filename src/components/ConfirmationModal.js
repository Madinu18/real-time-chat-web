import React from "react";

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, isAdmin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        {isAdmin ? (
          <p className="mb-4">
            Semua member akan otomatis keluar jika anda keluar ruangan. Apakah
            Anda yakin akan keluar?
          </p>
        ) : (
          <p className="mb-4">Apakah Anda yakin akan keluar?</p>
        )}
        <div className="flex justify-end">
          <button
            className="bg-red-500 text-white px-4 py-2 mr-4 rounded"
            onClick={onCancel}
          >
            Tidak
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
