import React from 'react';
import { ReactComponent as HomeIconSVG } from "./assets/home.svg";
import { ReactComponent as AppointmentsIconSVG } from "./assets/appointments.svg";
import { ReactComponent as PrescriptionIconSVG } from "./assets/prescription.svg";
import { ReactComponent as PatientFilesIconSVG } from "./assets/patient_files.svg";
import { ReactComponent as ServicesIconSVG } from "./assets/services.svg";
import { ReactComponent as BillingIconSVG } from "./assets/billing.svg";
import { ReactComponent as BusinessIconSVG } from "./assets/business.svg";
import { ReactComponent as PharmacyIconSVG } from "./assets/pharmacy.svg";
import { ReactComponent as MessageIconSVG } from "./assets/message.svg";
import { ReactComponent as MessageUnreadIconSVG } from "./assets/message_unread.svg";
import { ReactComponent as BellIconSVG } from "./assets/bell.svg";
import { ReactComponent as BellActiveIconSVG } from "./assets/bell_active.svg";
import { ReactComponent as StethoscopeIconSVG } from "./assets/Stethoscope.svg";
import { ReactComponent as PulseIconSVG } from "./assets/pulse.svg";
import { ReactComponent as BackIconSVG } from "./assets/back_arrow.svg";
import { ReactComponent as ChevronLeftIconSVG } from "./assets/chevron_left.svg";
import { ReactComponent as ChevronRightIconSVG } from "./assets/chevron_right.svg";
import { ReactComponent as UserHandsIconSVG } from "./assets/User Hands.svg";
import { ReactComponent as LetterIconSVG } from "./assets/Letter.svg";
import { ReactComponent as PhoneIconSVG } from "./assets/Phone.svg";
import { ReactComponent as CalendarIconSVG } from "./assets/calendar.svg";
import { ReactComponent as HashtagIconSVG } from "./assets/hashtag.svg";
import { ReactComponent as ClockIconSVG } from "./assets/Clock Circle.svg";

export const HomeIcon = () => <HomeIconSVG />;
export const AppointmentsIcon = () => <AppointmentsIconSVG />;
export const PrescriptionIcon = () => <PrescriptionIconSVG />;
export const PatientFilesIcon = () => <PatientFilesIconSVG />;
export const ServicesIcon = () => <ServicesIconSVG />;
export const BillingIcon = () => <BillingIconSVG />;
export const BusinessIcon = () => <BusinessIconSVG />;
export const PharmacyIcon = () => <PharmacyIconSVG />;
export const MessageIcon = () => <MessageIconSVG />;
export const MessageUnreadIcon = () => <MessageUnreadIconSVG />;
export const BellIcon = () => <BellIconSVG />;
export const BellActiveIcon = () => <BellActiveIconSVG />;
export const BackIcon = ({ style }: { style?: React.CSSProperties }) => <BackIconSVG style={style} />;
export const ChevronLeftIcon = ({ style }: { style?: React.CSSProperties }) => <ChevronLeftIconSVG style={style} />;
export const ChevronRightIcon = ({ style }: { style?: React.CSSProperties }) => <ChevronRightIconSVG style={style} />;
export const UserHandsIcon = ({ style }: { style?: React.CSSProperties }) => <UserHandsIconSVG style={style} />;
export const LetterIcon = ({ style }: { style?: React.CSSProperties }) => <LetterIconSVG style={style} />;
export const PhoneIcon = ({ style }: { style?: React.CSSProperties }) => <PhoneIconSVG style={style} />;
export const CalendarIcon = ({ style }: { style?: React.CSSProperties }) => <CalendarIconSVG style={style} />;
export const HashtagIcon = ({ style }: { style?: React.CSSProperties }) => <HashtagIconSVG style={style} />;
export const ClockIcon = ({ style }: { style?: React.CSSProperties }) => <ClockIconSVG style={style} />;


export const StethoscopeIcon = ({ style }: { style?: React.CSSProperties }) => (
  <StethoscopeIconSVG style={style} />
);

export const PulseIcon = ({ style }: { style?: React.CSSProperties }) => (
  <PulseIconSVG style={style} />
);
