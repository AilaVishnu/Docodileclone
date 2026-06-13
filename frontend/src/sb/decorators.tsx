import React, { useEffect, useRef } from 'react';
import type { Decorator } from '@storybook/react-webpack5';

/**
 * Wrap a story in a fixed-size box. Recharts' ResponsiveContainer collapses to
 * 0×0 without a sized parent, so every chart story needs this.
 */
export const withSize =
  (width: number | string = 360, height: number | string = 240): Decorator =>
  function SizeDecorator(Story) {
    return (
      <div style={{ width, height }}>
        <Story />
      </div>
    );
  };

/** Center a story on a padded stage — handy for small primitives. */
export const centered: Decorator = function CenteredDecorator(Story) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <Story />
    </div>
  );
};

/**
 * Seed localStorage keys before the story mounts (so components that read
 * localStorage on first render — schedule, session, role/gender/token — see
 * realistic state). Restores the prior values on unmount.
 */
export const withLocalStorage =
  (entries: Record<string, string>): Decorator =>
  function LocalStorageDecorator(Story) {
    const priorRef = useRef<Record<string, string | null> | null>(null);
    if (priorRef.current === null) {
      const prior: Record<string, string | null> = {};
      Object.entries(entries).forEach(([k, v]) => {
        prior[k] = localStorage.getItem(k);
        localStorage.setItem(k, v);
      });
      priorRef.current = prior;
    }
    useEffect(
      () => () => {
        const prior = priorRef.current ?? {};
        Object.entries(prior).forEach(([k, v]) => {
          if (v === null) localStorage.removeItem(k);
          else localStorage.setItem(k, v);
        });
      },
      [],
    );
    return <Story />;
  };

/** Common auth/identity localStorage seed for components that read the JWT/role. */
export const withClinicSession = withLocalStorage({
  docodile_token: 'storybook-fake-jwt',
  docodile_clinic_id: 'clinic-1',
  docodile_role: 'doctor',
  docodile_gender: 'female',
});
