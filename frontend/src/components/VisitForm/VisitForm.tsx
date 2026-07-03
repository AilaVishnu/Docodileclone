import React, { useState } from "react";
import { SectionBlock } from "../SectionBlock";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { PopoverMenu } from "../PopoverMenu/PopoverMenu";
import { getBlock } from "../../visit/blockRegistry";
import { DERM_TEMPLATE, type VisitTemplate, type BlockSpec } from "../../visit/templates";
import { styles } from "./VisitForm.styles";

// ─────────────────────────────────────────────────────────────────────────────
// VisitForm — renders a visit as a bento of block cards, driven by a template.
// Each block in the template is looked up in the registry and rendered inside
// the shared <SectionBlock> card; its bento width (full/half) places it in the
// 2-column grid. Blocks are "default + editable": the doctor can remove a
// repeatable block, and add another (a Procedure today). This is the seam the
// PrescriptionPage form moves onto — today the consult sections render a stub
// body; each is filled in as it's extracted into a real block.
// ─────────────────────────────────────────────────────────────────────────────

type VisitFormProps = {
  /** The specialty template — the default ordered list of blocks. */
  template?: VisitTemplate;
};

let _seq = 0;
const newInstanceId = (type: string): string => `${type}-${(_seq += 1)}`;

export function VisitForm({ template = DERM_TEMPLATE }: VisitFormProps) {
  const [blocks, setBlocks] = useState<BlockSpec[]>(() => template.blocks);
  const [data, setData] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const b of template.blocks) {
      const def = getBlock(b.type);
      init[b.instanceId] = def ? def.makeEmpty() : {};
    }
    return init;
  });

  const removeBlock = (instanceId: string) => setBlocks((bs) => bs.filter((b) => b.instanceId !== instanceId));

  const addProcedure = () => {
    const def = getBlock("procedure");
    if (!def) return;
    const instanceId = newInstanceId("procedure");
    setData((d) => ({ ...d, [instanceId]: def.makeEmpty() }));
    setBlocks((bs) => [...bs, { type: "procedure", instanceId }]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid}>
        {blocks.map((spec) => {
          const def = getBlock(spec.type);
          if (!def) return null;
          const Body = def.Component;
          return (
            <div key={spec.instanceId} style={def.width === "full" ? styles.full : styles.half}>
              <SectionBlock
                title={spec.title ?? def.title}
                icon={def.icon}
                surface={def.surface ?? "card"}
                onRemove={def.repeatable ? () => removeBlock(spec.instanceId) : undefined}
                actions={def.menu ? (
                  <PopoverMenu
                    trigger={<Icon name="menu" size={20} tone="inherit" />}
                    items={[{ label: "Save as template", onClick: () => {} }]}
                    ariaLabel="Section options"
                  />
                ) : undefined}
              >
                <Body value={data[spec.instanceId]} onChange={(v: unknown) => setData((d) => ({ ...d, [spec.instanceId]: v }))} />
              </SectionBlock>
            </div>
          );
        })}
        <div style={styles.addRow}>
          <Button variant="light" size="sm" iconLeft={<Icon name="plus" tone="inherit" size={14} />} onClick={addProcedure}>
            Add procedure
          </Button>
        </div>
      </div>
    </div>
  );
}
