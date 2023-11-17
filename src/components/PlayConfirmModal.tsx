import React from "react";

interface PlayConfirmModalProps {
  albumTitle: string;
  albumImageSrc: string;
  artistName: string;
  albumId: string;
  onPlay?: () => void;
  onNext?: () => void;
  onClose?: () => void;
}

const PlayConfirmModal: React.FC<PlayConfirmModalProps> = ({
  albumTitle,
  albumImageSrc,
  artistName,
  onPlay,
  onNext,
  onClose,
}) => {
  return (
    <div
      id="modal-background"
      className="min-w-full min-h-full bg-black-900 absolute top-0 left-0 z-10 flex flex-col items-center justify-center"
    >
      <div className="w-fit p-4 bg-gray-100 rounded flex flex-col items-center justify-center gap-2">
        <div className="modal-header">
          <h2 className="font-bold">Do you feel like playing this album?</h2>
        </div>
        <div className="modal-body flex flex-col items-center justify-center gap-4">
          <img
            src={albumImageSrc}
            alt="modal"
            className="h-40 w-40 shadow-md"
          />
          <p>
            <span className="font-bold">{albumTitle}</span>
            <span className="font-thin"> by </span>
            <span className="font-bold">{artistName}</span>
          </p>
        </div>
        <div className="modal-footer flex flex-col gap-2">
          <button
            className="border rounded py-1 px-20 bg-green border-green"
            onClick={onPlay}
          >
            Play
          </button>
          <button
            className="border rounded py-1 px-20 bg-gray-900 border-gray-900 text-white"
            onClick={onNext}
          >
            Next
          </button>
          <button className="border rounded py-1 px-20" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayConfirmModal;
