import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import type { Product } from "../../lib/types";

/** Matches the backend's Field(min_length=1, max_length=255). */
const MAX_NAME = 255;

interface ProductFormModalProps {
  open: boolean;
  /** Null when adding, the product being renamed otherwise. */
  product: Product | null;
  existingNames: Map<string, number>;
  busy: boolean;
  serverError: string | null;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function ProductFormModal({
  open,
  product,
  existingNames,
  busy,
  serverError,
  onSubmit,
  onClose,
}: ProductFormModalProps) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  // Re-seed whenever the dialog opens so edit starts from the current value.
  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setTouched(false);
    }
  }, [open, product]);

  const trimmed = name.trim();
  const duplicateId = existingNames.get(trimmed.toLowerCase());
  const validation =
    trimmed.length === 0
      ? "Бүтээгдэхүүний нэрийг оруулна уу."
      : trimmed.length > MAX_NAME
        ? `Нэр ${MAX_NAME} тэмдэгтээс хэтрэхгүй байх ёстой.`
        : duplicateId !== undefined && duplicateId !== product?.id
          ? "Ийм нэртэй бүтээгдэхүүн аль хэдийн бүртгэгдсэн байна."
          : null;

  const unchanged = product !== null && trimmed === product.name;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (validation || unchanged) return;
    onSubmit(trimmed);
  }

  const showError = touched && validation;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Бүтээгдэхүүн засах" : "Бүтээгдэхүүн нэмэх"}
      description={
        product
          ? "Нэрийг өөрчилсөн ч борлуулалтын түүх болон ID хэвээр хадгалагдана."
          : "Бүтээгдэхүүний хүснэгт зөвхөн нэрийг хадгалдаг."
      }
      size="sm"
      busy={busy}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Цуцлах
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={busy}
            disabled={Boolean(validation) || unchanged}
          >
            {product ? "Хадгалах" : "Нэмэх"}
          </Button>
        </>
      }
    >
      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Бүтээгдэхүүний нэр"
          value={name}
          maxLength={MAX_NAME + 20}
          placeholder="Бүтээгдэхүүний нэрийг оруулна уу"
          aria-invalid={Boolean(showError)}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setTouched(true)}
          disabled={busy}
        />
        <div className="form-meta">
          <span className={showError ? "form-meta__error" : "form-meta__hint"}>
            {showError ?? (product ? "Нэрийг өөрчилж хадгална уу." : "Нэр давхардахгүй байх ёстой.")}
          </span>
          <span className={trimmed.length > MAX_NAME ? "form-meta__error" : "form-meta__hint"}>
            {trimmed.length} / {MAX_NAME}
          </span>
        </div>
        {serverError && <p className="inline-error">{serverError}</p>}
      </form>
    </Modal>
  );
}
