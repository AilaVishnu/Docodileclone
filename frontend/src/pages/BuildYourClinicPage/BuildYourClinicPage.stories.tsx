import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { http, HttpResponse } from "msw";
import { BuildYourClinicPage } from "./BuildYourClinicPage";
import { colors } from "../../styles/theme";

// Mocked tenant data so the page renders its whole assembled layout (clinic
// tabs + info form + the staff "house") in Storybook, with no backend.
const B = "http://localhost:8080";
const CLINIC1 = "11111111-1111-1111-1111-111111111111";
const CLINIC2 = "22222222-2222-2222-2222-222222222222";

const CLINICS = [
  { id: CLINIC1, name: "TSKIN Dermatology", domain: "tskin", phone: "8639638549", address: "Anandbagh, Malkajgiri, Hyderabad, 500047", speciality: "Dermatology, Cosmetology, Trichology" },
  { id: CLINIC2, name: "TSKIN Kompally", domain: "tskin-kompally", phone: "8639600000", address: "Kompally, Hyderabad, 500100", speciality: "Dermatology" },
];

const STAFF1 = [
  { id: "s1", name: "Dr. Anika Reddy", role: "DOCTOR", gender: "female", email: "anika@tskin.in", phone: "9000010001", department: "Dermatology", specialty: "Cosmetic Dermatology", active: true, accountStatus: "ACTIVE" },
  { id: "s2", name: "Sneha Rao", role: "NURSE", gender: "female", email: "sneha@tskin.in", phone: "9000010002", department: "Dermatology", active: true, accountStatus: "ACTIVE" },
  { id: "s3", name: "Ravi Kumar", role: "FRONT_DESK", gender: "male", email: "ravi@tskin.in", phone: "9000010003", active: true, accountStatus: "PENDING_ACTIVATION" },
  { id: "s4", name: "Old Pharmacist", role: "PHARMACY", gender: "male", email: "old@tskin.in", phone: "9000010004", active: false, accountStatus: "DEACTIVATED" },
];

const tenantHandlers = (clinics: typeof CLINICS, staffByClinic: Record<string, typeof STAFF1>) => [
  http.get(`${B}/api/tenant/config`, () => HttpResponse.json({ maxClinics: 3, maxStaffPerClinic: 8 })),
  http.get(`${B}/api/tenant/clinics`, () => HttpResponse.json(clinics)),
  http.get(`${B}/api/tenant/clinics/:id/staff`, ({ params }) => HttpResponse.json(staffByClinic[params.id as string] ?? [])),
  // Tolerate saves so add/edit/next actions don't error against a dead backend.
  http.post(`${B}/api/tenant/clinic`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...body, id: body.id || CLINIC1 });
  }),
  http.post(`${B}/api/tenant/clinics/:id/staff`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...body, id: body.id || "new-staff", active: true, accountStatus: "PENDING_ACTIVATION" });
  }),
];

const meta = {
  title: "Pages/Build Your Clinic",
  component: BuildYourClinicPage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ background: colors.primary100, minHeight: "100vh" }}><Story /></div>
    ),
  ],
} satisfies Meta<typeof BuildYourClinicPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two clinics; the first has active staff, a pending invite, and a deactivated member. */
export const Default: Story = {
  parameters: { msw: { handlers: tenantHandlers(CLINICS, { [CLINIC1]: STAFF1, [CLINIC2]: [] }) } },
};

/** First-run — no clinics yet, so the page seeds a single empty "Your Clinic". */
export const Empty: Story = {
  parameters: { msw: { handlers: tenantHandlers([], {}) } },
};
