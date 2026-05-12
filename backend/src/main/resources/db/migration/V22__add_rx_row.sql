-- Rx row — one prescribed medicine per row, child of a visit. ON DELETE
-- CASCADE so dropping a visit cleans its prescriptions automatically.
-- `position` orders rows within a visit (1, 2, 3, ...) so the table
-- preserves the order the doctor entered them.
CREATE TABLE rx_row (
  id              UUID PRIMARY KEY,
  visit_id        UUID NOT NULL REFERENCES visit(id) ON DELETE CASCADE,
  position        SMALLINT NOT NULL,
  medicine        TEXT,
  medicine_note   TEXT,
  dosage          TEXT,
  when_to_take    TEXT,
  frequency       TEXT,
  duration        TEXT,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_rx_row_visit_id ON rx_row(visit_id);
