import StoreCard from "@/components/StoreCard";
import styles from "../../../index.module.css";
import UploadModal from "@/components/UploadModal";
import { useState } from "react";
import useDealClient from "@/hooks/useDealClient";
import { useDeals } from "@/context/DealContext";
import toast from "react-hot-toast";

import CID from "cids";
import { set } from "date-fns";
const cid = new CID(
  "baga6ea4seaqim3kdcgv4psrxyfobuihyvgs3h5ks6qcv5he3keoasdkxot6gihi"
);
const extraParamsV1 = [
  "https://data-depot.lighthouse.storage/api/download/download_car?fileId=740eaf77-0516-4cdf-bb8b-02229eacadb5.car",
  "138641223", //carSize,
  false, // taskArgs.skipIpniAnnounce,
  false, // taskArgs.removeUnsealedCopy
];
const DealRequestStruct = [
  cid.bytes, //cidHex
  "268435456", //taskArgs.pieceSize,
  true, //taskArgs.verifiedDeal,
  "bafybeib3e32n2isls5yertlfcmsaqxpisryunis3rknxca26n4jcqdpymm", //taskArgs.label,
  // 520000, // startEpoch
  1800000, // startEpoch
  2255200, // endEpoch
  0, // taskArgs.storagePricePerEpoch,
  0, // taskArgs.providerCollateral,
  0, // taskArgs.clientCollateral,
  1, //taskArgs.extraParamsVersion,
  extraParamsV1,
];

const dummyMiner = {
  miner: "t3xv7b7v6",
  pieceCid: "bafykbzaced6w",
  time: 3049483,
  price: 12,
};

export default function Store() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const { makeDealProposal } = useDealClient();
  const { handleAddDeal } = useDeals();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDealModal = () => {
    setIsOpen(true);
  };
  const handleMakeDeal = async () => {
    if (!file) return;
    const result = makeDealProposal(DealRequestStruct);
    toast.promise(result, {
      loading: "Making Deal...",
      success: (data) => {
        const deal = {
          fileName: file.name,
          miner: "t017840",
          size: file.size,
          pieceCid:
            "baga6ea4seaqim3kdcgv4psrxyfobuihyvgs3h5ks6qcv5he3keoasdkxot6gihi",
          startTime: "2024-06-04T00:00:00Z",
          endTime: "2027-09-30T00:00:00Z",
          status: "pending",
        };
        handleAddDeal(deal);
        setIsOpen(false);
        return "Deal Created!";
      },
      error: "Something went wrong!",
    });
  };
  return (
    <div className={styles.container}>
      <StoreCard
        minerDetails={dummyMiner}
        handleOpenDealModal={handleOpenDealModal}
      />
      <UploadModal
        file={file}
        setFile={setFile}
        isLoading={isLoading}
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
        handleMakeDeal={handleMakeDeal}
      />
    </div>
  );
}
