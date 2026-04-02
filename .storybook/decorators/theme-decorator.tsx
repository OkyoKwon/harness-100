import React, { useEffect } from "react";
import type { Decorator } from "@storybook/react";

export const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <Story />;
};
