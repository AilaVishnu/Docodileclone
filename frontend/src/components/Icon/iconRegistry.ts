import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Icon registry — the single source for <Icon name="…" />. assets/icons/*.svg
// (kebab names) + the named app/nav icons from assets/ root.
//
// These are STATIC imports on purpose: CRA only applies SVGR (the `ReactComponent`
// export) to explicit imports, NOT to webpack require.context — so an auto-folder
// registry silently yields URL strings, not components. To add an icon: drop the
// .svg in assets/icons and add its import + one map line below.
//
// MULTICOLOR_ICONS flags brand/illustrative icons that keep their baked palette.
// ─────────────────────────────────────────────────────────────────────────────
import { ReactComponent as Ic_archive_box } from "../../assets/icons/archive-box.svg";
import { ReactComponent as Ic_arrow_left } from "../../assets/icons/arrow-left.svg";
import { ReactComponent as Ic_bill_check } from "../../assets/icons/bill-check.svg";
import { ReactComponent as Ic_calendar } from "../../assets/icons/calendar.svg";
import { ReactComponent as Ic_calendar_check } from "../../assets/icons/calendar-check.svg";
import { ReactComponent as Ic_capsule } from "../../assets/icons/capsule.svg";
import { ReactComponent as Ic_catalog } from "../../assets/icons/catalog.svg";
import { ReactComponent as Ic_chat_dots } from "../../assets/icons/chat-dots.svg";
import { ReactComponent as Ic_chat_square_call } from "../../assets/icons/chat-square-call.svg";
import { ReactComponent as Ic_check } from "../../assets/icons/check.svg";
import { ReactComponent as Ic_check_circle } from "../../assets/icons/check-circle.svg";
import { ReactComponent as Ic_chevron_up } from "../../assets/icons/chevron-up.svg";
import { ReactComponent as Ic_danger_triangle } from "../../assets/icons/danger-triangle.svg";
import { ReactComponent as Ic_document_school } from "../../assets/icons/document-school.svg";
import { ReactComponent as Ic_download } from "../../assets/icons/download.svg";
import { ReactComponent as Ic_download_tray } from "../../assets/icons/download-tray.svg";
import { ReactComponent as Ic_edit_pencil } from "../../assets/icons/edit-pencil.svg";
import { ReactComponent as Ic_envelope } from "../../assets/icons/envelope.svg";
import { ReactComponent as Ic_error_circle } from "../../assets/icons/error-circle.svg";
import { ReactComponent as Ic_file } from "../../assets/icons/file.svg";
import { ReactComponent as Ic_heart_pulse } from "../../assets/icons/heart-pulse.svg";
import { ReactComponent as Ic_history } from "../../assets/icons/history.svg";
import { ReactComponent as Ic_hourglass_line } from "../../assets/icons/hourglass-line.svg";
import { ReactComponent as Ic_hourglass } from "../../assets/icons/hourglass.svg";
import { ReactComponent as Ic_info_seal } from "../../assets/icons/info-seal.svg";
import { ReactComponent as Ic_list_sort } from "../../assets/icons/list-sort.svg";
import { ReactComponent as Ic_magnifer_bug } from "../../assets/icons/magnifer-bug.svg";
import { ReactComponent as Ic_microphone } from "../../assets/icons/microphone.svg";
import { ReactComponent as Ic_paid_stamp } from "../../assets/icons/paid-stamp.svg";
import { ReactComponent as Ic_pen } from "../../assets/icons/pen.svg";
import { ReactComponent as Ic_pills } from "../../assets/icons/pills.svg";
import { ReactComponent as Ic_play_circle } from "../../assets/icons/play-circle.svg";
import { ReactComponent as Ic_printer } from "../../assets/icons/printer.svg";
import { ReactComponent as Ic_receipt } from "../../assets/icons/receipt.svg";
import { ReactComponent as Ic_receipt_slash } from "../../assets/icons/receipt-slash.svg";
import { ReactComponent as Ic_reorder } from "../../assets/icons/reorder.svg";
import { ReactComponent as Ic_restart_24 } from "../../assets/icons/restart-24.svg";
import { ReactComponent as Ic_rewind_back_circle } from "../../assets/icons/rewind-back-circle.svg";
import { ReactComponent as Ic_scale } from "../../assets/icons/scale.svg";
import { ReactComponent as Ic_share } from "../../assets/icons/share.svg";
import { ReactComponent as Ic_staff } from "../../assets/icons/staff.svg";
import { ReactComponent as Ic_star } from "../../assets/icons/star.svg";
import { ReactComponent as Ic_status_dot } from "../../assets/icons/status-dot.svg";
import { ReactComponent as Ic_stop_circle } from "../../assets/icons/stop-circle.svg";
import { ReactComponent as Ic_stopwatch } from "../../assets/icons/stopwatch.svg";
import { ReactComponent as Ic_success_seal } from "../../assets/icons/success-seal.svg";
import { ReactComponent as Ic_trash } from "../../assets/icons/trash.svg";
import { ReactComponent as Ic_trash_bin } from "../../assets/icons/trash-bin.svg";
import { ReactComponent as Ic_tuning } from "../../assets/icons/tuning.svg";
import { ReactComponent as Ic_user_check } from "../../assets/icons/user-check.svg";
import { ReactComponent as Ic_user } from "../../assets/icons/user.svg";
import { ReactComponent as Ic_users_group_rounded } from "../../assets/icons/users-group-rounded.svg";
import { ReactComponent as Ic_users_group } from "../../assets/icons/users-group.svg";
import { ReactComponent as Ic_verified_badge } from "../../assets/icons/verified-badge.svg";
import { ReactComponent as Ic_videocamera } from "../../assets/icons/videocamera.svg";
import { ReactComponent as Ic_visits } from "../../assets/icons/visits.svg";
import { ReactComponent as Ic_warning_triangle } from "../../assets/icons/warning-triangle.svg";
import { ReactComponent as Ic_widget } from "../../assets/icons/widget.svg";
import { ReactComponent as Ic_zero_queue } from "../../assets/icons/zero-queue.svg";

import { ReactComponent as Nav_home } from "../../assets/home.svg";
import { ReactComponent as Nav_appointments } from "../../assets/appointments.svg";
import { ReactComponent as Nav_prescription } from "../../assets/prescription.svg";
import { ReactComponent as Nav_patient_files } from "../../assets/patient_files.svg";
import { ReactComponent as Nav_billing } from "../../assets/billing.svg";
import { ReactComponent as Nav_business } from "../../assets/business.svg";
import { ReactComponent as Nav_pharmacy_nav } from "../../assets/pharmacy.svg";
import { ReactComponent as Nav_message } from "../../assets/message.svg";
import { ReactComponent as Nav_message_unread } from "../../assets/message_unread.svg";
import { ReactComponent as Nav_bell } from "../../assets/bell.svg";
import { ReactComponent as Nav_bell_active } from "../../assets/bell_active.svg";
import { ReactComponent as Nav_search } from "../../assets/search.svg";
import { ReactComponent as Nav_hashtag } from "../../assets/hashtag.svg";
import { ReactComponent as Nav_back_arrow } from "../../assets/back_arrow.svg";
import { ReactComponent as Nav_chevron_left } from "../../assets/chevron_left.svg";
import { ReactComponent as Nav_chevron_right } from "../../assets/chevron_right.svg";

// Form/affordance icons from assets/ root (distinct glyphs from any assets/icons
// twin — kept under their own names; dedupe later once glyphs are confirmed).
import { ReactComponent as Root_mail } from "../../assets/Letter.svg";
import { ReactComponent as Root_key } from "../../assets/Key.svg";
import { ReactComponent as Root_eye } from "../../assets/Eye.svg";
import { ReactComponent as Root_eye_closed } from "../../assets/Eye Closed.svg";
import { ReactComponent as Root_buildings } from "../../assets/Buildings.svg";
import { ReactComponent as Root_phone } from "../../assets/Phone.svg";
import { ReactComponent as Root_map_point } from "../../assets/Map Point.svg";
import { ReactComponent as Root_stethoscope } from "../../assets/Stethoscope.svg";
import { ReactComponent as Root_user_hands } from "../../assets/User Hands.svg";
import { ReactComponent as Root_mask_happy } from "../../assets/Mask Happly.svg";
import { ReactComponent as Root_plus } from "../../assets/Plus.svg";
import { ReactComponent as Root_pulse } from "../../assets/pulse.svg";
import { ReactComponent as Root_clock } from "../../assets/Clock Circle.svg";
import { ReactComponent as Root_arrow_right } from "../../assets/Arrow Right.svg";
import { ReactComponent as Root_help } from "../../assets/Help.svg";

type SvgComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export const ICONS: Record<string, SvgComponent> = {
  "archive-box": Ic_archive_box,
  "arrow-left": Ic_arrow_left,
  "bill-check": Ic_bill_check,
  "calendar": Ic_calendar,
  "calendar-check": Ic_calendar_check,
  "capsule": Ic_capsule,
  "chat-dots": Ic_chat_dots,
  "chat-square-call": Ic_chat_square_call,
  "check": Ic_check,
  "check-circle": Ic_check_circle,
  "chevron-up": Ic_chevron_up,
  "danger-triangle": Ic_danger_triangle,
  "document-school": Ic_document_school,
  "download": Ic_download,
  "download-tray": Ic_download_tray,
  "edit-pencil": Ic_edit_pencil,
  "envelope": Ic_envelope,
  "error-circle": Ic_error_circle,
  "file": Ic_file,
  "heart-pulse": Ic_heart_pulse,
  "history": Ic_history,
  "hourglass-line": Ic_hourglass_line,
  "hourglass": Ic_hourglass,
  "info-seal": Ic_info_seal,
  "list-sort": Ic_list_sort,
  "magnifer-bug": Ic_magnifer_bug,
  "microphone": Ic_microphone,
  "paid-stamp": Ic_paid_stamp,
  "pen": Ic_pen,
  "phone": Root_phone,
  "pills": Ic_pills,
  "play-circle": Ic_play_circle,
  "plus": Root_plus,
  "printer": Ic_printer,
  "receipt": Ic_receipt,
  "receipt-slash": Ic_receipt_slash,
  "pulse": Root_pulse,
  "menu": Ic_reorder,
  "restart": Ic_restart_24,
  "rewind-back-circle": Ic_rewind_back_circle,
  "scale": Ic_scale,
  "share": Ic_share,
  "staff": Ic_staff,
  "star": Ic_star,
  "status-dot": Ic_status_dot,
  "stop-circle": Ic_stop_circle,
  "stopwatch": Ic_stopwatch,
  "success-seal": Ic_success_seal,
  "trash": Ic_trash,
  "trash-bin": Ic_trash_bin,
  "tuning": Ic_tuning,
  "user-check": Ic_user_check,
  "user": Ic_user,
  "users-group-rounded": Ic_users_group_rounded,
  "users-group": Ic_users_group,
  "verified-badge": Ic_verified_badge,
  "videocamera": Ic_videocamera,
  "visits": Ic_visits,
  "warning-triangle": Ic_warning_triangle,
  "grid": Ic_widget,
  "zero-queue": Ic_zero_queue,
  "home": Nav_home,
  "appointments": Nav_appointments,
  "prescription": Nav_prescription,
  "patient-files": Nav_patient_files,
  "catalog": Ic_catalog,
  "billing": Nav_billing,
  "business": Nav_business,
  "pill": Nav_pharmacy_nav,
  "message": Nav_message,
  "message-unread": Nav_message_unread,
  "bell": Nav_bell,
  "bell-active": Nav_bell_active,
  "search": Nav_search,
  "hashtag": Nav_hashtag,
  "back-arrow": Nav_back_arrow,
  "chevron-left": Nav_chevron_left,
  "chevron-right": Nav_chevron_right,
  "mail": Root_mail,
  "key": Root_key,
  "eye": Root_eye,
  "eye-closed": Root_eye_closed,
  "buildings": Root_buildings,
  "map-point": Root_map_point,
  "stethoscope": Root_stethoscope,
  "user-hands": Root_user_hands,
  "mask-happy": Root_mask_happy,
  "clock": Root_clock,
  "arrow-right": Root_arrow_right,
  "help": Root_help,
};

/** Sorted list of every registered icon name (used by the gallery). */
export const ICON_NAMES: string[] = Object.keys(ICONS).sort();

/**
 * Brand / illustrative icons that carry their own baked palette. <Icon> leaves
 * these alone (no currentColor tone) so they keep their multi-colour design.
 */
export const MULTICOLOR_ICONS = new Set<string>([
  "archive-box",
  "calendar-check",
  "capsule",
  "download-tray",
  "check-circle",
  "danger-triangle",
  "envelope",
  "error-circle",
  "hourglass",
  "info-seal",
  "paid-stamp",
  "receipt",
  "receipt-slash",
  "stopwatch",
  "staff",
  "success-seal",
  "trash-bin",
  "warning-triangle",
  "user-check",
  "user",
  "users-group",
  "zero-queue",
  "bell-active",
]);
