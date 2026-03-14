import React from "react";
import { colors } from "../../styles/theme";
import { ReactComponent as FaceIcon } from "../../assets/staff/face.svg";
import { ReactComponent as BodyIcon } from "../../assets/staff/body.svg";
import { ReactComponent as FemaleHairIcon } from "../../assets/staff/hair_female.svg";
import { ReactComponent as MaleHairIcon } from "../../assets/staff/hair_male.svg";
import { ReactComponent as DoctorAccessory } from "../../assets/staff/accessory_doctor.svg";
import { ReactComponent as PharmacyAccessory } from "../../assets/staff/accessory_pharmacy.svg";
import { ReactComponent as NurseAccessory } from "../../assets/staff/accessory_nurse.svg";

type IllustrationProps = {
  role: string;
  gender: "male" | "female" | "other" | "";
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
};

export function StaffIllustration({
  role,
  gender,
  width = 220,
  height = 220,
  borderRadius = 8,
}: IllustrationProps) {
  const isFemale = gender === "female" || gender === "other" || gender === "";

  // Background colors based on role
  const getBgColor = () => {
    switch (role) {
      case "Doctor":
        return colors.primary800;
      case "Pharmacy":
        return "#556536";
      case "Nurse":
        return "#5a4d84";
      case "Front Desk":
        return "#196a7f";
      default:
        return colors.primary800;
    }
  };

  const getBodyColor = () => {
    switch (role) {
      case "Doctor":
        return "#F9F9ED";
      case "Pharmacy":
        return "#ACBF88";
      case "Nurse":
        return "#CF6F2F";
      default:
        return "#C7C7C7";
    }
  };

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: getBgColor(),
        borderRadius,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 217 217"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Face Fragment */}
        <g transform="translate(61.53, 49.91)">
          <FaceIcon />
        </g>

        {/* Body Fragment */}
        <g transform="translate(50.02, 109.89)" style={{ color: getBodyColor() }}>
          <BodyIcon />
        </g>

        {/* Hair Fragment */}
        <g transform={isFemale ? "translate(54.33, 38.91)" : "translate(60.98, 38.91)"}>
          {isFemale ? <FemaleHairIcon /> : <MaleHairIcon />}
        </g>

        {/* Accessories */}
        {role === "Doctor" && (
          <g transform="translate(68.52, 133.97)">
            <DoctorAccessory />
          </g>
        )}
        {role === "Pharmacy" && (
          <g transform="translate(114.84, 168.26)">
            <PharmacyAccessory />
          </g>
        )}
        {role === "Nurse" && (
          <g transform="translate(103.82, 81.28)">
            <NurseAccessory />
          </g>
        )}
      </svg>
    </div>
  );
}
