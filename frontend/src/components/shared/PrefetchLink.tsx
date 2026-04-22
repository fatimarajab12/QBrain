import { Link, LinkProps } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchProjectData, prefetchFeatureData } from "@/utils/navigation";
import { logger } from "@/utils/logger";

interface PrefetchLinkProps extends LinkProps {
  prefetchOnHover?: boolean;
}

export const PrefetchLink = ({ prefetchOnHover = true, ...props }: PrefetchLinkProps) => {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    if (!prefetchOnHover || !props.to) return;
    
    const path = typeof props.to === 'string' ? props.to : props.to.pathname || '';
    const projectMatch = path.match(/^\/projects\/([^/]+)$/);
    const featureMatch = path.match(/^\/projects\/([^/]+)\/features\/([^/]+)$/);
    
    if (featureMatch) {
      const [, projectId, featureId] = featureMatch;
      prefetchFeatureData(queryClient, featureId, projectId).catch((error) => {
        logger.debug('Failed to prefetch feature data', error);
      });
    } else if (projectMatch) {
      const [, projectId] = projectMatch;
      prefetchProjectData(queryClient, projectId).catch((error) => {
        logger.debug('Failed to prefetch project data', error);
      });
    }
  };

  return (
    <Link
      {...props}
      onMouseEnter={handleMouseEnter}
    />
  );
};

