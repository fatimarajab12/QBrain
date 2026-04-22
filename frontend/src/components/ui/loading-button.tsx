import { Button, ButtonProps } from "./button";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export const LoadingButton = ({
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" variant="gradient" />
      )}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
};

