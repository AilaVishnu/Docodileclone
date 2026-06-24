import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Modal } from "../../components/Modal/Modal";
import { colors, spacing } from "../../styles/theme";
import { withClinicSession } from "../../sb/decorators";
import {
  StockFormBody,
  DetailBody,
  AdjustQtyBody,
  DeleteConfirmBody,
  ImportInventoryBody,
} from "./PharmacyView";
import { MOCK_INVENTORY } from "./mockInventory";

// The five modals of the Meds (Pharmacy) module, each rendered with its real
// body component + mock data so we can review/refine them in isolation. The
// bodies are the same code the app uses (PharmacyView), so changes here flow
// straight into the app.

const MED = MOCK_INVENTORY[0]; // Acetuff P Tablet — healthy stock
const LOW_MED = MOCK_INVENTORY[5]; // Aldocont B Gel — low stock, near expiry
const OUT_MED = MOCK_INVENTORY[20]; // Episoft Cleanser — out of stock, expired

const noop = () => {};
const noopAsync = async () => {};

const meta = {
  title: "Patterns/Pharmacy/Modals",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The Meds module's modals — Medicine detail, Add / Edit stock, Adjust quantity, Delete confirmation, and Import inventory. Rendered with the real body components from PharmacyView.",
      },
    },
  },
  decorators: [withClinicSession],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Low stock + expiring soon — both hero tiles read amber. */
export const MedicineDetail: Story = {
  render: () => (
    <Modal isOpen onClose={noop} surface="transparent" padding={0} shadow="none">
      <DetailBody med={LOW_MED} onClose={noop} />
    </Modal>
  ),
};

/** Healthy stock + good expiry — both hero tiles read green. */
export const MedicineDetailHealthy: Story = {
  render: () => (
    <Modal isOpen onClose={noop} surface="transparent" padding={0} shadow="none">
      <DetailBody med={MED} onClose={noop} />
    </Modal>
  ),
};

/** Out of stock + expired — both hero tiles read red. */
export const MedicineDetailOutOfStock: Story = {
  render: () => (
    <Modal isOpen onClose={noop} surface="transparent" padding={0} shadow="none">
      <DetailBody med={OUT_MED} onClose={noop} />
    </Modal>
  ),
};

export const AddStock: Story = {
  render: () => (
    <Modal isOpen onClose={noop} surface={colors.neutral100} padding={spacing.xl}>
      <StockFormBody initial={null} onClose={noop} onSave={noopAsync} />
    </Modal>
  ),
};

export const EditStock: Story = {
  render: () => (
    <Modal isOpen onClose={noop} surface={colors.neutral100} padding={spacing.xl}>
      <StockFormBody initial={MED} onClose={noop} onSave={noopAsync} />
    </Modal>
  ),
};

export const AdjustQuantity: Story = {
  render: () => (
    <Modal isOpen onClose={noop}>
      <AdjustQtyBody med={MED} onClose={noop} onSave={noopAsync} />
    </Modal>
  ),
};

export const DeleteConfirm: Story = {
  render: () => (
    <Modal isOpen onClose={noop}>
      <DeleteConfirmBody med={MED} onCancel={noop} onConfirm={noopAsync} />
    </Modal>
  ),
};

export const ImportInventory: Story = {
  render: () => <ImportInventoryBody isOpen onClose={noop} onImported={noop} />,
};
