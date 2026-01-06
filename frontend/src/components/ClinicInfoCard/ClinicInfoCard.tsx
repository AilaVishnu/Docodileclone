import React, { useState } from "react";
import { Card } from "../Card";
import { TextInput } from "../Input/TextInput";
import { DomainInput } from "../Input/DomainInput";
import { Button } from "../Button";
import { styles } from "./ClinicInfoCard.styles";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";
import { ReactComponent as ClockIcon } from "../../assets/Clock Circle.svg";
import { ReactComponent as LocationIcon } from "../../assets/Map Point.svg"; 
import { ReactComponent as PlusIcon } from "../../assets/Plus.svg";

export function ClinicInfoCard() {
  const [domain, setDomain] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [phones, setPhones] = useState([""]);
  const [timings, setTimings] = useState([""]);
  const [address, setAddress] = useState("");

  const addPhone = () => setPhones([...phones, ""]);
  const updatePhone = (i: number, value: string) => {
    const copy = [...phones];
    copy[i] = value;
    setPhones(copy);
  };

  const addTiming = () => setTimings([...timings, ""]);
  const updateTiming = (i: number, value: string) => {
    const copy = [...timings];
    copy[i] = value;
    setTimings(copy);
  };

  return (
    <Card style={styles.outerCard}>
      <DomainInput value={domain} onChange={setDomain} />
      
      <Card style={styles.innerCard}>
        <TextInput
        value={clinicName}
        onChange={setClinicName}
        placeholder="Clinic Name"
        iconLeft={<BuildingIcon />}
      />

      {phones.map((phone, i) => (
        <div key={i} style={styles.rowWithAction}>
          <TextInput
            value={phone}
            onChange={(v) => updatePhone(i, v)}
            placeholder="+91 XXXXX XXXXX"
            iconLeft={<PhoneIcon />}
          />

          {i === phones.length - 1 && (
            <Button
              size="smIcon"
              variant="primaryLight"
              iconLeft={<PlusIcon/>}
              onClick={addPhone}
            />
          )}
        </div>
      ))}

      {timings.map((time, i) => (
        <div key={i} style={styles.rowWithAction}>
          <TextInput
            value={time}
            onChange={(v) => updateTiming(i, v)}
            placeholder="11:00 AM - 1:00 PM"
            iconLeft={<ClockIcon />}
          />

          {i === timings.length - 1 && (
            <Button
              size="smIcon"
              variant="primaryLight"
              iconLeft={<PlusIcon />}
              onClick={addTiming}
            />
          )}
        </div>
      ))}

      <TextInput
        value={address}
        onChange={setAddress}
        placeholder="Clinic address"
        iconLeft={<LocationIcon />}
      />
      </Card>
      
    </Card>
  );
}
