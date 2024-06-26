import { useState } from "react";
import styles from "./index.module.css";
import Image from "next/image";
import { formatFileSize, getFormattedDate } from "@/utils/helper";
import { useUser } from "@/hooks/useUser";
import Actions from "./Actions";
import { useDeals } from "@/context/DealContext";
import toast from "react-hot-toast";
import useDealFlow from "@/hooks/useDealFlow";
import { useRouter } from "next/navigation";

export default function DealCard({ deal, isChallenge = false }) {
  const [showActions, setShowActions] = useState(false);
  const { startTime, endTime, pieceCid, size, fileName, miner } = deal;
  const { user } = useUser();
  const { handleStatusChange } = useDeals();
  const { challengeDealDup } = useDealFlow();
  const router = useRouter();
  const actions =
    user.role === "user"
      ? isChallenge
        ? [
            {
              label: "Verify",
              onClick: () => {
                toast.error("Deal yet to be Proven!");
              },
            },
          ]
        : [
            {
              label: "Challenge",
              icon: "/challenge.svg",
              onClick: async () => {
                const result = challengeDealDup();
                toast.promise(result, {
                  loading: "Challenging...",
                  success: (data) => {
                    handleStatusChange(fileName, "challenged");
                    return "Deal Challenged!";
                  },
                  error: "Failed to Challenge",
                });
              },
            },
            {
              label: "View Deal",
              path: "https://calibration.filfox.info/en/deal/195236",
            },
          ]
      : [
          {
            label: "View Deal",
            onClick: () => {
              console.log("View Deal");
            },
          },
        ];

  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  const totalDuration = end - start;
  const elapsedTime = now - start;

  const progress = (elapsedTime / totalDuration) * 100;

  const progressPercentage = Math.min(progress, 100);
  const width = `${progressPercentage}%`;
  return (
    <div className={styles.container}>
      <div className={styles["deal-header"]}>
        <div className={styles["deal-size"]}>
          <p>{fileName}</p>
        </div>

        <div className={styles["deal-actions"]}>
          <Image
            className={styles.img}
            src={"/three-dot.svg"}
            alt="actions"
            width={24}
            height={24}
            onClick={() => {
              setShowActions(!showActions);
            }}
          />
          {showActions && <Actions actions={actions} />}
        </div>
      </div>
      <div className={styles["deal-size"]}>
        <p>{formatFileSize(size)}</p>
      </div>
      <div className={styles["deal-body"]}>
        <div className={styles["date-row"]}>
          <p>
            {getFormattedDate(new Date(startTime))}
            {" - "}
            {getFormattedDate(new Date(endTime))}
            {" (IST)"}
          </p>
        </div>
        <div className={styles["progress-bar"]} style={{ width: width }}></div>
        <div className={styles["miner-address"]}>
          <p>
            {miner} {" ("}
            <span>Miner</span>
            {")"}
          </p>
        </div>
        <div className={styles["miner-address"]}>
          <p>
            {pieceCid} {" ("}
            <span>CID</span>
            {")"}
          </p>
        </div>
      </div>
    </div>
  );
}
