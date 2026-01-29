import React, { useState } from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { styles } from "./StaffDetailsCard.styles";

// SVG icons (replace paths with your actual icons)
import { ReactComponent as UserIcon } from "../../assets/User Hands.svg";
import { ReactComponent as MailIcon } from "../../assets/Letter.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";

export function StaffDetailsCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");

  return (
    <Card style={styles.card}>
      <TextInput
        value={name}
        onChange={setName}
        placeholder="Name"
        iconLeft={<UserIcon />}
      />

      <TextInput
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="hello@example.com"
        iconLeft={<MailIcon />}
      />

      <TextInput
        value={phone}
        onChange={setPhone}
        placeholder="+91 98885672664"
        iconLeft={<PhoneIcon />}
      />

      <div style={styles.genderGroup}>
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
