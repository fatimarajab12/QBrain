import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { startTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchProjectData, prefetchFeatureData } from "@/utils/navigation";
import { logger } from "@/utils/logger";

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const navigateTo = useCallback(async (path: string, options?: { replace?: boolean; state?: unknown; prefetch?: boolean }) => {
    if (options?.prefetch) {
      try {
        const projectMatch = path.match(/^\/projects\/([^/]+)$/);
        const featureMatch = path.match(/^\/projects\/([^/]+)\/features\/([^/]+)$/);
        
        if (featureMatch) {
          const [, projectId, featureId] = featureMatch;
          await Promise.race([
            prefetchFeatureData(queryClient, featureId, projectId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Prefetch timeout')), 3000))
          ]).catch((error) => {
            logger.debug('Prefetch failed or timed out', error);
          });
        } else if (projectMatch) {
          const [, projectId] = projectMatch;
          await Promise.race([
            prefetchProjectData(queryClient, projectId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Prefetch timeout')), 3000))
          ]).catch((error) => {
            logger.debug('Prefetch failed or timed out', error);
          });
        }
      } catch (error) {
        logger.debug('Error during prefetch', error);
      }
    }
    
    startTransition(() => {
      navigate(path, { replace: options?.replace, state: options?.state });
    });
  }, [navigate, queryClient]);

  const navigateBack = useCallback(() => {
    startTransition(() => {
      navigate(-1);
    });
  }, [navigate]);

  const updateSearchParams = useCallback((updater: (params: URLSearchParams) => void, options?: { replace?: boolean }) => {
    const params = new URLSearchParams(location.search);
    updater(params);
    startTransition(() => {
      navigate(`${location.pathname}?${params.toString()}`, { 
        replace: options?.replace ?? true,
        state: location.state,
      });
    });
  }, [navigate, location]);

  return {
    navigateTo,
    navigateBack,
    updateSearchParams,
    currentPath: location.pathname,
    searchParams: new URLSearchParams(location.search),
  };
};

