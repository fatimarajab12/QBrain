export const CHAT_CONFIG = {
  MAX_HISTORY_MESSAGES: 10,
  N_RESULTS: 5,
  SCROLL_DELAY: 100,
  INPUT_FOCUS_DELAY: 100,
} as const;

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

export const CHAT_STYLES = {
  BUTTON_SIZE: {
    DEFAULT: 'h-14 w-14',
    SM: 'sm:h-16 sm:w-16',
  },
  CHAT_WINDOW: {
    WIDTH: {
      DEFAULT: 'w-[calc(100vw-2rem)]',
      SM: 'sm:w-96',
    },
    HEIGHT: {
      DEFAULT: 'h-[calc(100vh-10rem)]',
      SM: 'sm:h-[650px]',
    },
    MAX_WIDTH: {
      DEFAULT: 'max-w-[calc(100vw-2rem)]',
      SM: 'sm:max-w-md',
    },
    MAX_HEIGHT: {
      DEFAULT: 'max-h-[calc(100vh-10rem)]',
      SM: 'sm:max-h-[650px]',
    },
  },
} as const;

