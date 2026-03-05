import type {FC} from "react";

type Props = {
  handleMerge: () => void;
  isDisabled: boolean;
};

const MergeTicketsButton: FC<Props> = ({handleMerge, isDisabled}) => {
  return (
    <button
      className={"secondary-btn merge-tickets-btn"}
      onClick={handleMerge}
      disabled={isDisabled}
    >
      Merge & Create
    </button>);
};

export default MergeTicketsButton;