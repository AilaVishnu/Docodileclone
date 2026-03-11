import React from "react";
import { colors } from "../../styles/theme";

// SVG fragments as paths or components?
// For simplicity and performance, I'll define them as small functional components here.

type IllustrationProps = {
  role: string;
  gender: "male" | "female" | "other" | "";
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
};

const Face = () => (
  <path
    d="M74.2534 27.2452V21.6278C74.2534 11.0833 66.3687 2.20439 55.8982 0.957906C50.7232 0.341836 45.5054 1.68937 41.2758 4.73423L34.5375 9.58518C32.6958 10.911 30.9643 12.3833 29.3597 13.9879L14.0135 29.3342C5.74769 37.5999 4.06425 50.387 9.90903 60.5104C14.5226 68.5014 23.0489 73.4241 32.2761 73.4241H55.5001C62.7807 73.4241 69.1286 68.4727 70.9012 61.4111L72.5346 54.904C73.1085 52.6179 75.0022 50.9021 77.3337 50.5559L78.3004 50.4123C81.0614 50.0023 82.9217 47.3708 82.3874 44.6311C82.2234 43.7902 81.8416 43.007 81.2802 42.3597L78.8492 39.5572C75.8852 36.1402 74.2534 31.7686 74.2534 27.2452Z"
    fill="#E48647"
  />
);

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
        return colors.primary800; // #ae561a
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

  // Reconstructing the illustrations based on Figma fragments
  // Using a single SVG with layered groups

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
          <Face />
        </g>

        {/* Body Fragment */}
        <g transform="translate(50.02, 109.89)">
          <path
            d="M28.8332 2.25377C50.3691 6.65829 72.5739 23.1853 82.7426 32.3085C84.3214 33.725 83.4517 36.2316 81.3455 36.4828L65.8161 38.3351C58.057 39.2606 50.1891 38.2853 42.8908 35.4933L34.4936 32.2809C26.0615 29.0551 18.0164 23.8224 14.6045 15.4638C11.0435 6.73975 12.0449 -1.17975 28.8332 2.25377Z"
            fill={role === "Doctor" ? "#F9F9ED" : role === "Pharmacy" ? "#ACBF88" : role === "Nurse" ? "#CF6F2F" : "#C7C7C7"}
          />
          <path
            d="M57.3079 19.6777C93.7088 43.2137 114.925 86.6408 116.953 107.112H0L6.23748 52.3436C9.31729 25.3012 34.4521 4.89957 57.3079 19.6777Z"
            fill={role === "Doctor" ? "#F9F9ED" : role === "Pharmacy" ? "#ACBF88" : role === "Nurse" ? "#CF6F2F" : "#C7C7C7"}
          />
        </g>

        {/* Hair Fragment */}
        <g transform={isFemale ? "translate(54.33, 38.91)" : "translate(60.98, 38.91)"}>
          {isFemale ? (
            <path
              d="M56.75 0.0073902L71.3125 0.25739C73.2292 0.290319 75.1029 0.830674 76.7432 1.82282L77.8008 2.46247C86.1658 7.52271 82.5783 20.3834 72.8018 20.3834C68.8416 20.3835 65.22 22.6161 63.4404 26.1539L58.4941 35.9869C55.5453 41.8494 48.0969 43.7558 42.6943 40.0308C38.8515 37.381 33.8598 41.1889 35.4004 45.5953L35.5986 46.1627H35.6953L43.8232 65.524C46.9436 72.9564 41.4855 81.1683 33.4248 81.1685H12.7402C12.7184 81.1686 12.6966 81.1695 12.6748 81.1695C12.653 81.1695 12.6312 81.1686 12.6094 81.1685H12.3672V81.1646C5.50936 81.0013 0.00017825 75.3918 0 68.4947C0 63.7742 2.58188 59.6584 6.40918 57.4771L6.6543 51.2916V49.2525C6.6543 21.7213 29.2228 -0.464484 56.75 0.0073902Z"
              fill="#202020"
            />
          ) : (
            <path
              d="M36.6172 0.00540474L64.6582 0.485873C66.5749 0.518801 68.4486 1.0592 70.0889 2.0513L71.1465 2.69095C79.5117 7.75114 75.9241 20.6119 66.1475 20.6119C62.1873 20.612 58.5657 22.8446 56.7861 26.3824L51.8398 36.2163C48.8909 42.0787 41.4426 43.9844 36.04 40.2593C32.1972 37.6095 27.2057 41.4175 28.7461 45.8238L31.1924 52.8199C34.0874 61.1007 27.9404 69.7613 19.168 69.7613H8.39355C3.75794 69.7613 0.000146071 66.0033 0 61.3677V36.0005C0 15.8768 16.4964 -0.339601 36.6172 0.00540474Z"
              fill="#202020"
            />
          )}
        </g>

        {/* Accessories */}
        {role === "Doctor" && (
          <>
            <g transform="translate(68.52, 133.97)">
              <path d="M0.433495 1.436C13.9278 5.50962 42.5967 18.1635 49.3184 36.1899" stroke="#202020" strokeWidth="3"/>
            </g>
            <g transform="translate(111.76, 163.96)">
              <path d="M17.4319 22.6395C17.0586 13.5365 14.2354 -3.18694 5.92868 2.74298C-2.37805 8.6729 2.87473 23.1597 6.53946 29.6618" stroke="#202020" strokeWidth="3" strokeLinecap="round"/>
            </g>
          </>
        )}
        {role === "Pharmacy" && (
          <g transform="translate(114.84, 168.26)">
            <path d="M11.3972 1.8L11.4833 21.0806" stroke="#556536" strokeWidth="3.6" strokeLinecap="round"/>
            <path d="M21.0806 11.3974L1.8 11.4835" stroke="#556536" strokeWidth="3.6" strokeLinecap="round"/>
          </g>
        )}
        {role === "Nurse" && (
          <g transform="translate(103.82, 81.28)">
             <path d="M9.81612 14.3023H40.3364C40.3364 25.0349 30.9592 35.3796 24.0474 40.7457C20.3419 43.6226 15.5874 44.1126 10.9348 43.5124L4.08391 42.6287C3.49315 42.5525 3.09958 41.9799 3.24005 41.4011L9.81612 14.3023Z" fill="#E3E3E3"/>
             <path d="M0.41532 0.278406L9.81612 14.3023M9.81612 14.3023H40.3364C40.3364 25.035 30.9592 35.3796 24.0474 40.7457C20.3419 43.6226 15.5874 44.1126 10.9348 43.5124L4.08391 42.6287C3.49315 42.5525 3.09958 41.9799 3.24005 41.4011L9.81612 14.3023Z" stroke="#E3E3E3"/>
          </g>
        )}
      </svg>
    </div>
  );
}
