import { roundedButtonStyles } from "./RoundedButton.styles";

type RoundedButtonProps = {
  children: React.ReactNode;
  width?: number;        // width in px
  ratio?: number;        // width / height
  onClick?: () => void;
  disabled?: boolean;
};

export function RoundedButton({
  children,
  width = 240,
  ratio = 4,
  onClick,
  disabled = false,
}: RoundedButtonProps) {
    const height = width / ratio;
    return (
    <button
      style={{
        ...roundedButtonStyles.button,
        width,
        height,
        ...(disabled ? roundedButtonStyles.disabled : {}),
      }}
    >
      {children}
    </button>
  );
}
