import StoreCard from "@/components/StoreCard";
import styles from "../../../index.module.css";
import UploadModal from "@/components/UploadModal";
import { useEffect, useState } from "react";
import useDealClient from "@/hooks/useDealClient";
import useDealFlow from "@/hooks/useDealFlow";
import { useDeals } from "@/context/DealContext";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import useToken from "@/hooks/useToken";
import InfoModal from "@/components/InfoModal";
import { contractAddress, abi } from "../../../../../../constants";

import CID from "cids";
import { set } from "date-fns";
import { useReadContract } from "wagmi";
import Loader from "@/reusables/Loader";
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

const dummyMiners = [
  {
    miner: "t017840",
    token: "CUSDT",
    price: 12,
    time: "20000000",
  },
  {
    miner: "t017837",
    token: "FIL",
    price: 5,
    time: "19000000",
  },
];

export default function Store() {
  const [isOpen, setIsOpen] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [file, setFile] = useState(null);
  const { makeDealProposal } = useDealClient();
  const { getAllRegisteredMiners, getMinerDetails } = useDealFlow();
  const { handleAddDeal } = useDeals();
  const { user } = useUser();
  const { mint, approve } = useToken();

  const handleOpenDealModal = () => {
    setIsOpen(true);
  };
  const handleOpenInfoModal = () => {
    setOpenInfo(true);
  };
  const handleMakeDeal = async () => {
    if (!file) return;
    const amount =
      Number(user.minerDetails.price) * (268435456 / (1024 * 1024 * 1024));
    await mint(user.address, "10000000000000");
    await approve(user.minerDetails.paymentReceiver, amount.toString());
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
  const { data: miners, isLoading } = useReadContract({
    address: contractAddress.DealFlow,
    abi: abi.DealFlow,
    functionName: "getAllRegisteredMiners",
  });

  console.log(miners);

  if (isLoading) return <Loader />;
  return (
    <div className={styles.container}>
      {miners &&
        miners.map((miner) => (
          <StoreCard
            key={miner}
            miner={miner}
            handleOpenDealModal={handleOpenDealModal}
            handleOpenInfoModal={handleOpenInfoModal}
          />
        ))}
      <UploadModal
        file={file}
        setFile={setFile}
        isLoading={false}
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
        handleMakeDeal={handleMakeDeal}
      />
      <InfoModal
        isOpen={openInfo}
        handleClose={() => {
          setOpenInfo(false);
        }}
      />
    </div>
  );
}
