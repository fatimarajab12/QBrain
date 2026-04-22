import { PageLoading } from "@/components/ui/page-loading";

interface SuspenseFallbackProps {
  message?: string;
}

const SuspenseFallback = ({ message = "Loading..." }: SuspenseFallbackProps) => {
  return <PageLoading message={message} />;
};

export default SuspenseFallback;

