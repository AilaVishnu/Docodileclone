import React, { useState } from "react";
import { Card } from "../Card";
import { Field } from "../Field";
import { styles } from "./StaffDetailsCard.styles";

// SVG icons (replace paths with your actual icons)
import { ReactComponent as UserIcon } from "../../assets/User Hands.svg";
import { ReactComponent as MailIcon } from "../../assets/Letter.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";

type StaffDetailsCardProps = {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  gender: "male" | "female" | "other" | "";
  setGender: (val: "male" | "female" | "other" | "") => void;
  errors?: Record<string, boolean>;
};

export function StaffDetailsCard({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  gender,
  setGender,
  errors = {},
}: StaffDetailsCardProps) {

  return (
    <Card style={styles.card}>
      <Field
        variant="underline"
        value={name}
        onChange={setName}
        placeholder="Name"
        iconLeft={<UserIcon />}
        error={errors.name}
        errorMessage="Please enter staff name"
      />

      <Field
        variant="underline"
        type="email"
        value={email}
        onChange={setEmail}
        onBlur={() => setEmail(email.trim().toLowerCase())}
        placeholder="hello@example.com"
        iconLeft={<MailIcon />}
        error={errors.email}
        errorMessage="Please enter a valid email"
      />

      <Field
        variant="underline"
        value={phone}
        onChange={(val) => {
          let digits = val.replace(/\D/g, "");
          if (digits.startsWith("91") && val.startsWith("+")) {
            digits = digits.substring(2);
          }
          digits = digits.substring(0, 10);
          if (digits.length === 0) setPhone("");
          else setPhone("+91 " + digits);
        }}
        onBlur={() => {
          let clean = phone.replace(/\D/g, "");
          if (clean.length === 0) return;
          if (clean.startsWith("91")) clean = clean.substring(2);
          clean = clean.substring(0, 10);
          if (clean.length > 5) {
            setPhone(`+91 ${clean.substring(0, 5)} ${clean.substring(5)}`);
          } else {
            setPhone(`+91 ${clean}`);
          }
        }}
        placeholder="+91 XXXXX XXXXX"
        iconLeft={<PhoneIcon />}
        error={errors.phone}
        errorMessage="Please enter a valid phone number"
      />

      <div style={{ ...styles.genderGroup, ...(errors.gender ? { border: "1px solid red", borderRadius: "8px", padding: "4px" } : {}) }}>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={gender === "male"}
            onChange={() => setGender("male")}
            style={styles.radioInput}
          />
          Male
        </label>

        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={gender === "female"}
            onChange={() => setGender("female")}
            style={styles.radioInput}
          />
          Female
        </label>

        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="gender"
            value="other"
            checked={gender === "other"}
            onChange={() => setGender("other")}
            style={styles.radioInput}
          />
          Other
        </label>
      </div>

    </Card>
  );
}
