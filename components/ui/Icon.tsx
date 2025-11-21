export type { IconProps } from './icons/types.tsx';


export { MediaIcons } from './icons/media-icons';
export { NavigationIcons } from './icons/navigation-icons';
export { UtilityIcons } from './icons/utility-icons';

// For backward compatibility, export a combined Icons object
import { MediaIcons } from './icons/media-icons';
import { NavigationIcons } from './icons/navigation-icons';
import { UtilityIcons } from './icons/utility-icons';

export const Icons = {
  ...MediaIcons,
  ...NavigationIcons,
  ...UtilityIcons,
};
