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

/**
 * Seed a realistic clinic schedule (key: docodile_schedule) so hours/heatmap
 * components (HoursWidget, MyHoursCalendar) render with data in stories.
 * Mon–Fri 9–12 & 5–8, Sat 9–1, Sun off.
 */
const _work2 = { off: false, sessions: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '20:00' }] };
const _sat = { off: false, sessions: [{ start: '09:00', end: '13:00' }] };
const _off = { off: true, sessions: [] };
export const withSchedule = withLocalStorage({
  docodile_schedule: JSON.stringify({
    default: { mon: _work2, tue: _work2, wed: _work2, thu: _work2, fri: _work2, sat: _sat, sun: _off },
    overrides: {},
    configured: true,
  }),
});
