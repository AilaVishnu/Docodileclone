import React, { useState } from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
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
      <TextInput
        value={name}
        onChange={setName}
        placeholder="Name"
        iconLeft={<UserIcon />}
        error={errors.name}
        errorMessage="Please enter staff name"
      />

      <TextInput
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="hello@example.com"
        iconLeft={<MailIcon />}
        error={errors.email}
        errorMessage="Please enter a valid email"
      />

      <TextInput
        value={phone}
        onChange={setPhone}
        placeholder="+91 98885672664"
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
