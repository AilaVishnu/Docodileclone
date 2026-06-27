import React from "react";
import { Card } from "../Card";
import { Field } from "../Field";
import { RadioGroup } from "../Radio";
import { styles } from "./StaffDetailsCard.styles";

import { Icon } from "../Icon";

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
        iconLeft={<Icon name="user-hands" tone="inherit" />}
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
        iconLeft={<Icon name="mail" tone="inherit" />}
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
        iconLeft={<Icon name="phone" tone="inherit" />}
        error={errors.phone}
        errorMessage="Please enter a valid phone number"
      />

      <div style={{ marginTop: 4, ...(errors.gender ? { border: "1px solid red", borderRadius: "8px", padding: "4px" } : {}) }}>
        <RadioGroup
          name="gender"
          value={gender}
          onChange={(v) => setGender(v as "male" | "female" | "other")}
          gap={24}
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ]}
        />
      </div>

    </Card>
  );
}
